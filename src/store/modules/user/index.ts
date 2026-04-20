import type { providerType, UserState } from './types'
import type { LoginReq } from '@/api/user/types'
import { defineStore } from 'pinia'
import { UserApi } from '@/api'

import { clearToken, setToken } from '@/utils/auth'

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user_id: '',
    user_name: '',
    avatar: '',
    gender: 'unknown',
    years_of_playing: 0,
    level: '',
    real_name: '',
    phone: '',
    token: '',
  }),
  actions: {
    // 设置用户的信息
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial)
    },
    // 重置用户信息
    resetInfo() {
      this.$reset()
    },
    // 获取用户信息
    async info() {
      const result = await UserApi.me()
      this.setInfo({
        user_id: result.user_id ? String(result.user_id) : '',
        user_name: result.user_name ?? '',
        avatar: result.avatar ?? '',
        gender: result.gender ?? 'unknown',
        years_of_playing: result.years_of_playing ?? 0,
        level: result.level ?? '',
        real_name: result.real_name ?? '',
        phone: result.phone ?? '',
      })
    },
    // 异步登录并存储token
    login(loginForm: LoginReq) {
      return new Promise((resolve, reject) => {
        UserApi.login(loginForm).then((res) => {
          const token = res.token
          if (token) {
            setToken(token)
          }
          resolve(res)
        }).catch((error) => {
          reject(error)
        })
      })
    },
    // Logout
    async logout() {
      try {
        await UserApi.logout()
      }
      catch {
        // 当前后端未实现登出接口时，仍然允许本地退出
      }
      finally {
        this.resetInfo()
        clearToken()
      }
    },
    // 小程序授权登录
    authLogin(provider: providerType = 'weixin') {
      return new Promise((resolve, reject) => {
        uni.login({
          provider,
          success: async (result: UniApp.LoginRes) => {
            if (result.code) {
              const res = await UserApi.wxLoginByCode({ code: result.code })
              if (res.token) {
                setToken(res.token)
                this.token = res.token
              }
              resolve(res)
            }
            else {
              reject(new Error(result.errMsg))
            }
          },
          fail: (err: any) => {
            console.error(`login error: ${err}`)
            reject(err)
          },
        })
      })
    },
  },
  persist: true,
})

export default useUserStore
