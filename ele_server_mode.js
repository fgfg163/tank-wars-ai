import thrift from 'thrift'
import program from 'commander';
import UserService from './gen-nodejs/PlayerServer.js'
import ttypes from './gen-nodejs/player_types'
import ai from './ai/ai';

program
  .version('0.0.1')
  .option('-p, --port [n]', 'listen port', 8000)
  .parse(process.argv);


const directionToNum = {
  up: 1,
  down: 2,
  left: 3,
  right: 4
};
const numToDirection = {
  1: 'up',
  2: 'down',
  3: 'left',
  4: 'right',
};

const transGameMap = gamemap => {
  return gamemap;
};

const defaultState = {
  terain: [],
  myTank: [],
  myTankIdMap: new Set(),
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
      terain: transGameMap(gamemap || []),
    });
    console.log(gamemap);
    callback();
  },
  uploadParamters: function (arg, callback) {
    const { tankSpeed, shellSpeed, tankHP, tankScore, flagScore, maxRound, roundTimeoutInMs } = arg;
    state = Object.assign({}, state, {
      params: Object.assign({}, state.params, {
        tankSpeed,
        shellSpeed,
        tankHP,
        tankScore,
        flagScore,
        maxRound,
        roundTimeoutInMs,
      }),
    });
    callback();
  },
  assignTanks: function (tanks, callback) {
    const myTank = tanks || [];
    const myTankIdMap = new Set(myTank);
    state = Object.assign({}, state, {
      myTankIdMap,
    });
    callback();
  },
  latestState: function (newState, callback) {
    const { tanks, shells, yourFlagNo, enemyFlagNo, flagPos } = newState;
    const { myTankIdMap } = state;
    const newMyTank = tanks.filter(t => myTankIdMap.has(t.id)).map(t => Object.assign({}, t, {
      x: t.pos.y,
      y: t.pos.x,
      direction: numToDirection[t.dir],
    }));
    const newEnemyTank = tanks.filter(t => !myTankIdMap.has(t.id)).map(t => Object.assign({}, t, {
      x: t.pos.y,
      y: t.pos.x,
      direction: numToDirection[t.dir],
    }));
    const myBullet = shells.filter(b => myTankIdMap.has(b.id)).map(b => Object.assign({}, b, {
      from: b.id,
      x: b.pos.y,
      y: b.pos.x,
      direction: numToDirection[b.dir],
    }));
    const enemyBullet = shells.filter(b => !myTankIdMap.has(b.id)).map(b => Object.assign({}, b, {
      from: b.id,
      x: b.pos.y,
      y: b.pos.x,
      direction: numToDirection[b.dir],
    }));

    state = {
      ...state,
      myTank: newMyTank,
      enemyTank: newEnemyTank,
      myBullet,
      enemyBullet,
      myFlag: yourFlagNo,
      enemyFlag: enemyFlagNo,
      flagPosition: flagPos ? {
        ...flagPos,
        x: flagPos.y,
        y: flagPos.x,
      } : null,
    };
    console.log(Object.assign({}, newState, {
      tanks: newState.tanks.map(t => Object.assign({}, t, { x: t.pos.y, y: t.pos.x, dir: numToDirection[t.dir] })),
      shells: newState.shells.map(s => Object.assign({}, s, { x: s.pos.y, y: s.pos.x, dir: numToDirection[s.dir] })),
    }));
    callback();
  },
  getNewOrders: function (callback) {
    const tankOrders = ai(state);
    const nextTankOrder = [];
    tankOrders.forEach(tankOrder => {
      if (tankOrder.nextStep.nextStep !== 'stay') {
        let nextStep = '';
        switch (tankOrder.nextStep.nextStep) {
          case 'move':
            nextStep = 'move';
            break;
          case 'right':
          case 'left':
          case 'back':
            nextStep = 'turnTo';
            break;
          case 'fire-up':
          case 'fire-down':
          case 'fire-left':
          case 'fire-right':
            nextStep = 'fire';
            break;
        }

        nextTankOrder.push({
          tankId: tankOrder.tank.id,
          order: nextStep,
          dir: directionToNum[tankOrder.nextStep.direction],
        });
      }
    });
    console.log(nextTankOrder.map(o => Object.assign({}, o, {
      dir: numToDirection[o.dir],
    })));
    // tankOrders.forEach(tankOrder => console.log(tankOrder.tank));
    callback(null, nextTankOrder);
  },
});

server.listen(program.port);
console.log('server start');

server.on('error', (e => {
  console.log(e);
}));
