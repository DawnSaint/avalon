<template>
  <view class="board-wrapper">
    <view class="board-container" :style="boardScale">
      <!-- 游戏背景圆盘 -->
      <view class="game-board" :class="boardClasses">
        <!-- 中心内容区域 -->
        <view class="center-content">
          <slot name="center-content">
            <view v-if="roomStage === 'created' || roomStage === 'locked'" class="waiting-content">
              <text class="waiting-text">等待玩家加入</text>
              <text class="player-count">{{ players.length }}/10</text>
            </view>
            <view v-else-if="roomStage === 'started'" class="game-content">
              <slot name="game-content">
                <text class="game-text">游戏进行中</text>
              </slot>
            </view>
          </slot>
        </view>
      </view>

      <!-- 玩家圆形布局 -->
      <view
        v-for="(player, index) in players"
        :key="player.id"
        class="player-position"
        :style="getPlayerPosition(index)"
      >
        <view class="player-wrapper" :style="getPlayerRotation(index)">
          <Player
            :player="player"
            :display-index="displayPlayerIndex"
            :is-selected="isPlayerSelected(player.id)"
            :clickable="canSelectPlayer"
            @player-click="handlePlayerClick"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Player from './Player.vue';
import type { RoomPlayer } from '@/types';

interface Props {
  players: RoomPlayer[] | any[];
  roomStage?: 'created' | 'locked' | 'started';
  displayPlayerIndex?: boolean;
  selectedPlayers?: string[];
  canSelectPlayer?: boolean;
  gameResult?: 'good' | 'evil';
}

const props = withDefaults(defineProps<Props>(), {
  roomStage: 'created',
  displayPlayerIndex: false,
  selectedPlayers: () => [],
  canSelectPlayer: false
});

const emit = defineEmits<{
  playerClick: [playerId: string];
}>();

// 计算玩家位置（圆形布局）
const getPlayerPosition = (index: number) => {
  const playerCount = props.players.length;
  const angle = (360 / playerCount) * index;
  const radius = 280; // 半径，单位 rpx

  // 计算 x, y 坐标
  const radian = (angle - 90) * (Math.PI / 180); // -90度使第一个玩家在顶部
  const x = radius * Math.cos(radian);
  const y = radius * Math.sin(radian);

  return {
    transform: `translate(${x}rpx, ${y}rpx)`,
    transition: 'transform 0.5s ease'
  };
};

// 计算玩家旋转（使玩家名称始终朝外）
const getPlayerRotation = (index: number) => {
  const playerCount = props.players.length;
  const angle = (360 / playerCount) * index;

  return {
    transform: `rotate(${-angle}deg)`,
    transition: 'transform 0.5s ease'
  };
};

// 棋盘样式类
const boardClasses = computed(() => {
  return {
    'game-end-good': props.gameResult === 'good',
    'game-end-evil': props.gameResult === 'evil'
  };
});

// 棋盘缩放（根据屏幕大小自适应）
const boardScale = computed(() => {
  // 这里可以根据实际需求调整缩放比例
  return {
    transform: 'scale(1)'
  };
});

// 判断玩家是否被选中
const isPlayerSelected = (playerId: string): boolean => {
  return props.selectedPlayers.includes(playerId);
};

// 处理玩家点击
const handlePlayerClick = (playerId: string) => {
  emit('playerClick', playerId);
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.board-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.board-container {
  position: relative;
  width: 600rpx;
  height: 600rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-board {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-image: url('/static/images/core/board.webp');
  background-size: 137%;
  background-position: center;
  box-shadow:
    0 0 40rpx $board-shadow,
    inset 0 0 60rpx rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all $transition-slow;
}

// 游戏结束效果
.game-end-good {
  background: $game-end-good;
  @include game-end-shadow($game-end-good);
  animation: victory-pulse 2s infinite;
}

.game-end-evil {
  background: $game-end-evil;
  @include game-end-shadow($game-end-evil);
  animation: victory-pulse 2s infinite;
}

@keyframes victory-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.center-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.waiting-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.waiting-text {
  font-size: $font-lg;
  color: $text-white;
  font-weight: bold;
  opacity: 0.9;
}

.player-count {
  font-size: $font-xxl;
  color: $player-leader;
  font-weight: bold;
}

.game-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.game-text {
  font-size: $font-xl;
  color: $text-white;
  font-weight: bold;
  opacity: 0.9;
}

// 玩家位置容器
.player-position {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
}

.player-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}
</style>
