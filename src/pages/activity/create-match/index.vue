<template>
  <view class="create-match min-h-screen" style="background: #f5f7fa;">
    <view class="px-30rpx pb-40rpx pt-20rpx">
      <!-- 名称 -->
      <view class="form-card">
        <view class="form-row">
          <text class="form-label">
            名称
          </text>
          <view class="form-value">
            <u-input v-model="form.name" placeholder="输入比赛名称" border="none" input-align="right" />
          </view>
        </view>
      </view>

      <!-- 类型 / 性别 / 人数 -->
      <view class="form-card">
        <view class="form-row">
          <text class="form-label">
            类型
          </text>
          <text class="form-text">
            {{ form.format }}
          </text>
        </view>
        <view class="form-divider" />
        <view class="form-row">
          <text class="form-label">
            性别
          </text>
          <view class="form-chips">
            <view
              v-for="g in genderOptions"
              :key="g.value"
              class="chip"
              :class="{ active: form.gender === g.value }"
              @click="form.gender = g.value"
            >
              {{ g.label }}
            </view>
          </view>
        </view>
        <view class="form-divider" />
        <view class="form-row">
          <text class="form-label">
            人数
          </text>
          <view class="form-value">
            <u-number-box
              v-model="form.playerCount"
              :min="isBaRenZhuan ? 8 : 4"
              :max="isBaRenZhuan ? 8 : 20"
              :disabled="isBaRenZhuan"
              :step="2"
            />
          </view>
        </view>
        <view class="form-divider" />
        <view class="form-row">
          <text class="form-label">
            场地数
          </text>
          <view class="form-value">
            <u-number-box
              v-model="form.courtCount"
              :min="1"
              :max="8"
              :step="1"
            />
          </view>
        </view>
      </view>

      <!-- 赛制 -->
      <view class="form-card">
        <view class="form-row">
          <text class="form-label">
            赛制
          </text>
          <text class="form-text-sm">
            {{ formatSummary }}
          </text>
        </view>
        <view class="form-divider" />
        <view class="form-row">
          <text class="form-label">
            计分
          </text>
          <view class="form-chips">
            <view
              v-for="s in scoringOptions"
              :key="s.value"
              class="chip"
              :class="{ active: form.scoring === s.value }"
              @click="form.scoring = s.value"
            >
              {{ s.label }}
            </view>
          </view>
        </view>
      </view>

      <!-- 场地号 -->
      <view class="form-card">
        <view class="form-row">
          <text class="form-label">
            场地号
          </text>
          <view class="form-value">
            <u-input v-model="form.courtNumber" placeholder="选填" border="none" input-align="right" />
          </view>
        </view>
      </view>

      <!-- 组织方式 -->
      <view class="form-card">
        <view class="form-row">
          <text class="form-label">
            组织方式
          </text>
          <view class="form-chips">
            <view
              class="chip"
              :class="{ active: form.joinType === 'pre-register' }"
              @click="form.joinType = 'pre-register'"
            >
              预报名
            </view>
            <view
              class="chip"
              :class="{ active: form.joinType === 'onsite' }"
              @click="form.joinType = 'onsite'"
            >
              现场组织
            </view>
          </view>
        </view>
      </view>

      <!-- 补充说明 -->
      <view class="form-card">
        <view class="mb-16rpx flex items-center justify-between">
          <text class="form-label mb-0">
            补充
          </text>
          <text class="text-24rpx text-primary" @click="showFullInput = true">
            全屏输入
          </text>
        </view>
        <u-textarea v-model="form.description" placeholder="补充说明（可选）" :height="120" count :maxlength="200" />
      </view>

      <!-- Buttons -->
      <view class="mt-40rpx flex gap-20rpx">
        <u-button
          text="清空"
          custom-style="flex: 1; height: 88rpx; border-radius: 44rpx;"
          @click="handleClear"
        />
        <u-button
          text="保存"
          type="warning"
          plain
          custom-style="flex: 1; height: 88rpx; border-radius: 44rpx;"
          @click="handleSave"
        />
      </view>
      <u-button
        type="primary"
        text="发布"
        custom-style="margin-top: 24rpx; height: 88rpx; border-radius: 44rpx;"
        @click="handlePublish"
      />
    </view>

    <!-- 全屏输入弹层 -->
    <u-popup :show="showFullInput" mode="bottom" round="20" @close="showFullInput = false">
      <view class="px-30rpx py-40rpx">
        <view class="mb-24rpx flex items-center justify-between">
          <text class="text-32rpx font-bold">
            补充说明
          </text>
          <text class="text-28rpx text-primary" @click="showFullInput = false">
            完成
          </text>
        </view>
        <u-textarea v-model="form.description" placeholder="请输入补充说明" :height="400" count :maxlength="500" />
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { CompetitionApi } from '@/api'
import { useUserStore } from '@/store'

const form = reactive({
  name: '',
  mode: 'singles' as 'singles' | 'doubles',
  format: '八人转',
  formatId: 'ba-ren-zhuan',
  gender: 'unlimited' as 'unlimited' | 'male' | 'female' | 'mixed',
  playerCount: 8,
  courtCount: 1,
  scoring: 'one-set-21',
  courtNumber: '',
  description: '',
  joinType: 'pre-register' as 'pre-register' | 'onsite',
})

const showFullInput = ref(false)
const draftId = ref(0)
const userStore = useUserStore()

const genderOptions = [
  { label: '不限', value: 'unlimited' as const },
  { label: '男', value: 'male' as const },
  { label: '女', value: 'female' as const },
  { label: '混合', value: 'mixed' as const },
]

const scoringOptions = [
  { label: '一局定胜负·21分', value: 'one-set-21' },
  { label: '三局两胜·21分', value: 'three-set-21' },
  { label: '一局定胜负·11分', value: 'one-set-11' },
]

interface MatchCalc { perPlayer: number; total: number }

function calcMatchesByMode(
  mode: 'singles' | 'doubles',
  formatId: string,
  n: number,
): MatchCalc {
  const isDoubles = mode === 'doubles'
  const roundRobinTotal = isDoubles ? (n * (n - 1)) / 4 : (n * (n - 1)) / 2

  switch (formatId) {
    case 'ba-ren-zhuan':
      return { perPlayer: n - 1, total: roundRobinTotal }
    case 'chao-ba-zhuan':
      return { perPlayer: n - 1, total: n * 2 }
    case 'hun-shuang-zhuan':
      return { perPlayer: n - 1, total: roundRobinTotal }
    case 'zi-you-zhuan':
      return { perPlayer: n, total: n * 2 }
    case 'jin-ji-sai':
      return { perPlayer: Math.ceil(Math.log2(n)), total: n - 1 }
    default:
      return { perPlayer: 0, total: 0 }
  }
}

const computedMatches = computed(() => {
  return calcMatchesByMode(form.mode, form.formatId, form.playerCount)
})
const isBaRenZhuan = computed(() => form.formatId === 'ba-ren-zhuan')

const formatSummary = computed(() => {
  const { perPlayer, total } = computedMatches.value
  const rounds = Math.ceil(total / Math.max(1, form.courtCount))
  const scoringText = scoringOptions.find(s => s.value === form.scoring)?.label ?? ''
  return `预计${form.playerCount}人，每人${perPlayer}场，共${total}场\n${form.courtCount}片场地，约${rounds}轮\n${scoringText}`
})

function handleClear() {
  form.name = ''
  form.gender = 'unlimited'
  form.playerCount = 8
  form.courtCount = 1
  form.scoring = 'one-set-21'
  form.courtNumber = ''
  form.description = ''
  form.joinType = 'pre-register'
}

function validate(): boolean {
  if (!form.name.trim()) {
    uni.$u.toast('请输入比赛名称')
    return false
  }
  return true
}

function buildCompetition(status: 'draft' | 'recruiting') {
  const playerCount = isBaRenZhuan.value ? 8 : form.playerCount
  if (isBaRenZhuan.value)
    form.playerCount = 8
  const { perPlayer, total } = computedMatches.value
  return {
    name: form.name,
    mode: form.mode,
    format: form.format,
    formatId: form.formatId,
    gender: form.gender,
    playerCount,
    courtCount: Math.max(1, Number(form.courtCount) || 1),
    matchesPerPlayer: perPlayer,
    totalMatches: total,
    scoring: scoringOptions.find(s => s.value === form.scoring)?.label ?? '',
    courtNumber: form.courtNumber,
    description: form.description,
    status,
    joinType: form.joinType,
    creatorUserId: Number(userStore.user_id || 0),
    date: new Date().toISOString().split('T')[0],
  }
}

async function handleSave() {
  if (!validate())
    return
  try {
    const payload = buildCompetition('draft')
    if (draftId.value > 0) {
      await CompetitionApi.updateCompetition(draftId.value, payload)
    }
    else {
      const created = await CompetitionApi.createCompetition(payload)
      draftId.value = created.id
    }
    uni.$u.toast('已保存为草稿')
    setTimeout(() => uni.navigateBack(), 500)
  }
  catch {
    uni.$u.toast('保存失败')
  }
}

async function handlePublish() {
  if (!validate())
    return
  try {
    const payload = buildCompetition('recruiting')
    let comp: { id: number }
    if (draftId.value > 0)
      comp = await CompetitionApi.updateCompetition(draftId.value, payload)
    else
      comp = await CompetitionApi.createCompetition(payload)
    uni.$u.toast('发布成功')
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/activity/match-detail/index?id=${comp.id}` })
    }, 500)
  }
  catch {
    uni.$u.toast('发布失败')
  }
}

onLoad(async (options: any) => {
  if (!userStore.user_id) {
    await userStore.info().catch(() => {
      // ignore, create/update will be blocked by backend if unauthenticated
    })
  }
  if (options?.draftId)
    draftId.value = Number(options.draftId)
  if (options?.mode)
    form.mode = options.mode
  if (options?.format)
    form.format = decodeURIComponent(options.format)
  if (options?.formatId)
    form.formatId = options.formatId
  if (options?.name)
    form.name = decodeURIComponent(options.name)
  if (form.formatId === 'ba-ren-zhuan')
    form.playerCount = 8

  if (draftId.value > 0) {
    CompetitionApi.getCompetitionDetail(draftId.value).then((detail) => {
      form.name = detail.name
      form.mode = detail.mode
      form.format = detail.format
      form.formatId = detail.formatId
      form.gender = detail.gender
      form.playerCount = detail.playerCount
      form.courtCount = detail.courtCount ?? 1
      form.scoring = scoringOptions.find(s => s.label === detail.scoring)?.value ?? 'one-set-21'
      form.courtNumber = detail.courtNumber ?? ''
      form.description = detail.description ?? ''
      form.joinType = detail.joinType
    }).catch(() => {
      uni.$u.toast('草稿加载失败')
    })
  }
})
</script>

<style scoped lang="scss">
.form-card {
  padding: 0 28rpx;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: 16rpx;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100rpx;
}

.form-label {
  flex-shrink: 0;
  margin-bottom: 0;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.form-value {
  flex: 1;
  text-align: right;
}

.form-text {
  font-size: 28rpx;
  color: #666;
}

.form-text-sm {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  white-space: pre-line;
}

.form-divider {
  height: 1rpx;
  background: #f5f5f5;
}

.form-chips {
  display: flex;
  gap: 16rpx;
}

.chip {
  padding: 10rpx 28rpx;
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  border: 2rpx solid transparent;
  border-radius: 30rpx;
  transition: all 0.2s;

  &.active {
    color: var(--theme-primary);
    background: rgb(33 213 157 / 10%);
    border-color: var(--theme-primary);
  }
}
</style>
