import thrift from 'thrift'
import program from 'commander';
import UserService from './gen-nodejs/PlayerServer.js'
import ttypes from './gen-nodejs/player_types'

program
  .version('0.0.1')
  .option('-p, --port [n]', 'listen port', 8000)
  .parse(process.argv);

const defaultState = {
  terain: [],
  myTank: [],
  myTankForIdMap: new Map(),
  myBullet: [],
  myFlag: 1,
  enemyTank: [],
  enemyBullet: [],
  enemyFlag: 1,
  events: [],
  flagWait: 5,
  flagPos: null,
  params: {
    tankScore: 2,
    flagScore: 1,
    flagTime: 50,
    tankSpeed: 1,
    bulletSpeed: 2,
  },
  ended: false,
};

let state = Object.assign({}, defaultState);


const server = thrift.createServer(UserService, {
  uploadMap: function (gamemap, callback) {
    state = Object.assign({}, defaultState, {
      terain: gamemap || [],
    });
    callback();
  },
  uploadParamters: function (arguments, callback) {
    const { tankSpeed, shellSpeed, tankHP, tankScore, flagScore, maxRound, roundTimeoutInMs } = arguments;
    state = Object.assign({}, state, {
      params: Object.assign({}, state.params, {
        tankSpeed, shellSpeed, tankHP, tankScore, flagScore, maxRound, roundTimeoutInMs,
      }),
    });
    callback();
  },
  assignTanks: function (tanks, callback) {
    const myTank = (tanks || []).map(t => Object.assign({}, t, {
      x: (t.pos || {}).x,
      y: (t.pos || {}).y,
    }));
    const myTankForIdMap = new Map(myTank.map(t => ([t.id, t])));
    state = Object.assign({}, state, {
      myTank,
      myTankForIdMap,
    });
    callback();
  },
  latestState: function (newState, callback) {
    const { tanks, shells, yourFlagNo, enemyFlagNo, flagPos } = newState;
    const { myTankForIdMap } = state;
    const newMyTank = tanks.filter(t => myTankForIdMap.has(t.id));
    const newEnemyTank = tanks.filter(t => !myTankForIdMap.has(t.id));
    state = Object.assign({}, state, {
      myTank: newMyTank,
      enemyTank: newEnemyTank,
      myBullet: shells,
      enemyBullet: shells,
      myFlag: yourFlagNo,
      enemyFlag: enemyFlagNo,
      flagPos,
    });
    callback();
  },
  getNewOrders: function (user, callback) {
    const nextStep = ai(state);
    callback();
  },
});

server.listen(program.port);
console.log('server start');

server.on('error', (e => {
  console.log(e);
});
