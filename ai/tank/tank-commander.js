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

export default function (state, tank) {
  const terain = state.terain || [];
  const width = terain.length;
  const height = (terain[0] || []).length;

  const obstractList = state.obstractList || [];
  const obstractMap = new Map(obstractList.map(p => ([`${p.x},${p.y}`, p])))
  // 获取敌方坦克的方位
  const enemyTank = state.enemyTank || [];
  const enemyTankPositionMap = new Map(enemyTank.map(t => ([`${t.x},${t.y}`, t])));


  // 获取我方坦克的方位
  const myTank = state.myTank || [];
  const myTankPositionMap = new Map(myTank.map(t => ([`${t.x},${t.y}`, t])));
  const myTankPositionWithWeight = myTank.map(t => ({
    x: t.x,
    y: t.y,
    direction: t.direction,
    weight: 1000,
  }));
  const mapCellList = [...obstractList, ...myTankPositionWithWeight];


  // 扫描坦克横竖直线上，宽3格的位置是否有敌人
  // 上方
  for (let theY = tank.y; theY >= 0; theY--) {
    if (obstractMap.has(`${tank.x},${theY}`)) {
      break;
    }
    if (myTankPositionMap.has(`${tank.x},${theY}`)) {
      break;
    }
    if (enemyTankPositionMap.has(`${tank.x},${theY}`)) {
      tank.nextStep = 'fire-up';
      break;
    }
  }
  // 下方
  for (let theY = tank.y; theY < height; theY++) {
    if (obstractMap.has(`${tank.x},${theY}`)) {
      break;
    }
    if (myTankPositionMap.has(`${tank.x},${theY}`)) {
      break;
    }
    if (enemyTankPositionMap.has(`${tank.x},${theY}`)) {
      tank.nextStep = 'fire-down';
      break;
    }
  }
  // 左方
  for (let theX = tank.x; theX >= 0; theX--) {
    if (obstractMap.has(`${theX},${tank.y}`)) {
      break;
    }
    if (myTankPositionMap.has(`${theX},${tank.y}`)) {
      break;
    }
    if (enemyTankPositionMap.has(`${theX},${tank.y}`)) {
      tank.nextStep = 'fire-left';
      break;
    }
  }
  // 右方
  for (let theX = tank.x; theX < width; theX++) {
    if (myTankPositionMap.has(`${theX},${tank.y}`)) {
      break;
    }
    if (myTankPositionMap.has(`${theX},${tank.y}`)) {
      break;
    }
    if (enemyTankPositionMap.has(`${theX},${tank.y}`)) {
      tank.nextStep = 'fire-right';
      break;
    }
  }


  if (!tank.nextStep && tank.target) {
    // 计算路线
    const aStartMapInfo = {
      width: ((terain || []) || []).length || 0,
      height: (terain || []).length || 0,
      mapCellList,
    };
    tank.path = aStart(tank, tank.target, aStartMapInfo);

    // 如果能到达，计算下一步的方向
    if (tank.path && tank.path.length > 1) {
      // 检测前方是否已经被其他坦克堵死了
      const myTankPositionMap = new Map(myTank.map(p => ([`${p.x},${p.y}`, p])));

      let pathHasTankCount = 0;
      tank.path.map((p, index) => {
        if (index > 0 && myTankPositionMap.has(`${p.x},${p.y}`)) {
          pathHasTankCount++;
        }
      });
      // 如果前方没被堵死
      if (pathHasTankCount < tank.path.length - 1) {

        // 取下一步的点。tank.path[0]表示出发点
        // 计算下一步操作
        const nowPoint = tank.path[0];
        const nextPoint = tank.path[1];
        switch (`${tank.direction},${nextPointDirection(nowPoint, nextPoint)}`) {
          case 'up,up':
          case 'down,down':
          case 'left,left':
          case 'right,right':
            tank.nextStep = 'move';
            break;
          case 'up,right':
          case 'down,left':
          case 'left,up':
          case 'right,down':
            tank.nextStep = 'right';
            break;
          case 'up,left':
          case 'down,right':
          case 'left,down':
          case 'right,up':
            tank.nextStep = 'left';
            break;
          case 'up,down':
          case 'down,up':
          case 'left,right':
          case 'right,left':
            tank.nextStep = 'back';
            break;
          default:
            tank.nextStep = 'stay';
        }
      }
    }
  }
  tank.nextStep = tank.nextStep || 'stay';
  return {
    type: '',
    tank,
  };
}
