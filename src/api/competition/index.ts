import type {
  CompetitionDetail,
  CompetitionListItem,
  CompetitionListQuery,
  CompetitionMatch,
  CreateCompetitionReq,
  CreateCompetitionRes,
  RankingItem,
  RefereeItem,
  ScoreMatchReq,
} from './types'
import { get, post, request } from '@/utils/request'

export const listCompetitions = (params?: CompetitionListQuery) =>
  get<CompetitionListItem[]>('/competitions', { params })

export const createCompetition = (data: CreateCompetitionReq) =>
  post<CreateCompetitionRes>('/competitions', { data })

export const updateCompetition = (id: number, data: CreateCompetitionReq) =>
  request<CreateCompetitionRes>({ url: `/competitions/${id}`, method: 'PATCH', data })

export const deleteCompetition = (id: number) =>
  request<{ ok: boolean }>({ url: `/competitions/${id}`, method: 'DELETE' })

export const getCompetitionDetail = (id: number) =>
  get<CompetitionDetail>(`/competitions/${id}`)

export const joinCompetition = (id: number) =>
  post<{ ok: boolean }>(`/competitions/${id}/join`)

export const startCompetition = (id: number) =>
  post<{ ok: boolean }>(`/competitions/${id}/start`)

export const getCompetitionMatches = (id: number) =>
  get<CompetitionMatch[]>(`/competitions/${id}/matches`)

export const getCompetitionRankings = (id: number) =>
  get<RankingItem[]>(`/competitions/${id}/rankings`)

export const scoreMatch = (competitionId: number, matchId: number, data: ScoreMatchReq) =>
  post<{ ok: boolean }>(`/competitions/${competitionId}/matches/${matchId}/score`, { data })

export const listReferees = (id: number) =>
  get<RefereeItem[]>(`/competitions/${id}/referees`)

export const joinAsReferee = (id: number) =>
  post<{ ok: boolean; alreadyJoined: boolean }>(`/competitions/${id}/referees/join`)

export const removeReferee = (id: number, userId: number) =>
  request<{ ok: boolean }>({ url: `/competitions/${id}/referees/${userId}`, method: 'DELETE' })

export const devSeed = (id: number, count = 1) =>
  post<{ message: string; filled: number; totalPlayers: number }>(`/competitions/${id}/dev-seed?count=${count}`)
