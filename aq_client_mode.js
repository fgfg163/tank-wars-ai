import program from 'commander';
import ai from './ai/ai';

program
  .version('0.0.1')
  .option('-s, --side [n]', 'Red or Blue')
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
      const tankOrders = await ai(state);

      const nextTankOrder = {};
      tankOrders.forEach(tankOrder => {
        nextTankOrder[tankOrder.tank.id] = tankOrder.nextStep.nextStep;
      });
      console.log(nextTankOrder);

      state = await fetch(options.api, { method: 'POST', body: JSON.stringify(nextTankOrder) }).then(r => r.json());
      await sleep(500);
    }
  })().catch(e => {
    setTimeout(() => {
      throw e;
    }, 0)
  });
}
