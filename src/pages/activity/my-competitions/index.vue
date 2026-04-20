<template>
  <view class="my-comp min-h-screen" style="background: #f5f7fa;">
    <!-- 状态 Tab -->
    <view class="filter-bar">
      <view
        v-for="tab in statusTabs"
        :key="tab.key"
        class="filter-item"
        :class="{ active: currentStatus === tab.key }"
        @click="switchTab(tab.key)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 列表 -->
    <view class="px-30rpx pt-20rpx">
      <view v-if="loading" class="py-80rpx text-center text-[#999]">
        <text>加载中...</text>
      </view>

      <view v-else-if="list.length === 0" class="py-80rpx text-center text-[#999]">
        <view class="i-mdi-trophy-outline mx-auto mb-16rpx text-80rpx text-[#ddd]" />
        <text>暂无比赛</text>
      </view>

      <view
        v-for="comp in list"
        v-else
        :key="comp.id"
        class="comp-card mb-20rpx"
        @click="toDetail(comp.id)"
      >
        <view class="mb-12rpx flex items-center justify-between">
          <text class="text-28rpx font-bold">
            {{ comp.name }}
          </text>
          <view class="status-tag" :style="statusStyle(comp.status)">
            {{ statusText(comp.status) }}
          </view>
        </view>
        <view class="flex items-center gap-16rpx text-24rpx text-[#999]">
          <text>{{ comp.format }}</text>
          <text>·</text>
          <text>{{ comp.mode === 'singles' ? '单打' : '双打' }}</text>
          <text>·</text>
          <text>{{ comp.joinedCount }}/{{ comp.playerCount }}人</text>
        </view>
        <view class="mt-10rpx flex items-center gap-16rpx text-22rpx text-[#bbb]">
          <text>{{ comp.date }}</text>
          <text>·</text>
          <text>发起人：{{ comp.creatorNickname || `用户${comp.creatorUserId}` }}</text>
        </view>
        <view class="mt-14rpx flex items-center justify-between">
          <AvatarPreview
            :avatars="comp.playersPreview || []"
            :max="8"
            :size="22"
            align="flex-start"
            @more="toDetail(comp.id)"
            @click="toDetail(comp.id)"
          />
          <text class="text-24rpx font-bold" style="color: #ff9800;">
            查看 →
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CompetitionListItem } from '@/api/competition/types'
import { CompetitionApi } from '@/api'
import AvatarPreview from '@/components/avatar-preview/index.vue'

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'recruiting', label: '报名中' },
  { key: 'ongoing', label: '进行中' },
  { key: 'finished', label: '已结束' },
]

const statusConfig: Record<string, { text: string; color: string }> = {
  recruiting: { text: '报名中', color: '#ff9800' },
  full: { text: '已满', color: '#fe9831' },
  ongoing: { text: '进行中', color: '#3c9cff' },
  finished: { text: '已结束', color: '#999' },
  draft: { text: '草稿', color: '#bbb' },
}

function statusText(status: string) {
  return statusConfig[status]?.text ?? status
}

function statusStyle(status: string) {
  const color = statusConfig[status]?.color ?? '#999'
  return { background: `${color}20`, color }
}

const currentStatus = ref('all')
const list = ref<CompetitionListItem[]>([])
const loading = ref(false)

async function loadList() {
  loading.value = true
  try {
    const statusQuery = currentStatus.value === 'all'
      ? 'recruiting,full,ongoing,finished'
      : currentStatus.value
    list.value = await CompetitionApi.listCompetitions({ status: statusQuery })
  }
  catch {
    list.value = []
  }
  finally {
    loading.value = false
  }
}

function switchTab(key: string) {
  currentStatus.value = key
  loadList()
}

function toDetail(id: number) {
  uni.navigateTo({ url: `/pages/activity/match-detail/index?id=${id}` })
}

onShow(() => {
  loadList()
})
</script>

<style scoped lang="scss">
.filter-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgb(0 0 0 / 4%);
}

.filter-item {
  flex: 1;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #999;
  text-align: center;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s;

  &.active {
    font-weight: bold;
    color: #ff9800;
    border-bottom-color: #ff9800;
  }
}

.comp-card {
  padding: 28rpx;
  background: #fff;
  border-left: 6rpx solid #ff9800;
  border-radius: 16rpx;
}

.status-tag {
  padding: 4rpx 16rpx;
  font-size: 22rpx;
  border-radius: 20rpx;
}
</style>
