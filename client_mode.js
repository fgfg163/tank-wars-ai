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

if (options.api) {
  (async () => {
    let state = await fetch(options.api, { method: 'GET' })
      .then(res => res.json(), err => ({ myTank: [] }));
    console.log(state);
    let i = 0;
    while (!state.ended) {
      console.log(i++);
      const nextStepList = ai(state);


      state = await fetch(options.api, { method: 'POST', body: JSON.stringify({}) }).then(r => r.json());
    }
  })().catch(e => {
    setTimeout(() => {
      throw e;
    }, 0)
  });
}
