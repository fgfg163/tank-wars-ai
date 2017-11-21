export default (missions, state) => {
  const allMissions = {};
  Object.entries(missions).forEach(([key, missionFactory]) => {
    allMissions[key] = missionFactory(state);
  });
  const allMissionsList = Object.values(allMissions);
  return {
    getState() {
      return state;
    },
    next: async action => {
      for (const mission of allMissionsList) {
        if (typeof(mission) === 'function') {
          const newAction = await mission(action, state);
          if (newAction) {
            return newAction;
          }
        }
      }
      throw new RangeError(`Action "${action.type}" not found`);
    },
  };
}
