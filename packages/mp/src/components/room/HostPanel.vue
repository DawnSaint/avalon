<template>
  <view class="host-panel">
    <button class="host-btn" @click="showPanel = true">
      <text class="host-icon">⚙️</text>
      <text class="host-text">房主菜单</text>
    </button>

    <!-- 房主操作弹窗 -->
    <view v-if="showPanel" class="panel-overlay" @tap="handleOverlayTap">
      <view class="panel-content" @tap.stop>
        <view class="panel-header">
          <text class="panel-title">房主控制</text>
          <view class="close-btn" @tap="showPanel = false">
            <text class="close-icon">✕</text>
          </view>
        </view>

        <view class="panel-body">
          <!-- 游戏前的操作 -->
          <view v-if="roomStage !== 'started'" class="action-section">
            <text class="section-title">房间管理</text>

            <button class="action-btn primary" @tap="handleLockRoom">
              {{ roomStage === 'created' ? '🔒 锁定房间' : '🔓 解锁房间' }}
            </button>

            <button class="action-btn" @tap="handleShuffle">
              🔀 随机排列玩家
            </button>

            <button class="action-btn" @tap="handleGameSettings">
              ⚙️ 游戏设置
            </button>

            <button class="action-btn" @tap="handleShareRoom">
              📤 分享房间
            </button>
          </view>

          <!-- 游戏中的操作 -->
          <view v-else class="action-section">
            <text class="section-title">游戏控制</text>

            <view class="hint-text">
              <text>⚠️ 这些操作会影响正在进行的游戏</text>
            </view>

            <button class="action-btn warning" @tap="handleEndGame">
              ⏹️ 结束游戏
            </button>

            <button class="action-btn warning" @tap="handleRestartGame">
              🔄 结束并重启
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { socket } from '@/api/socket';

interface Props {
  roomUuid: string;
  roomStage: 'created' | 'locked' | 'started';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  openSettings: [];
  share: [];
}>();

const showPanel = ref(false);

// 处理遮罩层点击
const handleOverlayTap = () => {
  showPanel.value = false;
};

// 锁定/解锁房间
const handleLockRoom = () => {
  socket.emit('lockRoom', props.roomUuid);
  showPanel.value = false;
  uni.showToast({
    title: props.roomStage === 'created' ? '房间已锁定' : '房间已解锁',
    icon: 'success',
    duration: 1500
  });
};

// 随机排列玩家
const handleShuffle = () => {
  uni.showModal({
    title: '确认操作',
    content: '确定要随机排列玩家顺序吗？',
    success: (res) => {
      if (res.confirm) {
        socket.emit('shuffle', props.roomUuid);
        showPanel.value = false;
        uni.showToast({
          title: '已重新排列',
          icon: 'success',
          duration: 1500
        });
      }
    }
  });
};

// 游戏设置
const handleGameSettings = () => {
  showPanel.value = false;
  emit('openSettings');
};

// 分享房间
const handleShareRoom = () => {
  showPanel.value = false;
  emit('share');
};

// 结束游戏
const handleEndGame = () => {
  uni.showModal({
    title: '确认结束',
    content: '确定要结束当前游戏吗？',
    confirmColor: '#ff3b30',
    success: (res) => {
      if (res.confirm) {
        socket.emit('endGame', props.roomUuid);
        showPanel.value = false;
        uni.showToast({
          title: '游戏已结束',
          icon: 'success',
          duration: 1500
        });
      }
    }
  });
};

// 结束并重启游戏
const handleRestartGame = () => {
  uni.showModal({
    title: '确认重启',
    content: '确定要结束当前游戏并重新开始吗？',
    confirmColor: '#ff9500',
    success: (res) => {
      if (res.confirm) {
        socket.emit('endAndRestartGame', props.roomUuid);
        showPanel.value = false;
        uni.showToast({
          title: '正在重启游戏',
          icon: 'loading',
          duration: 1500
        });
      }
    }
  });
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.host-panel {
  position: relative;
}

.host-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: 12rpx 24rpx;
  background: transparent;
  color: $text-primary;
  border-radius: 0;
  border: none;
  transition: opacity $transition-normal;
}

.host-btn:active {
  opacity: 0.6;
}

.host-btn::after {
  border: none;
}

.host-icon {
  font-size: 32rpx;
}

.host-text {
  font-size: 28rpx;
  font-weight: 600;
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.panel-content {
  width: 100%;
  max-height: 80vh;
  background-color: $bg-page;
  border-radius: 0;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.panel-header {
  position: relative;
  padding: 40rpx 30rpx 20rpx;
  border-bottom: 1rpx solid $border-color;
}

.panel-title {
  font-size: $font-xl;
  font-weight: bold;
  color: $text-primary;
}

.close-btn {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: $border-light;
}

.close-icon {
  font-size: $font-xl;
  color: $text-secondary;
}

.panel-body {
  padding: 30rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.section-title {
  font-size: $font-md;
  font-weight: bold;
  color: $text-secondary;
  margin-bottom: 10rpx;
}

.hint-text {
  padding: $spacing-md;
  background-color: lighten($warning, 40%);
  border-radius: $radius-medium;
  margin-bottom: 10rpx;
}

.hint-text text {
  font-size: $font-sm;
  color: darken($warning, 30%);
}

.action-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background-color: transparent;
  color: $text-primary;
  border-radius: 0;
  font-size: $font-lg;
  border: none;
  text-align: center;
  font-weight: 600;
  transition: opacity $transition-normal;
}

.action-btn::after {
  border: none;
}

.action-btn.primary {
  background: transparent;
  color: $text-primary;
  font-weight: 600;
}

.action-btn.warning {
  background-color: transparent;
  color: $text-primary;
}

.action-btn:active {
  opacity: 0.6;
}
</style>
