import { delay } from '../../utils'

const STATUS = {
  ok: 'ok',
  pending: 'pending',
  failed: 'failed'
}

const getInitialState = () => ({
  isAuthenticated: false,
  isLogining: false,
  loginStatus: STATUS.pending
})

const getters = {
  isLoginFailed: state => state.loginStatus === STATUS.failed
}

const mutations = {
  IS_AUTHENTICATED_SET(state, value) {
    state.isAuthenticated = value
  },
  IS_LOGINING_SET(state, status) {
    state.isLogining = status
  },
  LOGIN_STATUS_SET(state, status) {
    state.loginStatus = status
  },
  STATE_RESET(state) {
    const s = getInitialState()
    Object.keys(s).forEach(key => {
      state[key] = s[key]
    })
  }
}

const actions = {
  login({ commit }, { userName, password }) {
    commit('IS_LOGINING_SET', true)
    commit('LOGIN_STATUS_SET', STATUS.pending)

    return delay(500)
      .then(() => {
        return userName === 'admin' && password === 'admin'
          ? STATUS.ok
          : STATUS.failed
      })
      .then(status => {
        if (status === 'ok') {
          commit('IS_AUTHENTICATED_SET', true)
          commit('LOGIN_STATUS_SET', status)
        } else {
          commit('LOGIN_STATUS_SET', status)
          throw new Error('Login: Username/password mismatch')
        }
      })
      .finally(() => {
        commit('IS_LOGINING_SET', false)
      })
  },
  logout({ commit }) {
    commit('STATE_RESET')
  }
}

export default {
  namespaced: true,
  state: getInitialState,
  getters,
  mutations,
  actions
}
