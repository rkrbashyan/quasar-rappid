import store from '../store'

export const authGuard = (to, from, next) => {
  const isAuthenticated = store.state.auth.isAuthenticated

  if (!isAuthenticated) {
    if (to.name !== 'login') {
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    if (to.name === 'login') {
      next({ name: 'logout' })
    } else {
      next()
    }
  }
}
