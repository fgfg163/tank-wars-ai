import aStart from './ai/a-start'

const theMap = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];


const path = aStart({ x: 0, y: 0, direction: 'up' }, { x: 4, y: 4 }, theMap);
console.log(path);
