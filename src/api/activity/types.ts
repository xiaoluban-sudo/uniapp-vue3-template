export type ActivityType = 'singles' | 'doubles' | 'mixed'
export type ActivityStatus = 'recruiting' | 'full' | 'ongoing' | 'finished' | 'cancelled'

export interface ActivityListItem {
  id: number
  title: string
  type: ActivityType
  date: string
  startTime: string
  endTime: string
  venue: string
  address: string
  maxPlayers: number
  joinedCount: number
  fee: string
  feeType: 'free' | 'aa' | 'fixed'
  status: ActivityStatus
  description: string
  creatorUserId: number
}

export interface ActivityPlayer {
  id: number
  userId: number
  nickname: string
  avatarUrl: string
}

export interface ActivityDetail extends Omit<ActivityListItem, 'joinedCount'> {
  players: ActivityPlayer[]
}

export interface CreateActivityReq {
  title: string
  type: ActivityType
  date: string
  startTime: string
  endTime: string
  venue: string
  address?: string
  maxPlayers: number
  feeType: 'free' | 'aa' | 'fixed'
  fee?: string
  description?: string
  creatorUserId: number
}
