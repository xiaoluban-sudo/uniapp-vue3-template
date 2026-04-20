<template>
  <view class="detail-page min-h-screen" style="background: #f5f7fa;">
    <view v-if="activity" class="px-30rpx pt-20rpx">
      <!-- Activity card -->
      <view class="card mb-20rpx">
        <view class="mb-20rpx flex items-center justify-between">
          <text class="text-34rpx font-bold">
            {{ activity.title }}
          </text>
          <view
            class="status-tag"
            :style="{ background: `${getStatusColor(activity.status)}20`, color: getStatusColor(activity.status) }"
          >
            {{ getStatusText(activity.status) }}
          </view>
        </view>

        <view class="flex flex-col gap-20rpx">
          <view class="info-row">
            <view class="i-mdi-account text-32rpx text-primary" />
            <text>用户{{ activity.creatorUserId }} 发起</text>
          </view>
          <view class="info-row">
            <view class="i-mdi-badminton text-32rpx text-primary" />
            <text>{{ typeLabels[activity.type] }}</text>
          </view>
          <view class="info-row">
            <view class="i-mdi-calendar-clock text-32rpx text-primary" />
            <text>{{ activity.date }} {{ activity.startTime }} - {{ activity.endTime }}</text>
          </view>
          <view class="info-row">
            <view class="i-mdi-map-marker text-32rpx text-primary" />
            <view>
              <text class="block">
                {{ activity.venue }}
              </text>
              <text class="text-22rpx text-[#999]">
                {{ activity.address }}
              </text>
            </view>
          </view>
          <view class="info-row">
            <view class="i-mdi-currency-cny text-32rpx text-primary" />
            <text>{{ feeText }}</text>
          </view>
        </view>

        <view v-if="activity.description" class="mt-24rpx border-t border-[#f0f0f0] pt-24rpx">
          <text class="text-26rpx text-[#666] leading-relaxed">
            {{ activity.description }}
          </text>
        </view>
      </view>

      <!-- Players -->
      <view class="card mb-20rpx">
        <view class="mb-20rpx flex items-center justify-between">
          <text class="text-28rpx font-bold">
            参与者 ({{ activity.players.length }}/{{ activity.maxPlayers }})
          </text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: `${(activity.players.length / activity.maxPlayers) * 100}%` }" />
          </view>
        </view>

        <view class="flex flex-wrap gap-24rpx">
          <view v-for="player in activity.players" :key="player.id" class="player-item">
            <u-avatar :src="player.avatarUrl" size="40" />
            <text class="mt-8rpx text-24rpx">
              {{ player.nickname }}
            </text>
            <text class="text-20rpx text-[#999]">
              ID: {{ player.userId }}
            </text>
          </view>

          <view
            v-for="i in Math.max(0, activity.maxPlayers - activity.players.length)"
            :key="`empty-${i}`"
            class="player-item"
          >
            <view class="empty-avatar">
              <view class="i-mdi-plus text-32rpx text-[#ccc]" />
            </view>
            <text class="mt-8rpx text-24rpx text-[#ccc]">
              等待加入
            </text>
          </view>
        </view>
      </view>

      <!-- Action -->
      <view class="pb-60rpx">
        <u-button
          v-if="activity.status === 'recruiting'"
          type="primary"
          text="立即报名"
          custom-style="height: 96rpx; border-radius: 48rpx;"
          @click="handleJoin"
        />
        <u-button
          v-else-if="activity.status === 'full'"
          type="warning"
          text="已满员"
          disabled
          custom-style="height: 96rpx; border-radius: 48rpx;"
        />
        <u-button
          v-else
          type="info"
          text="活动已结束"
          disabled
          custom-style="height: 96rpx; border-radius: 48rpx;"
        />
      </view>
    </view>

    <view v-else class="min-h-screen center">
      <text class="text-[#999]">
        活动不存在
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ActivityDetail } from '@/api/activity/types'
import { ActivityApi } from '@/api'

const activityId = ref(0)
const activity = ref<ActivityDetail | null>(null)

const typeLabels: Record<ActivityDetail['type'], string> = {
  singles: '单打',
  doubles: '双打',
  mixed: '混双',
}

const statusMap: Record<ActivityDetail['status'], { text: string; color: string }> = {
  recruiting: { text: '报名中', color: '#21d59d' },
  full: { text: '已满', color: '#fe9831' },
  ongoing: { text: '进行中', color: '#3c9cff' },
  finished: { text: '已结束', color: '#999' },
  cancelled: { text: '已取消', color: '#fa4e62' },
}

function getStatusText(status: ActivityDetail['status']) {
  return statusMap[status]?.text ?? status
}

function getStatusColor(status: ActivityDetail['status']) {
  return statusMap[status]?.color ?? '#999'
}

const feeText = computed(() => {
  if (!activity.value)
    return ''
  if (activity.value.feeType === 'free')
    return '免费'
  return `¥${activity.value.fee}${activity.value.feeType === 'aa' ? '/人 (AA制)' : ' (固定费用)'}`
})

function handleJoin() {
  if (!activityId.value)
    return
  ActivityApi.joinActivity(activityId.value, {
    userId: 1,
    nickname: '球友小王',
    avatarUrl: '',
  })
  uni.$u.toast('报名成功')
  loadDetail()
}

async function loadDetail() {
  if (!activityId.value)
    return
  try {
    activity.value = await ActivityApi.getActivityDetail(activityId.value)
  }
  catch {
    activity.value = null
  }
}

onLoad((options: any) => {
  activityId.value = Number(options?.id || 0)
  loadDetail()
})
</script>

<style scoped lang="scss">
.card {
  padding: 28rpx;
  background: #fff;
  border-radius: 16rpx;
}

.status-tag {
  padding: 6rpx 20rpx;
  font-size: 24rpx;
  border-radius: 20rpx;
}

.info-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
  font-size: 28rpx;
  color: #333;
}

.progress-bar {
  width: 120rpx;
  height: 8rpx;
  overflow: hidden;
  background: #f0f0f0;
  border-radius: 4rpx;
}

.progress-fill {
  height: 100%;
  background: var(--theme-primary);
  border-radius: 4rpx;
  transition: width 0.3s;
}

.player-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
}

.empty-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border: 2rpx dashed #ddd;
  border-radius: 50%;
}
</style>
