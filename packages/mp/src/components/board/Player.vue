<template>
  <view class="player" :class="playerClasses" @tap="handlePlayerClick">
    <!-- 玩家框架 -->
    <view class="player-frame">
      <!-- 玩家边框装饰 -->
      <image
        class="player-frame-image"
        src="/static/images/core/player-frame.webp"
        mode="aspectFit"
      />

      <!-- 玩家头像/图标 -->
      <view class="player-avatar">
        <text class="avatar-text">{{ getInitial(playerName) }}</text>
      </view>

      <!-- 领袖标识 -->
      <image
        v-if="isLeader"
        class="player-crown"
        src="/static/images/core/crown.webp"
        mode="aspectFit"
      />

      <!-- 选中标识 -->
      <view v-if="isSelected" class="selected-indicator"></view>

      <!-- 玩家名称 -->
      <view class="player-name-container">
        <image
          class="name-frame-image"
          src="/static/images/core/name-frame.webp"
          mode="aspectFit"
        />
        <text class="player-name">{{ displayName }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMainStore } from '@/store';
import type { RoomPlayer } from '@/types';

interface Props {
  player: RoomPlayer | any; // any 用于游戏中的玩家状态
  displayIndex?: boolean;
  isSelected?: boolean;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  displayIndex: false,
  isSelected: false,
  clickable: false
});

const emit = defineEmits<{
  playerClick: [id: string];
}>();

const store = useMainStore();

// 计算属性
const playerName = computed(() => {
  const userState = store.users[props.player.id];
  if (userState && 'profile' in userState) {
    return userState.profile.name;
  }
  // 异步加载用户信息
  store.getUserPublicProfile(props.player.id);
  return '加载中...';
});

const displayName = computed(() => {
  let name = playerName.value;
  if (props.displayIndex && 'index' in props.player) {
    name = `${props.player.index}. ${name}`;
  }
  return name;
});

const isLeader = computed(() => {
  if ('isLeader' in props.player) {
    return props.player.isLeader;
  }
  if ('features' in props.player) {
    return props.player.features.isLeader;
  }
  return false;
});

const playerClasses = computed(() => {
  const classes: Record<string, boolean> = {
    'is-leader': isLeader.value,
    'is-selected': props.isSelected,
    'is-clickable': props.clickable
  };

  // 游戏中的特殊状态
  if ('features' in props.player) {
    const features = props.player.features;
    classes['is-sent'] = features.isSent || false;
    classes['wait-action'] = features.waitForAction || false;
  }

  return classes;
});

// 获取首字母
const getInitial = (name: string): string => {
  if (!name || name === '加载中...') return '?';
  return name.charAt(0).toUpperCase();
};

// 处理点击
const handlePlayerClick = () => {
  if (props.clickable) {
    emit('playerClick', props.player.id);
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.player {
  position: relative;
  width: 120rpx;
  height: 120rpx;
  pointer-events: auto;
}

.player-frame {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-frame-image {
  position: absolute;
  width: 120rpx;
  height: 120rpx;
  z-index: 1;
  pointer-events: none;
}

.player-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: $secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid $text-white;
  @include shadow-elevated;
  transition: all $transition-normal;
  z-index: 2;
}

.avatar-text {
  font-size: 40rpx;
  font-weight: bold;
  color: $text-white;
}

.player-crown {
  position: absolute;
  top: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 48rpx;
  z-index: 10;
  filter: drop-shadow(0 2rpx 8rpx rgba(255, 215, 0, 0.6));
}

.selected-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 6rpx solid $player-selected;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

.player-name-container {
  position: absolute;
  bottom: -35rpx;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  max-width: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rpx 12rpx;
}

.name-frame-image {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.player-name {
  font-size: $font-xs;
  color: $text-white;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  z-index: 1;
  position: relative;
}

// 状态样式
.is-leader .player-avatar {
  border-color: $player-leader;
  box-shadow: 0 0 20rpx rgba($player-leader, 0.5);
}

.is-selected .player-avatar {
  border-color: $player-selected;
}

.is-sent .player-avatar {
  border-color: $player-sent;
  box-shadow: 0 0 20rpx rgba($player-sent, 0.5);
}

.wait-action .player-avatar {
  animation: waiting-pulse 1s infinite;
}

@keyframes waiting-pulse {
  0%, 100% {
    box-shadow: 0 0 20rpx rgba($player-wait, 0.5);
  }
  50% {
    box-shadow: 0 0 30rpx rgba($player-wait, 0.8);
  }
}

.is-clickable {
  .player-avatar {
    cursor: pointer;
  }

  &:active .player-avatar {
    transform: scale(0.95);
  }
}
</style>
