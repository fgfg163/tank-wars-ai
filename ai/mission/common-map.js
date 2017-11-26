import makeAction from './make-action'
import moveToPoint from '../tank/move-to-point'
import autoFire from '../tank/auto-fire'
import dodgeBullet from '../tank/dodge-bullet'
import {
  checkGetFlagCost,
  checkMoveToClosestEnemyCost,
} from '../mission-operators/common-map'

import {
  COMMON_MAP_INIT,
  COMMON_MAP_START,
  COMMON_MAP_CHECK_MAP_SITUATION,
  COMMON_MAP_MOVE_TO_FLAG,
  COMMON_MAP_MOVE_TO_ENEMY,
  COMMON_MAP_MOVE_TO_CENTER,
  COMMON_MAP_AUTO_FIRE,
  COMMON_MAP_DODGE_BULLET,
  MAIN_FLOW_AVOID_CONFLICT,
} from './container'

export default state => {
  state.mainFlow = {};

  return async (action, state) => {
    const mainFlow = state.mainFlow;
    switch (action.type) {
      case COMMON_MAP_INIT: {
        return makeAction(COMMON_MAP_START);
      }
      case COMMON_MAP_START: {
        return makeAction(COMMON_MAP_CHECK_MAP_SITUATION);
      }
      case COMMON_MAP_CHECK_MAP_SITUATION: {
        // 检查棋盘状况，如果有旗子就去抢，如果没有就追着敌方坦克
        const { gameState, gameStateData } = state;
        mainFlow.getFlagCost = checkGetFlagCost(gameState, gameStateData);
        const {
          distance: moveToClosestEnemyCost,
          enemy: closestEnemy,
        } = checkMoveToClosestEnemyCost(gameState, gameStateData);
        mainFlow.moveToClosestEnemyCost = moveToClosestEnemyCost;
        mainFlow.closestEnemy = closestEnemy;
        if (mainFlow.moveToClosestEnemyCost === 0 && mainFlow.getFlagCost === 0) {
          return makeAction(COMMON_MAP_MOVE_TO_CENTER);
        } else if (mainFlow.moveToClosestEnemyCost < mainFlow.getFlagCost) {
          return makeAction(COMMON_MAP_MOVE_TO_FLAG);
        }
        return makeAction(COMMON_MAP_MOVE_TO_ENEMY);
      }
      case COMMON_MAP_MOVE_TO_FLAG: {
        const { gameState, gameStateData } = state;
        const { flagPosition, myTank } = gameState;
        myTank.forEach(tank => {
          state.result.push(...moveToPoint(gameState, gameStateData, tank, flagPosition));
        });
        return makeAction(COMMON_MAP_AUTO_FIRE);
      }
      case COMMON_MAP_MOVE_TO_ENEMY: {
        const { gameState, gameStateData } = state;
        const { flagPosition, myTank } = gameState;
        myTank.forEach(tank => {
          state.result.push(...moveToPoint(gameState, gameStateData, tank, mainFlow.closestEnemy));
        });
        return makeAction(COMMON_MAP_AUTO_FIRE);
      }
      case COMMON_MAP_MOVE_TO_CENTER: {
        const { gameState, gameStateData } = state;
        const { myTank } = gameState;
        const { width, height, } = gameStateData;
        const center = { x: Math.floor(width / 2), y: Math.floor(height / 2) }
        myTank.forEach(tank => {
          state.result.push(...moveToPoint(gameState, gameStateData, tank, center));
        });
        return makeAction(COMMON_MAP_AUTO_FIRE);
      }
      case COMMON_MAP_AUTO_FIRE: {
        const { gameState, gameStateData } = state;
        const { myTank } = gameState;
        myTank.forEach(tank => {
          state.result.push(...autoFire(gameState, gameStateData, tank));
        });
        return makeAction(COMMON_MAP_DODGE_BULLET);
      }
      case COMMON_MAP_DODGE_BULLET: {
        const { gameState, gameStateData } = state;
        const { myTank } = gameState;
        state.result.push(...dodgeBullet(gameState, gameStateData));
        return makeAction(MAIN_FLOW_AVOID_CONFLICT);
      }
      default: {
        return '';
      }
    }
  }
}
