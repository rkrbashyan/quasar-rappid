<template>
  <q-page padding class="row justify-center">
    <div style="width: 450px; max-width: 90vw;">
      <div class="flex column items-center">
        <h6 class="q-my-sm">You are already loged in</h6>
        <q-btn
          class="q-my-md"
          style="width:60%;"
          color="primary"
          label="Logout"
          no-caps
          @click="onLogout"
        />
      </div>
    </div>
  </q-page>
</template>

<style></style>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'PageLogout',
  methods: {
    ...mapActions('auth', ['logout']),
    onLogout() {
      this.logout().then(() => {
        this.$router.push({ name: 'login' })
      })
    }
  }
}
</script>
