const mutations: any = {
  setInsights(state: any, payload: {insights: any}) {
    state.insights = payload.insights || [];
  },
};

export default mutations;
