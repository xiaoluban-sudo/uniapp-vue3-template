export type RoleType = '' | '*' | 'user'
export interface UserState {
  user_id?: string
  user_name?: string
  avatar?: string
  gender?: 'unknown' | 'male' | 'female' | 'mixed'
  years_of_playing?: number
  level?: string
  real_name?: string
  phone?: string
  token?: string
}

export type providerType
  = | 'weixin'
    | 'qq'
    | 'sinaweibo'
    | 'xiaomi'
    | 'apple'
    | 'univerify'
    | undefined
