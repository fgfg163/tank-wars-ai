import aStart from '../a-start';

const nextPointDirection = (nowPoint, nextPoint) => {
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

export default function (state, stateData, tank, commanderOrders) {
  const width = stateData.width;
  const height = stateData.height;
  const obstractList = stateData.obstractList;
  const obstractMap = stateData.obstractMap;
  const myBulletMap = stateData.myBulletMap;
  const myTank = state.myTank;

  const nextStepList = {
    'move': {
      tankId: tank.id,
      nextStep: 'move',
      weight: 0,
    },
    'right': {
      tankId: tank.id,
      nextStep: 'right',
      weight: 0,
    },
    'left': {
      tankId: tank.id,
      nextStep: 'left',
      weight: 0,
    },
    'back': {
      tankId: tank.id,
      nextStep: 'back',
      weight: 0,
    },
  };

  const orders = commanderOrders.filter(order => {
    if (order.type === 'move-to') {
      if (order.tankId === 'ALL' || order.tankId === tank.id) {
        return true;
      }
    }
  });

  const theOrder = orders[0];
  if (theOrder) {
    // 将我方坦克当成高权重方块放进a星算法进行计算
    const myTankPositionWithWeight = myTank.map(t => ({
      x: t.x,
      y: t.y,
      direction: t.direction,
      weight: 1000,
    }));
    const mapCellList = [...obstractList, ...myTankPositionWithWeight];


    // 计算路线
    const aStartMapInfo = {
      width,
      height,
      mapCellList,
    };
    const path = aStart(tank, theOrder, aStartMapInfo);

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
        switch (`${tank.direction},${nextPointDirection(nowPoint, nextPoint)}`) {
          case 'up,up':
          case 'down,down':
          case 'left,left':
          case 'right,right':
            nextStepList.move.weight += 100;
            break;
          case 'up,right':
          case 'down,left':
          case 'left,up':
          case 'right,down':
            nextStepList.right.weight += 100;
            break;
          case 'up,left':
          case 'down,right':
          case 'left,down':
          case 'right,up':
            nextStepList.left.weight += 100;
            break;
          case 'up,down':
          case 'down,up':
          case 'left,right':
          case 'right,left':
            nextStepList.back.weight += 100;
            break;
        }
      }
      tank.path = path;
    }
  }

  return {
    type: '',
    nextStepList: Object.values(nextStepList),
  };
}
