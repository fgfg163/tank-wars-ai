import { rangeArray } from '../utils/map-tools';

export default function (gameState, gameStateData, tank) {
  const obstacleMap = gameStateData.obstacleMap;
  const myTankMap = gameStateData.myTankMap;
  const enemyTankMap = gameStateData.enemyTankMap;
  const myBulletOfTankMap = gameStateData.myBulletOfTankMap;
  const width = gameStateData.width;
  const height = gameStateData.height;


  let nextStepList = [];

  // 如果本坦克有炮弹在地图上，就不进行开炮
  if (!myBulletOfTankMap.has(tank.id)) {
    // 扫描坦克横竖直线上，宽3格的位置是否有敌人
    // 垂直方向扫描的宽度
    const scanXStart = Math.max(tank.x - 1, 0);
    const scanXEnd = Math.min(tank.x + 1, width - 1);
    // 上方
    rangeArray(tank.y - 1, 0).some((theY, distance) => {
      // 如果扫描到了障碍物，则停止扫描
      if (obstacleMap.has(`${tank.x},${theY}`)) {
        return true;
      }
      // 扫描宽度
      rangeArray(scanXStart, scanXEnd).some(theX => {
        const theIndex = `${theX},${theY}`;
        // 如果有友军
        if (myTankMap.has(theIndex)) {
          const theTank = myTankMap.get(theIndex);
          if (theX === tank.x
            && (theX < tank.x && theTank.direction === 'right')
            && (theX > tank.x && theTank.direction === 'left')) {
            nextStepList.push({
              tankId: tank.id,
              nextStep: 'fire',
              direction: 'up',
              weight: -100 + height - distance,
            });
          }
        }
        if (enemyTankMap.has(theIndex)) {
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'up',
            weight: 10 + height - distance,
          });
        }
      });
    });
    // 下方
    rangeArray(tank.y + 1, height - 1).some((theY, distance) => {
      // 如果扫描到了障碍物，则停止扫描
      if (obstacleMap.has(`${tank.x},${theY}`)) {
        return true;
      }
      // 扫描宽度
      rangeArray(scanXStart, scanXEnd).some(theX => {
        const theIndex = `${theX},${theY}`;
        // 如果有友军
        if (myTankMap.has(theIndex)) {
          const theTank = myTankMap.get(theIndex);
          if (theX === tank.x
            && (theX < tank.x && theTank.direction === 'right')
            && (theX > tank.x && theTank.direction === 'left')) {
            nextStepList.push({
              tankId: tank.id,
              nextStep: 'fire',
              direction: 'down',
              weight: -100 + height - distance,
            });
          }
        }
        if (enemyTankMap.has(theIndex)) {
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'down',
            weight: 10 + height - distance,
          });
        }
      });
    });
    // 水平方向扫描的宽度
    const scanYStart = Math.max(tank.y - 1, 0);
    const scanYEnd = Math.min(tank.y + 1, width - 1);
    // 左方
    rangeArray(tank.x - 1, 0).some((theX, distance) => {
      // 如果扫描到了障碍物，则停止扫描
      if (obstacleMap.has(`${theX},${tank.y}`)) {
        return true;
      }
      // 扫描宽度
      rangeArray(scanYStart, scanYEnd).some(theY => {
        const theIndex = `${theX},${theY}`;
        // 如果有友军
        if (myTankMap.has(theIndex)) {
          const theTank = myTankMap.get(theIndex);
          if (theY === tank.y
            && (theY < tank.y && theTank.direction === 'down')
            && (theY > tank.y && theTank.direction === 'up')) {
            nextStepList.push({
              tankId: tank.id,
              nextStep: 'fire',
              direction: 'left',
              weight: -100 + height - distance,
            });
          }
        }
        if (enemyTankMap.has(theIndex)) {
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'left',
            weight: 10 + width - distance,
          });
        }
      });
    });
    // 右方
    rangeArray(tank.x + 1, width - 1).some((theX, distance) => {
      // 如果扫描到了障碍物，则停止扫描
      if (obstacleMap.has(`${theX},${tank.y}`)) {
        return true;
      }
      rangeArray(scanYStart, scanYEnd).some(theY => {
        const theIndex = `${theX},${theY}`;
        // 如果有友军
        if (myTankMap.has(theIndex)) {
          const theTank = myTankMap.get(theIndex);
          if (theY === tank.y
            && (theY < tank.y && theTank.direction === 'down')
            && (theY > tank.y && theTank.direction === 'up')) {
            nextStepList.push({
              tankId: tank.id,
              nextStep: 'fire',
              direction: 'right',
              weight: -100 + height - distance,
            });
          }
        }
        if (enemyTankMap.has(theIndex)) {
          nextStepList.push({
            tankId: tank.id,
            nextStep: 'fire',
            direction: 'right',
            weight: 10 + height - distance,
          });
        }
      });
    });
  }

  return nextStepList;
}
