import aStart from './a-start';

export default function (state, tank) {
  const terain = state.terain || [];
  // 计算路线
  const newTank = Object.assign({}, tank, {
    path: aStart({ x: tank.x, y: tank.y }, tank.target, terain),
  });
  if (newTank.path && newTank.path.length > 0) {
    const nextPoint = newTank.path[0];
    // 如果
    if (newTank.x === nextPoint) {
    }
    newTank.nextStep = '';
  }

  return {
    type: '',
    tank: newTank,
  };
}
