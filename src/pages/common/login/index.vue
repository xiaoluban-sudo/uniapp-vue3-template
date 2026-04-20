<template>
  <view class="login-page">
    <view class="hero-card">
      <view class="hero-icon i-mdi-badminton text-white" />
      <text class="hero-title">
        羽毛球助手
      </text>

      <!-- 未登录：先获取身份 -->
      <template v-if="!hasToken">
        <text class="hero-subtitle">
          微信一键登录，开启你的羽球之旅
        </text>
        <u-button
          type="success"
          :loading="loadingLogin"
          text="微信一键登录"
          custom-style="height: 88rpx; border-radius: 44rpx;"
          @click="handleLogin"
        />
      </template>

      <!-- 已登录：完善头像昵称 -->
      <template v-else>
        <text class="hero-subtitle">
          完善你的头像和昵称
        </text>

        <view class="profile-form">
          <!-- 头像选择（微信组件方式） -->
          <view class="avatar-row">
            <text class="form-label">
              头像
            </text>
            <!-- #ifdef MP-WEIXIN -->
            <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
              <u-avatar :src="avatarUrl || ''" size="50" />
              <text class="avatar-hint">
                点击选择
              </text>
            </button>
            <!-- #endif -->
            <!-- #ifndef MP-WEIXIN -->
            <view class="avatar-btn" @click="pickAvatarFallback">
              <u-avatar :src="avatarUrl || ''" size="50" />
              <text class="avatar-hint">
                点击选择
              </text>
            </view>
            <!-- #endif -->
          </view>

          <!-- 昵称输入（微信组件方式） -->
          <view class="nickname-row">
            <text class="form-label">
              昵称
            </text>
            <!-- #ifdef MP-WEIXIN -->
            <input
              v-model="nickname"
              type="nickname"
              class="nickname-input"
              placeholder="请输入昵称"
              @blur="onNicknameBlur"
            >
            <!-- #endif -->
            <!-- #ifndef MP-WEIXIN -->
            <input
              v-model="nickname"
              class="nickname-input"
              placeholder="请输入昵称"
            >
            <!-- #endif -->
          </view>
        </view>

        <u-button
          type="success"
          :loading="loadingSave"
          text="保存"
          custom-style="margin-top: 32rpx; height: 88rpx; border-radius: 44rpx;"
          @click="handleFinish"
        />
      </template>

      <text class="hint">
        登录即代表同意《用户协议》和《隐私政策》
      </text>
    </view>
    <view class="h-150rpx" />
  </view>
</template>

<script setup lang="ts">
import { UserApi } from '@/api'
import { HOME_PATH, isTabBarPath, LOGIN_PATH, removeQueryString } from '@/router'
import { useUserStore } from '@/store'
import { getToken } from '@/utils/auth'

const userStore = useUserStore()
const loadingLogin = ref(false)
const loadingSave = ref(false)
const hasToken = ref(!!getToken())
const avatarUrl = ref('')
const nickname = ref('')
let redirect = HOME_PATH

async function goAfterLogin() {
  uni.$u.route({
    type: isTabBarPath(redirect) ? 'switchTab' : 'redirectTo',
    url: redirect,
  })
}

async function handleLogin() {
  if (loadingLogin.value)
    return
  loadingLogin.value = true
  try {
    await userStore.authLogin('weixin')
    hasToken.value = true
    uni.$u.toast('登录成功，请完善资料')
  }
  catch {
    uni.$u.toast('微信登录失败，请重试')
  }
  finally {
    loadingLogin.value = false
  }
}

function onChooseAvatar(e: any) {
  const url = e?.detail?.avatarUrl
  if (url)
    avatarUrl.value = url
}

function onNicknameBlur(e: any) {
  const val = e?.detail?.value
  if (val)
    nickname.value = val
}

function pickAvatarFallback() {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      avatarUrl.value = res.tempFilePaths?.[0] ?? ''
    },
  })
}

async function handleFinish() {
  if (loadingSave.value)
    return
  if (!nickname.value.trim()) {
    uni.$u.toast('请输入昵称')
    return
  }
  loadingSave.value = true
  try {
    await UserApi.updateMe({
      nickname: nickname.value.trim(),
      avatarUrl: avatarUrl.value,
    })
    await userStore.info()
    uni.$u.toast('欢迎加入！')
    setTimeout(() => {
      void goAfterLogin()
    }, 300)
  }
  catch {
    uni.$u.toast('保存失败，请重试')
  }
  finally {
    loadingSave.value = false
  }
}

onLoad((options: any) => {
  if (options?.redirect && removeQueryString(options.redirect) !== LOGIN_PATH)
    redirect = decodeURIComponent(options.redirect)
  hasToken.value = !!getToken()
})
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40rpx 40rpx 180rpx;
  background: linear-gradient(180deg, #effaf5 0%, #f7f8fa 100%);
}

.hero-card {
  width: 100%;
  padding: 56rpx 40rpx 44rpx;
  text-align: center;
  background: #fff;
  border-radius: 28rpx;
  box-shadow: 0 16rpx 40rpx rgb(0 0 0 / 8%);
}

.hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  margin-bottom: 20rpx;
  font-size: 64rpx;
  background: linear-gradient(135deg, #21d59d 0%, #1ab389 100%);
  border-radius: 50%;
}

.hero-title {
  display: block;
  margin-bottom: 10rpx;
  font-size: 44rpx;
  font-weight: bold;
  color: #1f2937;
}

.hero-subtitle {
  display: block;
  margin-bottom: 36rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.hint {
  display: block;
  margin-top: 24rpx;
  font-size: 22rpx;
  color: #9ca3af;
}

.profile-form {
  padding: 0 8rpx;
  margin-bottom: 8rpx;
  text-align: left;
}

.avatar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f3f3f3;
}

.form-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.avatar-btn {
  display: flex;
  gap: 16rpx;
  align-items: center;
  padding: 0;
  margin: 0;
  line-height: normal;
  background: transparent;
  border: none;

  &::after {
    border: none;
  }
}

.avatar-hint {
  font-size: 24rpx;
  color: #999;
}

.nickname-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
}

.nickname-input {
  flex: 1;
  height: 60rpx;
  padding: 0 20rpx;
  margin-left: 24rpx;
  font-size: 28rpx;
  text-align: right;
  background: #f8f8f8;
  border: none;
  border-radius: 12rpx;
}
</style>
