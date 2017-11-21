import commander from './commander'
import tankCommander from './tank/tank-commander'
import { getObstacleListFromMap } from './utils/map-tools'

const stateData = {};


export default function (state) {
  // 分析数据
  // 处理地图数据，将二维数组转换为点数组和map对象
  const terain = state.terain || [];
  stateData.height = (terain || []).length || 0;
  stateData.width = ((terain || [])[0] || []).length || 0;
  stateData.obstractList = stateData.obstractList || getObstacleListFromMap(terain);
  stateData.obstractMap = stateData.obstractMap || new Map(stateData.obstractList.map(e => ([`${e.x},${e.y}`, e])));
  // 坦克map对象
  stateData.myTankMap = new Map((state.myTank || []).map(e => ([`${e.x},${e.y}`, e])));
  // 我方子弹map对象
  stateData.myBulletMap = new Map((state.myBullet || []).map(e => ([`${e.x},${e.y}`, e])));
  // 我方子弹以坦克ID索引的map对象
  stateData.myBulletOfTankMap = new Map((state.myBullet || []).map(e => ([e.from, e])));
  // 敌方坦克map对象
  stateData.enemyTankMap = new Map((state.enemyTank || []).map(e => ([`${e.x},${e.y}`, e])));
  // 敌方子弹以坦克ID索引的map对象
  stateData.enemyBulletOfTankMap = new Map((state.enemyTank || []).map(e => ([e.from, e])));

  const myTank = state.myTank || [];


  // 由总指挥官选定一个目标前进
  const { targetList: commanderOrders } = commander(state, stateData);


  // 发送给坦克车长进行判断
  const tankOrders = myTank.map(tank => {
    return tankCommander(state, stateData, tank, commanderOrders);
  });

  // 检查各个坦克下一步是否冲突
  // nextPositionMap 记录了每个“下一步位置”包含多少坦克
  // 假如一个点包含了2个以上的坦克说明有冲突，此时选择一个放行其他的等一回合
  const nextPositionMap = {};
  tankOrders
    .filter(tankOrder => tankOrder.nextStep.nextStep === 'move')
    .filter(tankOrder => tankOrder.tank.path && tankOrder.tank.path.length > 1)
    .forEach(tankOrder => {
      const tank = tankOrder.tank;
      let theIndex = '';
      switch (tank.direction) {
        case 'up':
          theIndex = `${tank.x},${tank.y - 1}`;
          break;
        case 'down':
          theIndex = `${tank.x},${tank.y + 1}`;
          break;
        case 'left':
          theIndex = `${tank.x - 1},${tank.y}`;
          break;
        case 'right':
          theIndex = `${tank.x + 1},${tank.y}`;
          break;
      }
      nextPositionMap[theIndex] = nextPositionMap[theIndex] || {};
      nextPositionMap[theIndex][tank.id] = tank;
    });
  Object.values(nextPositionMap).forEach(tanksOnAPoint => {
    const tanks = Object.values(tanksOnAPoint);
    if (tanks.length > 1) {
      const minPath = Math.min(...tanks.filter(t => t.path).map(t => t.path.length));
      const minPathTank = tanks.find(t => t.path && t.path.length === minPath);
      const stayTankMap = new Set(tanks.filter(t => t.id !== minPathTank.id).map(t => t.id));

      tankOrders.forEach(o => {
        if (stayTankMap.has(o.tank.id)) {
          o.nextStep.nextStep = 'stay';
        }
      });
    }
  });

  return tankOrders;
}
