<template>
  <view class="assassination-panel">
    <view class="panel-header">
      <text class="header-title">刺客行动</text>
      <text class="header-subtitle">选择一名玩家刺杀</text>
    </view>

    <view v-if="targetTypes.length > 0" class="target-hint">
      <text class="hint-text">目标角色: {{ targetTypesText }}</text>
    </view>

    <view class="target-selection">
      <text class="selection-label">选择目标:</text>
      <view class="players-list">
        <view
          v-for="player in assassinablePlayers"
          :key="player.id"
          class="player-item"
          :class="{ selected: selectedTarget === player.id }"
          @click="selectTarget(player.id)"
        >
          <text class="player-name">{{ player.name }}</text>
        </view>
      </view>
    </view>

    <view class="action-buttons">
      <button
        class="assassinate-btn"
        :class="{ disabled: !selectedTarget }"
        :disabled="!selectedTarget"
        @click="handleAssassinate"
      >
        {{ selectedTarget ? '确认刺杀' : '请选择目标' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { VisualGameState, TAssassinateType } from '@/types';

interface Props {
  game: VisualGameState;
  currentPlayerId: string;
}

interface Emits {
  (e: 'assassinate', targetId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedTarget = ref<string>('');

// 获取刺杀目标类型
const targetTypes = computed((): TAssassinateType[] => {
  if (props.game.addonsData?.assassin?.assassinateTargets) {
    return props.game.addonsData.assassin.assassinateTargets;
  }
  return ['merlin']; // 默认刺杀梅林
});

const targetTypesText = computed(() => {
  const typeMap: Record<TAssassinateType, string> = {
    merlin: '梅林',
    lovers: '情侣',
    guinevere: '女皇',
    cleric: '牧师',
  };
  return targetTypes.value.map((t) => typeMap[t] || t).join(', ');
});

// 可以被刺杀的玩家（排除当前玩家）
const assassinablePlayers = computed(() => {
  return props.game.players.filter((p) => p.id !== props.currentPlayerId);
});

const selectTarget = (playerId: string) => {
  selectedTarget.value = playerId;
};

const handleAssassinate = () => {
  if (selectedTarget.value) {
    emit('assassinate', selectedTarget.value);
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.assassination-panel {
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
  color: $loyalty-evil;
  margin-bottom: $spacing-xs;
}

.header-subtitle {
  display: block;
  font-size: $font-md;
  color: $text-secondary;
}

.target-hint {
  text-align: center;
  margin-bottom: $spacing-lg;
  padding: $spacing-sm;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: $radius-small;
}

.hint-text {
  font-size: $font-sm;
  color: $text-secondary;
}

.target-selection {
  margin-bottom: $spacing-lg;
}

.selection-label {
  display: block;
  text-align: center;
  font-size: $font-md;
  color: $text-primary;
  margin-bottom: $spacing-md;
  font-weight: 500;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  max-height: 400rpx;
  overflow-y: auto;
}

.player-item {
  padding: $spacing-md;
  background-color: rgba(0, 0, 0, 0.02);
  border: 2rpx solid rgba(0, 0, 0, 0.1);
  border-radius: $radius-small;
  transition: all $transition-normal;
}

.player-item:active {
  opacity: 0.6;
}

.player-item.selected {
  background-color: rgba($loyalty-evil, 0.1);
  border-color: $loyalty-evil;
}

.player-name {
  font-size: $font-md;
  color: $text-primary;
  text-align: center;
  display: block;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.assassinate-btn {
  width: auto;
  padding: 20rpx 60rpx;
  background-color: transparent;
  color: $loyalty-evil;
  border-radius: 0;
  font-size: $font-lg;
  font-weight: 600;
  border: none;
  transition: opacity $transition-normal;
}

.assassinate-btn:active {
  opacity: 0.6;
}

.assassinate-btn::after {
  border: none;
}

.assassinate-btn.disabled {
  opacity: 0.4;
  color: $text-disabled;
}
</style>
