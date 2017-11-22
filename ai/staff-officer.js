import aStart from './a-start';
import bfs from './bfs';

export default function (state, commanderOrder) {
  const myTank = state.myTank || [];
  const terain = state.terain || [];
  const moveTo = [];
  // 确定坦克都能到达目标点
  const canMoveTank = [];
  myTank.forEach(tank => {
    const thePath = aStart({ x: tank.x, y: tank.y }, commanderOrder[0], terain);
    if (thePath) {
      canMoveTank.push(tank);
    }
  });
  // 在目标点附近找到一片空地能容下所有坦克
  const targetList = bfs(commanderOrder[0], canMoveTank.length, terain);

  // 将空地分配给坦克
  const tankPathList = canMoveTank.map((tank, index) => ({
    ...tank,
    target: targetList[index],
  }));

  return {
    type: '',
    tankList: tankPathList,
  };
}
