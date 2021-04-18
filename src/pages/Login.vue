<template>
  <q-page padding class="row justify-center">
    <div style="width: 400px; max-width: 90vw;">
      <h6 v-if="!isLoginFailed" class="q-my-sm">
        {{ isLogining ? 'Logining...' : 'Login' }}
      </h6>
      <h6 v-else class="q-my-sm text-negative">
        {{ errorMessage }}
      </h6>

      <div class="flex column items-center">
        <q-input
          class="q-my-sm full-width"
          v-model="userName"
          type="text"
          float-label="User Name"
          clearable
          @keydown="onKeyEnter"
        />

        <q-input
          class="q-my-sm full-width"
          v-model="password"
          type="password"
          float-label="Password"
          no-pass-toggle
          clearable
          @keydown="onKeyEnter"
        />

        <q-btn
          class="q-my-md"
          style="width:60%;"
          color="primary"
          label="Login"
          no-caps
          :loading="isLogining"
          :disable="!isLoginAllowed"
          @click="onLogin"
        >
          <q-spinner-oval slot="loading" />
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<style></style>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'PageLogin',
  data() {
    return {
      userName: '',
      password: '',
      errorMessage: ''
    }
  },
  computed: {
    ...mapState('auth', ['isLogining']),
    ...mapGetters('auth', ['isLoginFailed']),
    isLoginAllowed() {
      return this.userName && this.password && !this.isLogining
    }
  },
  methods: {
    ...mapActions('auth', ['login']),
    onLogin() {
      this.login({ userName: this.userName, password: this.password })
        .then(() => {
          this.$router.push({ name: 'index' })
        })
        .catch(({ message }) => {
          this.errorMessage = message
        })
    },
    onKeyEnter(e) {
      if (e.keyCode === 13 && this.isLoginAllowed) {
        this.onLogin()
      }
    }
  }
}
</script>
