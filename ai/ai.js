import commander from './commander'
import tankCommander from './tank/tank-commander'
import { getObstacleListFromMap } from './utils/map-tools'
import createMissions from './mission-creator/index'
import missions from './mission/index'
import { MAIN_FLOW_INIT } from './mission/container'

const state = {};
const missionStore = createMissions(missions, state);


export default async gameState => {
  // 分析数据
  // 处理地图数据，将二维数组转换为点数组和map对象
  const terain = gameState.terain || [];
  const gameStateData = {};
  gameStateData.height = (terain || []).length || 0;
  gameStateData.width = ((terain || [])[0] || []).length || 0;
  gameStateData.obstractList = gameStateData.obstractList || getObstacleListFromMap(terain);
  gameStateData.obstractMap = gameStateData.obstractMap || new Map(gameStateData.obstractList.map(e => ([`${e.x},${e.y}`, e])));
  // 坦克map对象
  gameStateData.myTankMap = new Map((gameState.myTank || []).map(e => ([`${e.x},${e.y}`, e])));
  // 我方子弹map对象
  gameStateData.myBulletMap = new Map((gameState.myBullet || []).map(e => ([`${e.x},${e.y}`, e])));
  // 我方子弹以坦克ID索引的map对象
  gameStateData.myBulletOfTankMap = new Map((gameState.myBullet || []).map(e => ([e.from, e])));
  // 敌方坦克map对象
  gameStateData.enemyTankMap = new Map((gameState.enemyTank || []).map(e => ([`${e.x},${e.y}`, e])));
  // 敌方子弹以坦克ID索引的map对象
  gameStateData.enemyBulletOfTankMap = new Map((gameState.enemyTank || []).map(e => ([e.from, e])));


  // action 队列
  const theActionQuery = [{ type: MAIN_FLOW_INIT }];
  state.gameState = gameState;
  state.gameStateData = gameStateData;
  state.result = {};
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
        theActionQuery[0] = newAction;
      } else {
        theActionQuery.shift();
      }
    } else {
      theActionQuery.shift();
    }
  }
  return [];
};


// const myTank = state.myTank || [];
// // 由总指挥官选定一个目标前进
// const { targetList: commanderOrders } = commander(state, gameStateData);
//
//
// // 发送给坦克车长进行判断
// const tankOrders = myTank.map(tank => {
//   return tankCommander(state, gameStateData, tank, commanderOrders);
// });
//
// // 检查各个坦克下一步是否冲突
// // nextPositionMap 记录了每个“下一步位置”包含多少坦克
// // 假如一个点包含了2个以上的坦克说明有冲突，此时选择一个放行其他的等一回合
// const nextPositionMap = {};
// tankOrders
//   .filter(tankOrder => tankOrder.nextStep.nextStep === 'move')
//   .filter(tankOrder => tankOrder.tank.path && tankOrder.tank.path.length > 1)
//   .forEach(tankOrder => {
//     const tank = tankOrder.tank;
//     let theIndex = '';
//     switch (tank.direction) {
//       case 'up':
//         theIndex = `${tank.x},${tank.y - 1}`;
//         break;
//       case 'down':
//         theIndex = `${tank.x},${tank.y + 1}`;
//         break;
//       case 'left':
//         theIndex = `${tank.x - 1},${tank.y}`;
//         break;
//       case 'right':
//         theIndex = `${tank.x + 1},${tank.y}`;
//         break;
//     }
//     nextPositionMap[theIndex] = nextPositionMap[theIndex] || {};
//     nextPositionMap[theIndex][tank.id] = tank;
//   });
// Object.values(nextPositionMap).forEach(tanksOnAPoint => {
//   const tanks = Object.values(tanksOnAPoint);
//   if (tanks.length > 1) {
//     const minPath = Math.min(...tanks.filter(t => t.path).map(t => t.path.length));
//     const minPathTank = tanks.find(t => t.path && t.path.length === minPath);
//     const stayTankMap = new Set(tanks.filter(t => t.id !== minPathTank.id).map(t => t.id));
//
//     tankOrders.forEach(o => {
//       if (stayTankMap.has(o.tank.id)) {
//         o.nextStep.nextStep = 'stay';
//       }
//     });
//   }
// });
//
//   return tankOrders;
// }
