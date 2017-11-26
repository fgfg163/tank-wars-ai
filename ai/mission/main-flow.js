import makeAction from './make-action'
import {
  MAIN_FLOW_INIT,
  MAIN_FLOW_START,
  COMMON_MAP_START,
  MAIN_FLOW_AVOID_CONFLICT,
} from './container'

export default state => {
  state.mainFlow = {};

  return async action => {
    switch (action.type) {
      case MAIN_FLOW_INIT: {
        return makeAction(MAIN_FLOW_START);
      }
      case MAIN_FLOW_START: {
        return makeAction(COMMON_MAP_START);
      }
      case MAIN_FLOW_AVOID_CONFLICT: {
        // 检查下一步是否有冲突，有冲突就选择一个坦克前进其他都原地等待。

        return makeAction('');
      }
      default:
        return '';
    }
  };
}
