import commander from './commander'
import tankCommander from './tank/tank-commander'
import { getObstacleListFromMap } from './utils/map-tools'

export default function (state) {
  // 分析数据
  // 处理地图数据，将二维数组转换为点数组
  const terain = state.terain || [];
  state.obstractList = getObstacleListFromMap(terain);
  const myTank = state.myTank || [];

  // 提取坦克和子弹信息
  // const myBullet = state.myBullet || [];
  // const myBulletMapFrom = {};
  // myBullet.forEach(bullet => {
  //   myBulletMapFrom[bullet.from] = bullet;
  // });
  // const myTank = (state.myTank || []).map(tank => Object.assign({}, tank, {
  //   bullet: myBulletMapFrom[tank.id],
  // }));
  // state.myTank = myTank;
  // --分析数据


  // 由总指挥官选定一个目标前进
  const { targetList: commanderOrders } = commander(state);
  console.log(commanderOrders);


  myTank.forEach(tank => {
    tank.target = commanderOrders[0];
  });

  // 发送给坦克车长进行判断
  const tankWithOrder = myTank.map(tank => {
    return tankCommander(state, tank).tank;
  });

  // 检查各个坦克下一步是否冲突
  // nextPositionMap 记录了每个“下一步位置”包含多少坦克
  // 假如一个点包含了2个以上的坦克说明有冲突，此时选择一个放行其他的等一回合
  const nextPositionMap = {};
  tankWithOrder
    .filter(tank => tank.nextStep === 'move')
    .filter(tank => tank.path && tank.path.length > 1)
    .forEach(tank => {
      const nextPoint = tank.path[1];
      const theIndex = `${nextPoint.x},${nextPoint.y}`;
      nextPositionMap[theIndex] = nextPositionMap[theIndex] || {};
      nextPositionMap[theIndex][tank.id] = tank;
    });
  Object.values(nextPositionMap).forEach(tanksOnAPoint => {
    const tanks = Object.values(tanksOnAPoint);
    if (tanks.length > 1) {
      const minPath = Math.min(...tanks.filter(t => t.path).map(t => t.path.length));
      const minPathTank = tanks.find(t => t.path && t.path.length === minPath);
      tanks.forEach(t => {
        t.nextStep = 'stay';
      });
      minPathTank.nextStep = 'move';
    }
  });

  const tankOrder = {};
  tankWithOrder.forEach(tank => {
    console.log(tank);
    tankOrder[tank.id] = tank.nextStep;
  });

  return tankOrder;
}
