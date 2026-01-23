<template>
  <view class="mission-action-panel">
    <view class="panel-header">
      <text class="header-title">执行任务</text>
      <text class="header-subtitle">请选择你的行动</text>
    </view>

    <view v-if="!hasActed" class="action-buttons">
      <button class="action-btn success" @click="handleAction('success')">
        <text>成功</text>
      </button>
      <button
        v-if="canFail"
        class="action-btn fail"
        @click="handleAction('fail')"
      >
        <text>失败</text>
      </button>
    </view>

    <view v-else class="acted-indicator">
      <text>已提交，等待其他玩家...</text>
    </view>

    <view v-if="!canFail" class="info-hint">
      <text>善良方只能选择成功</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { VisualGameState, TMissionResult } from '@/types';

interface Props {
  game: VisualGameState;
  currentPlayerId: string;
}

interface Emits {
  (e: 'action', result: TMissionResult): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 获取当前玩家
const currentPlayer = computed(() => {
  return props.game.players.find(p => p.id === props.currentPlayerId);
});

// 检查是否可以投失败
const canFail = computed(() => {
  if (!currentPlayer.value) return false;
  return currentPlayer.value.validMissionsResult.includes('fail');
});

// 检查是否已经行动
const hasActed = computed(() => {
  if (!currentPlayer.value) return false;
  return !currentPlayer.value.features.waitForAction;
});

const handleAction = (result: TMissionResult) => {
  emit('action', result);
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.mission-action-panel {
  padding: $spacing-lg $spacing-md;
  background-color: transparent;
}

.panel-header {
  text-align: center;
  margin-bottom: $spacing-lg;
}

.header-title {
  display: block;
  font-size: $font-xl;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.header-subtitle {
  display: block;
  font-size: $font-md;
  color: $text-secondary;
}

.action-buttons {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
  margin-bottom: $spacing-lg;
}

.action-btn {
  flex: 1;
  max-width: 200rpx;
  padding: 20rpx;
  background-color: transparent;
  border-radius: 0;
  font-size: $font-lg;
  font-weight: 600;
  border: none;
  transition: opacity $transition-normal;
}

.action-btn:active {
  opacity: 0.6;
}

.action-btn::after {
  border: none;
}

.action-btn.success {
  color: $loyalty-good;
}

.action-btn.fail {
  color: $loyalty-evil;
}

.acted-indicator {
  text-align: center;
  padding: $spacing-lg;
  color: $text-secondary;
  font-size: $font-md;
}

.info-hint {
  text-align: center;
  margin-top: $spacing-md;
  padding: $spacing-sm;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: $radius-small;
}

.info-hint text {
  font-size: $font-sm;
  color: $text-secondary;
}
</style>
