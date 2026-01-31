<template>
  <view class="lobby">
    <!-- 主标题 -->
    <LobbyLogo />

    <!-- 创建房间按钮 -->
    <button class="create-room-btn" @click="createRoom">
      {{ isCreating ? '创建中...' : '创建房间' }}
    </button>

    <!-- 房间列表 -->
    <view v-if="roomsList && roomsList.length" class="rooms-list">
      <view v-for="(game, index) in roomsList" :key="game.uuid" class="game-item" @click="handleRoomClick(game.uuid)">
        <view class="game-index">{{ index + 1 }}.</view>
        <view class="game-container">
          <view class="game-left">
            <view class="game-name">
              <text v-if="game.result?.winner" :class="`${game.result.winner}-loyalty-icon`"></text>
              <text class="host-name">{{ roomsListHosts[index] || '加载中...' }}</text>
            </view>
            <view v-if="hasOptions(game.options)" class="options-preview">
              <text class="option-text">配置: </text>
              <text v-if="game.options.roles.merlin" class="option-badge">梅林 </text>
              <text v-if="game.options.roles.percival" class="option-badge">派西维尔 </text>
              <text v-if="game.options.roles.morgana" class="option-badge">莫甘娜 </text>
              <text v-if="game.options.roles.mordred" class="option-badge">莫德雷德 </text>
              <text v-if="game.options.addons.lady_of_lake" class="option-badge">湖中女神 </text>
            </view>
          </view>
          <view class="game-right">
            <view class="game-right-content">
              <view
                v-if="game.state === 'created' && game.options.features?.lookingForPlayers"
                class="status-chip looking-for-players"
              >
                寻找玩家
              </view>
              <view class="players-amount">
                {{ game.state === 'created' ? `${game.players}/10` : `${game.players} 玩家` }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LobbyLogo from '@/components/LobbyLogo.vue';
import { useMainStore } from '@/store';
import { socket } from '@/api/socket';
import type { TRoomsList, GameOptionsRoles, GameOptionsAddons } from '@/types';
import { wechatLogin } from '@/utils/login';

const store = useMainStore();
const roomsList = ref<TRoomsList>([]);
const isCreating = ref(false);

// 获取房间主持人名称列表
const roomsListHosts = computed(() => {
  return (roomsList.value || []).map((room) => {
    const userState = store.users[room.hostID];
    if (userState && 'profile' in userState) {
      return userState.profile.name;
    }
    // 异步加载用户信息
    store.getUserPublicProfile(room.hostID);
    return '加载中...';
  });
});

// 初始化数据
const initState = async () => {
  try {
    const data = await socket.emitWithAck<TRoomsList>('getRoomsList');
    roomsList.value = data || [];
  } catch (e) {
    console.error('Failed to get rooms list:', e);
  }
};

// 创建房间
const createRoom = async () => {
  if (!store.profile) {
    // 未登录，尝试微信登录
    uni.showLoading({
      title: '登录中...',
      mask: true,
    });

    try {
      const result = await wechatLogin();
      uni.hideLoading();

      if (result.success) {
        // 登录成功，继续创建房间
        uni.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
        });
        // 等待 toast 显示后再创建房间
        setTimeout(() => {
          performCreateRoom();
        }, 1500);
      } else if (result.needsNickname) {
        // 需要配置昵称，跳转到 profile 页面
        uni.showModal({
          title: '提示',
          content: '请先完成昵称和头像设置',
          showCancel: false,
          success: () => {
            uni.switchTab({
              url: '/pages/profile',
            });
          },
        });
      } else {
        // 登录失败
        uni.showModal({
          title: '登录失败',
          content: result.error || '请重试',
          showCancel: false,
        });
      }
    } catch (e) {
      uni.hideLoading();
      console.error('Login error:', e);
      uni.showToast({
        title: '登录失败',
        icon: 'none',
        duration: 2000,
      });
    }
    return;
  }

  performCreateRoom();
};

// 执行创建房间
const performCreateRoom = async () => {
  if (isCreating.value) {
    return;
  }

  isCreating.value = true;

  try {
    const uuid = await socket.emitWithAck<string>('createRoom');
    uni.navigateTo({
      url: `/pages/room?uuid=${uuid}`,
    });
  } catch (e) {
    console.error('Failed to create room:', e);
    uni.showToast({
      title: '创建房间失败',
      icon: 'none',
      duration: 2000,
    });
    isCreating.value = false;
  }
};

// 进入房间
const handleRoomClick = (uuid: string) => {
  uni.navigateTo({
    url: `/pages/room?uuid=${uuid}`,
  });
};

// 检查是否有配置选项
const hasOptions = (options: { roles: GameOptionsRoles; addons: GameOptionsAddons }) => {
  return [...Object.values(options.roles), ...Object.values(options.addons)].some((el) => Boolean(el));
};

// 房间列表更新监听
const handleRoomsListUpdated = (list: TRoomsList) => {
  roomsList.value = list;
};

onMounted(() => {
  initState();

  // 监听事件
  socket.on('roomsListUpdated', handleRoomsListUpdated);
});

onUnmounted(() => {
  // 移除监听
  socket.off('roomsListUpdated', handleRoomsListUpdated);
});
</script>

<style scoped lang="scss">
.lobby {
  box-sizing: border-box;
  padding: $spacing-header $spacing-lg;
}

.create-room-btn {
  margin: 36vh $spacing-xxxl 0;
  color: $text-white;
  background-color: $accent;
  font-size: $font-xl;
  border: none;
  font-weight: 600;
  transition: opacity $transition-normal;
}

.create-room-btn:active {
  opacity: 0.6;
}

.create-room-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: $primary;
}

.rooms-list {
  margin-top: $spacing-xxl;
}

.game-item {
  background-color: transparent;
  border-radius: 0;
  padding: $spacing-lg 0;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  transition: opacity $transition-normal;
}

.game-item:active {
  opacity: 0.6;
}

.game-index {
  font-size: $font-xl;
  font-weight: bold;
  margin-right: 20rpx;
  color: $text-secondary;
  min-width: 60rpx;
}

.game-container {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-left {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-name {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.host-name {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
}

.options-preview {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-top: $spacing-xs;
}

.option-text {
  font-size: $font-xs;
  color: $text-secondary;
}

.option-badge {
  font-size: $font-xs;
  color: $primary;
  background-color: $loyalty-good-bg;
  padding: 4rpx 12rpx;
  border-radius: $radius-small;
}

.game-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.game-right-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.status-chip {
  padding: $spacing-xs 16rpx;
  border-radius: $radius-small;
  font-size: $font-xs;
  font-weight: 500;
}

.looking-for-players {
  background-color: $success;
  color: $text-white;
}

.players-amount {
  font-size: $font-md;
  color: $text-secondary;
  font-weight: 500;
}

// 忠诚度图标样式
.good-loyalty-icon,
.evil-loyalty-icon {
  display: inline-block;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: $spacing-xs;
}

.good-loyalty-icon {
  background-color: $loyalty-good;
}

.evil-loyalty-icon {
  background-color: $loyalty-evil;
}
</style>
