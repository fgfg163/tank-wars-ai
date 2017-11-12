const isInList = (point, list) =>
  list.findIndex((p) => p.x === point.x && p.y === point.y) > -1;

const getMapValue = (p, m) =>
  m && m[p.y] && m[p.y][p.x] ? m[p.y][p.x] : null;

// 在指定点周围寻找指定数量的空位
export default function (startPoint, count, mapObj) {
  const height = (mapObj || []).length;
  const width = ((mapObj || [])[0] || []).length;
  const openList = [{ x: startPoint.x, y: startPoint.y }];
  const closeListMap = {};

  while (openList.length > 0) {
    const thePoint = openList.shift();
    closeListMap[`${thePoint.y},${thePoint.x}`] = thePoint;
    // 检查这个点的四周相邻的点
    // 左边
    const lp = { x: thePoint.x - 1, y: thePoint.y };
    if (lp.x >= 0 && !closeListMap[`${lp.y},${lp.x}`] && getMapValue(lp, mapObj) !== 1) {
      openList.push(lp);
    }
    // 右边
    const rp = { x: thePoint.x + 1, y: thePoint.y };
    if (rp.x <= width - 1 && !closeListMap[`${rp.y},${rp.x}`] && getMapValue(rp, mapObj) !== 1) {
      openList.push(rp);
    }
    // 上边
    const tp = { x: thePoint.x, y: thePoint.y - 1 };
    if (tp.y >= 0 && !closeListMap[`${tp.y},${tp.x}`] && getMapValue(tp, mapObj) !== 1) {
      openList.push(tp);
    }
    // 下边
    const bp = { x: thePoint.x, y: thePoint.y + 1 };
    if (bp.y <= height - 1 && !closeListMap[`${bp.y},${bp.x}`] && getMapValue(bp, mapObj) !== 1) {
      openList.push(bp);
    }
    if (Object.keys(closeListMap).length >= count) {
      return Object.values(closeListMap);
    }
  }
}
