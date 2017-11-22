import cannoneer from './cannoneer';
import driver from './move-to-point';


export default function (state, stateData, tank, commanderOrders) {
  const width = stateData.width;
  const height = stateData.height;

  // 获取敌方坦克的方位
  const enemyBulletMap = stateData.enemyBulletMap;
  // 获取我方坦克的方位
  const myTank = state.myTank || [];
  const myBulletMap = stateData.myBulletMap;

  let nextOrder;


  const { nextStepList: fireEvent } = cannoneer(state, stateData, tank, commanderOrders);
  const { nextStepList: moveEvent } = driver(state, stateData, tank, commanderOrders);
  const allEvent = [...fireEvent, ...moveEvent];
  const allEffectEvent = allEvent.filter(e => e.weight > 0);
  let nextStep = {};
  if (allEffectEvent.length > 1) {
    const maxWeight = Math.max(...allEffectEvent.map(e => e.weight));
    nextStep = allEffectEvent.find(e => e.weight === maxWeight);
  } else if (allEffectEvent.length > 0) {
    nextStep = allEffectEvent[0];
  }

  return {
    type: '',
    tank,
    nextStep,
  };
}
