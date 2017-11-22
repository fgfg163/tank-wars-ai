import aStart from '../a-start';

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
  const { path } = aStart(tank, moveTo, {
    stepLength: 1,
    width,
    height,
    obstacleMap,
    mapCellList: myTankPositionWithWeight,
  });

  console.log('path', path);

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

      // 取下一步的点。path[0]表示出发点
      // 计算下一步操作
      const nowPoint = path[0];
      const nextPoint = path[1];
      const nextPointDirection = getNextPointDirection(nowPoint, nextPoint);
      if (tank.direction === nextPointDirection) {
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'move',
          direction: tank.direction,
          weight: 100,
        });
      } else {
        let turnTo = '';
        switch (`${tank.direction},${getNextPointDirection(nowPoint, nextPoint)}`) {
          case 'up,left':
          case 'left,down':
          case 'down,right':
          case 'right,up':
            turnTo = 'left';
            break;
          case 'up,right':
          case 'left,up':
          case 'down,left':
          case 'right,down':
            turnTo = 'right';
            break;
          case 'up,down':
          case 'left,right':
          case 'down,up':
          case 'right,left':
            turnTo = 'back';
            break;
        }
        nextStepList.push({
          tankId: tank.id,
          nextStep: 'turnTo',
          turnTo,
          direction: nextPointDirection,
          weight: 100,
        });
      }
    }
    tank.path = path;
  }

  return nextStepList;
}
