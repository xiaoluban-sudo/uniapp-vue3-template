<template>
  <view class="profile-edit min-h-screen" style="background: #f5f7fa;">
    <view class="px-30rpx py-20rpx">
      <view class="form-card">
        <view class="form-row" @click="pickAvatar">
          <text class="form-label">
            头像
          </text>
          <view class="flex items-center gap-16rpx">
            <u-avatar :src="form.avatarUrl || ''" size="42" />
            <view class="i-mdi-chevron-right text-32rpx text-[#bbb]" />
          </view>
        </view>
        <view class="form-divider" />

        <view class="form-row">
          <text class="form-label">
            昵称
          </text>
          <view class="form-value">
            <u-input v-model="form.nickname" placeholder="请输入昵称" border="none" input-align="right" :maxlength="20" />
          </view>
        </view>
        <view class="form-divider" />

        <view class="form-row">
          <text class="form-label">
            性别
          </text>
          <view class="gender-tags">
            <view
              class="gender-tag"
              :class="{ active: form.gender === 'male' }"
              @click="form.gender = 'male'"
            >
              <view class="gender-icon is-male i-mdi-gender-male text-26rpx" />
              <text>男</text>
            </view>
            <view
              class="gender-tag"
              :class="{ active: form.gender === 'female' }"
              @click="form.gender = 'female'"
            >
              <view class="gender-icon is-female i-mdi-gender-female text-26rpx" />
              <text>女</text>
            </view>
          </view>
        </view>
        <view class="form-divider" />

        <view class="form-row" @click="showLevelPicker = true">
          <text class="form-label">
            羽毛球等级
          </text>
          <view class="flex items-center gap-10rpx">
            <text class="form-text">
              {{ form.level || '请选择' }}
            </text>
            <view class="i-mdi-chevron-right text-32rpx text-[#bbb]" />
          </view>
        </view>
        <view class="form-divider" />

        <view class="form-row">
          <text class="form-label">
            真实姓名
          </text>
          <view class="form-value">
            <u-input v-model="form.realName" placeholder="选填" border="none" input-align="right" :maxlength="20" />
          </view>
        </view>
        <view class="form-divider" />

        <view class="form-row">
          <text class="form-label">
            手机号
          </text>
          <view class="form-value">
            <u-input v-model="form.phone" type="number" placeholder="选填" border="none" input-align="right" :maxlength="11" />
          </view>
        </view>
      </view>

      <u-button
        type="primary"
        text="保存"
        custom-style="margin-top: 32rpx; height: 88rpx; border-radius: 44rpx;"
        :loading="saving"
        @click="saveProfile"
      />
    </view>

    <u-popup :show="showLevelPicker" mode="bottom" round="16" @close="showLevelPicker = false">
      <view class="picker-wrap">
        <view class="picker-head">
          <text class="text-30rpx font-bold">
            选择羽毛球等级
          </text>
          <text class="text-28rpx text-primary" @click="showLevelPicker = false">
            关闭
          </text>
        </view>
        <view
          v-for="item in levelOptions"
          :key="item"
          class="picker-item"
          @click="selectLevel(item)"
        >
          <text>{{ item }}</text>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { UserApi } from '@/api'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const saving = ref(false)
const showLevelPicker = ref(false)

const form = reactive({
  avatarUrl: '',
  nickname: '',
  gender: 'unknown' as 'unknown' | 'male' | 'female' | 'mixed',
  level: '',
  realName: '',
  phone: '',
})

const levelOptions = ['萌新', '1级', '2级', '3级', '4级', '5级', '6级', '7级', '8级', '9级', '专业级']

async function loadMe() {
  const me = await UserApi.me()
  form.avatarUrl = me.avatar ?? ''
  form.nickname = me.user_name ?? ''
  form.gender = me.gender ?? 'unknown'
  form.level = me.level ?? ''
  form.realName = me.real_name ?? ''
  form.phone = me.phone ?? ''
}

function selectLevel(level: string) {
  form.level = level
  showLevelPicker.value = false
}

function pickAvatar() {
  uni.showActionSheet({
    itemList: ['使用微信头像', '从相册选择', '拍照'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // #ifdef MP-WEIXIN
        uni.getUserProfile({
          desc: '用于完善头像',
          success: (ret) => {
            form.avatarUrl = ret.userInfo?.avatarUrl ?? form.avatarUrl
          },
        })
        // #endif
      }
      if (res.tapIndex === 1) {
        uni.chooseImage({
          count: 1,
          sourceType: ['album'],
          success: (ret) => {
            form.avatarUrl = ret.tempFilePaths?.[0] ?? form.avatarUrl
          },
        })
      }
      if (res.tapIndex === 2) {
        uni.chooseImage({
          count: 1,
          sourceType: ['camera'],
          success: (ret) => {
            form.avatarUrl = ret.tempFilePaths?.[0] ?? form.avatarUrl
          },
        })
      }
    },
  })
}

async function saveProfile() {
  if (saving.value)
    return
  saving.value = true
  try {
    await UserApi.updateMe({
      avatarUrl: form.avatarUrl,
      nickname: form.nickname.trim(),
      gender: form.gender,
      level: form.level,
      realName: form.realName.trim(),
      phone: form.phone.trim(),
    })
    await userStore.info()
    uni.$u.toast('保存成功')
    setTimeout(() => uni.navigateBack(), 300)
  }
  catch {
    uni.$u.toast('保存失败')
  }
  finally {
    saving.value = false
  }
}

onLoad(() => {
  loadMe().catch(() => {
    uni.$u.toast('加载失败')
  })
})
</script>

<style scoped lang="scss">
.form-card {
  padding: 0 28rpx;
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
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.form-value {
  flex: 1;
  text-align: right;
}

.form-text {
  font-size: 26rpx;
  color: #666;
}

.form-divider {
  height: 1rpx;
  background: #f3f3f3;
}

.gender-tags {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.gender-tag {
  display: flex;
  gap: 8rpx;
  align-items: center;
  padding: 10rpx 18rpx;
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  border: 2rpx solid transparent;
  border-radius: 999rpx;

  &.active {
    color: var(--theme-primary);
    background: rgb(33 213 157 / 10%);
    border-color: var(--theme-primary);
  }
}

.gender-icon {
  color: #94a3b8;

  &.is-male {
    color: #3c9cff;
  }

  &.is-female {
    color: #ff5fa2;
  }
}

.gender-tag.active .gender-icon {
  filter: drop-shadow(0 2rpx 6rpx rgb(0 0 0 / 10%));
}

.picker-wrap {
  padding: 24rpx 30rpx 40rpx;
}

.picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.picker-item {
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #333;
  text-align: center;
  border-bottom: 1rpx solid #f3f3f3;
}
</style>
