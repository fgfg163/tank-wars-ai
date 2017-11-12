const pointGenerator = (startPoint, endPoint, lastPoint = null) => {
  const point = {
    x: startPoint.x,
    y: startPoint.y,
    lastPoint,
  };
  point.G = lastPoint ? lastPoint.G + 1 : 0;
  point.H = Math.abs(endPoint.x - startPoint.x) + Math.abs(endPoint.y - startPoint.y);
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


export default function (startPoint, endPoint, mapObj) {
  const obstacleList = getObstacleList(mapObj);
  const height = (mapObj || []).length;
  const width = ((mapObj || [])[0] || []).length;
  // open队列
  let openList = [];
  // close队列，做成对象的方式方便取索引
  let closeListMap = {};
  const theStartPoint = pointGenerator(startPoint, endPoint);
  openList.push(theStartPoint);

  while (openList.length > 0) {
    // 从开列表选出F值最小的点，如果F值大小相同就选列表中靠后的
    const {
      point: thePoint,
      index: thePointIndex,
    } = findMinFPoint(openList);
    // 将这个点从openList移动到closeList
    closeListMap[`${thePoint.y},${thePoint.x}`] = thePoint;
    openList = openList.filter((e, index) => index !== thePointIndex);

    // 检查这个点的四周相邻的点
    // 左边
    const lp = { x: thePoint.x - 1, y: thePoint.y };
    if (lp.x >= 0 && !closeListMap[`${lp.y},${lp.x}`] && getMapValue(lp, mapObj) !== 1) {
      const newPoint = pointGenerator(lp, endPoint, thePoint);
      openList.push(newPoint);
      if (newPoint.H === 0) {
        break;
      }
    }
    // 右边
    const rp = { x: thePoint.x + 1, y: thePoint.y };
    if (rp.x <= width - 1 && !closeListMap[`${rp.y},${rp.x}`] && getMapValue(rp, mapObj) !== 1) {
      const newPoint = pointGenerator(rp, endPoint, thePoint);
      openList.push(newPoint);
      // 如果这个点已经是目标点，则停止寻找
      if (newPoint.H === 0) {
        break;
      }
    }
    // 上边
    const tp = { x: thePoint.x, y: thePoint.y - 1 };
    if (tp.y >= 0 && !closeListMap[`${tp.y},${tp.x}`] && getMapValue(tp, mapObj) !== 1) {
      const newPoint = pointGenerator(tp, endPoint, thePoint);
      openList.push(newPoint);
      // 如果这个点已经是目标点，则停止寻找
      if (newPoint.H === 0) {
        break;
      }
    }
    // 下边
    const bp = { x: thePoint.x, y: thePoint.y + 1 };
    if (bp.y <= height - 1 && !closeListMap[`${bp.y},${bp.x}`] && getMapValue(bp, mapObj) !== 1) {
      const newPoint = pointGenerator(bp, endPoint, thePoint);
      openList.push(newPoint);
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
    while (point.lastPoint) {
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
