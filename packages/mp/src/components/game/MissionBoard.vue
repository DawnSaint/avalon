<template>
  <view class="mission-board">
    <view
      v-for="(mission, index) in missions"
      :key="index"
      class="mission-item"
      :class="getMissionClass(mission, index)"
    >
      <view class="mission-number">{{ index + 1 }}</view>
      <view v-if="mission.result" class="mission-result">
        <text v-if="mission.result === 'success'">✓</text>
        <text v-else-if="mission.result === 'fail'">✗</text>
      </view>
      <view v-if="mission.hidden && mission.result" class="mission-hidden">🔮</view>
      <view class="mission-players">{{ mission.players }}</view>
      <view v-if="mission.result && !mission.hidden && mission.fails > 0" class="mission-fails">
        <text>{{ mission.fails }} 失败</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { MissionWithResult } from '@/types';

interface Props {
  missions: MissionWithResult[];
}

const props = defineProps<Props>();

const getMissionClass = (mission: MissionWithResult, index: number) => {
  const classes: string[] = [];

  if (mission.result === 'success') {
    classes.push('success');
  } else if (mission.result === 'fail') {
    classes.push('fail');
  } else {
    classes.push('pending');
  }

  if (mission.hidden && mission.result) {
    classes.push('hidden');
  }

  return classes.join(' ');
};
</script>

<style scoped lang="scss">
.mission-board {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg $spacing-md;
  flex-wrap: wrap;
}

.mission-item {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  transition: all $transition-normal;
}

.mission-item.pending {
  border-color: rgba(0, 0, 0, 0.2);
}

.mission-item.success {
  border-color: $loyalty-good;
  background-color: rgba($loyalty-good, 0.1);
}

.mission-item.fail {
  border-color: $loyalty-evil;
  background-color: rgba($loyalty-evil, 0.1);
}

.mission-item.hidden {
  border-color: $text-disabled;
  background-color: rgba(0, 0, 0, 0.05);
}

.mission-number {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
}

.mission-result {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: $font-xxl;
  font-weight: bold;
}

.mission-item.success .mission-result {
  color: $loyalty-good;
}

.mission-item.fail .mission-result {
  color: $loyalty-evil;
}

.mission-hidden {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: $font-xl;
}

.mission-players {
  position: absolute;
  bottom: 5rpx;
  font-size: $font-xs;
  color: $text-secondary;
}

.mission-fails {
  position: absolute;
  top: -25rpx;
  font-size: $font-xs;
  color: $error;
  white-space: nowrap;
}
</style>
