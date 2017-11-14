export const copy = function (map) {
  return map.map(row =>
    row.map(cell => cell)
  );
};
