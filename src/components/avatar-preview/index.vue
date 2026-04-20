<template>
  <view class="avatars" :style="{ justifyContent: align }" @click.stop="emit('click')">
    <view v-for="(a, i) in shown" :key="`${i}-${a}`" class="avatar-item">
      <u-avatar :src="a" :size="size" />
    </view>
    <view v-if="hasMore" class="avatar-more" @click.stop="emit('more')">
      <view class="i-mdi-dots-horizontal text-28rpx text-[#999]" />
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  avatars?: string[]
  max?: number
  size?: number
  align?: 'flex-start' | 'center' | 'flex-end'
}

const props = withDefaults(defineProps<Props>(), {
  avatars: () => [],
  max: 6,
  size: 22,
  align: 'flex-end',
})

const emit = defineEmits<{
  (e: 'more'): void
  (e: 'click'): void
}>()

const cleaned = computed(() => (props.avatars || []).filter(Boolean))
const shown = computed(() => cleaned.value.slice(0, props.max))
const hasMore = computed(() => cleaned.value.length > props.max)
</script>

<style scoped lang="scss">
.avatars {
  display: flex;
  align-items: center;
  min-width: 0;
}

.avatar-item {
  margin-left: -10rpx;
}

.avatar-item:first-child {
  margin-left: 0;
}

.avatar-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
  margin-left: 8rpx;
  background: #f5f5f5;
  border-radius: 22rpx;
}
</style>
