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
