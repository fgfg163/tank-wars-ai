const pointGenerator = (startTank, endPoint, weight = 1, lastPoint = null) => {
  const point = {
    x: startTank.x,
    y: startTank.y,
    lastPoint,
  };
  point.G = lastPoint ? lastPoint.G + weight : 0;
  point.H = Math.abs(endPoint.x - startTank.x) + Math.abs(endPoint.y - startTank.y);
  point.F = point.G + point.H;
  return point;
};

const findMinFPoint = (list = []) => {
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

const getMapValue = (p, m) =>
  m && m[p.y] && m[p.y][p.x] ? m[p.y][p.x] : null;

const getObstacleList = (mapObj) => {
  const obstacle = [];
  mapObj.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col === 1)
        obstacle.push({
          x: colIndex,
          y: rowIndex,
        })
    });
  });
  return obstacle;
};


export default function (startTank, endPoint, mapObj) {
  const obstacleList = getObstacleList(mapObj);
  const height = (mapObj || []).length;
  const width = ((mapObj || [])[0] || []).length;
  // open队列，象的方式方便取索引
  const openList = [];
  const openListMap = {};
  // close队列，做成对象的方式方便取索引
  const closeListMap = {};
  const theStartTank = pointGenerator(startTank, endPoint);
  openList.push(theStartTank);
  openListMap[`${theStartTank.x},${theStartTank.y}`] = theStartTank;

  while (openList.length > 0) {
    // 从开列表选出F值最小的点，如果F值大小相同就选列表中靠后的
    const {
      point: thePoint,
      index: thePointIndex,
    } = findMinFPoint(openList);
    // 将这个点从openList移动到closeList
    closeListMap[`${thePoint.x},${thePoint.y}`] = thePoint;
    openList.splice(thePointIndex, 1);
    delete openListMap[`${thePoint.x},${thePoint.y}`];

    // 检查这个点的四周相邻的点
    // 左边
    const lp = { x: thePoint.x - 1, y: thePoint.y };
    if (lp.x >= 0
      && !closeListMap[`${lp.x},${lp.y}`]
      && !openListMap[`${lp.x},${lp.y}`]
      && getMapValue(lp, mapObj) !== 1) {
      const widget = startTank.direction === 'left' ? 1 : 1.5;
      const newPoint = pointGenerator(lp, endPoint, widget, thePoint);
      openList.push(newPoint);
      openListMap[`${newPoint.x},${newPoint.y}`] = newPoint;
      if (newPoint.H === 0) {
        break;
      }
    }
    // 右边
    const rp = { x: thePoint.x + 1, y: thePoint.y };
    if (rp.x <= width - 1
      && !closeListMap[`${rp.x},${rp.y}`]
      && !openListMap[`${rp.x},${rp.y}`]
      && getMapValue(rp, mapObj) !== 1) {
      const widget = startTank.direction === 'right' ? 1 : 1.5;
      const newPoint = pointGenerator(rp, endPoint, widget, thePoint);
      openList.push(newPoint);
      openListMap[`${newPoint.x},${newPoint.y}`] = newPoint;
      // 如果这个点已经是目标点，则停止寻找
      if (newPoint.H === 0) {
        break;
      }
    }
    // 上边
    const up = { x: thePoint.x, y: thePoint.y - 1 };
    if (up.y >= 0
      && !closeListMap[`${up.x},${up.y}`]
      && !openListMap[`${up.x},${up.y}`]
      && getMapValue(up, mapObj) !== 1) {
      const widget = startTank.direction === 'up' ? 1 : 1.5;
      const newPoint = pointGenerator(up, endPoint, widget, thePoint);
      openList.push(newPoint);
      openListMap[`${newPoint.x},${newPoint.y}`] = newPoint;
      // 如果这个点已经是目标点，则停止寻找
      if (newPoint.H === 0) {
        break;
      }
    }
    // 下边
    const dp = { x: thePoint.x, y: thePoint.y + 1 };
    if (dp.y <= height - 1
      && !closeListMap[`${dp.x},${dp.y}`]
      && !openListMap[`${dp.x},${dp.y}`]
      && getMapValue(dp, mapObj) !== 1) {
      const widget = startTank.direction === 'down' ? 1 : 1.5;
      const newPoint = pointGenerator(dp, endPoint, widget, thePoint);
      openList.push(newPoint);
      openListMap[`${newPoint.x},${newPoint.y}`] = newPoint;
      // 如果这个点已经是目标点，则停止寻找
      if (newPoint.H === 0) {
        break;
      }
    }
  }


  // 如果列表最后一个点是终点，说明已找到路线。否则说明无法到达目标
  if (openList.length > 0 && openList[openList.length - 1].H === 0) {
    const thePath = [];
    let point = openList[openList.length - 1];
    while (point) {
      thePath.push(point);
      point = point.lastPoint;
    }
    const resultPath = thePath.reverse().map(e => {
      delete e.lastPoint;
      return e;
    });
    return resultPath;
  }
}
