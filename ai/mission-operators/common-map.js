import aStart from '../a-start'

export const defaultOperat = () => true


export const checkGetFlagCost = (gameState, gameStateData) => {
  const myTank = gameState.myTank;
  const flagPosition = gameState.flagPosition;
  const tankSpeed = (gameState.params || {}).tankSpeed;
  if (flagPosition) {
    // 计算我方坦克到旗子的距离
    const theTank = myTank[0];

    const { pass: thePath } = aStart(theTank, flagPosition, {
      stepLength: tankSpeed,
      width: gameStateData.width,
      height: gameStateData.height,
      obstacleMap: gameStateData.obstacleMap,
    });

    if (thePath) {
      const theDistance = thePath[thePath.length - 1].G;
      return theDistance;
    }
  }

  return 0;
};

// 检查坦克分成了几组
const checkTankGroupAndGetDistance = (gameState, gameStateData, tanks) => {
  let openList = [...tanks];
  const groupList = [];
  while (openList.length > 0) {
    const theGroup = [];
    const newOpenList = [];
    const theTank = openList.shift();
    theGroup.push(theTank);
    const checkList = [...openList];
    checkList.forEach(otherTank => {
      const { accurate: thePath } = aStart(theTank, otherTank, {
        turnCost: 0,
        stepDeep: 3,
        width: gameStateData.width,
        height: gameStateData.height,
        obstacleMap: gameStateData.obstacleMap,
      });
      if (thePath) {
        theGroup.push(otherTank);
      } else {
        newOpenList.push(otherTank);
      }
    });
    groupList.push(theGroup);
    openList = newOpenList;
  }
  return groupList;
};

export const checkMoveToClosestEnemyCost = (gameState, gameStateData) => {
  const myTank = gameState.myTank;
  const enemyTank = gameState.enemyTank;
  const tankSpeed = (gameState.params || {}).tankSpeed;

  if (enemyTank.length === 0) {
    return {
      enemy: null,
      path: null,
      distance: 0,
    };
  }

  // 计算我方坦克到敌方坦克的距离
  const theTank = myTank[0];
  const groupList = checkTankGroupAndGetDistance(gameState, gameStateData, enemyTank);
  const distanceList = [];
  groupList.forEach(enemyGroup => {
    const { path: thePath } = aStart(theTank, enemyGroup[0], {
      width: gameStateData.width,
      height: gameStateData.height,
      obstacleMap: gameStateData.obstacleMap,
    });
    if (thePath && thePath.length > 0) {
      distanceList.push({
        enemy: enemyGroup[0],
        path: thePath,
        distance: thePath[thePath.length - 1].G,
      });
    }
  });
  const minDistance = Math.min(...distanceList.map(e => e.distance));
  const closestEnemy = distanceList.find(e => e.distance === minDistance);


  return {
    enemy: closestEnemy.enemy,
    path: closestEnemy.path,
    distance: closestEnemy.distance,
  };
};
