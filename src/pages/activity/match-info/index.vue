<template>
  <view class="match-info min-h-screen bg-[#f5f7fa] px-30rpx py-24rpx">
    <view v-if="loading" class="py-80rpx text-center text-[#999]">
      加载中...
    </view>
    <view v-else-if="!comp || !match" class="py-80rpx text-center text-[#999]">
      对阵不存在
    </view>
    <view v-else>
      <view class="card mb-20rpx">
        <view class="mb-12rpx flex items-center gap-12rpx">
          <text class="text-32rpx font-bold">
            第{{ match.round }}轮 · 第{{ match.roundMatchNo || 1 }}场
          </text>
          <text v-if="match.courtNumber" class="court-tag">
            {{ match.courtNumber }}
          </text>
        </view>
        <text class="text-24rpx text-[#666]">
          当前赛制：{{ comp.format }} · {{ comp.scoring }}
        </text>
        <view class="mt-16rpx flex items-center justify-between text-24rpx text-[#666]">
          <text>状态：{{ matchStatusText(match.status) }}</text>
          <text>结束时间：{{ formatEndTime(match.finishedAt) }}</text>
        </view>
      </view>

      <view class="card mb-20rpx">
        <text class="mb-16rpx block text-28rpx font-bold">
          对阵信息
        </text>
        <view class="battle-row">
          <view class="team-col">
            <view v-for="p in teamA" :key="`a-${p.id}`" class="team-player">
              <u-avatar :src="p.avatarUrl" size="30" />
              <text class="ml-10rpx text-24rpx">
                {{ p.nickname }}
              </text>
            </view>
          </view>
          <view class="score-col">
            <text class="score-text">
              {{ match.scoreA }} : {{ match.scoreB }}
            </text>
            <text class="text-22rpx text-[#999]">
              VS
            </text>
          </view>
          <view class="team-col items-end">
            <view v-for="p in teamB" :key="`b-${p.id}`" class="team-player justify-end">
              <text class="mr-10rpx text-24rpx">
                {{ p.nickname }}
              </text>
              <u-avatar :src="p.avatarUrl" size="30" />
            </view>
          </view>
        </view>
      </view>

      <view class="card mb-20rpx">
        <text class="mb-16rpx block text-28rpx font-bold">
          裁判
        </text>
        <view v-if="referees.length === 0" class="text-24rpx text-[#999]">
          暂无裁判
        </view>
        <view v-else class="flex flex-wrap gap-20rpx">
          <view v-for="r in referees" :key="r.id" class="referee-item">
            <u-avatar :src="r.avatarUrl" size="26" />
            <text class="text-22rpx">
              {{ r.nickname || `球友${r.userId}` }}
            </text>
            <text v-if="r.isCreator" class="creator-tag">
              组织者
            </text>
          </view>
        </view>
      </view>

      <view class="card">
        <text class="mb-16rpx block text-28rpx font-bold">
          比赛信息
        </text>
        <view class="info-row">
          <text>比赛名称</text><text>{{ comp.name }}</text>
        </view>
        <view class="info-row">
          <text>比赛类型</text><text>{{ comp.mode === 'doubles' ? '双打' : '单打' }}</text>
        </view>
        <view class="info-row">
          <text>赛制</text><text>{{ comp.format }}</text>
        </view>
        <view class="info-row">
          <text>场地数</text><text>{{ comp.courtCount || 1 }}片</text>
        </view>
        <view class="info-row">
          <text>比赛日期</text><text>{{ comp.date }}</text>
        </view>
        <view class="info-row">
          <text>说明</text><text>{{ comp.description || '无' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CompetitionDetail, CompetitionMatch, RefereeItem } from '@/api/competition/types'
import { CompetitionApi } from '@/api'

interface PlayerInfo { id: number; nickname: string; avatarUrl: string }

const loading = ref(false)
const competitionId = ref(0)
const matchId = ref(0)
const comp = ref<CompetitionDetail | null>(null)
const match = ref<CompetitionMatch | null>(null)
const referees = ref<RefereeItem[]>([])

const playerMap = computed(() => {
  const map = new Map<number, PlayerInfo>()
  for (const p of comp.value?.players ?? [])
    map.set(p.id, { id: p.id, nickname: p.nickname || `球友${p.userId}`, avatarUrl: p.avatarUrl || '' })
  return map
})

const teamA = computed(() => {
  const m = match.value
  if (!m)
    return []
  return [
    playerMap.value.get(m.teamAPlayer1Id),
    m.teamAPlayer2Id ? playerMap.value.get(m.teamAPlayer2Id) : undefined,
  ].filter(Boolean) as PlayerInfo[]
})

const teamB = computed(() => {
  const m = match.value
  if (!m)
    return []
  return [
    playerMap.value.get(m.teamBPlayer1Id),
    m.teamBPlayer2Id ? playerMap.value.get(m.teamBPlayer2Id) : undefined,
  ].filter(Boolean) as PlayerInfo[]
})

function matchStatusText(status: CompetitionMatch['status']) {
  if (status === 'finished')
    return '已结束'
  if (status === 'playing')
    return '进行中'
  return '待比赛'
}

function formatEndTime(v?: string | null) {
  if (!v)
    return '未结束'
  return String(v).replace('T', ' ').slice(0, 16)
}

async function loadData() {
  if (!competitionId.value || !matchId.value)
    return
  loading.value = true
  try {
    const [detail, matches, refs] = await Promise.all([
      CompetitionApi.getCompetitionDetail(competitionId.value),
      CompetitionApi.getCompetitionMatches(competitionId.value),
      CompetitionApi.listReferees(competitionId.value),
    ])
    comp.value = detail
    referees.value = refs
    match.value = matches.find(m => m.id === matchId.value) ?? null
  }
  catch {
    comp.value = null
    match.value = null
    referees.value = []
  }
  finally {
    loading.value = false
  }
}

onLoad((options: any) => {
  competitionId.value = Number(options?.competitionId || 0)
  matchId.value = Number(options?.matchId || 0)
  loadData()
})
</script>

<style scoped lang="scss">
.card {
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

.court-tag {
  padding: 4rpx 12rpx;
  font-size: 20rpx;
  color: #3c9cff;
  background: rgb(60 156 255 / 10%);
  border-radius: 999rpx;
}

.battle-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
  justify-content: space-between;
}

.team-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12rpx;
}

.team-player {
  display: flex;
  align-items: center;
}

.score-col {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  align-items: center;
  justify-content: center;
}

.score-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.referee-item {
  display: flex;
  gap: 8rpx;
  align-items: center;
  padding: 8rpx 12rpx;
  background: #f8fafc;
  border-radius: 999rpx;
}

.creator-tag {
  padding: 0 10rpx;
  font-size: 20rpx;
  color: #ff9800;
  background: rgb(255 152 0 / 10%);
  border-radius: 999rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64rpx;
  font-size: 24rpx;
  color: #666;
}
</style>
