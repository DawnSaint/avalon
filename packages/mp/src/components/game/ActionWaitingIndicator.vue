<template>
  <view v-if="waitingPlayers.length > 0" class="waiting-indicator">
    <text class="indicator-label">等待中:</text>
    <view class="waiting-players">
      <text
        v-for="player in waitingPlayers"
        :key="player.id"
        class="player-name"
      >
        {{ player.name }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Player } from '@/types';

interface Props {
  players: Player[];
}

const props = defineProps<Props>();

const waitingPlayers = computed(() => {
  return props.players.filter(p => p.features.waitForAction);
});
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.waiting-indicator {
  padding: $spacing-md;
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1rpx solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.indicator-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.waiting-players {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $spacing-xs;
}

.player-name {
  padding: $spacing-xs $spacing-sm;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: $radius-small;
  font-size: $font-xs;
  color: $text-primary;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
