import makeAction from './make-action'
import {
  MAP_1_INIT,
  MAP_1_START,
} from './container';

export default state => {
  state.mainFlow = {};

  return async action => {
    switch (action.type) {
      case MAP_1_INIT:
        return makeAction(MAP_1_START);
      case MAP_1_START:
        console.log('haha');

        return makeAction('');
      default:
        return '';
    }
  };
}
