import { isTanksInArea } from './utils/map-tools';

export default function (state, stateData) {
  const targetList = [];
  const width = stateData.width;
  const height = stateData.height;
  const params = state.params || {};
  const myTank = state.myTank || [];
  const obstacle = [];
  // 如果棋盘上有flag，则向flag位置移动
  if (state.flagWait === 0
    && typeof(params.flagX) === 'number'
    && typeof(params.flagY) === 'number') {
    targetList.push({
      type: 'move-to',
      tankId: 'ALL',
      x: params.flagX,
      y: params.flagY,
      weight: 10,
    });
  } else if (!isTanksInArea({ x: 0, y: 0 }, { x: 3, y: 3 }, myTank)) {
    targetList.push({
      type: 'move-to',
      tankId: 'ALL',
      x: 10,
      y: 10,
      weight: 10,
    });
  } else {
    targetList.push({
      type: 'move-to',
      tankId: 'ALL',
      x: 10,
      y: 10,
      weight: 10,
    });
  }
  targetList.push({
    type: 'auto-fire',
    tankId: 'ALL',
    x: 1,
    y: 1,
    weight: 100,
  });

  // 排序，将权重大的放在前面
  targetList.sort((a, b) => b.weight - a.weight);
  return {
    type: '',
    targetList,
  };
}

