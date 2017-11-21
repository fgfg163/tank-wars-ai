import makeAction from './make-action'
import checker from '../mission-operators/checker'
import {
  isFlagInMap,
  defaultOperat
} from '../mission-operators/common-map'

import {
  COMMON_MAP_INIT,
  COMMON_MAP_START,
  COMMON_MAP_MOVE_TO_FLAG,
  COMMON_MAP_MOVE_TO_CENTER,
} from './container'

export default state => {
  state.mainFlow = {};

  return async (action, state) => {
    switch (action.type) {
      case COMMON_MAP_INIT: {
        return makeAction(COMMON_MAP_START);
      }
      case COMMON_MAP_START: {
        const newAction = await checker([
          [COMMON_MAP_MOVE_TO_FLAG, isFlagInMap(state)],
          [COMMON_MAP_MOVE_TO_CENTER, defaultOperat],
        ]);
        return makeAction(newAction);
      }
      case COMMON_MAP_MOVE_TO_FLAG: {

        return makeAction('');
      }
      case COMMON_MAP_MOVE_TO_CENTER: {

        return makeAction('');
      }
      default: {
        return '';
      }
    }
  }
}
