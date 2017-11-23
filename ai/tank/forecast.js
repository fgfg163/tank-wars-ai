// 预测坦克和子弹未来n回合出现的位置和概率
import { rangeArray } from '../utils/map-tools'

const probabilityOfTankOption = (() => {
  const percentMap = {
    move: 0.5,
    turnTo: 0.3,
    stay: 0.2, // 包括开火
  };
  return (step) => percentMap[step] || 0;
})();


// 获取一个坦克未来1回合出现的位置和概率
const getTankNextPosition = (tank, tankSpeed, gameStateData) => {
  const { obstacleMap, width, height } = gameStateData;
  const position = [];
  const dangerArea = [];
  const nowProbability = tank.probability || 1;
  switch (tank.direction) {
    case 'up': {
      let tankPosition;
      rangeArray(tank.y - 1, tank.y - tankSpeed)
        .some(theY => {
          if (theY >= 0 && !obstacleMap.has(`${tank.x},${theY}`)) {
            tankPosition = {
              ...tank,
              y: theY,
              probability: nowProbability * probabilityOfTankOption('move'),
            };
          } else {
            return true;
          }
        });
      if (tankPosition) {
        position.push(tankPosition);
      }
      position.push({
        ...tank,
        direction: 'up',
        probability: nowProbability * probabilityOfTankOption('stay'),
      });

      position.push({
        ...tank,
        direction: 'left',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      position.push({
        ...tank,
        direction: 'right',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      position.push({
        ...tank,
        direction: 'down',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      break;
    }
    case 'down': {
      let tankPosition;
      rangeArray(tank.y + 1, tank.y + tankSpeed)
        .some(theY => {
          if (theY <= height - 1 && !obstacleMap.has(`${tank.x},${theY}`)) {
            tankPosition = {
              ...tank,
              y: theY,
              probability: nowProbability * probabilityOfTankOption('move'),
            };
          } else {
            return true;
          }
        });
      if (tankPosition) {
        position.push(tankPosition);
      }
      position.push({
        ...tank,
        probability: nowProbability * probabilityOfTankOption('stay'),
      });
      position.push({
        ...tank,
        direction: 'up',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      position.push({
        ...tank,
        direction: 'left',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      position.push({
        ...tank,
        direction: 'right',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      break;
    }
    case 'left': {
      let tankPosition;
      rangeArray(tank.x - 1, tank.x - tankSpeed)
        .some(theX => {
          if (theX >= 0 && !obstacleMap.has(`${theX},${tank.y}`)) {
            tankPosition = {
              ...tank,
              x: theX,
              probability: nowProbability * probabilityOfTankOption('move'),
            };
          } else {
            return true;
          }
        });
      if (tankPosition) {
        position.push(tankPosition);
      }
      position.push({
        ...tank,
        probability: nowProbability * probabilityOfTankOption('stay'),
      });
      position.push({
        ...tank,
        direction: 'top',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      position.push({
        ...tank,
        direction: 'right',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      position.push({
        ...tank,
        direction: 'down',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      break;
    }
    case 'right': {
      let tankPosition;
      rangeArray(tank.x + 1, tank.x + tankSpeed)
        .some(theX => {
          if (theX >= 0 && !obstacleMap.has(`${theX},${tank.y}`)) {
            tankPosition = {
              ...tank,
              x: theX,
              probability: nowProbability * probabilityOfTankOption('move'),
            };
          } else {
            return true;
          }
        });
      if (tankPosition) {
        position.push(tankPosition);
      }
      position.push({
        ...tank,
        probability: nowProbability * probabilityOfTankOption('stay'),
      });
      position.push({
        ...tank,
        direction: 'top',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      position.push({
        ...tank,
        direction: 'left',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      position.push({
        ...tank,
        direction: 'down',
        probability: nowProbability * probabilityOfTankOption('turnTo') / 3,
      });
      break;
    }
  }
  return { position, dangerArea };
};

// 预测坦克n回合后的位置
export const forecastTank = (gameState, gameStateData, roundNum = 1) => {
  const futureList = [];
  const {
    myTank,
    enemyTank,
  } = gameState;
  const {
    width,
    height,
    obstacleMap,
  } = gameStateData;
  const { tankSpeed } = gameState.params;

  futureList.push({
    myTank,
    enemyTank,
  });

  for (let round = 0; round < roundNum; round++) {
    const {
      myTank: nowMyTank,
      enemyTank: nowEnemyTank,
    } = futureList[futureList.length - 1];
    const newMyTank = [];
    const newMyTankDangerArea = [];
    const newEnemyTank = [];
    const newEnemyTankDangerArea = [];
    nowMyTank.forEach(tank => {
      const {
        position: newPosition,
        dangerArea: newDangerArea,
      } = getTankNextPosition(tank, tankSpeed, gameStateData);
      if (newPosition) {
        newMyTank.push(...newPosition);
        newMyTankDangerArea.push(...newDangerArea);
      }
    });
    nowEnemyTank.forEach(tank => {
      const {
        position: newPosition,
        dangerArea: newDangerArea,
      } = getTankNextPosition(tank, tankSpeed, gameStateData);
      if (newPosition) {
        newEnemyTank.push(...newPosition);
        newEnemyTankDangerArea.push(...newDangerArea);
      }
    });

    // 将坦克出现概率分别划分到每个格子里
    const myTankProbabilityMap = new Map();
    newMyTank.forEach(t => {
      const index = `${t.x},${t.y}`;
      if (myTankProbabilityMap.has(index)) {
        const tank = myTankProbabilityMap.get(index);
        myTankProbabilityMap.set(index, {
          ...tank,
          probability: t.probability + tank.probability,
        });
      } else {
        myTankProbabilityMap.set(index, t);
      }
    });
    // 将坦克出现概率分别划分到每个格子里
    const enemyTankProbabilityMap = new Map();
    newEnemyTank.forEach(t => {
      const index = `${t.x},${t.y}`;
      if (enemyTankProbabilityMap.has(index)) {
        const tank = enemyTankProbabilityMap.get(index);
        enemyTankProbabilityMap.set(index, {
          ...tank,
          probability: t.probability + tank.probability,
        });
      } else {
        enemyTankProbabilityMap.set(index, t);
      }
    });
    // 将坦克危险区域概率分别划分到每个格子里
    const enemyTankDangerAreaProbabilityMap = new Map();
    newEnemyTankDangerArea.forEach(t => {
      const index = `${t.x},${t.y}`;
      if (enemyTankDangerAreaProbabilityMap.has(index)) {
        const tank = enemyTankDangerAreaProbabilityMap.get(index);
        enemyTankDangerAreaProbabilityMap.set(index, {
          ...tank,
          probability: t.probability + tank.probability,
        });
      } else {
        enemyTankDangerAreaProbabilityMap.set(index, t);
      }
    });

    futureList.push({
      myTank: newMyTank,
      myTankProbabilityMap,
      enemyTank: newEnemyTank,
      enemyTankProbabilityMap,
      enemyTankDangerArea: newEnemyTankDangerArea,
      enemyTankDangerAreaProbabilityMap,
    });
  }
  // 移除第一组内容，因为第一组内容是现在坦克状况
  futureList.shift();
  return futureList;
}


// 预测一个子弹1回合后的位置(包括弹道长度，因为在弹道内都是危险区域)
const getBulletNextPosition = (bullet, bulletSpeed, gameStateData) => {
  const { obstacleMap, width, height } = gameStateData;
  const position = [];
  const dangerArea = [];
  switch (bullet.direction) {
    case 'up': {
      let bulletPosition;
      rangeArray(bullet.y - 1, bullet.y - 1 - bulletSpeed)
        .some(theY => {
          if (theY >= 0 && !obstacleMap.has(`${bullet.x},${theY}`)) {
            const p = { ...bullet, y: theY };
            bulletPosition = p;
            dangerArea.push(p);
          } else {
            return true;
          }
        });
      if (bulletPosition) {
        position.push(bulletPosition);
      }
      break;
    }
    case 'down': {
      let bulletPosition;
      rangeArray(bullet.y + 1, bullet.y + 1 + bulletSpeed)
        .some(theY => {
          if (theY <= height - 1 && !obstacleMap.has(`${bullet.x},${theY}`)) {
            const p = { ...bullet, y: theY };
            bulletPosition = p;
            dangerArea.push(p);
          } else {
            return true;
          }
        });
      if (bulletPosition) {
        position.push(bulletPosition);
      }
      break;
    }
    case 'left': {
      let bulletPosition;
      rangeArray(bullet.x - 1, bullet.x - 1 - bulletSpeed)
        .some(theX => {
          if (theX >= 0 && !obstacleMap.has(`${theX},${bullet.y}`)) {
            const p = { ...bullet, x: theX };
            bulletPosition = p;
            dangerArea.push(p);
          } else {
            return true;
          }
        });
      if (bulletPosition) {
        position.push(bulletPosition);
      }
      break;
    }
    case 'right': {
      let bulletPosition;
      rangeArray(bullet.x + 1, bullet.x + 1 + bulletSpeed)
        .some(theX => {
          if (theX >= 0 && !obstacleMap.has(`${theX},${bullet.y}`)) {
            const p = { ...bullet, x: theX };
            bulletPosition = p;
            dangerArea.push(p);
          } else {
            return true;
          }
        });
      if (bulletPosition) {
        position.push(bulletPosition);
      }
      break;
    }
  }
  return { position, dangerArea };
};
// 预测子弹n回合后的位置
export const forecastBullet = (gameState, gameStateData, roundNum = 1) => {
  const futureList = [];
  const {
    myBullet,
    enemyBullet,
  } = gameState;
  const {
    width,
    height,
    obstacleMap,
  } = gameStateData;
  const { bulletSpeed } = gameState.params;

  futureList.push({
    myBullet,
    enemyBullet,
  });

  for (let round = 0; round < roundNum; round++) {
    const {
      myBullet: nowMyBullet,
      enemyBullet: nowEnemyBullet,
    } = futureList[futureList.length - 1];
    const newMyBullet = [];
    const newEnemyBullet = [];
    const newMyBulletDangerArea = [];
    const newEnemyBulletDangerArea = [];
    nowMyBullet.forEach(bullet => {
      const {
        position: newPosition,
        dangerArea: newDangerArea,
      } = getBulletNextPosition(bullet, bulletSpeed, gameStateData);
      if (newPosition) {
        newMyBullet.push(...newPosition);
        newMyBulletDangerArea.push(...newDangerArea);
      }
    });
    nowEnemyBullet.forEach(bullet => {
      const {
        position: newPosition,
        dangerArea: newDangerArea,
      } = getBulletNextPosition(bullet, bulletSpeed, gameStateData);
      if (newPosition) {
        newEnemyBullet.push(...newPosition);
        newEnemyBulletDangerArea.push(...newDangerArea);
      }
    });
    futureList.push({
      myBullet: newMyBullet,
      myBulletMap: new Map(newMyBullet.map(b => ([`${b.x},${b.y}`, b]))),
      myBulletDangerArea: newMyBulletDangerArea,
      myBulletDangerAreaMap: new Map(newMyBulletDangerArea.map(b => ([`${b.x},${b.y}`, b]))),
      enemyBullet: newEnemyBullet,
      enemyBulletMap: new Map(newEnemyBullet.map(b => ([`${b.x},${b.y}`, b]))),
      enemyBulletDangerArea: newEnemyBulletDangerArea,
      enemyBulletDangerAreaMap: new Map(newEnemyBulletDangerArea.map(b => ([`${b.x},${b.y}`, b]))),
    });
  }
  // 去掉开头一个集合，因为第一个集合是本回合的情况
  futureList.shift();
  return futureList;
}
