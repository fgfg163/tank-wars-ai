import makeAction from './make-action'
import {
  MAIN_FLOW_INIT,
  MAIN_FLOW_START,
  COMMON_MAP_START,
} from './container'

export default state => {
  state.mainFlow = {};

  return async action => {
    switch (action.type) {
      case MAIN_FLOW_INIT:
        return makeAction(MAIN_FLOW_START);
      case MAIN_FLOW_START:
        return makeAction(COMMON_MAP_START);
      default:
        return '';
    }
  };
}
