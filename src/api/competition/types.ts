export interface CompetitionListItem {
  id: number
  name: string
  mode: 'singles' | 'doubles'
  format: string
  formatId: string
  playerCount: number
  courtCount?: number
  joinedCount: number
  status: 'draft' | 'recruiting' | 'full' | 'ongoing' | 'finished'
  creatorUserId: number
  creatorNickname?: string
  playersPreview?: string[]
  date: string
  createdAt?: string
  updatedAt?: string
}

export interface CompetitionListQuery {
  /** 支持逗号分隔多状态，如 'recruiting,full,ongoing' */
  status?: string
  creatorUserId?: number
}

export interface CompetitionPlayer {
  id: number
  userId: number
  nickname: string
  avatarUrl: string
}

export interface CompetitionMatch {
  id: number
  round: number
  roundMatchNo: number
  courtNumber: string
  teamAPlayer1Id: number
  teamAPlayer2Id?: number | null
  teamBPlayer1Id: number
  teamBPlayer2Id?: number | null
  scoreA: number
  scoreB: number
  status: 'pending' | 'playing' | 'finished'
  finishedAt?: string | null
}

export interface CompetitionDetail {
  id: number
  name: string
  mode: 'singles' | 'doubles'
  format: string
  formatId: string
  gender: 'unlimited' | 'male' | 'female' | 'mixed'
  playerCount: number
  courtCount: number
  matchesPerPlayer: number
  totalMatches: number
  scoring: string
  courtNumber: string
  description: string
  status: 'draft' | 'recruiting' | 'full' | 'ongoing' | 'finished'
  joinType: 'pre-register' | 'onsite'
  creatorUserId: number
  creatorNickname?: string
  date: string
  players: CompetitionPlayer[]
}

export interface CreateCompetitionReq {
  name: string
  mode: 'singles' | 'doubles'
  format: string
  formatId: string
  gender: 'unlimited' | 'male' | 'female' | 'mixed'
  playerCount: number
  courtCount: number
  matchesPerPlayer: number
  totalMatches: number
  scoring: string
  courtNumber: string
  description: string
  status: 'draft' | 'recruiting' | 'full' | 'ongoing' | 'finished'
  joinType: 'pre-register' | 'onsite'
  creatorUserId: number
  date: string
}

export interface CreateCompetitionRes {
  id: number
}

export interface RankingItem {
  rank: number
  userId: number
  nickname: string
  avatarUrl: string
  wins: number
  netPoints: number
}

export interface MatchupPlayerInfo {
  nickname: string
  avatarUrl: string
}

export interface ScoreMatchReq {
  scoreA: number
  scoreB: number
}

export interface RefereeItem {
  id: number
  competitionId: number
  userId: number
  nickname: string
  avatarUrl: string
  isCreator: boolean
}
