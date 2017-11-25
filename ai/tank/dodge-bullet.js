import { pointStr, rangeArray } from '../utils/map-tools'

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

export default (gameState, gameStateData, tank) => {
  const { forcastList } = gameStateData;
  const nextStepList = [];
  (() => {
    // 检查下1回合是否会被击中
    // 获取下回合本坦克可能的位置
    const myThisTankOperatorList = gameStateData.tankOperatorList[tank.id] || [];
    const enemyBulletMap = (forcastList[0] || {}).enemyBulletMap || new Map();
    const enemyBulletPathMap = (forcastList[0] || {}).enemyBulletPathMap || new Map();

    if (myThisTankOperatorList.length <= 1) {
      // 我方坦克不移动

      // 我方坦克下回合被敌方子弹击中，立刻向子弹来的方向开炮
      if (enemyBulletMap.has(`${tank.x},${tank.y}`) || enemyBulletPathMap.has(`${tank.x},${tank.y}`)) {
        const bullet = enemyBulletMap.get(`${tank.x},${tank.y}`) || enemyBulletPathMap.get(`${tank.x},${tank.y}`);
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'fire',
          direction: getReverseDirection(bullet.direction),
          weight: 10000,
        });
      }

    } else if (myThisTankOperatorList.length > 1 && myThisTankOperatorList[0].nextStep === 'move') {
      // 我方坦克正在移动
      const nowPosition = myThisTankOperatorList[0];
      const nextPosition = myThisTankOperatorList[1];

      // 我方坦克会在移动之前被子弹击中，立刻向子弹来的方向开炮
      if (enemyBulletMap.has(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.has(`${nowPosition.x},${nowPosition.y}`)) {
        const bullet = enemyBulletMap.get(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.get(`${nowPosition.x},${nowPosition.y}`);
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'fire',
          direction: getReverseDirection(bullet.direction),
          weight: 10000,
        });
      }
      // 我方坦克会在行动之后被子弹击中，停止本次移动
      if (enemyBulletMap.has(`${nextPosition.x},${nextPosition.y}`) || enemyBulletPathMap.has(`${nextPosition.x},${nextPosition.y}`)) {
        const bullet = enemyBulletMap.get(`${nextPosition.x},${nextPosition.y}`) || enemyBulletPathMap.get(`${nextPosition.x},${nextPosition.y}`);
        if (isVerticalDirection(tank.direction, bullet.direction)) {
          // 子弹和坦克方向是垂直的，停止行动一回合
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'stay',
            direction: tank.direction,
            weight: 6000,
          });
        } else {
          // 子弹和坦克方向是水平的，立刻向子弹来的方向开炮
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: getReverseDirection(bullet.direction),
            weight: 10000,
          });
        }
      }
      // 我方坦克在移动路径上遇到子弹，则停止移动
      const myThisTankPath = getPathBetweenTwoPoint(nowPosition, nextPosition);
      myThisTankPath.some(pathPoint => {
        if (enemyBulletMap.get(`${pathPoint.x},${pathPoint.y}`)) {
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'stay',
            direction: tank.direction,
            weight: 100,
          });
          return true;
        }
      });
    }
  })();
  (() => {
    // 检查下2回合是否会被击中
    // 获取下2回合本坦克可能的位置
    const myThisTankOperatorList = gameStateData.tankOperatorList[tank.id] || [];
    const enemyBulletMap = (forcastList[1] || {}).enemyBulletMap || new Map();
    const enemyBulletPathMap = (forcastList[1] || {}).enemyBulletPathMap || new Map();

    if (myThisTankOperatorList.length <= 1) {
      // 我方坦克一直不移动

      // 我方坦克在下2回合被击中
      if (enemyBulletMap.has(`${tank.x},${tank.y}`) || enemyBulletPathMap.has(`${tank.x},${tank.y}`)) {
        const bullet = enemyBulletMap.get(`${tank.x},${tank.y}`) || enemyBulletPathMap.get(`${tank.x},${tank.y}`);
        if (isVerticalDirection(tank.direction, bullet.direction)) {
          // 我方坦克方向与子弹方向是垂直的，就移动一步
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'move',
            direction: tank.direction,
            weight: 6000,
          });
        } else {
          // 我方坦克方向与子弹方向是水平的，就立刻开炮
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: getReverseDirection(bullet.direction),
            weight: 6000,
          });
        }
      }

    } else if (myThisTankOperatorList.length === 2) {
      // 我方坦克在第2回合停止
      const prevPosition = myThisTankOperatorList[0];
      const nowPosition = myThisTankOperatorList[1];
      if (prevPosition.x === nowPosition.x && prevPosition.y === nowPosition.y) {
        // 我方坦克第1回合没移动，第二回合不动，会在第二回合被击中，立刻开炮
        if (enemyBulletMap.has(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.has(`${nowPosition.x},${nowPosition.y}`)) {
          const bullet = enemyBulletMap.get(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.get(`${nowPosition.x},${nowPosition.y}`);
          if (isVerticalDirection(tank.direction, bullet.direction)) {
            // 我方坦克方向与子弹方向是垂直的，就移动一步
            nextStepList.push({
              tankId: tank.id,
              nextStep: 'move',
              direction: tank.direction,
              weight: 10000,
            });
          } else {
            // 我方坦克方向与子弹方向是水平的，就立刻开炮
            nextStepList.push({
              tankId: tank.id,
              nextStep: 'fire',
              direction: getReverseDirection(bullet.direction),
              weight: 10000,
            });
          }
        }
      } else {
        // 我方坦克第一回合移动，第二回合停止，会在第二回合被击中，则停止移动
        if (enemyBulletMap.has(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.has(`${nowPosition.x},${nowPosition.y}`)) {
          const bullet = enemyBulletMap.get(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.get(`${nowPosition.x},${nowPosition.y}`);
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'stay',
            direction: tank.direction,
            weight: 6000,
          });
        }
      }
    } else if (myThisTankOperatorList.length > 2) {
      const nowPosition = myThisTankOperatorList[1];
      const nextPosition = myThisTankOperatorList[2];

      // 我方坦克会在移动之前被子弹击中
      if (enemyBulletMap.has(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.has(`${nowPosition.x},${nowPosition.y}`)) {
        const bullet = enemyBulletMap.get(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.get(`${nowPosition.x},${nowPosition.y}`);
        if (isVerticalDirection(tank.direction, bullet.direction)) {
          // 坦克方向与子弹方向垂直，则移动一步
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'move',
            direction: tank.direction,
            weight: 6000,
          });
        } else {
          // 坦克方向与子弹方向垂直，则向右转
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'turnTo',
            direction: getLeftDirection(tank.direction),
            weight: 6000,
          });
        }
      }
      // 我方坦克会在行动之后被子弹击中，停止本次移动
      if (enemyBulletMap.has(`${nextPosition.x},${nextPosition.y}`) || enemyBulletPathMap.has(`${nextPosition.x},${nextPosition.y}`)) {
        const bullet = enemyBulletMap.get(`${nextPosition.x},${nextPosition.y}`) || enemyBulletPathMap.get(`${nextPosition.x},${nextPosition.y}`);
        if (isVerticalDirection(tank.direction, bullet.direction)) {
        } else {
          // 子弹和坦克方向是水平的，向右转
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: getRightDirection(tank.direction),
            weight: 10000,
          });
        }
      }
    }
  })();
  (() => {
    // 检查下3回合是否会被击中
    // 获取下3回合本坦克可能的位置
    const myThisTankOperatorList = gameStateData.tankOperatorList[tank.id] || [];
    const enemyBulletMap = (forcastList[1] || {}).enemyBulletMap || new Map();
    const enemyBulletPathMap = (forcastList[1] || {}).enemyBulletPathMap || new Map();

    if (myThisTankOperatorList.length <= 1) {
      // 我方坦克一直不移动

      // 我方坦克在下3回合被击中
      if (enemyBulletMap.has(`${tank.x},${tank.y}`) || enemyBulletPathMap.has(`${tank.x},${tank.y}`)) {
        const bullet = enemyBulletMap.get(`${tank.x},${tank.y}`) || enemyBulletPathMap.get(`${tank.x},${tank.y}`);
        if (isVerticalDirection(tank.direction, bullet.direction)) {
          // 我方坦克方向与子弹方向是垂直的，就移动一步
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'move',
            direction: tank.direction,
            weight: 6000,
          });
        } else {
          // 我方坦克方向与子弹方向是水平的，就向右转
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'turnTo',
            direction: getRightDirection(bullet.direction),
            weight: 6000,
          });
        }
      }

    } else if (myThisTankOperatorList.length === 2) {
      // 我方坦克在第2回合停止
      const prevPosition = myThisTankOperatorList[0];
      const nowPosition = myThisTankOperatorList[1];
      if (prevPosition.x === nowPosition.x && prevPosition.y === nowPosition.y) {
        // 我方坦克第1回合没移动，第二回合不动，会在第3回合被击中
        if (enemyBulletMap.has(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.has(`${nowPosition.x},${nowPosition.y}`)) {
          const bullet = enemyBulletMap.get(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.get(`${nowPosition.x},${nowPosition.y}`);
          if (isVerticalDirection(tank.direction, bullet.direction)) {
            // 坦克方向与子弹方向垂直，则移动一步
            nextStepList.push({
              tankId: tank.id,
              nextStep: 'fire',
              direction: getReverseDirection(bullet.direction),
              weight: 10000,
            });
          } else {
            // 坦克方向与子弹方向水平，则向右转
            nextStepList.push({
              tankId: tank.id,
              nextStep: 'turnTo',
              direction: getLeftDirection(tank.direction),
              weight: 10000,
            });
          }
        }
      } else {
        // 我方坦克第一回合移动，第二回合停止，会在第二回合被击中，则停止移动
        if (enemyBulletMap.has(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.has(`${nowPosition.x},${nowPosition.y}`)) {
          const bullet = enemyBulletMap.get(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.get(`${nowPosition.x},${nowPosition.y}`);
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'stay',
            direction: tank.direction,
            weight: 6000,
          });
        }
      }
    } else if (myThisTankOperatorList.length > 2) {
      const nowPosition = myThisTankOperatorList[1];
      const nextPosition = myThisTankOperatorList[2];

      // 我方坦克会在移动之前被子弹击中
      if (enemyBulletMap.has(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.has(`${nowPosition.x},${nowPosition.y}`)) {
        const bullet = enemyBulletMap.get(`${nowPosition.x},${nowPosition.y}`) || enemyBulletPathMap.get(`${nowPosition.x},${nowPosition.y}`);
        if (isVerticalDirection(tank.direction, bullet.direction)) {
          // 坦克方向与子弹方向垂直，则移动一步
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'move',
            direction: tank.direction,
            weight: 6000,
          });
        } else {
          // 坦克方向与子弹方向垂直，则向右转
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'turnTo',
            direction: getLeftDirection(tank.direction),
            weight: 6000,
          });
        }
      }
      // 我方坦克会在行动之后被子弹击中，停止本次移动
      if (enemyBulletMap.has(`${nextPosition.x},${nextPosition.y}`) || enemyBulletPathMap.has(`${nextPosition.x},${nextPosition.y}`)) {
        const bullet = enemyBulletMap.get(`${nextPosition.x},${nextPosition.y}`) || enemyBulletPathMap.get(`${nextPosition.x},${nextPosition.y}`);
        if (isVerticalDirection(tank.direction, bullet.direction)) {
        } else {
          // 子弹和坦克方向是水平的，向右转
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: getRightDirection(tank.direction),
            weight: 10000,
          });
        }
      }
    }
  })();
  console.log('dodge nextStepList', nextStepList)
  return nextStepList;
}
