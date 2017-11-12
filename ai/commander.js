export default function (state) {
  const targetList = [];
  const terain = state.terain || [];
  const width = terain.length;
  const height = (terain[0] || []).length;
  const params = state.params || {};
  const obstacle = [];
  // 如果棋盘上有flag，则向flag位置移动
  if (state.flagWait === 0
    && typeof(params.flagX) === 'number'
    && typeof(params.flagY) === 'number') {
    targetList.push({
      type: 'get-flag',
      x: params.flagX,
      y: params.flagY,
      weight: 100,
    });
  } else {
    targetList.push({
      type: 'get-flag',
      x: params.flagX,
      y: params.flagY,
      weight: 100,
    });
  }

  // 排序，将权重大的放在前面
  targetList.sort((a, b) => b.weight - a.weight);
  return {
    type: '',
    targetList,
  };
}

