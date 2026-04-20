<template>
  <view class="home min-h-screen" style="background: #f5f7fa;">
    <!-- Header -->
    <view class="header">
      <view class="header-content" :style="{ paddingTop: `${headerTopPx}px` }">
        <view class="flex items-center justify-between">
          <view>
            <text class="text-40rpx text-white font-bold">
              快乐打球
            </text>
            <text class="mt-8rpx block text-24rpx text-white/70">
              接不住的球本就不属于你
            </text>
          </view>
        </view>
      </view>

      <!-- Stats card -->
      <view class="stats-card">
        <view class="flex justify-around">
          <view class="text-center">
            <text class="stats-value">
              {{ stats.thisWeek }}
            </text>
            <text class="stats-label">
              本周场次
            </text>
          </view>
          <view class="stats-divider" />
          <view class="text-center">
            <text class="stats-value">
              {{ stats.winRate }}%
            </text>
            <text class="stats-label">
              胜率
            </text>
          </view>
          <view class="stats-divider" />
          <view class="text-center">
            <text class="stats-value">
              {{ stats.currentStreak }}
            </text>
            <text class="stats-label">
              连胜
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- Quick actions -->
    <view class="mx-30rpx mt-80rpx">
      <view class="card">
        <view class="flex justify-around">
          <view v-for="action in quickActions" :key="action.text" class="action-item" @click="action.handler">
            <view class="action-icon" :style="{ background: action.bgColor }">
              <view :class="action.icon" class="text-40rpx text-white" />
            </view>
            <text class="action-text">
              {{ action.text }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- Recent competitions -->
    <view v-if="competitionList.length > 0" class="mx-30rpx mt-30rpx">
      <view class="mb-20rpx flex items-center justify-between">
        <text class="text-30rpx font-bold">
          近期比赛
        </text>
        <text class="text-24rpx text-primary" @click="toMyCompetitions">
          更多比赛
        </text>
      </view>
      <view
        v-for="comp in competitionList"
        :key="comp.id"
        class="comp-card mb-20rpx"
        @click="toCompDetail(comp.id)"
      >
        <view class="mb-12rpx flex items-center justify-between">
          <text class="text-28rpx font-bold">
            {{ comp.name }}
          </text>
          <view class="status-tag" :style="compStatusStyle(comp.status)">
            {{ compStatusText(comp.status) }}
          </view>
        </view>
        <view class="flex items-center gap-16rpx text-24rpx text-[#999]">
          <text>{{ comp.format }}</text>
          <text>·</text>
          <text>{{ comp.mode === 'singles' ? '单打' : '双打' }}</text>
          <text>·</text>
          <text>{{ comp.joinedCount }}/{{ comp.playerCount }}人</text>
        </view>
        <view class="mt-12rpx flex items-center justify-between gap-16rpx">
          <text class="text-22rpx text-[#bbb]">
            发起人：{{ comp.creatorNickname || `用户${comp.creatorUserId}` }}
          </text>
          <text class="text-24rpx font-bold" style="color: #ff9800;">
            查看详情 →
          </text>
        </view>
        <view class="mt-14rpx flex items-center justify-start">
          <AvatarPreview
            :avatars="comp.playersPreview || []"
            :max="8"
            :size="22"
            align="flex-start"
            @more="toCompDetail(comp.id)"
            @click="toCompDetail(comp.id)"
          />
        </view>
      </view>
    </view>

    <!-- Recent activities -->
    <view class="mx-30rpx mt-30rpx">
      <view class="mb-20rpx flex items-center justify-between">
        <text class="text-30rpx font-bold">
          近期活动
        </text>
        <text class="text-24rpx text-primary" @click="toMatchTab">
          查看更多
        </text>
      </view>
      <view
        v-for="activity in activityList"
        :key="activity.id"
        class="card mb-20rpx"
        @click="toDetail(activity.id)"
      >
        <view class="mb-16rpx flex items-center justify-between">
          <text class="text-28rpx font-bold">
            {{ activity.title }}
          </text>
          <view
            class="status-tag"
            :style="{ background: `${getStatusColor(activity.status)}20`, color: getStatusColor(activity.status) }"
          >
            {{ getStatusText(activity.status) }}
          </view>
        </view>
        <view class="flex items-center gap-20rpx text-24rpx text-[#999]">
          <view class="flex items-center gap-6rpx">
            <view class="i-mdi-calendar-outline text-28rpx" />
            <text>{{ activity.date }} {{ activity.startTime }}</text>
          </view>
          <view class="flex items-center gap-6rpx">
            <view class="i-mdi-map-marker-outline text-28rpx" />
            <text>{{ activity.venue }}</text>
          </view>
        </view>
        <view class="mt-16rpx flex items-center justify-between">
          <view class="flex items-center gap-8rpx">
            <view class="i-mdi-account-group-outline text-28rpx text-[#999]" />
            <text class="text-24rpx text-[#999]">
              {{ activity.joinedCount }}/{{ activity.maxPlayers }}人
            </text>
          </view>
          <text class="text-24rpx text-primary font-bold">
            {{ activity.feeType === 'free' ? '免费' : `¥${activity.fee}${activity.feeType === 'aa' ? '/人' : ''}` }}
          </text>
        </view>
      </view>

      <view v-if="activityList.length === 0" class="card text-center text-[#999]">
        <text>暂无活动，快去发起约球吧</text>
      </view>
    </view>

    <view class="h-130rpx" />
    <custom-tabbar :current="0" />
  </view>
</template>

<script setup lang="ts">
import type { ActivityStatus } from '@/api/activity/types'
import type { CompetitionListItem } from '@/api/competition/types'
import type { MatchStatsData } from '@/api/user/types'
import { ActivityApi, CompetitionApi, UserApi } from '@/api'
import AvatarPreview from '@/components/avatar-preview/index.vue'
import { useUserStore } from '@/store'
import { isLogin } from '@/utils/auth'

function calcHeaderTop() {
  const sys = uni.getSystemInfoSync()
  const statusBarH = sys.statusBarHeight ?? 20
  try {
    const rect = uni.getMenuButtonBoundingClientRect()
    if (rect && rect.top > 0)
      return rect.top + rect.height + 10
  }
  catch {}
  return statusBarH + 15
}
const headerTopPx = calcHeaderTop()

const stats = ref<MatchStatsData>({
  totalMatches: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  currentStreak: 0,
  bestStreak: 0,
  thisMonth: 0,
  thisWeek: 0,
})
const activityList = ref<Array<{
  id: number
  title: string
  date: string
  startTime: string
  venue: string
  joinedCount: number
  maxPlayers: number
  fee: string
  feeType: 'free' | 'aa' | 'fixed'
  status: ActivityStatus
}>>([])
const competitionList = ref<CompetitionListItem[]>([])
const hasDraft = ref(false)
const userStore = useUserStore()

const statusMap: Record<ActivityStatus, { text: string; color: string }> = {
  recruiting: { text: '报名中', color: '#21d59d' },
  full: { text: '已满', color: '#fe9831' },
  ongoing: { text: '进行中', color: '#3c9cff' },
  finished: { text: '已结束', color: '#999' },
  cancelled: { text: '已取消', color: '#fa4e62' },
}

function getStatusText(status: ActivityStatus) {
  return statusMap[status]?.text ?? status
}

function getStatusColor(status: ActivityStatus) {
  return statusMap[status]?.color ?? '#999'
}

const compStatusConfig: Record<string, { text: string; color: string }> = {
  recruiting: { text: '报名中', color: '#ff9800' },
  full: { text: '已满', color: '#fe9831' },
  ongoing: { text: '进行中', color: '#3c9cff' },
  finished: { text: '已结束', color: '#999' },
  draft: { text: '草稿', color: '#bbb' },
}

function compStatusText(status: string) {
  return compStatusConfig[status]?.text ?? status
}

function compStatusStyle(status: string) {
  const color = compStatusConfig[status]?.color ?? '#999'
  return { background: `${color}20`, color }
}

const quickActions = computed(() => {
  const firstAction = hasDraft.value
    ? {
        icon: 'i-mdi-file-document-edit-outline',
        text: '我的草稿',
        bgColor: '#ff9800',
        handler: () => uni.navigateTo({ url: '/pages/activity/drafts/index' }),
      }
    : {
        icon: 'i-mdi-calendar-plus',
        text: '发起约球',
        bgColor: '#21d59d',
        handler: () => uni.navigateTo({ url: '/pages/activity/create/index' }),
      }

  return [
    firstAction,
    {
      icon: 'i-mdi-counter',
      text: '快速记分',
      bgColor: '#3c9cff',
      handler: () => uni.navigateTo({ url: '/pages/activity/scoring/index' }),
    },
    {
      icon: 'i-mdi-trophy',
      text: '我的战绩',
      bgColor: '#fe9831',
      handler: () => uni.switchTab({ url: '/pages/tab/record/index' }),
    },
    {
      icon: 'i-mdi-account-group',
      text: '约球大厅',
      bgColor: '#f56c6c',
      handler: () => uni.switchTab({ url: '/pages/tab/match/index' }),
    },
  ]
})

function toMatchTab() {
  uni.switchTab({ url: '/pages/tab/match/index' })
}

function toDetail(id: number) {
  uni.navigateTo({ url: `/pages/activity/detail/index?id=${id}` })
}

function toCompDetail(id: number) {
  uni.navigateTo({ url: `/pages/activity/match-detail/index?id=${id}` })
}

function toMyCompetitions() {
  uni.navigateTo({ url: '/pages/activity/my-competitions/index' })
}

async function loadCompetitions() {
  try {
    const list = await CompetitionApi.listCompetitions({ status: 'recruiting,full,ongoing' })
    competitionList.value = list.slice(0, 5)
  }
  catch {
    competitionList.value = []
  }
}

async function loadActivities() {
  try {
    const list = await ActivityApi.listActivities()
    activityList.value = list.slice(0, 3) as any
  }
  catch {
    activityList.value = []
  }
}

async function loadStats() {
  try {
    const res = await UserApi.myStats()
    stats.value = res.stats
  }
  catch {
    // keep default zeros
  }
}

async function loadDraftEntry() {
  if (!isLogin()) {
    hasDraft.value = false
    return
  }
  const creatorUserId = Number(userStore.user_id || 0)
  if (!creatorUserId) {
    hasDraft.value = false
    return
  }
  try {
    const drafts = await CompetitionApi.listCompetitions({
      status: 'draft',
      creatorUserId,
    })
    hasDraft.value = drafts.length > 0
  }
  catch {
    hasDraft.value = false
  }
}

onShow(() => {
  loadCompetitions()
  loadActivities()
  loadStats()
  loadDraftEntry()
})
</script>

<style scoped lang="scss">
.header {
  position: relative;
  padding-bottom: 80rpx;
  background: linear-gradient(135deg, #21d59d 0%, #1ab389 100%);
  border-radius: 0 0 40rpx 40rpx;
}

.header-content {
  padding: 30rpx 30rpx 90rpx;
}

.stats-card {
  position: absolute;
  right: 30rpx;
  bottom: -50rpx;
  left: 30rpx;
  padding: 36rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgb(0 0 0 / 8%);
}

.stats-value {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: var(--theme-main-color);
}

.stats-label {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #999;
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  margin: auto 0;
  background: #eee;
}

.card {
  padding: 28rpx;
  background: #fff;
  border-radius: 16rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
}

.action-text {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #333;
}

.status-tag {
  padding: 4rpx 16rpx;
  font-size: 22rpx;
  border-radius: 20rpx;
}

.comp-card {
  padding: 28rpx;
  background: #fff;
  border-left: 6rpx solid #ff9800;
  border-radius: 16rpx;
}
</style>
