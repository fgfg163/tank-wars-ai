import { rangeArray } from '../utils/map-tools';

const calTank = (theIndex, distance, tank, direction, myTankMap, enemyTankMap, nextStepList, forcastList, bulletSpeed) => {
  if (distance <= 1) {
    // 在第一个回合
    // 如果有友军
    const myTankMap = (forcastList[0] || {}).myTankMap || new Map();
    if (myTankMap.has(theIndex)) {
      // 将自己从友军列表里剔除，即开炮的时候不考虑自己的移动
      const theNextTankList = myTankMap.get(theIndex).filter(t => t.id !== tank.id);
      if (theNextTankList.length > 0) {
        const probability = theNextTankList.map(t => t.probability || 1).reduce((a, b) => a + b);
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'fire',
          direction: direction,
          weight: -10000 * probability - distance,
        });
      }
    }
    // 如果有敌人
    const enemyTankProbabilityMap = (forcastList[0] || {}).enemyTankProbabilityMap || new Map();
    if (enemyTankProbabilityMap.has(theIndex)) {
      const theNextTank = enemyTankProbabilityMap.get(theIndex);
      const probability = theNextTank.probability || 1;
      nextStepList.push({
        tankId: tank.id,
        nextStep: 'fire',
        direction: direction,
        weight: 10000 * probability - distance,
      });
    }
    if (distance === 1) {
      // 如果有友军穿过这个位置
      const myTankPathMap = (forcastList[0] || {}).myTankPathMap || new Map();
      if (myTankPathMap.has(theIndex)) {
        // 将自己从友军列表里剔除，即开炮的时候不考虑自己的移动
        const theNextTankList = myTankPathMap.get(theIndex).filter(t => t.id !== tank.id);
        if (theNextTankList.length > 0) {
          const probability = theNextTankList.map(t => t.probability || 1).reduce((a, b) => a + b);
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: direction,
            weight: -10000 * probability - distance,
          });
        }
      }
      // 如果有敌人穿过这个位置
      const enemyTankProbabilityMap = (forcastList[0] || {}).enemyTankProbabilityMap || new Map();
      if (enemyTankProbabilityMap.has(theIndex)) {
        const theNextTank = enemyTankProbabilityMap.get(theIndex);
        const probability = theNextTank.probability || 1;
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'fire',
          direction: direction,
          weight: 10000 * probability - distance,
        });
      }
    }
  } else if (distance <= bulletSpeed + 1) {
    // 在第二个回合
    // 如果有友军
    const myTankMap = (forcastList[1] || {}).myTankMap || new Map();
    if (myTankMap.has(theIndex)) {
      // 将自己从友军列表里剔除，即开炮的时候不考虑自己的移动
      const theNextTankList = myTankMap.get(theIndex).filter(t => t.id !== tank.id);
      if (theNextTankList.length > 0) {
        const probability = theNextTankList.map(t => t.probability || 1).reduce((a, b) => a + b);
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'fire',
          direction: direction,
          weight: -5000 * probability - distance,
        });
      }
    }
    // 如果有敌人
    const enemyTankProbabilityMap = (forcastList[1] || {}).enemyTankProbabilityMap || new Map();
    if (enemyTankProbabilityMap.has(theIndex)) {
      const theNextTank = enemyTankProbabilityMap.get(theIndex);
      const probability = theNextTank.probability || 1;
      nextStepList.push({
        tankId: tank.id,
        nextStep: 'fire',
        direction: direction,
        weight: 5000 * probability - distance,
      });
    }
    if (distance === bulletSpeed + 1) {
      // 如果有友军穿过这个位置
      const myTankPathMap = (forcastList[1] || {}).myTankPathMap || new Map();
      if (myTankPathMap.has(theIndex)) {
        // 将自己从友军列表里剔除，即开炮的时候不考虑自己的移动
        const theNextTankList = myTankPathMap.get(theIndex).filter(t => t.id !== tank.id);
        if (theNextTankList.length > 0) {
          const probability = theNextTankList.map(t => t.probability || 1).reduce((a, b) => a + b);
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: direction,
            weight: -5000 * probability - distance,
          });
        }
      }
      // 如果有敌人穿过这个位置
      const enemyTankProbabilityMap = (forcastList[1] || {}).enemyTankProbabilityMap || new Map();
      if (enemyTankProbabilityMap.has(theIndex)) {
        const theNextTank = enemyTankProbabilityMap.get(theIndex);
        const probability = theNextTank.probability || 1;
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'fire',
          direction: direction,
          weight: 5000 * probability - distance,
        });
      }
    }
  } else if (distance <= bulletSpeed * 2 + 1) {
    // 在第三个回合
    // 如果有友军
    const myTankMap = (forcastList[1] || {}).myTankMap || new Map();
    if (myTankMap.has(theIndex)) {
      // 将自己从友军列表里剔除，即开炮的时候不考虑自己的移动
      const theNextTankList = myTankMap.get(theIndex).filter(t => t.id !== tank.id);
      if (theNextTankList.length > 0) {
        const probability = theNextTankList.map(t => t.probability || 1).reduce((a, b) => a + b);
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'fire',
          direction: direction,
          weight: -1000 * probability - distance,
        });
      }
    }
    // 如果有敌人
    const enemyTankProbabilityMap = (forcastList[2] || {}).enemyTankProbabilityMap || new Map();
    if (enemyTankProbabilityMap.has(theIndex)) {
      const theNextTank = enemyTankProbabilityMap.get(theIndex);
      const probability = theNextTank.probability || 1;
      nextStepList.push({
        tankId: tank.id,
        nextStep: 'fire',
        direction: direction,
        weight: 500 * probability - distance,
      });
    }
    if (distance === bulletSpeed * 2 + 1) {
      // 如果有友军穿过这个位置
      const myTankPathMap = (forcastList[1] || {}).myTankPathMap || new Map();
      if (myTankPathMap.has(theIndex)) {
        // 将自己从友军列表里剔除，即开炮的时候不考虑自己的移动
        const theNextTankList = myTankPathMap.get(theIndex).filter(t => t.id !== tank.id);
        if (theNextTankList.length > 0) {
          const probability = theNextTankList.map(t => t.probability || 1).reduce((a, b) => a + b);
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: direction,
            weight: -1000 * probability - distance,
          });
        }
      }
      // 如果有敌人穿过这个位置
      const enemyTankProbabilityMap = (forcastList[2] || {}).enemyTankProbabilityMap || new Map();
      if (enemyTankProbabilityMap.has(theIndex)) {
        const theNextTank = enemyTankProbabilityMap.get(theIndex);
        const probability = theNextTank.probability || 1;
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'fire',
          direction: direction,
          weight: 500 * probability - distance,
        });
      }
    }
  } else {
    // 三回合以外的地方
    // 如果有友军
    if (myTankMap.has(theIndex)) {
      const theNextTank = myTankMap.get(theIndex);
      const probability = theNextTank.probability || 1;
      nextStepList.push({
        tankId: tank.id,
        nextStep: 'fire',
        direction: direction,
        weight: -100 * probability - distance,
      });
    }
    return true;
  }
};

export default (gameState, gameStateData, tank) => {
  const {
    obstacleMap,
    myTankMap,
    enemyTankMap,
    myBulletOfTankMap,
    width,
    height,
    forcastList,
  } = gameStateData;
  const { bulletSpeed } = gameState.params;


  let nextStepList = [];

  // 如果本坦克有炮弹在地图上，就不进行开炮
  if (!myBulletOfTankMap.has(tank.id)) {
    // 扫描坦克横竖直线上，未来3回合是否有敌人
    // 上方
    rangeArray(tank.y - 1, 0).some((theY, index) => {
      const distance = index + 1;
      // 如果扫描到了障碍物，则停止扫描
      const theIndex = `${tank.x},${theY}`;
      if (obstacleMap.has(theIndex)) {
        return true;
      }
      return calTank(theIndex, distance, tank, 'up', myTankMap, enemyTankMap, nextStepList, forcastList, bulletSpeed);
    });
    // 下方
    rangeArray(tank.y + 1, height - 1).some((theY, index) => {
      const distance = index + 1;
      // 如果扫描到了障碍物，则停止扫描
      const theIndex = `${tank.x},${theY}`;
      if (obstacleMap.has(theIndex)) {
        return true;
      }
      return calTank(theIndex, distance, tank, 'down', myTankMap, enemyTankMap, nextStepList, forcastList, bulletSpeed);
    });
    // 左方
    rangeArray(tank.x - 1, 0).some((theX, index) => {
      const distance = index + 1;
      // 如果扫描到了障碍物，则停止扫描
      const theIndex = `${theX},${tank.y}`;
      if (obstacleMap.has(theIndex)) {
        return true;
      }
      return calTank(theIndex, distance, tank, 'left', myTankMap, enemyTankMap, nextStepList, forcastList, bulletSpeed);
    });
    // 右方
    rangeArray(tank.x + 1, width - 1).some((theX, index) => {
      const distance = index + 1;
      // 如果扫描到了障碍物，则停止扫描
      const theIndex = `${theX},${tank.y}`;
      if (obstacleMap.has(theIndex)) {
        return true;
      }
      return calTank(theIndex, distance, tank, 'right', myTankMap, enemyTankMap, nextStepList, forcastList, bulletSpeed);
    });
  }
  console.log(nextStepList)
  return nextStepList;
}
