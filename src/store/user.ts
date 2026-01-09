import { defineStore } from 'pinia'
import { post } from '@/api'

interface SignInParams {
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

interface SignInResponse {
  id: number
  /** 用户名 */
  username: string
  /** token */
  token: string
}

interface State {
  userInfo: Partial<SignInResponse>
}

export const useUserStore = defineStore('user', {
  state: (): State => ({
    userInfo: {
      id: null,
      username: '',
      token: '',
    },
  }),

  actions: {
    // 登录
    async signIn(params: SignInParams) {
      const response = await post<SignInResponse>('/api/v1/auth/signIn', params)
      this.userInfo.id = response.id
      this.userInfo.username = response.username
      sessionStorage.setItem('token', response.token)
    },

    // 注册
    async signUp(params: SignInParams) {
      return await post<void>('/api/v1/auth/signUp', {
        users: [params],
      })
    },

    async logout() {
      this.$reset()
      return true
    },
  },
})
