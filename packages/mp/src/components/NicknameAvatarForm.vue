<template>
  <view class="nickname-form">
    <view class="form-title">
      <text>设置个人信息</text>
    </view>

    <!-- 头像选择 -->
    <view class="avatar-section">
      <text class="section-label">选择头像</text>
      <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image v-if="avatarUrl" :src="avatarUrl" class="avatar-preview" mode="aspectFill" />
        <text v-else class="avatar-placeholder">点击选择头像</text>
      </button>
    </view>

    <!-- 昵称输入 -->
    <view class="nickname-section">
      <text class="section-label">输入昵称</text>
      <input
        v-model="nickname"
        type="nickname"
        class="nickname-input"
        placeholder="请输入昵称"
        maxlength="20"
        @confirm="handleConfirm"
      />
    </view>

    <!-- 确认按钮 -->
    <button
      class="confirm-btn"
      :class="{ disabled: !canConfirm }"
      @click="handleConfirm"
      :disabled="!canConfirm || loading"
    >
      {{ loading ? '登录中...' : '完成' }}
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Props
interface Props {
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

// Emits
interface Emits {
  (e: 'confirm', data: { nickname: string; avatarUrl?: string }): void;
}

const emit = defineEmits<Emits>();

// 状态
const nickname = ref('');
const avatarUrl = ref('');

// 头像选择回调
const onChooseAvatar = (e: any) => {
  const { avatarUrl: url } = e.detail;
  avatarUrl.value = url;
};

// 检查是否可以提交
const canConfirm = computed(() => {
  return nickname.value.trim().length > 0;
});

// 确认提交
const handleConfirm = () => {
  if (!canConfirm.value || props.loading) {
    return;
  }

  emit('confirm', {
    nickname: nickname.value.trim(),
    avatarUrl: avatarUrl.value || undefined,
  });
};

// 重置表单
const reset = () => {
  nickname.value = '';
  avatarUrl.value = '';
};

// 暴露方法给父组件
defineExpose({
  reset,
});
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.nickname-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xl;
}

.form-title {
  text-align: center;
  margin-bottom: $spacing-md;
}

.form-title text {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
}

.avatar-section,
.nickname-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.section-label {
  font-size: $font-md;
  color: $text-secondary;
  font-weight: 500;
}

.avatar-button {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: 4rpx dashed rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  overflow: hidden;
  padding: 0;
  transition: all $transition-normal;

  &:active {
    opacity: 0.7;
  }
}

.avatar-button::after {
  border: none;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-placeholder {
  font-size: $font-sm;
  color: $text-disabled;
  text-align: center;
}

.nickname-input {
  width: 100%;
  padding: $spacing-md $spacing-lg;
  background: rgba(0, 0, 0, 0.02);
  border: 2rpx solid rgba(0, 0, 0, 0.1);
  border-radius: $radius-medium;
  font-size: $font-lg;
  color: $text-primary;
  transition: border-color $transition-normal;

  &:focus {
    border-color: $primary;
  }
}

.confirm-btn {
  width: 100%;
  max-width: 400rpx;
  padding: $spacing-md $spacing-xl;
  background: transparent;
  color: $text-primary;
  border-radius: 0;
  font-size: $font-xl;
  font-weight: 600;
  border: none;
  margin-top: $spacing-lg;
  transition: opacity $transition-normal;

  &:active {
    opacity: 0.6;
  }
}

.confirm-btn::after {
  border: none;
}

.confirm-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
