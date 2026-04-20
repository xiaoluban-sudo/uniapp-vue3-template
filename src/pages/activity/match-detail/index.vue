<template>
  <view class="match-detail min-h-screen" style="background: #f5f7fa;">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="navBarStyle">
      <view class="nav-back" :style="navBtnStyle" @click="goBack">
        <view class="i-mdi-chevron-left text-44rpx text-white" />
      </view>
      <text class="nav-title" :style="{ lineHeight: `${menuBtnHeight}px` }">
        比赛详情
      </text>
    </view>

    <view v-if="comp">
      <!-- Header card -->
      <view class="header-card" :style="{ paddingTop: `${navTotalHeight + 20}px` }">
        <view class="mb-16rpx flex items-center justify-between">
          <text class="text-36rpx text-white font-bold">
            {{ comp.name }}
          </text>
          <view class="header-badge">
            {{ statusText }}
          </view>
        </view>
        <view class="flex items-center gap-24rpx text-24rpx text-white/70">
          <text>{{ comp.format }} · {{ comp.mode === 'singles' ? '单打' : '双打' }}</text>
          <text>{{ comp.players.length }}/{{ comp.playerCount }}人</text>
        </view>
      </view>

      <!-- Tabs -->
      <view class="tab-bar">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: currentTab === tab.key }"
          @click="currentTab = tab.key"
        >
          <text>{{ tab.label }}</text>
        </view>
      </view>

      <!-- Tab: 比赛 -->
      <view v-if="currentTab === 'info'" class="px-30rpx pt-20rpx">
        <view class="card mb-20rpx">
          <view class="info-grid">
            <view class="info-item">
              <view class="info-icon i-mdi-badminton" />
              <text class="info-label">
                赛制
              </text>
              <text class="info-val">
                {{ comp.format }}
              </text>
            </view>
            <view class="info-item">
              <view class="info-icon i-mdi-account-group" />
              <text class="info-label">
                人数
              </text>
              <text class="info-val">
                {{ comp.playerCount }}人
              </text>
            </view>
            <view class="info-item">
              <view class="info-icon i-mdi-counter" />
              <text class="info-label">
                场次
              </text>
              <text class="info-val">
                每人{{ comp.matchesPerPlayer }}场
              </text>
            </view>
            <view class="info-item">
              <view class="info-icon i-mdi-scoreboard" />
              <text class="info-label">
                计分
              </text>
              <text class="info-val">
                {{ comp.scoring }}
              </text>
            </view>
          </view>
        </view>

        <!-- 详细信息 -->
        <view class="card mb-20rpx">
          <view class="detail-row">
            <text class="detail-label">
              组织方式
            </text>
            <text class="detail-val">
              {{ comp.joinType === 'pre-register' ? '预报名' : '现场组织' }}
            </text>
          </view>
          <view class="detail-row">
            <text class="detail-label">
              性别限制
            </text>
            <text class="detail-val">
              {{ genderLabel }}
            </text>
          </view>
          <view v-if="comp.courtNumber" class="detail-row">
            <text class="detail-label">
              场地号
            </text>
            <text class="detail-val">
              {{ comp.courtNumber }}
            </text>
          </view>
          <view class="detail-row">
            <text class="detail-label">
              发起人
            </text>
            <text class="detail-val">
              {{ comp.creatorNickname || `用户${comp.creatorUserId}` }}
            </text>
          </view>
          <view v-if="comp.description" class="detail-row" style="flex-direction: column; gap: 8rpx; align-items: flex-start;">
            <text class="detail-label">
              补充说明
            </text>
            <text class="text-26rpx text-[#666]">
              {{ comp.description }}
            </text>
          </view>
        </view>

        <!-- 已报名选手 -->
        <view class="card mb-20rpx">
          <text class="mb-20rpx block text-28rpx font-bold">
            已报名 ({{ comp.players.length }}/{{ comp.playerCount }})
          </text>
          <view class="flex flex-wrap gap-24rpx">
            <view v-for="p in comp.players" :key="p.id" class="player-slot">
              <u-avatar :src="p.avatarUrl" size="40" />
              <text class="mt-6rpx text-22rpx">
                {{ p.nickname || `球友${p.userId}` }}
              </text>
              <text v-if="p.userId === comp.creatorUserId" class="creator-tag">
                发起人
              </text>
            </view>
            <view
              v-for="i in Math.max(0, comp.playerCount - comp.players.length)"
              :key="`e-${i}`"
              class="player-slot"
            >
              <view class="empty-avatar">
                <view class="i-mdi-plus text-28rpx text-[#ccc]" />
              </view>
              <text class="mt-6rpx text-22rpx text-[#ccc]">
                空位
              </text>
            </view>
          </view>
        </view>

        <!-- Dev: 添加测试用户 -->
        <view v-if="isCreator" class="mb-20rpx">
          <u-button
            type="info"
            text="+1 测试用户"
            plain
            size="small"
            custom-style="height: 64rpx; border-radius: 32rpx; border-style: dashed;"
            :disabled="!canDevSeed"
            :loading="seeding"
            @click="handleDevAddOne"
          />
        </view>

        <!-- Actions -->
        <view class="flex gap-20rpx pb-40rpx">
          <u-button
            text="分享给好友"
            plain
            type="primary"
            custom-style="flex: 1; height: 88rpx; border-radius: 44rpx;"
            open-type="share"
            @click="handleShare"
          />
          <!-- 报名中 + 未报名 + 已登录 -->
          <u-button
            v-if="comp.status === 'recruiting' && !hasJoined && isLoggedIn"
            type="primary"
            text="立即加入"
            custom-style="flex: 1; height: 88rpx; border-radius: 44rpx;"
            :loading="joining"
            @click="handleJoin"
          />
          <!-- 报名中 + 未登录 -->
          <u-button
            v-else-if="comp.status === 'recruiting' && !hasJoined && !isLoggedIn"
            type="primary"
            text="登录后报名"
            custom-style="flex: 1; height: 88rpx; border-radius: 44rpx;"
            @click="toLogin"
          />
          <!-- 已满员 + 发起人 -->
          <u-button
            v-else-if="comp.status === 'full' && isCreator"
            type="warning"
            text="开始比赛"
            custom-style="flex: 1; height: 88rpx; border-radius: 44rpx;"
            @click="handleStart"
          />
          <!-- 已报名（非 ongoing/finished） -->
          <u-button
            v-else-if="hasJoined && !['ongoing', 'finished'].includes(comp.status)"
            type="success"
            text="已报名"
            disabled
            custom-style="flex: 1; height: 88rpx; border-radius: 44rpx;"
          />
          <!-- 已满员 + 未报名 -->
          <u-button
            v-else-if="comp.status === 'full' && !hasJoined"
            text="已满员"
            disabled
            custom-style="flex: 1; height: 88rpx; border-radius: 44rpx;"
          />
        </view>
      </view>

      <!-- Tab: 排名 -->
      <view v-if="currentTab === 'ranking'" class="px-30rpx pt-20rpx">
        <view class="card">
          <view v-if="comp.status === 'recruiting' || comp.status === 'full'" class="py-60rpx text-center text-[#999]">
            <view class="i-mdi-trophy-outline mx-auto mb-16rpx text-80rpx text-[#ddd]" />
            <text>比赛尚未开始，报满即可开赛</text>
          </view>
          <view v-else>
            <view v-for="(p, i) in rankingList" :key="p.userId" class="rank-row">
              <text class="rank-num" :class="{ gold: i === 0, silver: i === 1, bronze: i === 2 }">
                {{ i + 1 }}
              </text>
              <u-avatar :src="p.avatarUrl" size="32" />
              <text class="flex-1 text-28rpx">
                {{ p.nickname }}
              </text>
              <text class="text-24rpx text-[#999]">
                {{ p.wins }}胜 / 净胜{{ p.netPoints }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- Tab: 对阵 -->
      <view v-if="currentTab === 'matchup'" class="px-30rpx pt-20rpx">
        <!-- Filter: 选中头像 -->
        <view v-if="selectedPlayerIds.length > 0" class="filter-card mb-20rpx">
          <view class="flex items-center justify-between">
            <text class="text-26rpx text-[#333] font-bold">
              已筛选（{{ selectedPlayerIds.length }}）
            </text>
            <text class="text-24rpx text-primary" @click="clearSelectedPlayers">
              清空
            </text>
          </view>
          <view class="mt-16rpx flex flex-wrap gap-16rpx">
            <view v-for="pid in selectedPlayerIds" :key="`sp-${pid}`" class="selected-chip">
              <u-avatar :src="selectedPlayerInfo(pid)?.avatarUrl" size="26" />
              <text class="mx-10rpx text-22rpx">
                {{ selectedPlayerInfo(pid)?.nickname || '-' }}
              </text>
              <view class="i-mdi-close-circle text-30rpx text-[#bbb]" @click.stop="removeSelectedPlayer(pid)" />
            </view>
          </view>
        </view>

        <view v-if="matchList.length === 0" class="card">
          <view class="py-60rpx text-center text-[#999]">
            <view class="i-mdi-view-list-outline mx-auto mb-16rpx text-80rpx text-[#ddd]" />
            <text>对阵表将在比赛开始后生成</text>
          </view>
        </view>
        <view v-else class="matchup-list">
          <view v-for="group in groupedMatchListFiltered" :key="`r-${group.round}`" class="round-group mb-20rpx">
            <view class="round-header">
              第{{ group.round }}轮（{{ group.matches.length }}场）
            </view>
            <view v-for="m in group.matches" :key="m.id" class="match-card mb-16rpx" @click="toMatchInfo(m.id)">
              <view class="match-round">
                第{{ m.round }}轮 · 第{{ m.roundMatchNo }}场
                <text v-if="m.courtNumber" class="court-tag">
                  {{ m.courtNumber }}
                </text>
                <text v-if="m.status === 'finished'" class="match-status finished">
                  已结束
                </text>
                <text v-else class="match-status pending">
                  待比赛
                </text>
                <!-- 裁判记分按钮 -->
                <view
                  v-if="amReferee && m.status !== 'finished'"
                  class="score-btn"
                  @click.stop="openScoreDialog(m)"
                >
                  <view class="i-mdi-pencil text-22rpx" />
                  <text>记分</text>
                </view>
              </view>
              <view class="match-body">
                <!-- Team A -->
                <view class="team-col">
                  <view v-for="p in m.teamA" :key="p.nickname" class="team-player">
                    <view class="avatar-hit" @tap.stop="p.playerId && toggleSelectedPlayer(p.playerId)">
                      <u-avatar
                        :src="p.avatarUrl"
                        size="28"
                        :class="[{ 'avatar-selected': p.playerId && selectedPlayerIds.includes(p.playerId) }]"
                      />
                    </view>
                    <text class="team-name">
                      {{ p.nickname }}
                    </text>
                  </view>
                </view>
                <!-- Score -->
                <view class="score-col">
                  <text class="score-text" :class="{ 'has-result': m.status === 'finished' }">
                    {{ m.scoreA }} : {{ m.scoreB }}
                  </text>
                  <text class="vs-label">
                    VS
                  </text>
                </view>
                <!-- Team B -->
                <view class="team-col team-right">
                  <view v-for="p in m.teamB" :key="p.nickname" class="team-player justify-end">
                    <text class="team-name text-right">
                      {{ p.nickname }}
                    </text>
                    <view class="avatar-hit" @tap.stop="p.playerId && toggleSelectedPlayer(p.playerId)">
                      <u-avatar
                        :src="p.avatarUrl"
                        size="28"
                        :class="[{ 'avatar-selected': p.playerId && selectedPlayerIds.includes(p.playerId) }]"
                      />
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Tab: 裁判 -->
      <view v-if="currentTab === 'referee'" class="px-30rpx pt-20rpx">
        <view class="card mb-20rpx">
          <text class="mb-20rpx block text-28rpx font-bold">
            裁判列表 ({{ referees.length }})
          </text>
          <view v-if="referees.length === 0" class="py-40rpx text-center text-[#999]">
            <text>暂无裁判</text>
          </view>
          <view v-else class="flex flex-wrap gap-24rpx">
            <view v-for="r in referees" :key="r.id" class="player-slot">
              <u-avatar :src="r.avatarUrl" size="40" />
              <text class="mt-6rpx text-22rpx">
                {{ r.nickname || `球友${r.userId}` }}
              </text>
              <text v-if="r.isCreator" class="creator-tag">
                组织者
              </text>
            </view>
          </view>
        </view>

        <!-- 邀请裁判 -->
        <view v-if="isCreator" class="mb-20rpx">
          <u-button
            type="primary"
            text="邀请裁判（分享给好友）"
            icon="share"
            custom-style="height: 88rpx; border-radius: 44rpx;"
            open-type="share"
            @click="shareMode = 'referee'"
          />
        </view>

        <!-- 当前用户非裁判时，显示接受邀请按钮 -->
        <view v-if="isLoggedIn && !amReferee && !isCreator" class="mb-20rpx">
          <u-button
            type="warning"
            text="接受邀请，成为裁判"
            custom-style="height: 88rpx; border-radius: 44rpx;"
            @click="handleAcceptReferee"
          />
        </view>
      </view>
    </view>

    <view v-else class="min-h-screen center">
      <text class="text-[#999]">
        比赛不存在
      </text>
    </view>

    <!-- 记分弹窗 -->
    <u-popup :show="scoreDialogVisible" mode="bottom" round="24" :safe-area-inset-bottom="true" @close="scoreDialogVisible = false">
      <view class="score-dialog">
        <text class="score-dialog-title">
          第{{ scoringMatch?.round }}轮 · 第{{ scoringMatch?.roundMatchNo || 1 }}场 · 记分
        </text>

        <view class="score-team-row">
          <view class="score-team-info">
            <view v-for="p in (scoringMatch?.teamA ?? [])" :key="p.nickname" class="score-team-player">
              <u-avatar :src="p.avatarUrl" size="24" />
              <text class="text-24rpx">
                {{ p.nickname }}
              </text>
            </view>
          </view>
          <view class="score-input-wrap">
            <input
              v-model="scoreForm.scoreA"
              type="number"
              class="score-input"
              placeholder="0"
            >
          </view>
        </view>

        <view class="score-vs">
          VS
        </view>

        <view class="score-team-row">
          <view class="score-team-info">
            <view v-for="p in (scoringMatch?.teamB ?? [])" :key="p.nickname" class="score-team-player">
              <u-avatar :src="p.avatarUrl" size="24" />
              <text class="text-24rpx">
                {{ p.nickname }}
              </text>
            </view>
          </view>
          <view class="score-input-wrap">
            <input
              v-model="scoreForm.scoreB"
              type="number"
              class="score-input"
              placeholder="0"
            >
          </view>
        </view>

        <view class="mt-40rpx flex gap-20rpx">
          <u-button
            text="取消"
            plain
            custom-style="flex: 1; height: 80rpx; border-radius: 40rpx;"
            @click="scoreDialogVisible = false"
          />
          <u-button
            type="primary"
            text="提交"
            custom-style="flex: 1; height: 80rpx; border-radius: 40rpx;"
            :loading="scoring"
            @click="submitScore"
          />
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import type { CompetitionDetail, CompetitionMatch, RankingItem, RefereeItem } from '@/api/competition/types'
import { CompetitionApi } from '@/api'
import { useUserStore } from '@/store'
import { isLogin } from '@/utils/auth'

const userStore = useUserStore()
const compId = ref(0)
const comp = ref<CompetitionDetail | null>(null)
const matches = ref<CompetitionMatch[]>([])
const rankingList = ref<RankingItem[]>([])
const referees = ref<RefereeItem[]>([])
const currentTab = ref('info')
const joining = ref(false)
const shareMode = ref<'normal' | 'referee'>('normal')

const tabs = [
  { key: 'info', label: '比赛' },
  { key: 'ranking', label: '排名' },
  { key: 'matchup', label: '对阵' },
  { key: 'referee', label: '裁判' },
]

const statusMap: Record<string, string> = {
  draft: '草稿',
  recruiting: '报名中',
  full: '已满员',
  ongoing: '进行中',
  finished: '已结束',
}

const genderMap: Record<string, string> = {
  unlimited: '不限',
  male: '仅限男性',
  female: '仅限女性',
  mixed: '男女混合',
}

const currentUserId = computed(() => Number(userStore.user_id) || 0)
const isLoggedIn = computed(() => isLogin())
const statusText = computed(() => statusMap[comp.value?.status ?? ''] ?? '')
const genderLabel = computed(() => genderMap[comp.value?.gender ?? ''] ?? '不限')
const hasJoined = computed(() => comp.value?.players.some(p => p.userId === currentUserId.value))
const isCreator = computed(() => comp.value?.creatorUserId === currentUserId.value)
const amReferee = computed(() => referees.value.some(r => r.userId === currentUserId.value))
const canDevSeed = computed(() => {
  const c = comp.value
  if (!c)
    return false
  return (c.players?.length ?? 0) < c.playerCount
})

const playerMap = computed(() => {
  const map = new Map<number, { playerId: number; nickname: string; avatarUrl: string }>()
  for (const p of comp.value?.players ?? [])
    map.set(p.id, { playerId: p.id, nickname: p.nickname || `球友${p.userId}`, avatarUrl: p.avatarUrl })
  return map
})

// ---- 对阵筛选：按球友（competition_player.id） ----
const selectedPlayerIds = ref<number[]>([])
function toggleSelectedPlayer(playerId: number) {
  const idx = selectedPlayerIds.value.indexOf(playerId)
  if (idx >= 0)
    selectedPlayerIds.value.splice(idx, 1)
  else
    selectedPlayerIds.value.push(playerId)
}

function removeSelectedPlayer(playerId: number) {
  const idx = selectedPlayerIds.value.indexOf(playerId)
  if (idx >= 0)
    selectedPlayerIds.value.splice(idx, 1)
}

function clearSelectedPlayers() {
  selectedPlayerIds.value = []
}

function selectedPlayerInfo(playerId: number) {
  return playerMap.value.get(playerId)
}

const matchList = computed(() => {
  return matches.value.map((m) => {
    const p1 = playerMap.value.get(m.teamAPlayer1Id)
    const p2 = m.teamAPlayer2Id ? playerMap.value.get(m.teamAPlayer2Id) : undefined
    const p3 = playerMap.value.get(m.teamBPlayer1Id)
    const p4 = m.teamBPlayer2Id ? playerMap.value.get(m.teamBPlayer2Id) : undefined
    return {
      id: m.id,
      round: m.round,
      roundMatchNo: m.roundMatchNo || 1,
      courtNumber: m.courtNumber || '',
      status: m.status,
      scoreA: m.scoreA,
      scoreB: m.scoreB,
      teamA: [
        { playerId: m.teamAPlayer1Id, nickname: p1?.nickname ?? '-', avatarUrl: p1?.avatarUrl ?? '' },
        ...(m.teamAPlayer2Id ? [{ playerId: m.teamAPlayer2Id, nickname: p2?.nickname ?? '-', avatarUrl: p2?.avatarUrl ?? '' }] : []),
      ],
      teamB: [
        { playerId: m.teamBPlayer1Id, nickname: p3?.nickname ?? '-', avatarUrl: p3?.avatarUrl ?? '' },
        ...(m.teamBPlayer2Id ? [{ playerId: m.teamBPlayer2Id, nickname: p4?.nickname ?? '-', avatarUrl: p4?.avatarUrl ?? '' }] : []),
      ],
      playerIds: [
        m.teamAPlayer1Id,
        ...(m.teamAPlayer2Id ? [m.teamAPlayer2Id] : []),
        m.teamBPlayer1Id,
        ...(m.teamBPlayer2Id ? [m.teamBPlayer2Id] : []),
      ],
    }
  })
})

const groupedMatchList = computed(() => {
  const groupMap = new Map<number, typeof matchList.value>()
  for (const m of matchList.value) {
    const arr = groupMap.get(m.round) ?? []
    arr.push(m)
    groupMap.set(m.round, arr)
  }
  return Array.from(groupMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, roundMatches]) => ({
      round,
      matches: roundMatches.sort((a, b) => a.roundMatchNo - b.roundMatchNo),
    }))
})

const groupedMatchListFiltered = computed(() => {
  const selected = selectedPlayerIds.value
  if (selected.length === 0)
    return groupedMatchList.value
  return groupedMatchList.value
    .map(g => ({
      ...g,
      matches: g.matches.filter(m => m.playerIds.some(pid => selected.includes(pid))),
    }))
    .filter(g => g.matches.length > 0)
})

// ---- 记分弹窗 ----
const scoreDialogVisible = ref(false)
const scoring = ref(false)
const scoringMatch = ref<(typeof matchList.value)[number] | null>(null)
const scoringMatchId = ref(0)
const scoreForm = reactive({ scoreA: '', scoreB: '' })

function openScoreDialog(m: (typeof matchList.value)[number]) {
  scoringMatch.value = m
  scoringMatchId.value = m.id
  scoreForm.scoreA = ''
  scoreForm.scoreB = ''
  scoreDialogVisible.value = true
}

async function submitScore() {
  const a = Number(scoreForm.scoreA)
  const b = Number(scoreForm.scoreB)
  if (Number.isNaN(a) || Number.isNaN(b) || a < 0 || b < 0) {
    uni.$u.toast('请输入有效分数')
    return
  }
  if (a === b) {
    uni.$u.toast('不允许平局')
    return
  }
  scoring.value = true
  try {
    await CompetitionApi.scoreMatch(compId.value, scoringMatchId.value, { scoreA: a, scoreB: b })
    uni.$u.toast('记分成功')
    scoreDialogVisible.value = false
    await Promise.all([loadMatches(), loadRankings(), loadDetail()])
  }
  catch (e: any) {
    uni.$u.toast(e?.data?.message || '记分失败')
  }
  finally {
    scoring.value = false
  }
}

// ---- 数据加载 ----
async function loadDetail() {
  if (!compId.value)
    return
  try {
    comp.value = await CompetitionApi.getCompetitionDetail(compId.value)
  }
  catch {
    comp.value = null
  }
}

async function loadMatches() {
  if (!compId.value)
    return
  try {
    matches.value = await CompetitionApi.getCompetitionMatches(compId.value)
  }
  catch {
    matches.value = []
  }
}

async function loadRankings() {
  if (!compId.value)
    return
  try {
    rankingList.value = await CompetitionApi.getCompetitionRankings(compId.value)
  }
  catch {
    rankingList.value = []
  }
}

async function loadReferees() {
  if (!compId.value)
    return
  try {
    referees.value = await CompetitionApi.listReferees(compId.value)
  }
  catch {
    referees.value = []
  }
}

// ---- 操作 ----
async function handleJoin() {
  if (!compId.value || joining.value)
    return
  joining.value = true
  try {
    await CompetitionApi.joinCompetition(compId.value)
    uni.$u.toast('报名成功！')
    await loadDetail()
  }
  catch (e: any) {
    uni.$u.toast(e?.data?.message || '报名失败')
  }
  finally {
    joining.value = false
  }
}

async function handleStart() {
  if (!compId.value)
    return
  try {
    await CompetitionApi.startCompetition(compId.value)
    uni.$u.toast('比赛已开始，对阵表已生成')
    currentTab.value = 'matchup'
    await Promise.all([loadDetail(), loadMatches(), loadRankings()])
  }
  catch (e: any) {
    uni.$u.toast(e?.data?.message || '开始比赛失败')
  }
}

async function handleAcceptReferee() {
  if (!compId.value)
    return
  try {
    const res = await CompetitionApi.joinAsReferee(compId.value)
    uni.$u.toast(res.alreadyJoined ? '你已经是裁判了' : '已成为裁判')
    await loadReferees()
  }
  catch (e: any) {
    uni.$u.toast(e?.data?.message || '操作失败')
  }
}

// ---- 测试：添加一个测试用户 ----
const seeding = ref(false)
async function handleDevAddOne() {
  if (!compId.value || seeding.value)
    return
  if (!canDevSeed.value) {
    uni.$u.toast('已满员，无需填充')
    return
  }
  seeding.value = true
  try {
    const res = await CompetitionApi.devSeed(compId.value, 1)
    if (res.filled > 0)
      uni.$u.toast(`+${res.filled} (${res.totalPlayers}/${comp.value?.playerCount})`)
    else
      uni.$u.toast(res.message || '未新增测试用户')
    await loadDetail()
  }
  catch {
    uni.$u.toast('添加失败')
  }
  finally {
    seeding.value = false
  }
}

function toLogin() {
  uni.navigateTo({ url: '/pages/common/login/index' })
}

function toMatchInfo(matchId: number) {
  if (!compId.value)
    return
  uni.navigateTo({ url: `/pages/activity/match-info/index?competitionId=${compId.value}&matchId=${matchId}` })
}

// ---- 导航栏布局 ----
const statusBarHeight = ref(0)
const menuBtnTop = ref(0)
const menuBtnHeight = ref(32)

function initNavLayout() {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight ?? 20

  // #ifdef MP-WEIXIN
  const rect = uni.getMenuButtonBoundingClientRect()
  menuBtnTop.value = rect.top
  menuBtnHeight.value = rect.height
  // #endif

  // #ifndef MP-WEIXIN
  menuBtnTop.value = statusBarHeight.value + 4
  menuBtnHeight.value = 32
  // #endif
}
initNavLayout()

const navBarStyle = computed(() => ({
  paddingTop: `${menuBtnTop.value}px`,
}))

const navBtnStyle = computed(() => ({
  width: `${menuBtnHeight.value}px`,
  height: `${menuBtnHeight.value}px`,
}))

const navTotalHeight = computed(() => menuBtnTop.value + menuBtnHeight.value + 8)

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1)
    uni.navigateBack()
  else
    uni.switchTab({ url: '/pages/tab/home/index' })
}

function handleShare() {
  // #ifdef H5
  uni.$u.toast('请在微信小程序中分享')
  // #endif
}

// #ifdef MP-WEIXIN
onShareAppMessage(() => {
  if (shareMode.value === 'referee') {
    shareMode.value = 'normal'
    return {
      title: `邀请你担任「${comp.value?.name ?? '羽毛球比赛'}」的裁判`,
      path: `/pages/activity/match-detail/index?id=${compId.value}&refereeInvite=true`,
    }
  }
  return {
    title: comp.value?.name ?? '来一起打羽毛球吧！',
    path: `/pages/activity/match-detail/index?id=${compId.value}`,
  }
})
// #endif

onLoad(async (options: any) => {
  compId.value = Number(options?.id ?? 0)
  const isRefereeInvite = options?.refereeInvite === 'true'

  if (isLoggedIn.value && !userStore.user_id) {
    await userStore.info().catch(() => {})
  }

  await Promise.all([loadDetail(), loadMatches(), loadRankings(), loadReferees()])

  // 通过裁判邀请链接进入，自动跳到裁判 Tab 并尝试加入
  if (isRefereeInvite && isLoggedIn.value) {
    currentTab.value = 'referee'
    if (!amReferee.value) {
      await handleAcceptReferee()
    }
  }
})
</script>

<style scoped lang="scss">
.nav-bar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  padding-right: 24rpx;
  padding-bottom: 8px;
  padding-left: 24rpx;
}

.nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 20%);
  border-radius: 50%;
}

.nav-title {
  margin-left: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.header-card {
  padding: 30rpx;
  padding-top: 180rpx;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border-radius: 0 0 32rpx 32rpx;
}

.header-badge {
  padding: 6rpx 20rpx;
  font-size: 22rpx;
  color: #fff;
  background: rgb(255 255 255 / 25%);
  border-radius: 20rpx;
}

.tab-bar {
  display: flex;
  background: #fff;
  box-shadow: 0 2rpx 8rpx rgb(0 0 0 / 4%);
}

.tab-item {
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

.card {
  padding: 28rpx;
  background: #fff;
  border-radius: 16rpx;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: center;
  padding: 20rpx 0;
  background: #fafafa;
  border-radius: 12rpx;
}

.info-icon {
  font-size: 36rpx;
  color: #ff9800;
}

.info-label {
  font-size: 22rpx;
  color: #999;
}

.info-val {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-size: 26rpx;
  color: #999;
}

.detail-val {
  font-size: 26rpx;
  color: #333;
}

.player-slot {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
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

.creator-tag {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  padding: 2rpx 10rpx;
  font-size: 18rpx;
  color: #fff;
  background: #ff9800;
  border-radius: 10rpx;
}

.rank-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.rank-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #999;
  background: #f5f5f5;
  border-radius: 50%;

  &.gold { color: #fff; background: #ffd700; }
  &.silver { color: #fff; background: #c0c0c0; }
  &.bronze { color: #fff; background: #cd7f32; }
}

.match-card {
  padding: 0;
  overflow: hidden;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgb(0 0 0 / 5%);
}

.filter-card {
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgb(0 0 0 / 5%);
}

.selected-chip {
  display: flex;
  align-items: center;
  padding: 8rpx 12rpx;
  background: #f8fafc;
  border-radius: 999rpx;
}

.avatar-selected {
  border-radius: 999rpx;
  box-shadow: 0 0 0 4rpx rgb(33 213 157 / 25%);
}

.avatar-hit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.round-header {
  margin-bottom: 12rpx;
  font-size: 24rpx;
  font-weight: bold;
  color: #666;
}

.match-round {
  display: flex;
  gap: 12rpx;
  align-items: center;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  font-weight: bold;
  color: #666;
  background: #fafafa;
}

.court-tag {
  padding: 2rpx 12rpx;
  margin-left: 8rpx;
  font-size: 20rpx;
  color: #3c9cff;
  background: rgb(60 156 255 / 10%);
  border-radius: 999rpx;
}

.match-status {
  padding: 2rpx 14rpx;
  font-size: 20rpx;
  font-weight: normal;
  border-radius: 8rpx;

  &.finished { color: #67c23a; background: #f0f9eb; }
  &.pending { color: #ff9800; background: #fff8e1; }
}

.match-body {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
}

.team-col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12rpx;
}

.team-right {
  align-items: flex-end;
}

.team-player {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.team-name {
  max-width: 140rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 24rpx;
  color: #333;
  white-space: nowrap;
}

.score-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120rpx;
  padding: 0 20rpx;
}

.score-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ccc;

  &.has-result { color: #333; }
}

.vs-label {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #ccc;
}

.score-btn {
  display: flex;
  gap: 4rpx;
  align-items: center;
  padding: 6rpx 18rpx;
  margin-left: auto;
  font-size: 22rpx;
  font-weight: normal;
  color: #fff;
  background: #ff9800;
  border-radius: 8rpx;
}

.score-dialog {
  padding: 40rpx 30rpx;
}

.score-dialog-title {
  display: block;
  margin-bottom: 32rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.score-team-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.score-team-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10rpx;
}

.score-team-player {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.score-input-wrap {
  width: 140rpx;
  margin-left: 20rpx;
}

.score-input {
  width: 100%;
  height: 80rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  background: #f5f5f5;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
}

.score-vs {
  padding: 8rpx 0;
  font-size: 24rpx;
  font-weight: bold;
  color: #ccc;
  text-align: center;
}
</style>
