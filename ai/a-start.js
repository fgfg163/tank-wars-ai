const pointGenerator = (startTank, endPoint, weight = 1, lastPoint = null) => {
  const point = {
    x: startTank.x,
    y: startTank.y,
    direction: startTank.direction,
    lastPoint,
  };
  point.G = lastPoint ? lastPoint.G + weight : 0;
  point.H = Math.abs(endPoint.x - startTank.x) + Math.abs(endPoint.y - startTank.y);
  point.F = point.G + point.H;
  return point;
};

const findMinFPoint = (list = new Map()) => {
  let minF = null;
  let minPoint = null;
  let minPointIndex = null;
  list.forEach((point, index) => {
    if (!minF || minF >= point.F) {
      minF = point.F;
      minPoint = point;
      minPointIndex = index;
    }
  });
  return { point: minPoint, index: minPointIndex };
}

const rangeArray = (start, end) => {
  const arr = Array.from({ length: Math.abs(start - end + 1) });
  return start < end ? arr.map((e, i) => start + i) : arr.map((e, i) => start - i);
};


// 所有map类型列表的索引格式为`${point.x},${point.y}`，两个坐标数字中间用英文逗号连接
// mapCellList: 棋盘格子列表，格式为{x:1, y:1, weight:10}。如果没有weight属性则该格子视为障碍物，
// 有weight属性则视为带权重的格子

export default function (startTank, endPoint, stepLength = 1, { width, height, mapCellList }) {
  const obstacleList = mapCellList.filter(e => !e.weight);
  const cellList = mapCellList.filter(e => e.weight);
  const obstracleMap = new Map(obstacleList.map(e => ([`${e.x},${e.y}`, e])));
  const cellMap = new Map(cellList.map(e => ([`${e.x},${e.y}`, e])));
  // open队列，象的方式方便取索引
  const openListMap = new Map();
  // close队列，做成对象的方式方便取索引
  const closeListMap = new Map();
  const theStartTank = pointGenerator(startTank, endPoint);
  openListMap.set(`${theStartTank.x},${theStartTank.y}`, theStartTank);

  while (openListMap.size > 0) {
    // 从开列表选出F值最小的点，如果F值大小相同就选列表中靠后的
    const {
      point: thePoint,
    } = findMinFPoint(openListMap);
    // 将这个点从openList移动到closeList
    closeListMap.set(`${thePoint.x},${thePoint.y}`, thePoint);
    openListMap.delete(`${thePoint.x},${thePoint.y}`);

    // 检查这个点的四周相邻的点
    // 左边
    // 将步长内的点都找到
    let lpList = rangeArray(thePoint.x - 1, thePoint.x - stepLength)
      .map(e => ({ x: e, y: thePoint.y }));
    let lp = null;
    // 从近到远检测是否撞墙，取撞墙前一格
    lpList.some(p => {
      if (p.x >= 0 && !obstracleMap.has(`${p.x},${p.y}`)) {
        lp = p
      } else {
        return true;
      }
    });
    if (lp) {
      const lpIndex = `${lp.x},${lp.y}`;
      if (!closeListMap.has(lpIndex)) {
        lp.direction = 'left';
        const cellWidget = (cellMap.get(lpIndex) || {}).weight || 0;
        const directionWidget = thePoint.direction === lp.direction ? 0 : 1;
        const widget = cellWidget + directionWidget;
        const oldPoint = openListMap.get(lpIndex);
        const newPoint = pointGenerator(lp, endPoint, widget, thePoint);
        if (oldPoint && oldPoint.F > newPoint.F) {
          openListMap.delete(`${oldPoint.x},${oldPoint.y}`);
        }
        if (!oldPoint || oldPoint.F > newPoint.F) {
          openListMap.set(`${newPoint.x},${newPoint.y}`, newPoint);
          // 如果这个点已经是目标点，则停止寻找
          if (newPoint.H === 0) {
            break;
          }
        }
      }
    }

    // 右边
    // 将步长内的点都找到
    let rpList = rangeArray(thePoint.x + 1, thePoint.x + stepLength)
      .map(e => ({ x: e, y: thePoint.y }));
    let rp = null;
    // 从近到远检测是否撞墙，取撞墙前一格
    rpList.some(p => {
      if (p.x <= width - 1 && !obstracleMap.has(`${p.x},${p.y}`)) {
        rp = p
      } else {
        return true;
      }
    });
    if (rp) {
      const rpIndex = `${rp.x},${rp.y}`;
      if (!closeListMap.has(rpIndex)) {
        rp.direction = 'right';
        const cellWidget = (cellMap.get(rpIndex) || {}).weight || 0;
        const directionWidget = thePoint.direction === rp.direction ? 0 : 1;
        const widget = cellWidget + directionWidget;
        const oldPoint = openListMap.get(rpIndex);
        const newPoint = pointGenerator(rp, endPoint, widget, thePoint);
        if (oldPoint && oldPoint.F > newPoint.F) {
          openListMap.delete(`${oldPoint.x},${oldPoint.y}`);
        }
        if (!oldPoint || oldPoint.F > newPoint.F) {
          openListMap.set(`${newPoint.x},${newPoint.y}`, newPoint);
          // 如果这个点已经是目标点，则停止寻找
          if (newPoint.H === 0) {
            break;
          }
        }
      }
    }
    // 上边
    // 将步长内的点都找到
    let upList = rangeArray(thePoint.y - 1, thePoint.y - stepLength)
      .map(e => ({ x: thePoint.x, y: e }));
    let up = null;
    // 从近到远检测是否撞墙，取撞墙前一格
    upList.some(p => {
      if (p.y >= 0 && !obstracleMap.has(`${p.x},${p.y}`)) {
        up = p
      } else {
        return true;
      }
    });
    if (up) {
      const upIndex = `${up.x},${up.y}`;
      if (!closeListMap.has(upIndex)) {
        up.direction = 'up';
        const cellWidget = (cellMap.get(upIndex) || {}).weight || 0;
        const directionWidget = thePoint.direction === up.direction ? 0 : 1;
        const widget = cellWidget + directionWidget;
        const oldPoint = openListMap.get(upIndex);
        const newPoint = pointGenerator(up, endPoint, widget, thePoint);
        if (oldPoint && oldPoint.F > newPoint.F) {
          openListMap.delete(`${oldPoint.x},${oldPoint.y}`);
        }
        if (!oldPoint || oldPoint.F > newPoint.F) {
          openListMap.set(`${newPoint.x},${newPoint.y}`, newPoint);
          // 如果这个点已经是目标点，则停止寻找
          if (newPoint.H === 0) {
            break;
          }
        }
      }
    }
    // 下边
    // 将步长内的点都找到
    let dpList = rangeArray(thePoint.y + 1, thePoint.y + stepLength)
      .map(e => ({ x: thePoint.x, y: e }));
    let dp = null;
    // 从近到远检测是否撞墙，取撞墙前一格
    dpList.some(p => {
      if (p.y <= height - 1 && !obstracleMap.has(`${p.x},${p.y}`)) {
        dp = p
      } else {
        return true;
      }
    });
    if (dp) {
      const dpIndex = `${dp.x},${dp.y}`;
      if (!closeListMap.has(dpIndex)) {
        dp.direction = 'down';
        const cellWidget = (cellMap.get(dpIndex) || {}).weight || 0;
        const directionWidget = thePoint.direction === dp.direction ? 0 : 1;
        const widget = cellWidget + directionWidget;
        const oldPoint = openListMap.get(dpIndex);
        const newPoint = pointGenerator(dp, endPoint, widget, thePoint);
        if (oldPoint && oldPoint.F > newPoint.F) {
          openListMap.delete(`${oldPoint.x},${oldPoint.y}`);
        }
        if (!oldPoint || oldPoint.F > newPoint.F) {
          openListMap.set(`${newPoint.x},${newPoint.y}`, newPoint);
          // 如果这个点已经是目标点，则停止寻找
          if (newPoint.H === 0) {
            break;
          }
        }
      }
    }
  }

  const openList = [...openListMap.values()];
  let finalPoint = null;
  if (openList.length > 0 && openList[openList.length - 1].H === 0) {
    // 如果列表最后一个点是终点，说明已找到路线。否则说明无法到达目标
    finalPoint = openList[openList.length - 1];
  } else {
    // 如果无法到达，则寻找一个离目标最近的点
    let minDistance;
    let minPoint;
    closeListMap.forEach(p => {
      const distance = Math.abs(p.x - endPoint.x) + Math.abs(p.y - endPoint.y);
      if (!minDistance || minDistance > distance) {
        minDistance = distance;
        minPoint = p;
      }
    });
    finalPoint = minPoint;
  }

  let thePoint = finalPoint;
  const thePath = [];
  while (thePoint) {
    thePath.push(thePoint);
    thePoint = thePoint.lastPoint;
  }
  const resultPath = thePath.reverse().map(e => {
    delete e.lastPoint;
    return e;
  });
  return resultPath;
}
