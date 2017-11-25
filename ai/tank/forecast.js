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
  const pathPosition = [];
  const dangerArea = [];
  const nowProbability = tank.probability || 1;
  switch (tank.direction) {
    case 'up': {
      let tankPosition;
      rangeArray(tank.y, tank.y - tankSpeed)
        .some(theY => {
          if (theY >= 0 && !obstacleMap.has(`${tank.x},${theY}`)) {
            tankPosition = {
              ...tank,
              y: theY,
              probability: nowProbability * probabilityOfTankOption('move'),
            };
            pathPosition.push(tankPosition);
          } else {
            return true;
          }
        });
      position.push(tankPosition);
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
      // 坦克起点也算一个经过位置
      rangeArray(tank.y, tank.y + tankSpeed)
        .some(theY => {
          if (theY <= height - 1 && !obstacleMap.has(`${tank.x},${theY}`)) {
            tankPosition = {
              ...tank,
              y: theY,
              probability: nowProbability * probabilityOfTankOption('move'),
            };
            pathPosition.push(tankPosition);
          } else {
            return true;
          }
        });
      position.push(tankPosition);
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
      // 坦克起点也算一个经过位置
      rangeArray(tank.x, tank.x - tankSpeed)
        .some(theX => {
          if (theX >= 0 && !obstacleMap.has(`${theX},${tank.y}`)) {
            tankPosition = {
              ...tank,
              x: theX,
              probability: nowProbability * probabilityOfTankOption('move'),
            };
            pathPosition.push(tankPosition);
          } else {
            return true;
          }
        });
      position.push(tankPosition);
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
      rangeArray(tank.x, tank.x + tankSpeed)
        .some(theX => {
          if (theX >= 0 && !obstacleMap.has(`${theX},${tank.y}`)) {
            tankPosition = {
              ...tank,
              x: theX,
              probability: nowProbability * probabilityOfTankOption('move'),
            };
            pathPosition.push(tankPosition);
          } else {
            return true;
          }
        });
      position.push(tankPosition);
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
  return { position, dangerArea, pathPosition };
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
    const newMyTankPath = [];
    const newMyTankDangerArea = [];
    const newEnemyTank = [];
    const newEnemyTankDangerArea = [];
    const newEnemyTankPath = [];
    nowMyTank.forEach(tank => {
      const {
        position: newPosition,
        dangerArea: newDangerArea,
        pathPosition: newPathPosition,
      } = getTankNextPosition(tank, tankSpeed, gameStateData);
      newMyTank.push(...newPosition);
      newMyTankDangerArea.push(...newDangerArea);
      newMyTankPath.push(...newPathPosition);
    });
    nowEnemyTank.forEach(tank => {
      const {
        position: newPosition,
        dangerArea: newDangerArea,
        pathPosition: newPathPosition,
      } = getTankNextPosition(tank, tankSpeed, gameStateData);
      newEnemyTank.push(...newPosition);
      newEnemyTankDangerArea.push(...newDangerArea);
      newEnemyTankPath.push(...newPathPosition);
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
    // 将坦克每回合所在位置分类到每个格子里，不把概率加起来是因为方便使用时剔除自己
    const myTankMap = new Map();
    newMyTank.forEach(t => {
      const index = `${t.x},${t.y}`;
      if (myTankMap.has(index)) {
        const tankList = myTankMap.get(index);
        tankList.push(t);
        myTankMap.set(index, tankList);
      } else {
        myTankMap.set(index, [t]);
      }
    });
    // 将坦克经过的位置分别分类到每个格子里，用于计算坦克撞子弹的概率，不把概率加起来是因为方便使用时剔除自己
    const myTankPathMap = new Map();
    newMyTankPath.forEach(t => {
      const index = `${t.x},${t.y}`;
      if (myTankMap.has(index)) {
        const tankList = myTankMap.get(index);
        tankList.push(t);
        myTankMap.set(index, tankList);
      } else {
        myTankMap.set(index, [t]);
      }
    });
    // 将坦克出现概率分别分类到每个格子里，用于计算子弹射中坦克的概率
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
    // 将坦克经过的位置的概率分别分类到每个格子里，用于计算坦克撞子弹的概率
    const enemyTankPathProbabilityMap = new Map();
    newEnemyTankPath.forEach(t => {
      const index = `${t.x},${t.y}`;
      if (enemyTankPathProbabilityMap.has(index)) {
        const tank = enemyTankPathProbabilityMap.get(index);
        enemyTankPathProbabilityMap.set(index, {
          ...tank,
          probability: t.probability + tank.probability,
        });
      } else {
        enemyTankPathProbabilityMap.set(index, t);
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
      myTankMap,
      myTankPath: newMyTankPath,
      myTankPathMap,
      myTankProbabilityMap,
      enemyTank: newEnemyTank,
      enemyTankProbabilityMap,
      enemyTankPathProbabilityMap,
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
  const pathPosition = [];
  switch (bullet.direction) {
    case 'up': {
      let bulletPosition;
      rangeArray(bullet.y - 1, bullet.y - 1 - bulletSpeed)
        .some(theY => {
          if (theY >= 0 && !obstacleMap.has(`${bullet.x},${theY}`)) {
            const p = { ...bullet, y: theY };
            bulletPosition = p;
            pathPosition.push(p);
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
            pathPosition.push(p);
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
            pathPosition.push(p);
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
            pathPosition.push(p);
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
  return { position, pathPosition };
};
// 预测子弹n回合后的位置
export const forecastBullet = (gameState, gameStateData, roundNum = 1) => {
  const futureList = [];
  const {
    myBullet,
    enemyBullet,
  } = gameState;
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
    const newMyBulletPath = [];
    const newEnemyBulletPath = [];
    nowMyBullet.forEach(bullet => {
      const {
        position: newPosition,
        pathPosition: newPath,
      } = getBulletNextPosition(bullet, bulletSpeed, gameStateData);
      newMyBullet.push(...newPosition);
      newMyBulletPath.push(...newPath);
    });
    nowEnemyBullet.forEach(bullet => {
      const {
        position: newPosition,
        pathPosition: newPath,
      } = getBulletNextPosition(bullet, bulletSpeed, gameStateData);
      newEnemyBullet.push(...newPosition);
      newEnemyBulletPath.push(...newPath);
    });
    futureList.push({
      myBullet: newMyBullet,
      myBulletMap: new Map(newMyBullet.map(b => ([`${b.x},${b.y}`, b]))),
      myBulletPath: newMyBulletPath,
      myBulletPathMap: new Map(newMyBulletPath.map(b => ([`${b.x},${b.y}`, b]))),
      enemyBullet: newEnemyBullet,
      enemyBulletMap: new Map(newEnemyBullet.map(b => ([`${b.x},${b.y}`, b]))),
      enemyBulletPath: newEnemyBulletPath,
      enemyBulletPathMap: new Map(newEnemyBulletPath.map(b => ([`${b.x},${b.y}`, b]))),
    });
  }
  // 去掉开头一个集合，因为第一个集合是本回合的情况
  futureList.shift();
  return futureList;
}
