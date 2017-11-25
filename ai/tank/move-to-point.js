import * as aStart from '../a-start';

// 下一个点在当前点的方向，相对地图的方向
const getNextPointDirection = (nowPoint, nextPoint) => {
  if (nowPoint.x === nextPoint.x && nowPoint.y > nextPoint.y) {
    // 下一步在当前位置的上方
    return 'up';
  } else if (nowPoint.x === nextPoint.x && nowPoint.y < nextPoint.y) {
    // 下一步在当前位置的下方
    return 'down';
  } else if (nowPoint.x > nextPoint.x && nowPoint.y === nextPoint.y) {
    // 下一步在当前位置的左方
    return 'left';
  } else if (nowPoint.x < nextPoint.x && nowPoint.y === nextPoint.y) {
    // 下一步在当前位置的右方
    return 'right';
  }
  return '';
};

// 下一步的动作执行后的方向，相对地图的方向
const getNextPointDirectionByNextStep = (nowPoint, nextStep) => {
  switch (`${nowPoint.direction},${nextStep}`) {
    case 'up,move':
    case 'up,stay':
    case 'right,left':
    case 'left,right':
    case 'down,back':
      return 'up';
      break;
    case 'down,move':
    case 'down,stay':
    case 'right,right':
    case 'left,left':
    case 'up,back':
      return 'down';
      break;
    case 'left,move':
    case 'left,stay':
    case 'up,left':
    case 'down,right':
    case 'right,back':
      return 'left';
      break;
    case 'right,move':
    case 'right,stay':
    case 'up,right':
    case 'down,left':
    case 'left,back':
      return 'right';
      break;
  }
  return '';
};

export default function (gameState, gameStateData, tank, moveTo) {
  const width = gameStateData.width;
  const height = gameStateData.height;
  const obstacleMap = gameStateData.obstacleMap;
  const myBulletMap = gameStateData.myBulletMap;
  const myTank = gameState.myTank;

  const nextStepList = [];

  let theNextStep = nextStepList.stay;


  // 将我方坦克当成高权重方块放进a星算法进行计算
  const myTankPositionWithWeight = myTank.map(t => ({
    x: t.x,
    y: t.y,
    direction: t.direction,
    weight: 1000,
  }));

  // 计算路线
  const { path } = aStart.toPoint(tank, moveTo, {
    stepLength: 1,
    width,
    height,
    obstacleMap,
    mapCellList: myTankPositionWithWeight,
  });

  // 如果能到达，计算下一步的方向
  if (path && path.length > 1) {
    // 检测前方是否已经被其他坦克堵死了
    let pathHasTankCount = 0;
    path.map((p, index) => {
      if (index > 0 && myBulletMap.has(`${p.x},${p.y}`)) {
        pathHasTankCount++;
      }
    });
    // 如果前方没被堵死
    if (pathHasTankCount < path.length - 1) {
      const operatorList = aStart.getOperatorListFromPath(path, 1);
      const nextStep = operatorList[0];
      nextStepList.push({
        tankId: tank.id,
        nextStep: nextStep.nextStep,
        ...(nextStep.turnTo ? { turnTo: nextStep.turnTo } : {}),
        direction: nextStep.direction,
        weight: 10,
      });
      gameStateData.tankOperatorList[tank.id] = operatorList;
    }
    gameStateData.tankPath[tank.id] = path;
  }

  return nextStepList;
}
