import type { ActivityDetail, ActivityListItem, CreateActivityReq } from './types'
import { get, post } from '@/utils/request'

export const listActivities = () => get<ActivityListItem[]>('/activities')

export const createActivity = (data: CreateActivityReq) =>
  post<{ id: number }>('/activities', { data })

export const getActivityDetail = (id: number) =>
  get<ActivityDetail>(`/activities/${id}`)

export const joinActivity = (id: number, data: { userId: number; nickname?: string; avatarUrl?: string }) =>
  post<{ ok: boolean }>(`/activities/${id}/join`, { data })
