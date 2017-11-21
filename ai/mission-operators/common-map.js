export const defaultOperat = () => true

export const isFlagInMap = (state) =>
  () => {
    const params = state.gameStateData.params;
    if (params.flagX && params.flagY) {
      return true;
    }
  }
