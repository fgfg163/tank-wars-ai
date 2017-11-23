import { rangeArray } from '../utils/map-tools';

export default function (gameState, gameStateData, tank) {
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
      if (distance <= 1) {
        // 在第一个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[0] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'up',
            weight: -10000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[0] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'up',
            weight: 10000 * probability - distance,
          });
        }
      } else if (distance <= bulletSpeed + 1) {
        // 在第二个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[1] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'up',
            weight: -5000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[1] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'up',
            weight: 5000 * probability - distance,
          });
        }
      } else if (distance <= bulletSpeed * 2 + 1) {
        // 在第三个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[2] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'up',
            weight: -1000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[2] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'up',
            weight: 500 * probability - distance,
          });
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
            direction: 'down',
            weight: -100 * probability - distance,
          });
        }
        // 如果有敌人
        if (enemyTankMap.has(theIndex)) {
          const theNextTank = enemyTankMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'down',
            weight: 100 * probability - distance,
          });
        }
        return true;
      }
    });
    // 下方
    rangeArray(tank.y + 1, height - 1).some((theY, index) => {
      const distance = index + 1;
      // 如果扫描到了障碍物，则停止扫描
      const theIndex = `${tank.x},${theY}`;
      if (obstacleMap.has(theIndex)) {
        return true;
      }
      if (distance <= 1) {
        // 在第一个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[0] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'down',
            weight: -10000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[0] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'down',
            weight: 10000 * probability - distance,
          });
        }
      } else if (distance <= bulletSpeed + 1) {
        // 在第二个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[1] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'down',
            weight: -5000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[1] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'down',
            weight: 5000 * probability - distance,
          });
        }
      } else if (distance <= bulletSpeed * 2 + 1) {
        // 在第三个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[2] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'down',
            weight: -1000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[2] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'down',
            weight: 500 * probability - distance,
          });
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
            direction: 'down',
            weight: -100 * probability - distance,
          });
        }
        // 如果有敌人
        if (enemyTankMap.has(theIndex)) {
          const theNextTank = enemyTankMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'down',
            weight: 100 * probability - distance,
          });
        }
        return true;
      }
    });
    // 左方
    rangeArray(tank.x - 1, 0).some((theX, index) => {
      const distance = index + 1;
      // 如果扫描到了障碍物，则停止扫描
      const theIndex = `${theX},${tank.y}`;
      if (obstacleMap.has(theIndex)) {
        return true;
      }
      if (distance <= 1) {
        // 在第一个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[0] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'left',
            weight: -10000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[0] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'left',
            weight: 10000 * probability - distance,
          });
        }
      } else if (distance <= bulletSpeed + 1) {
        // 在第二个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[1] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'left',
            weight: -5000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[1] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'left',
            weight: 5000 * probability - distance,
          });
        }
      } else if (distance <= bulletSpeed * 2 + 1) {
        // 在第三个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[2] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'left',
            weight: -1000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[2] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'left',
            weight: 500 * probability - distance,
          });
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
            direction: 'left',
            weight: -100 * probability - distance,
          });
        }
        // 如果有敌人
        if (enemyTankMap.has(theIndex)) {
          const theNextTank = enemyTankMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'left',
            weight: 100 * probability - distance,
          });
        }
        return true;
      }
    });
    // 右方
    rangeArray(tank.x + 1, width - 1).some((theX, index) => {
      const distance = index + 1;
      // 如果扫描到了障碍物，则停止扫描
      const theIndex = `${theX},${tank.y}`;
      if (obstacleMap.has(theIndex)) {
        return true;
      }
      if (distance <= 1) {
        // 在第一个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[0] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'right',
            weight: -10000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[0] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'right',
            weight: 10000 * probability - distance,
          });
        }
      } else if (distance <= bulletSpeed + 1) {
        // 在第二个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[1] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'right',
            weight: -5000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[1] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'right',
            weight: 5000 * probability - distance,
          });
        }
      } else if (distance <= bulletSpeed * 2 + 1) {
        // 在第三个回合
        // 如果有友军
        const myTankProbabilityMap = (forcastList[2] || {}).myTankProbabilityMap || new Map();
        if (myTankProbabilityMap.has(theIndex)) {
          const theNextTank = myTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'right',
            weight: -1000 * probability - distance,
          });
        }
        // 如果有敌人
        const enemyTankProbabilityMap = (forcastList[2] || {}).enemyTankProbabilityMap || new Map();
        if (enemyTankProbabilityMap.has(theIndex)) {
          const theNextTank = enemyTankProbabilityMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'right',
            weight: 500 * probability - distance,
          });
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
            direction: 'right',
            weight: -100 * probability - distance,
          });
        }
        // 如果有敌人
        if (enemyTankMap.has(theIndex)) {
          const theNextTank = enemyTankMap.get(theIndex);
          const probability = theNextTank.probability || 1;
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'right',
            weight: 100 * probability - distance,
          });
        }
        return true;
      }
    });
  }
  console.log(nextStepList);
  return nextStepList;
}
