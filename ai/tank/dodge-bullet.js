import { pointStr, rangeArray } from '../utils/map-tools'
import * as aStart from '../a-start'

// 反方向
const getReverseDirection = (() => {
  const map = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  return direction => map[direction] || direction;
})();
// 右转
const getRightDirection = (() => {
  const map = {
    up: 'right',
    down: 'left',
    left: 'up',
    right: 'down',
  };
  return direction => map[direction] || direction;
})();
// 左转
const getLeftDirection = (() => {
  const map = {
    up: 'left',
    down: 'right',
    left: 'down',
    right: 'up',
  };
  return direction => map[direction] || direction;
})();
// 是否是垂直方向
const isVerticalDirection = (() => {
  const map = {
    'up,up': false,
    'up,down': false,
    'up,left': true,
    'up,right': true,
    'down,up': false,
    'down,down': false,
    'down,left': true,
    'down,right': true,
    'left,up': true,
    'left,down': true,
    'left,left': false,
    'left,right': false,
    'right,up': true,
    'right,down': true,
    'right,left': false,
    'right,right': false,
  };
  return (direction1, direction2) => map[`${direction1},${direction2}`];
})();
// 计算坦克移动路径经过的点
const getPathBetweenTwoPoint = (point1, point2) => {
  if (point1.x === point2.x) {
    return rangeArray(point1.y, point2.y).map(y => ({ x: point1.x, y }));
  } else if (point1.y === point2.y) {
    return rangeArray(point1.x, point2.x).map(x => ({ x, y: point1.y }));
  }
  return [];
}

const moveBulletARound = (myTank, myBullet, enemyBullet, obstacleMap, width, height, bulletSpeed) => {
  const willHitedTank = [];
  const nextEnemyBullet = [];
  const nextMyBullet = [];
  const myTankMap = new Map(myTank.map(t => ([`${t.x},${t.y}`, t])));

  const scanBullet = (bullet, width, height, bulletSpeed) => {
    const willHitedTank = [];
    let nextBullet;
    let scanArray = [];
    switch (bullet.direction) {
      case 'up':
        scanArray = rangeArray(bullet.y - 1, Math.max(0, bullet.y - 1 - bulletSpeed))
          .map(y => ({ x: bullet.x, y }));
        break;
      case 'down':
        scanArray = rangeArray(bullet.y + 1, Math.min(height - 1, bullet.y + 1 + bulletSpeed))
          .map(y => ({ x: bullet.x, y }));
        break;
      case 'left':
        scanArray = rangeArray(bullet.x - 1, Math.max(0, bullet.x - 1 - bulletSpeed))
          .map(x => ({ x, y: bullet.y }));
        break;
      case 'right':
        scanArray = rangeArray(bullet.x + 1, Math.min(width - 1, bullet.x + 1 + bulletSpeed))
          .map(x => ({ x, y: bullet.y }));
        break;
    }

    scanArray.some(point => {
      if (obstacleMap.has(`${point.x},${point.y}`)) {
        nextBullet = null;
        return true;
      }
      nextBullet = { ...bullet, ...point };
      if (myTankMap.has(`${point.x},${point.y}`)) {
        willHitedTank.push({
          tank: myTankMap.get(`${point.x},${point.y}`),
          bullet: { ...bullet, ...point },
        });
      }
    });
    return [willHitedTank, nextBullet];
  };

  enemyBullet.forEach(bullet => {
    const [hitTank, nextBullet] = scanBullet(bullet, width, height, bulletSpeed);
    willHitedTank.push(...hitTank);
    if (nextBullet) {
      nextEnemyBullet.push(nextBullet);
    }
  });
  myBullet.forEach(bullet => {
    const [hitTank, nextBullet] = scanBullet(bullet, width, height, bulletSpeed);
    willHitedTank.push(...hitTank);
    if (nextBullet) {
      nextMyBullet.push(nextBullet);
    }
  });
  return [willHitedTank, nextMyBullet, nextEnemyBullet];
};

const moveTankARound = (myTank, myTankPathOperatorList, myBullet, enemyBullet) => {
  const willHitedTank = [];
  const myBulletMap = new Map(myBullet.map(b => ([`${b.x},${b.y}`, b])));
  const enemyBulletMap = new Map(enemyBullet.map(b => ([`${b.x},${b.y}`, b])));
  myTank.forEach(tank => {
    const thePath = myTankPathOperatorList[tank.id] || [];
    const [startPoint, endPoint] = thePath;
    let scanArray = [];
    if (!startPoint) {
      scanArray = [myTank];
    } else if (!endPoint) {
      scanArray = [startPoint];
    } else {
      switch (startPoint.direction) {
        case 'up':
          scanArray = rangeArray(startPoint.y - 1, endPoint.y)
            .map(y => ({ x: startPoint.x, y }));
          break;
        case 'down':
          scanArray = rangeArray(startPoint.y + 1, endPoint.y)
            .map(y => ({ x: startPoint.x, y }));
          break;
        case 'left':
          scanArray = rangeArray(startPoint.x - 1, endPoint.x)
            .map(x => ({ x, y: startPoint.y }));
          break;
        case 'right':
          scanArray = rangeArray(startPoint.x + 1, endPoint.x)
            .map(x => ({ x, y: startPoint.y }));
          break;
      }
    }
    scanArray.forEach(point => {
      if (myBulletMap.has(`${point.x},${point.y}`)) {
        willHitedTank.push({
          tank,
          bullet: myBulletMap.get(`${point.x},${point.y}`),
        });
      }
      if (enemyBulletMap.has(`${point.x},${point.y}`)) {
        willHitedTank.push({
          tank,
          bullet: enemyBulletMap.get(`${point.x},${point.y}`),
        });
      }
    });
  });
  return willHitedTank;
};

export default (gameState, gameStateData) => {
  const { myTank, myBullet, enemyBullet, width, height } = gameState;
  const { obstacleMap, myTankPath } = gameStateData;
  const { bulletSpeed } = gameState.params;
  // 获取坦克移动路线和操作列表
  const getMyTankPathOperatorListSlice = (myTankPath, start, end) => (
    Object.entries(myTankPath)
      .map(obj => {
        obj[1] = aStart.getOperatorListFromPath(obj[1]).slice(start, end);
        return obj;
      })
      .reduce((obj, [tankId, thePath]) => {
        obj[tankId] = thePath;
        return obj;
      }, {})
  );
  const nextStepList = [];
  let nextMyBullet
  let nextEnemyBullet
  (() => {
    // 检查下1回合是否会被击中
    // 子弹移动一回合
    const [willHitedTank1, _nextMyBullet, _nextEnemyBullet] = moveBulletARound(myTank, myBullet, enemyBullet, obstacleMap, width, height, bulletSpeed);
    nextMyBullet = _nextMyBullet;
    nextEnemyBullet = _nextEnemyBullet;
    willHitedTank1.forEach(({ tank, bullet }) => {
      // nextStepList.push({
      //   tankId: tank.id,
      //   nextStep: 'fire',
      //   direction: getReverseDirection(bullet.direction),
      //   weight: 10000,
      // });
    });

    // 坦克移动一回合
    const myTankPathOperatorList = getMyTankPathOperatorListSlice(myTankPath, 0, 2);
    const willHitedTank2 = moveTankARound(myTank, myTankPathOperatorList, nextMyBullet, nextEnemyBullet);
    willHitedTank2.forEach(({ tank, bullet }) => {
      if (isVerticalDirection(tank.direction, bullet.direction)) {
        // 坦克撞子弹，如果是垂直方向就停一回合
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'stay',
          direction: tank.direction,
          weight: 6000,
        });
      } else {
        // 坦克撞子弹，如果是平行方向就立刻开炮
        // nextStepList.push({
        //   tankId: tank.id,
        //   nextStep: 'fire',
        //   direction: getReverseDirection(bullet.direction),
        //   weight: 10000,
        // });
      }
    });
    const willHitedTank = [...willHitedTank1, ...willHitedTank2];
    console.log('willHitedTank1', willHitedTank);
  })();
  (() => {
    // 检查下2回合是否会被击中
    // 子弹移动一回合
    const [willHitedTank1, _nextMyBullet, _nextEnemyBullet] = moveBulletARound(myTank, nextMyBullet, nextEnemyBullet, obstacleMap, width, height, bulletSpeed);
    nextMyBullet = _nextMyBullet;
    nextEnemyBullet = _nextEnemyBullet;
    willHitedTank1.forEach(({ tank, bullet }) => {
      if (isVerticalDirection(tank.direction, bullet.direction)) {
        // 如果是垂直方向，就移动一步
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'move',
          direction: tank.direction,
          weight: 6000,
        });
      } else {
        // 如果是平行方向，就立刻开炮
        // nextStepList.push({
        //   tankId: tank.id,
        //   nextStep: 'fire',
        //   direction: getReverseDirection(bullet.direction),
        //   weight: 10000,
        // });
      }
    });
    // 坦克移动一回合
    const myTankPathOperatorList = getMyTankPathOperatorListSlice(myTankPath, 1, 3);
    const willHitedTank2 = moveTankARound(myTank, myTankPathOperatorList, nextMyBullet, nextEnemyBullet);
    willHitedTank2.forEach(({ tank, bullet }) => {
      if (isVerticalDirection(tank.direction, bullet.direction)) {
      } else {
        // 坦克撞子弹，如果是水平方向就向左转
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'turnTo',
          direction: getLeftDirection(tank.direction),
          weight: 6000,
        });
      }
    });
    const willHitedTank = [...willHitedTank1, ...willHitedTank2];
    console.log('willHitedTank2', willHitedTank);
  })();
  (() => {
    // 检查下3回合是否会被击中
    // 子弹移动一回合
    const [willHitedTank1, _nextMyBullet, _nextEnemyBullet] = moveBulletARound(myTank, nextMyBullet, nextEnemyBullet, obstacleMap, width, height, bulletSpeed);
    nextMyBullet = _nextMyBullet;
    nextEnemyBullet = _nextEnemyBullet;
    willHitedTank1.forEach(({ tank, bullet }) => {
      if (isVerticalDirection(tank.direction, bullet.direction)) {
        // 如果是垂直方向，就移动一步
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'move',
          direction: tank.direction,
          weight: 6000,
        });
      } else {
        // 如果是平行方向，就立刻开炮
        // nextStepList.push({
        //   tankId: tank.id,
        //   nextStep: 'fire',
        //   direction: getReverseDirection(bullet.direction),
        //   weight: 10000,
        // });
      }
    });
    // 坦克移动一回合
    const myTankPathOperatorList = getMyTankPathOperatorListSlice(myTankPath, 2, 4);
    const willHitedTank2 = moveTankARound(myTank, myTankPathOperatorList, nextMyBullet, nextEnemyBullet);

    const willHitedTank = [...willHitedTank1, ...willHitedTank2];
    console.log('willHitedTank3', willHitedTank);
  })();


  console.log('dodge nextStepList', nextStepList)
  return nextStepList;
}
