export interface ProfileReq {
  user_id?: string
}

export interface ProfileRes {
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

export interface LoginReq {
  phone: string
  code: string
}

export interface LoginRes {
  token: string
  user_id: number
  user_name: string
  avatar: string
}

export interface LoginByCodeReq {
  code: string
}

export interface LoginByCodeRes {
  token: string
  userId: number
}

export interface UpdateProfileReq {
  nickname?: string
  avatarUrl?: string
  gender?: 'unknown' | 'male' | 'female' | 'mixed'
  level?: string
  realName?: string
  phone?: string
}

export interface MatchRecordItem {
  id: number
  type: 'singles' | 'doubles'
  playerA: string
  playerB: string
  scoreA: number
  scoreB: number
  winner: 'A' | 'B'
  date: string
  venue: string
}

export interface MatchStatsData {
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  currentStreak: number
  bestStreak: number
  thisMonth: number
  thisWeek: number
}

export interface MyStatsRes {
  stats: MatchStatsData
  records: MatchRecordItem[]
}
