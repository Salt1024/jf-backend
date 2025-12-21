import axios, { type AxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store'

interface ServerResponse<T> {
  statusCode: number
  data: T
  message: string
}

export const instance = axios.create({
  timeout: 63 * 1000,
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.userInfo.token) {
      config.headers['authorization'] = userStore.userInfo.token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (res) => {
    return res.data?.data
  },
  (error) => {
    if (error.response.data) {
      if (Array.isArray(error.response.data.message)) {
        error.response.data.message = error.response.data.message.join(',')
      }
      return Promise.reject(error.response.data)
    }
    return Promise.reject({
      statusCode: error.status,
      ...error
    })
  },
)

export const get = <Data = null>(url: string, params: Record<string, any> = {}, config?: AxiosRequestConfig) => {
  return instance.get<Data, Data>(url, Object.assign({}, { params: params }, config))
}

export const post = <Data = null>(url: string, data: Record<string, any> = {}, config?: AxiosRequestConfig) => {
  return instance.post<Data, Data>(url, data, config)
}

export const put = <Data = null>(url: string, data: Record<string, any> = {}, config?: AxiosRequestConfig) => {
  return instance.put<Data, Data>(url, data, config)
}

export const del = <Data = null>(url: string, params: Record<string, any> = {}, config?: AxiosRequestConfig) => {
  return instance.delete<Data, Data>(url, Object.assign({}, { params: params }, config))
}


