import { getObstacleListFromMap } from './utils/map-tools'
import createMissions from './mission-creator/index'
import missions from './mission/index'
import { getNextStepInfo } from './cal-history'
import { MAIN_FLOW_INIT } from './mission/container'
import { forecastBullet, forecastTank } from './tank/forecast'

let missionStore = createMissions(missions, {});


const directionReverse = (() => {
  const theMap = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };
  return direction => theMap[direction] || direction;
})();

export const initAi = () => {
  missionStore = createMissions(missions, {});
}

export const ai = async gameState => {
  // 分析数据

  const state = missionStore.getState();
  // 处理地图数据，将二维数组转换为点数组和map对象
  const terain = gameState.terain || [];
  const gameStateData = {};
  const height = (terain || []).length || 0;
  gameStateData.height = height;
  const width = ((terain || [])[0] || []).length || 0;
  gameStateData.width = width;

  // 反转地图位置，让我方坦克始终在左上角
  state.isNeedReverseMap = typeof(state.isNeedReverseMap) === 'boolean' ?
    state.isNeedReverseMap
    : gameState.myTank.map(t => t.y < width / 2 ? 0 : 1).reduce((a, b) => a + b) > (gameState.myTank || []).length / 2;

  const isNeedReverseMap = state.isNeedReverseMap;
  if (isNeedReverseMap) {
    const myTank = (gameState.myTank || []).map(t => ({
      ...t,
      direction: directionReverse(t.direction),
      x: width - 1 - t.x,
      y: height - 1 - t.y,
    }));
    const myBullet = (gameState.myBullet || []).map(b => ({
      ...b,
      direction: directionReverse(b.direction),
      x: width - 1 - b.x,
      y: height - 1 - b.y,
    }));
    const enemyTank = (gameState.enemyTank || []).map(t => ({
      ...t,
      direction: directionReverse(t.direction),
      x: width - 1 - t.x,
      y: height - 1 - t.y,
    }));
    const enemyBullet = (gameState.enemyBullet || []).map(b => ({
      ...b,
      direction: directionReverse(b.direction),
      x: width - 1 - b.x,
      y: height - 1 - b.y,
    }));

    gameState.myTank = myTank;
    gameState.myBullet = myBullet;
    gameState.enemyTank = enemyTank;
    gameState.enemyBullet = enemyBullet;
  }

  gameStateData.obstacleList = gameStateData.obstacleList || getObstacleListFromMap(terain);
  gameStateData.obstacleMap = gameStateData.obstacleMap || new Map(gameStateData.obstacleList.map(e => ([`${e.x},${e.y}`, e])));
  // 坦克map对象
  gameStateData.myTankMap = new Map((gameState.myTank || []).map(e => ([`${e.x},${e.y}`, e])));
  gameStateData.myTankOfIdMap = new Map((gameState.myTank || []).map(e => ([e.id, e])));
  // 我方子弹map对象
  gameStateData.myBulletMap = new Map((gameState.myBullet || []).map(e => ([`${e.x},${e.y}`, e])));
  // 我方子弹以坦克ID索引的map对象
  gameStateData.myBulletOfTankMap = new Map((gameState.myBullet || []).map(e => ([e.from, e])));
  // 敌方坦克map对象
  gameStateData.enemyTankMap = new Map((gameState.enemyTank || []).map(e => ([`${e.x},${e.y}`, e])));
  // 敌方子弹以坦克ID索引的map对象
  gameStateData.enemyBulletOfTankMap = new Map((gameState.enemyTank || []).map(e => ([e.from, e])));
  // 旗子的位置，如果出现旗子则 flagPosition 不为空
  gameStateData.flagPosition = gameState.flagPosition;

  gameStateData.bulletHistory = getNextStepInfo(gameState, gameStateData);

  // 预测子弹移动和危险区域
  // 预测坦克移动
  const bulletPosition = forecastBullet(gameState, gameStateData, 3);
  const tankPosiblePosition = forecastTank(gameState, gameStateData, 3);
  const forcastList = [];
  for (let key = 0; ; key++) {
    if (!bulletPosition[key] && !tankPosiblePosition[key]) {
      break;
    }
    forcastList.push({
      ...(bulletPosition[key] || {}),
      ...(tankPosiblePosition[key] || {}),
    });
  }
  gameStateData.forcastList = forcastList;

  // action 队列
  const theActionQuery = [{ type: MAIN_FLOW_INIT }];
  state.gameState = gameState;
  state.gameStateData = gameStateData;
  state.result = [];
  for (let runCount = 0; theActionQuery.length > 0; runCount++) {
    const action = theActionQuery[0];
    // 如果这个 action 是初始 action 则将其放入队列尾部保证队列能一直进行
    if (action.isBase) {
      theActionQuery.push(action);
    }
    // 执行一个 action
    if (action.type) {
      const newAction = await missionStore.next(action);
      console.log('newAction', newAction);
      if (typeof (newAction) === 'object') {
        if (newAction.addToStart) {
          theActionQuery.unshift(newAction);
        } else {
          theActionQuery[0] = newAction;
        }
      } else {
        theActionQuery.shift();
      }
    } else {
      theActionQuery.shift();
    }
  }

  // 将相同坦克相同操作的权重合并起来
  const nextStepMap = new Map();
  state.result.forEach(e => {
    const theIndex = `${e.tankId},${e.nextStep},${e.direction}`;
    if (nextStepMap.has(theIndex)) {
      const oldStep = nextStepMap.get(theIndex);
      nextStepMap.set(theIndex, {
        ...oldStep,
        ...e,
        weight: oldStep.weight + e.weight,
      });
    } else {
      nextStepMap.set(theIndex, e);
    }
  });

  // 每个坦克选出一个权重最高的操作
  const nextStepMap2 = new Map();
  nextStepMap.forEach(e => {
    const theIndex = e.tankId;
    if (nextStepMap2.has(theIndex)) {
      const oldStep = nextStepMap2.get(theIndex);
      if (oldStep.weight < e.weight) {
        nextStepMap2.set(theIndex, e);
      }
      return;
    }
    nextStepMap2.set(theIndex, e);
  });

  let nextStepList = [...nextStepMap2.values()];
  // 返回结果前再将坦克和操作反转回去
  if (isNeedReverseMap) {
    nextStepList = nextStepList.map(e => ({
      ...e,
      direction: directionReverse(e.direction),
    }));
  }

  return nextStepList;
};
