import { rangeArray } from '../utils/map-tools';

export default function (state, stateData, tank, commanderOrders) {
  const obstractMap = stateData.obstractMap;
  const myTankMap = stateData.myTankMap;
  const enemyTankMap = stateData.enemyTankMap;
  const myBulletOfTankMap = stateData.myBulletOfTankMap;
  const width = stateData.width;
  const height = stateData.height;

  const orders = commanderOrders.filter(order => {
    if (order.type === 'fire' || order.type === 'auto-fire') {
      if (order.tankId === 'ALL' || order.tankId === tank.id) {
        return true;
      }
    }
  });

  const theOrder = orders[0];

  let nextStepMap = {
    'fire-up': {
      tankId: tank.id,
      nextStep: 'fire-up',
      weight: 0,
    },
    'fire-down': {
      tankId: tank.id,
      nextStep: 'fire-down',
      weight: 0,
    },
    'fire-left': {
      tankId: tank.id,
      nextStep: 'fire-left',
      weight: 0,
    },
    'fire-right': {
      tankId: tank.id,
      nextStep: 'fire-right',
      weight: 0,
    },
  };

  // 如果本坦克有炮弹在地图上，就不进行开炮
  if (theOrder && !myBulletOfTankMap.has(tank.id)) {
    // 扫描坦克横竖直线上，宽3格的位置是否有敌人
    // 垂直方向扫描的宽度
    const scanXStart = Math.max(tank.x - 1, 0);
    const scanXEnd = Math.min(tank.x + 1, width - 1);
    // 上方
    rangeArray(tank.y - 1, 0).some((theY, distance) => {
      if (obstractMap.has(`${tank.x},${theY}`)) {
        return true;
      }
      rangeArray(scanXStart, scanXEnd).some(theX => {
        const theIndex = `${theX},${theY}`;
        if (theX === tank.x && myTankMap.has(theIndex)) {
          nextStepMap['fire-up'].weight = -1000;
        }
        if (enemyTankMap.has(theIndex)) {
          nextStepMap['fire-up'].weight += 10 + height - distance;
        }
      });
    });
    // 下方
    rangeArray(tank.y + 1, height - 1).some((theY, distance) => {
      if (obstractMap.has(`${tank.x},${theY}`)) {
        return true;
      }
      rangeArray(scanXStart, scanXEnd).some(theX => {
        const theIndex = `${theX},${theY}`;
        if (theX === tank.x && myTankMap.has(theIndex)) {
          nextStepMap['fire-down'].weight = -1000;
        }
        if (enemyTankMap.has(theIndex)) {
          nextStepMap['fire-down'].weight += 10 + height - distance;
        }
      });
    });
    // 水平方向扫描的宽度
    const scanYStart = Math.max(tank.y - 1, 0);
    const scanYEnd = Math.min(tank.y + 1, width - 1);
    // 左方
    rangeArray(tank.x - 1, 0).some((theX, distance) => {
      if (obstractMap.has(`${theX},${tank.y}`)) {
        return true;
      }
      rangeArray(scanYStart, scanYEnd).some(theY => {
        const theIndex = `${theX},${theY}`;
        if (theY === tank.y && myTankMap.has(theIndex)) {
          nextStepMap['fire-left'].weight = -1000;
        }
        if (enemyTankMap.has(theIndex)) {
          nextStepMap['fire-left'].weight += 10 + width - distance;
        }
      });
    });
    // 右方
    rangeArray(tank.x + 1, width - 1).some((theX, distance) => {
      if (obstractMap.has(`${theX},${tank.y}`)) {
        return true;
      }
      rangeArray(scanYStart, scanYEnd).some(theY => {
        const theIndex = `${theX},${theY}`;
        if (theY === tank.y && myTankMap.has(theIndex)) {
          nextStepMap['fire-right'].weight = -1000;
        }
        if (enemyTankMap.has(theIndex)) {
          nextStepMap['fire-right'].weight += 10 + width - distance;
        }
      });
    });
  }

  const nextStepList = Object.values(nextStepMap).map(e => (Object.assign({}, e, {
    weight: e.weight > 0 ? e.weight + theOrder.weight : e.weight,
  })));

  return {
    type: '',
    nextStepList,
  };
}
