import thrift from 'thrift'
import program from 'commander';
import UserService from './gen-nodejs/PlayerServer.js'
import ttypes from './gen-nodejs/player_types'
import ai from './ai/ai';

program
  .version('0.0.1')
  .option('-p, --port [n]', 'listen port', 8000)
  .parse(process.argv);


const directionToNum = (() => {
  const theMap = {
    up: 1,
    down: 2,
    left: 3,
    right: 4
  };
  return direction => theMap[direction] || direction;
})();
const numToDirection = (() => {
  const theMap = {
    1: 'up',
    2: 'down',
    3: 'left',
    4: 'right',
  };
  return direction => theMap[direction] || direction;
})();

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
      direction: numToDirection(t.dir),
    }));
    const newEnemyTank = tanks.filter(t => !myTankIdMap.has(t.id)).map(t => Object.assign({}, t, {
      x: t.pos.y,
      y: t.pos.x,
      direction: numToDirection(t.dir),
    }));
    const myBullet = shells.filter(b => myTankIdMap.has(b.id)).map(b => Object.assign({}, b, {
      from: b.id,
      x: b.pos.y,
      y: b.pos.x,
      direction: numToDirection(b.dir),
    }));
    const enemyBullet = shells.filter(b => !myTankIdMap.has(b.id)).map(b => Object.assign({}, b, {
      from: b.id,
      x: b.pos.y,
      y: b.pos.x,
      direction: numToDirection(b.dir),
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
      tanks: newState.tanks.map(t => Object.assign({}, t, { x: t.pos.y, y: t.pos.x, dir: numToDirection(t.dir) })),
      shells: newState.shells.map(s => Object.assign({}, s, { x: s.pos.y, y: s.pos.x, dir: numToDirection(s.dir) })),
    }));
    callback();
  },
  getNewOrders: function (callback) {
    (async () => {
      const nextStepList = await ai(state);
      console.log(nextStepList);
      const nextTankOrder = [];
      nextStepList.forEach(tankOrder => {
        if (tankOrder.nextStep.nextStep !== 'stay') {
          let nextStep = '';

          nextTankOrder.push({
            tankId: tankOrder.tankId,
            order: tankOrder.nextStep,
            dir: directionToNum(tankOrder.direction),
          });
        }
      });

      console.log(nextTankOrder.map(o => ({
        ...o,
        dir: numToDirection(o.dir),
      })));
      // tankOrders.forEach(tankOrder => console.log(tankOrder.tank));
      callback(null, nextTankOrder);
    })().catch(e => {
      setTimeout(() => {
        throw e;
      }, 0)
    });
  },
});

server.listen(program.port);
console.log('server start');

server.on('error', (e => {
  console.log(e);
}));
