import type { LoginByCodeReq, LoginByCodeRes, LoginReq, LoginRes, MyStatsRes, ProfileReq, ProfileRes, UpdateProfileReq } from './types'
/**
 * 用户信息相关接口
 */
import type { CommonRes } from '@/api/common/types'
import { get, post, request } from '@/utils/request'

/** 获取用户信息 */
export const profile = (params?: ProfileReq) => get<ProfileRes>('/user/profile', { params })

/** 登录 */
export const login = (data: LoginReq) => post<LoginRes>('/user/login', { data, custom: { auth: false } })

/** 验证码登录 */
export const loginByCode = (data: LoginByCodeReq) => post<LoginByCodeRes>('/auth/login-by-code', { data, custom: { auth: false } })

/** 退出登录 */
export const logout = () => post<CommonRes>('/user/logout')

/** 小程序 code 登录 */
export const wxLoginByCode = (data: LoginByCodeReq) => post<LoginByCodeRes>('/auth/login-by-code', { data, custom: { auth: false } })

/** 当前用户信息 */
export const me = () => get<ProfileRes>('/users/me')

/** 更新当前用户资料 */
export const updateMe = (data: UpdateProfileReq) => request<ProfileRes>({ url: '/users/me', method: 'PATCH', data })

/** 我的战绩统计 + 比赛记录 */
export const myStats = () => get<MyStatsRes>('/users/me/stats')
