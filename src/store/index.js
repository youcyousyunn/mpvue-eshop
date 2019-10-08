import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/utils/api'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    // 首页数据
    newGoods: [],
    hotGoods: [],
    topics: [],
    brands: [],
    floorGoods: [],
    banner: [],
    channel: []
  },
  mutations: {
    getIndexData (state, res) {
      state.newGoods = res.newGoodList
      state.hotGoods = res.hotGoodList
      state.topics = res.topicList
      state.brands = res.brandList
      state.floorGoods = res.categoryList
      state.banner = res.adList
      state.channel = res.channelList
    }
  },
  actions: {
    async getIndexData ({ commit }) {
      const res = await api.getIndexData()
      // console.log('vuex取首页的数据getIndexData', res)
      if (res.rspCd === '00000') {
        commit('getIndexData', res)
      }
    }
  }
})

export default store
