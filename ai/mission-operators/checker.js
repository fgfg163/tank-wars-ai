const sleep = ms => new Promise(r => setTimeout(r, ms));

export default async (...operateLists) => {
  const operatesMap = new Map();
  operateLists
    .filter(ol => Array.isArray(ol))
    .forEach(operateList => {
      operateList
        .filter(o => Array.isArray(o) && o[0] && o[1])
        .forEach(operate => {
          if (operatesMap.has(operate[1])) {
            operatesMap.delete(operate[1]);
          }
          operatesMap.set(operate[1], operate)
        });
    });

  const operateList = operatesMap.values();
  let resTag = null;
  for (let count = 0; true; count++) {
    let res = false;
    for (let [tag, operate] of operateList) {
      if (operate(count)) {
        resTag = tag;
        res = true;
        break;
      }
    }
    if (res) {
      break;
    }
    await sleep(0);
  }
  return resTag;
}
