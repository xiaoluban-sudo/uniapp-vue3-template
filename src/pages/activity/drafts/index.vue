<template>
  <view class="draft-page min-h-screen" style="background: #f5f7fa;">
    <view class="px-30rpx py-20rpx">
      <view
        v-for="item in draftList"
        :key="item.id"
        class="draft-card mb-20rpx"
      >
        <view class="mb-8rpx flex items-center justify-between">
          <text class="text-30rpx font-bold">
            {{ item.name || '未命名草稿' }}
          </text>
          <text class="draft-tag">
            草稿
          </text>
        </view>
        <text class="block text-24rpx text-[#666]">
          {{ item.format }} · {{ item.mode === 'singles' ? '单打' : '双打' }} · {{ item.playerCount }}人
        </text>
        <text class="mt-8rpx block text-22rpx text-[#999]">
          比赛日期：{{ item.date }}
        </text>
        <text class="mt-4rpx block text-22rpx text-[#999]">
          最后编辑：{{ formatTime(item.updatedAt || item.createdAt) }}
        </text>
        <view class="mt-16rpx flex items-center justify-end gap-16rpx">
          <u-button
            text="继续编辑"
            type="primary"
            plain
            size="mini"
            custom-style="height: 56rpx; border-radius: 28rpx; padding: 0 24rpx;"
            @click.stop="toEdit(item.id)"
          />
          <u-button
            text="删除"
            type="error"
            plain
            size="mini"
            custom-style="height: 56rpx; border-radius: 28rpx; padding: 0 24rpx;"
            @click.stop="removeDraft(item.id)"
          />
        </view>
      </view>

      <view v-if="draftList.length === 0" class="empty-card">
        <text class="text-[#999]">
          暂无草稿，去发起比赛保存一份吧
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CompetitionListItem } from '@/api/competition/types'
import { CompetitionApi } from '@/api'
import { useUserStore } from '@/store'

const draftList = ref<CompetitionListItem[]>([])
const loading = ref(false)
const userStore = useUserStore()

async function loadDrafts() {
  if (loading.value)
    return
  loading.value = true
  try {
    if (!userStore.user_id)
      await userStore.info()
    const creatorUserId = Number(userStore.user_id || 0)
    if (!creatorUserId) {
      draftList.value = []
      return
    }
    draftList.value = await CompetitionApi.listCompetitions({
      status: 'draft',
      creatorUserId,
    })
  }
  catch {
    draftList.value = []
    uni.$u.toast('草稿加载失败')
  }
  finally {
    loading.value = false
  }
}

function toEdit(id: number) {
  uni.navigateTo({
    url: `/pages/activity/create-match/index?draftId=${id}`,
  })
}

function formatTime(v?: string) {
  if (!v)
    return '-'
  return String(v).replace('T', ' ').slice(0, 16)
}

function removeDraft(id: number) {
  uni.showModal({
    title: '删除草稿',
    content: '确认删除该草稿吗？',
    success: async (res) => {
      if (!res.confirm)
        return
      try {
        await CompetitionApi.deleteCompetition(id)
        uni.$u.toast('已删除')
        await loadDrafts()
      }
      catch {
        uni.$u.toast('删除失败')
      }
    },
  })
}

onShow(() => {
  void loadDrafts()
})
</script>

<style scoped lang="scss">
.draft-card {
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

.draft-tag {
  padding: 4rpx 14rpx;
  font-size: 22rpx;
  color: #ff9800;
  background: #fff4e5;
  border-radius: 8rpx;
}

.empty-card {
  padding: 40rpx 24rpx;
  text-align: center;
  background: #fff;
  border-radius: 16rpx;
}
</style>
