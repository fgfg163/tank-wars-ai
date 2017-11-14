import aStart from './a-start';

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
  // 计算路线
  const newTank = Object.assign({}, tank, {
    path: aStart(tank, tank.target, terain),
  });
  if (newTank.path && newTank.path.length > 1) {
    // 取下一步的点。newTank.path[0]表示出发点
    const nowPoint = newTank.path[0];
    const nextPoint = newTank.path[1];
    switch (`${tank.direction},${nextPointDirection(nowPoint, nextPoint)}`) {
      case 'up,up':
      case 'down,down':
      case 'left,left':
      case 'right,right':
        newTank.nextStep = 'move';
        break;
      case 'up,right':
      case 'down,left':
      case 'left,up':
      case 'right,down':
        newTank.nextStep = 'right';
        break;
      case 'up,left':
      case 'down,right':
      case 'left,down':
      case 'right,up':
        newTank.nextStep = 'left';
        break;
      case 'up,down':
      case 'down,up':
      case 'left,right':
      case 'right,left':
        newTank.nextStep = 'back';
        break;
      default:
    }
  }
  newTank.nextStep = newTank.nextStep || 'stay';
  return {
    type: '',
    tank: newTank,
  };
}
