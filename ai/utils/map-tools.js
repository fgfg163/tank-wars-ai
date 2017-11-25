export const copy = function (map) {
  return map.map(row =>
    row.map(cell => cell)
  );
};

export const getObstacleListFromMap = (mapObj) => {
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

export const rangeArray = function (start, end) {
  const arr = Array.from({ length: Math.abs(start - end) + 1 });
  if (start < end) {
    return arr.map((e, i) => start + i);
  }
  return arr.map((e, i) => start - i);
}

export const isTanksInArea = function (point1, point2, tanksList) {
  const left = Math.min(point1.x, point2.x);
  const right = Math.max(point1.x, point2.x);
  const up = Math.min(point1.y, point2.y);
  const down = Math.max(point1.y, point2.y);

  const tanksX = tanksList.map(t => t.x);
  const tanksY = tanksList.map(t => t.y);
  const tanksMinX = Math.min(...tanksX);
  const tanksMaxX = Math.max(...tanksX);
  const tanksMinY = Math.min(...tanksY);
  const tanksMaxY = Math.max(...tanksY);
  if (tanksMinX >= left && tanksMaxX <= right && tanksMinY >= up && tanksMaxY <= down) {
    return true;
  }
  return false;
}

export const pointStr = (point, pointy) => {
  if (pointy === undefined || pointy === null) {
    return `${point.x},${point.y}`;
  }
  return `${point},${pointy}`;
}
