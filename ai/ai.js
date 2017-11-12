import commander from './commander'
import staffOfficer from './staff-officer'
import tankCommander from './tank-commander'

export default function (state) {
  // 由总指挥官选定一个目标前进
  const { targetList: commanderOrders } = commander(state);
  console.log(commanderOrders);

  // 提取坦克和子弹信息
  const myBullet = state.myBullet || [];
  const myBulletMapFrom = {};
  myBullet.forEach(bullet => {
    myBulletMapFrom[bullet.from] = bullet;
  });
  const myTank = (state.myTank || []).map(tank => Object.assign({}, tank, {
    bullet: myBulletMapFrom[tank.id],
  }));
  state.myTank = myTank;

  // 参谋将坦克安排到选定地点附近
  const { tankList: staffOfficerOrder } = staffOfficer(state, commanderOrders);
  console.log(staffOfficerOrder);
  // 发送给坦克车长进行判断
  const tankOrder = {};
  staffOfficerOrder.forEach(tank => {
    const tOrder = tankCommander(state, tank);
    tankOrder[tank.id] = tOrder;
  });
  console.log(tankOrder);
  return tankOrder;
}
