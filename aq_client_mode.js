import program from 'commander';
import { ai } from './ai/ai';

program
  .version('0.0.1')
  .option('-s, --side [n]', 'red or blue', 'blue')
  .option('-i, --id [n]', 'Game id')
  .option('-a, --api [n]', 'Game api, will overwrite side and id')
  .parse(process.argv);

const options = {
  side: program.side,
  gameid: program.id,
  api: program.api,
};
if (!program.api) {
  options.api = `http://ml.niven.cn:8777/game/${options.gameid}/match/${options.side}`;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

if (options.api) {
  (async () => {
    let state = await fetch(options.api, { method: 'GET' })
      .then(res => res.json(), err => ({ myTank: [] }));
    console.log(state);
    let i = 0;
    while (!state.ended) {
      console.log(i++, '--------------------------------');

      state = {
        ...state,
        flagPosition: state.flagWait === 0 ? {
          x: (state.params || {}).flagX,
          y: (state.params || {}).flagY,
        } : null,
      };

      const tankOrders = await ai(state);

      const nextTankOrder = {};
      tankOrders.forEach(tankOrder => {
        console.log(tankOrder);
        if (tankOrder.nextStep === 'fire') {
          nextTankOrder[tankOrder.tankId] = `${tankOrder.nextStep}-${tankOrder.direction}`;
        } else if (tankOrder.nextStep === 'turnTo') {
          nextTankOrder[tankOrder.tankId] = tankOrder.turnTo;
        } else {
          nextTankOrder[tankOrder.tankId] = tankOrder.nextStep;
        }
      });
      console.log(nextTankOrder);

      state = await fetch(options.api, { method: 'POST', body: JSON.stringify(nextTankOrder) }).then(r => r.json());
      await sleep(0);
    }
  })().catch(e => {
    setTimeout(() => {
      throw e;
    }, 0)
  });
}
