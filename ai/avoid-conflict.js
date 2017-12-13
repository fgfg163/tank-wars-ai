export default (myTankOfIdMap, tankOrders) => {
  const nextPositionConflictMap = {};
  let newTankOrders = tankOrders;
  tankOrders
    .filter(order => order.nextStep === 'move')
    .forEach(order => {
      const tank = myTankOfIdMap.get(order.tankId);
      let theIndex = '';
      switch (order.direction) {
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
      nextPositionConflictMap[theIndex] = nextPositionConflictMap[theIndex] || {};
      nextPositionConflictMap[theIndex][tank.id] = tank;
    });

  Object.values(nextPositionConflictMap).forEach(tanksOnAPoint => {
    const tanks = Object.values(tanksOnAPoint);
    if (tanks.length > 1) {
      const minPath = Math.min(...tanks.filter(t => gameStateData.myTankPath[t.id]).map(t => gameStateData.myTankPath[t.id].length));
      const minPathTank = tanks.find(t => gameStateData.myTankPath[t.id] && gameStateData.myTankPath[t.id].length === minPath);
      const stayTankMap = new Set(tanks.filter(t => t.id !== minPathTank.id).map(t => t.id));

      newTankOrders = newTankOrders.map(order => {
        if (stayTankMap.has(order.tankId)) {
          const tank = myTankOfIdMap.get(order.tankId);
          return {
            ...order,
            nextStep: 'stay',
            direction: tank.direction,
          };
        } else {
          return order;
        }
      });
    }
  });

  state.result = newTankOrders;
}