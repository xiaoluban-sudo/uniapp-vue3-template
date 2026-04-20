<template>
  <view class="tabbar-wrap">
    <!-- Popup overlay -->
    <view v-if="showPopup" class="popup-overlay" @click="showPopup = false" />

    <!-- Popup menu -->
    <view v-if="showPopup" class="popup-menu">
      <view class="popup-item" @click="goToMatchType">
        <view class="popup-icon" style="background: linear-gradient(135deg, #ff9800, #f57c00);">
          <view class="i-mdi-trophy text-48rpx text-white" />
        </view>
        <text class="popup-label">
          比赛
        </text>
      </view>
      <view class="popup-item" @click="goToActivity">
        <view class="popup-icon" style="background: linear-gradient(135deg, #21d59d, #1ab389);">
          <view class="i-mdi-calendar-plus text-48rpx text-white" />
        </view>
        <text class="popup-label">
          活动
        </text>
      </view>
    </view>

    <!-- Tabbar background with circular notch -->
    <view class="tabbar-bg" />

    <!-- Tabbar content -->
    <view class="tabbar">
      <view class="tabbar-item" :class="{ 'is-active': current === 0 }" @click="switchTab(0)">
        <view class="tabbar-icon" :class="current === 0 ? tabs[0].activeIcon : tabs[0].icon" />
        <text class="tabbar-label">
          {{ tabs[0].text }}
        </text>
        <view v-if="current === 0" class="tab-dot" />
      </view>

      <view class="tabbar-item" :class="{ 'is-active': current === 1 }" @click="switchTab(1)">
        <view class="tabbar-icon" :class="current === 1 ? tabs[1].activeIcon : tabs[1].icon" />
        <text class="tabbar-label">
          {{ tabs[1].text }}
        </text>
        <view v-if="current === 1" class="tab-dot" />
      </view>

      <!-- Center button -->
      <view class="tabbar-center" @click="togglePopup">
        <view class="center-btn" :class="{ 'is-open': showPopup }">
          <view class="center-btn-gloss" />
          <view class="center-icon i-mdi-plus text-50rpx text-white" :class="{ 'is-open': showPopup }" />
        </view>
        <!-- Ripple on tap -->
        <view v-if="showRipple" class="center-ripple" />
      </view>

      <view class="tabbar-item" :class="{ 'is-active': current === 2 }" @click="switchTab(2)">
        <view class="tabbar-icon" :class="current === 2 ? tabs[2].activeIcon : tabs[2].icon" />
        <text class="tabbar-label">
          {{ tabs[2].text }}
        </text>
        <view v-if="current === 2" class="tab-dot" />
      </view>

      <view class="tabbar-item" :class="{ 'is-active': current === 3 }" @click="switchTab(3)">
        <view class="tabbar-icon" :class="current === 3 ? tabs[3].activeIcon : tabs[3].icon" />
        <text class="tabbar-label">
          {{ tabs[3].text }}
        </text>
        <view v-if="current === 3" class="tab-dot" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  current: number
}

const props = defineProps<Props>()

const showPopup = ref(false)
const showRipple = ref(false)

const tabs = [
  { path: '/pages/tab/home/index', icon: 'i-mdi-home-variant-outline', activeIcon: 'i-mdi-home-variant', text: '首页' },
  { path: '/pages/tab/match/index', icon: 'i-mdi-badminton', activeIcon: 'i-mdi-badminton', text: '约球' },
  { path: '/pages/tab/record/index', icon: 'i-mdi-trophy-variant-outline', activeIcon: 'i-mdi-trophy-variant', text: '战绩' },
  { path: '/pages/tab/user/index', icon: 'i-mdi-account-circle-outline', activeIcon: 'i-mdi-account-circle', text: '我的' },
]

function switchTab(index: number) {
  if (index === props.current)
    return
  showPopup.value = false
  uni.switchTab({ url: tabs[index].path })
}

function togglePopup() {
  showRipple.value = true
  setTimeout(() => {
    showRipple.value = false
  }, 500)
  showPopup.value = !showPopup.value
}

function goToMatchType() {
  showPopup.value = false
  uni.navigateTo({ url: '/pages/activity/match-type/index' })
}

function goToActivity() {
  showPopup.value = false
  uni.navigateTo({ url: '/pages/activity/create/index' })
}
</script>

<style scoped lang="scss">
.tabbar-wrap {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
}

/* ── Popup ── */
.popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 998;
  background: rgb(0 0 0 / 48%);
  backdrop-filter: blur(4px);
}

.popup-menu {
  position: absolute;
  bottom: calc(110rpx + env(safe-area-inset-bottom) + 60rpx);
  left: 50%;
  z-index: 1000;
  display: flex;
  gap: 60rpx;
  transform: translateX(-50%);
  animation: popup-in 0.25s ease-out;
}

@keyframes popup-in {
  from { opacity: 0; transform: translateX(-50%) translateY(30rpx) scale(0.8); }
  to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

.popup-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  align-items: center;
}

.popup-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  box-shadow: 0 8rpx 24rpx rgb(0 0 0 / 20%);
}

.popup-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #fff;
}

/* ── Tabbar background with radial-gradient notch ── */
.tabbar-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(circle 68rpx at 50% 0, transparent 66rpx, #fff 68rpx);
  filter: drop-shadow(0 -4rpx 6rpx rgb(0 0 0 / 6%));
}

/* ── Tabbar layout ── */
.tabbar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  height: 110rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ── Tab items ── */
.tabbar-item {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 110rpx;
  padding-top: 14rpx;
  transition: all 0.2s;
}

.tabbar-icon {
  width: 44rpx;
  height: 44rpx;
  margin-bottom: 4rpx;
  font-size: 44rpx;
  color: #999;
  transition: color 0.2s, transform 0.2s;
}

.tabbar-label {
  font-size: 22rpx;
  color: #999;
  transition: color 0.2s;
}

.is-active .tabbar-icon {
  color: var(--theme-primary);
  transform: scale(1.08);
}

.is-active .tabbar-label {
  font-weight: bold;
  color: var(--theme-primary);
}

/* Active indicator dot */
.tab-dot {
  width: 8rpx;
  height: 8rpx;
  margin-top: 6rpx;
  background: var(--theme-primary);
  border-radius: 50%;
  animation: dot-in 0.25s ease-out;
}

@keyframes dot-in {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}

/* ── Center button ── */
.tabbar-center {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 110rpx;
}

.center-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 110rpx;
  height: 110rpx;
  margin-top: -62rpx;
  background: linear-gradient(145deg, #2ae0aa 0%, #18b585 100%);
  border: 7rpx solid #fff;
  border-radius: 50%;
  box-shadow:
    0 6rpx 20rpx rgb(24 181 133 / 30%),
    0 2rpx 6rpx rgb(0 0 0 / 8%);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  animation: btn-breathe 2.4s ease-in-out infinite;

  &:active {
    transform: scale(0.94);
    animation: none;
  }

  &.is-open {
    background: linear-gradient(145deg, #ff7d7d 0%, #ef5f5f 100%);
    box-shadow:
      0 6rpx 20rpx rgb(239 95 95 / 30%),
      0 2rpx 6rpx rgb(0 0 0 / 8%);
    transform: scale(1);
    animation: none;
  }
}

.center-btn-gloss {
  position: absolute;
  top: 12rpx;
  left: 16rpx;
  width: 44rpx;
  height: 20rpx;
  background: rgb(255 255 255 / 40%);
  border-radius: 99rpx;
  transform: rotate(-18deg);
}

.center-icon {
  font-weight: bold;
  transition: transform 0.22s ease;

  &.is-open {
    transform: rotate(45deg);
  }
}

/* Ripple on center button tap */
.center-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: -1;
  width: 110rpx;
  height: 110rpx;
  margin-top: -62rpx;
  pointer-events: none;
  border: 4rpx solid rgb(24 181 133 / 35%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple-out 0.5s ease-out forwards;
}

@keyframes ripple-out {
  0% { width: 110rpx; height: 110rpx; opacity: 0.6; }
  100% { width: 190rpx; height: 190rpx; opacity: 0; }
}

@keyframes btn-breathe {
  0%, 100% {
    box-shadow: 0 6rpx 20rpx rgb(24 181 133 / 28%), 0 2rpx 6rpx rgb(0 0 0 / 8%);
    transform: scale(1);
  }

  50% {
    box-shadow: 0 10rpx 26rpx rgb(24 181 133 / 36%), 0 3rpx 8rpx rgb(0 0 0 / 9%);
    transform: scale(1.03);
  }
}
</style>
