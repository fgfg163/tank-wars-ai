const pointGenerator = (startTank, endPoint, weight = 1, lastPoint = null) => {
  const point = {
    x: startTank.x,
    y: startTank.y,
    direction: startTank.direction,
    lastPoint,
  };
  // 从起点到这个点的深度
  point.step = lastPoint ? lastPoint.step + 1 : 0;
  // 从起点到这个点的消耗
  point.G = lastPoint ? lastPoint.G + weight : 0;
  // 到终点的消耗(估算)
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

const isSamePosition = (point1, point2) => point1.x === point2.x && point1.y === point2.y;

const rangeArray = (start, end) => {
  const arr = Array.from({ length: Math.abs(start - end + 1) });
  return start < end ? arr.map((e, i) => start + i) : arr.map((e, i) => start - i);
};

const getThePath = (endPoint) => {
  let thePoint = endPoint;
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

// 下一个点在当前点的方向，相对地图的方向
const getNextPointDirection = (nowPoint, nextPoint) => {
  if (nowPoint.x === nextPoint.x && nowPoint.y > nextPoint.y) {
    // 下一步在当前位置的上方
    return 'up';
  } else if (nowPoint.x === nextPoint.x && nowPoint.y < nextPoint.y) {
    // 下一步在当前位置的下方
    return 'down';
  } else if (nowPoint.x > nextPoint.x && nowPoint.y === nextPoint.y) {
    // 下一步在当前位置的左方
    return 'left';
  } else if (nowPoint.x < nextPoint.x && nowPoint.y === nextPoint.y) {
    // 下一步在当前位置的右方
    return 'right';
  }
  return '';
};

// 所有map类型列表的索引格式为`${point.x},${point.y}`，两个坐标数字中间用英文逗号连接
// mapCellList: 棋盘格子列表，格式为{x:1, y:1, weight:10}。如果没有weight属性则该格子视为障碍物，
// 有weight属性则视为带权重的格子

export const toPoint = (startTank, endPoint, option) => {
  const {
    stepLength = 1,
    stepDeep, // 路线搜索深度
    turnCost = 1, // 转向权重，即寻路时转向比直行花费更高
    width,
    height,
    obstacleMap = new Map(),
    mapCellList = [], // 地图格子的列表，一维数组
  } = option;

  if (isSamePosition(startTank, endPoint)) {
    return {};
  }


  const theStepDeep = typeof(stepDeep) === 'number' ? stepDeep : Math.abs(startTank.x - endPoint.x) + Math.abs(startTank.y - endPoint.y) * 2;
  // 地图格子列表，包括所有带权重的格子
  const mapCellMap = new Map(mapCellList.map(e => ([`${e.x},${e.y}`, e])));
  // open队列，象的方式方便取索引
  const openListMap = new Map();
  // close队列，做成对象的方式方便取索引
  const closeListMap = new Map();
  const theStartTank = pointGenerator(startTank, endPoint);
  openListMap.set(`${theStartTank.x},${theStartTank.y}`, theStartTank);

  // 路径是否经过终点的标记。如果经过了目标点，则标记为 true。在速度>1的情况下可避免在终点附近来回找终点。
  let isPassedEndPoint = false;
  for (let step = 0; openListMap.size > 0 && !isPassedEndPoint; step++) {
    // 从开列表选出F值最小的点，如果F值大小相同就选列表中靠后的
    const {
      point: thePoint,
    } = findMinFPoint(openListMap);
    // 将这个点从openList移动到closeList
    closeListMap.set(`${thePoint.x},${thePoint.y}`, thePoint);
    openListMap.delete(`${thePoint.x},${thePoint.y}`);

    if (thePoint.step >= theStepDeep) {
      break;
    }

    // 检查这个点的四周相邻的点
    // 左边
    // 将步长内的点都找到
    let lpList = rangeArray(thePoint.x - 1, thePoint.x - stepLength)
      .map(e => ({ x: e, y: thePoint.y }));
    let lp = null;
    // 从近到远检测是否撞墙，取撞墙前一格。如果此时经过了目标点，则标记一下。
    lpList.some(p => {
      if (p.x >= 0 && !obstacleMap.has(`${p.x},${p.y}`)) {
        lp = p;
        // 如果经过了终点，则标记一下
        if (isSamePosition(p, endPoint)) {
          isPassedEndPoint = true;
        }
      } else {
        return true;
      }
    });
    if (lp) {
      const lpIndex = `${lp.x},${lp.y}`;
      if (!closeListMap.has(lpIndex)) {
        lp.direction = 'left';
        const cellWidget = (mapCellMap.get(lpIndex) || {}).weight || 0;
        const directionWidget = thePoint.direction === lp.direction ? 0 : turnCost;
        const widget = cellWidget + directionWidget;
        const oldPoint = openListMap.get(lpIndex);
        const newPoint = pointGenerator(lp, endPoint, widget, thePoint);
        if (oldPoint && oldPoint.F > newPoint.F) {
          openListMap.delete(`${oldPoint.x},${oldPoint.y}`);
        }
        if (!oldPoint || oldPoint.F > newPoint.F) {
          openListMap.set(`${newPoint.x},${newPoint.y}`, newPoint);
          // 如果这个点已经是目标点，则停止寻找
          if (isSamePosition(newPoint, endPoint)) {
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
    // 从近到远检测是否撞墙，取撞墙前一格。如果此时经过了目标点，则标记一下。
    rpList.some(p => {
      if (p.x <= width - 1 && !obstacleMap.has(`${p.x},${p.y}`)) {
        rp = p;
        // 如果经过了终点，则标记一下
        if (isSamePosition(p, endPoint)) {
          isPassedEndPoint = true;
        }
      } else {
        return true;
      }
    });
    if (rp) {
      const rpIndex = `${rp.x},${rp.y}`;
      if (!closeListMap.has(rpIndex)) {
        rp.direction = 'right';
        const cellWidget = (mapCellMap.get(rpIndex) || {}).weight || 0;
        const directionWidget = thePoint.direction === rp.direction ? 0 : turnCost;
        const widget = cellWidget + directionWidget;
        const oldPoint = openListMap.get(rpIndex);
        const newPoint = pointGenerator(rp, endPoint, widget, thePoint);
        if (oldPoint && oldPoint.F > newPoint.F) {
          openListMap.delete(`${oldPoint.x},${oldPoint.y}`);
        }
        if (!oldPoint || oldPoint.F > newPoint.F) {
          openListMap.set(`${newPoint.x},${newPoint.y}`, newPoint);
          // 如果这个点已经是目标点，则停止寻找
          if (isSamePosition(newPoint, endPoint)) {
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
    // 从近到远检测是否撞墙，取撞墙前一格。如果此时经过了目标点，则标记一下。
    upList.some(p => {
      if (p.y >= 0 && !obstacleMap.has(`${p.x},${p.y}`)) {
        up = p;
        // 如果经过了终点，则标记一下
        if (isSamePosition(p, endPoint)) {
          isPassedEndPoint = true;
        }
      } else {
        return true;
      }
    });
    if (up) {
      const upIndex = `${up.x},${up.y}`;
      if (!closeListMap.has(upIndex)) {
        up.direction = 'up';
        const cellWidget = (mapCellMap.get(upIndex) || {}).weight || 0;
        const directionWidget = thePoint.direction === up.direction ? 0 : turnCost;
        const widget = cellWidget + directionWidget;
        const oldPoint = openListMap.get(upIndex);
        const newPoint = pointGenerator(up, endPoint, widget, thePoint);
        if (oldPoint && oldPoint.F > newPoint.F) {
          openListMap.delete(`${oldPoint.x},${oldPoint.y}`);
        }
        if (!oldPoint || oldPoint.F > newPoint.F) {
          openListMap.set(`${newPoint.x},${newPoint.y}`, newPoint);
          // 如果这个点已经是目标点，则停止寻找
          if (isSamePosition(newPoint, endPoint)) {
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
    // 从近到远检测是否撞墙，取撞墙前一格。如果此时经过了目标点，则标记一下。
    dpList.some(p => {
      if (p.y <= height - 1 && !obstacleMap.has(`${p.x},${p.y}`)) {
        dp = p;
        // 如果经过了终点，则标记一下
        if (isSamePosition(p, endPoint)) {
          isPassedEndPoint = true;
        }
      } else {
        return true;
      }
    });
    if (dp) {
      const dpIndex = `${dp.x},${dp.y}`;
      if (!closeListMap.has(dpIndex)) {
        dp.direction = 'down';
        const cellWidget = (mapCellMap.get(dpIndex) || {}).weight || 0;
        const directionWidget = thePoint.direction === dp.direction ? 0 : turnCost;
        const widget = cellWidget + directionWidget;
        const oldPoint = openListMap.get(dpIndex);
        const newPoint = pointGenerator(dp, endPoint, widget, thePoint);
        if (oldPoint && oldPoint.F > newPoint.F) {
          openListMap.delete(`${oldPoint.x},${oldPoint.y}`);
        }
        if (!oldPoint || oldPoint.F > newPoint.F) {
          openListMap.set(`${newPoint.x},${newPoint.y}`, newPoint);
          // 如果这个点已经是目标点，则停止寻找
          if (isSamePosition(newPoint, endPoint)) {
            break;
          }
        }
      }
    }
  }

  const result = {
    path: null,
    accurate: null,
    pass: null,
    near: null,
  };

  const openList = [...openListMap.values()];
  if (openList.length > 0 && isSamePosition(openList[openList.length - 1], endPoint)) {
    // 如果列表最后一个点是终点，说明已找到路线。否则说明无法到达目标
    const finalPoint = openList[openList.length - 1];
    result.accurate = getThePath(finalPoint);
  } else if (openList.length > 0 && isPassedEndPoint) {
    // 如果路径经过了终点，则将这条路径记录下来
    const finalPoint = openList[openList.length - 1];
    result.pass = getThePath(finalPoint);
  } else if (closeListMap.size > 1) {
    // 如果无法在指定步数内到达，则寻找一个离目标最近的点作为目标
    let minDistance;
    let minPoint;
    closeListMap.forEach(p => {
      if (!minDistance || minDistance > p.H) {
        minDistance = p.H;
        minPoint = p;
      }
    });
    result.near = getThePath(minPoint);
  }
  // path 表示一条可行的路径，其他参数则精确说明他们是哪种路径
  result.path = result.accurate || result.pass || result.near;

  return result;
}

export const getOperatorListFromPath = (path, limit) => {
  if (!path) {
    throw 'path is null';
  }
  if (path.length === 0) {
    return path;
  }
  const operatorList = [];
  if (path.length > 1) {
    for (let key = 0; key < path.length - 1 && (!limit || key < limit); key++) {
      const nowPoint = path[key];
      const nextPoint = path[key + 1];

      if (nowPoint.direction !== nextPoint.direction) {
        let turnTo = '';
        switch (`${nowPoint.direction},${nextPoint.direction}`) {
          case 'up,left':
          case 'left,down':
          case 'down,right':
          case 'right,up':
            turnTo = 'left';
            break;
          case 'up,right':
          case 'left,up':
          case 'down,left':
          case 'right,down':
            turnTo = 'right';
            break;
          case 'up,down':
          case 'left,right':
          case 'down,up':
          case 'right,left':
            turnTo = 'back';
            break;
        }
        operatorList.push({
          ...nowPoint,
          nextStep: 'turnTo',
          turnTo,
        });
        operatorList.push({
          ...nowPoint,
          nextStep: 'move',
          direction: nextPoint.direction,
        });

      } else {
        operatorList.push({
          ...nowPoint,
          nextStep: 'move',
        });
      }
    }
    operatorList.push({ ...path[path.length - 1] });
  }
  return operatorList;
}

export const getOperatorListAndPathFromPath = (path, limit) => {
  if (!path) {
    throw 'path is null';
  }
  if (path.length === 0) {
    return path;
  }

  const getPathBetween = (p1, p2) => {
    if (p1.x === p2.x) {
      return rangeArray(p1.y, p2.y).map(y => ({ ...p1, x: p1.x, y }));
    } else if (p1.y === p2.y) {
      return rangeArray(p1.x, p2.x).map(x => ({ ...p1, x, y: p1.y }));
    }
  };

  const operatorList = [];
  if (path.length > 1) {
    for (let key = 0; key < path.length - 1 && (!limit || key < limit); key++) {
      const nowPoint = path[key];
      const nextPoint = path[key + 1];
      const pathBetween = [];

      if (nowPoint.direction !== nextPoint.direction) {
        let turnTo = '';
        switch (`${nowPoint.direction},${nextPoint.direction}`) {
          case 'up,left':
          case 'left,down':
          case 'down,right':
          case 'right,up':
            turnTo = 'left';
            break;
          case 'up,right':
          case 'left,up':
          case 'down,left':
          case 'right,down':
            turnTo = 'right';
            break;
          case 'up,down':
          case 'left,right':
          case 'down,up':
          case 'right,left':
            turnTo = 'back';
            break;
        }
        operatorList.push([{
          ...nowPoint,
          nextStep: 'turnTo',
          turnTo,
        }]);
        operatorList.push([
          {
            ...nowPoint,
            nextStep: 'move',
            direction: nextPoint.direction,
          },
          ...getPathBetween(nowPoint, nextPoint),
        ]);

      } else {
        operatorList.push([
          {
            ...nowPoint,
            nextStep: 'move',
          },
          ...getPathBetween(nowPoint, nextPoint),
        ]);
      }
    }
    operatorList.push([{ ...path[path.length - 1] }]);
  }
  return operatorList;
}
