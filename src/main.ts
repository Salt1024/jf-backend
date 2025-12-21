import { createApp, watch } from 'vue'
import { router } from './router'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

const PINIA_KEY = 'jf-backend-pinia'

const piniaState = sessionStorage.getItem(PINIA_KEY)
if (piniaState) {
  pinia.state.value = JSON.parse(piniaState)
}

watch(
  pinia.state,
  (state) => {
    sessionStorage.setItem(PINIA_KEY, JSON.stringify(state))
  },
  { deep: true }
)

app.mount('#app')
