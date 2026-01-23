<template>
  <view class="room">
    <!-- 错误提示 -->
    <view v-if="errorMessage" class="error-container">
      <view class="error-box">
        <text class="error-title">{{ getErrorText(errorMessage.error) }}</text>
        <button class="back-btn" @click="handleBackToLobby">返回大厅</button>
      </view>
    </view>

    <!-- 正常房间视图 -->
    <view v-else class="room-content">
      <!-- 房间信息 -->
      <view class="room-info">
        <text class="room-id">房间 ID: {{ roomUuid }}</text>
        <text class="room-stage">状态: {{ getRoomStageText(roomState?.stage) }}</text>
      </view>

      <!-- 游戏棋盘区域 -->
      <view v-if="roomState" class="board-area">
        <!-- 游戏棋盘 -->
        <view class="board-wrapper">
          <Board
            :players="roomState.stage === 'started' ? gamePlayers : roomState.players"
            :room-stage="roomState.stage"
            :display-player-index="roomState.stage === 'started'"
            :game-result="gameResult"
            :selected-players="selectedPlayers"
            :can-select-player="canSelectPlayer"
            @player-click="handlePlayerClick"
          >
            <template #center-content>
              <!-- 等待开始时的中心内容 -->
              <view v-if="roomState.stage === 'created' || roomState.stage === 'locked'" class="center-waiting">
                <text class="waiting-title">等待玩家</text>
                <text class="player-count-text">{{ roomState.players.length }}/10</text>
              </view>
              <!-- 游戏中的中心内容 -->
              <view v-else-if="roomState.stage === 'started'" class="center-gaming">
                <text class="game-stage-text">游戏进行中</text>
              </view>
            </template>
          </Board>
        </view>

        <!-- 游戏组件区域（游戏进行中） -->
        <view v-if="roomState.stage === 'started' && gameState" class="game-components">
          <!-- 游戏状态显示 -->
          <GameStateDisplay :state="gameState" />

          <!-- 任务棋盘 -->
          <MissionBoard :missions="gameState.missionState" />

          <!-- 动态游戏面板 -->
          <!-- 游戏结束面板 -->
          <GameResultDisplay
            v-if="currentPanelType === 'result'"
            :game="gameState"
            :current-player-id="store.profile?.id || ''"
            :selected-players="selectedPlayers"
            @send-team="handleSendTeam"
            @vote="handleVote"
            @action="handleMissionAction"
            @assassinate="handleAssassinate"
          />

          <!-- 选择队伍面板 -->
          <TeamSelectionPanel
            v-else-if="currentPanelType === 'teamSelection'"
            :game="gameState"
            :current-player-id="store.profile?.id || ''"
            :selected-players="selectedPlayers"
            @send-team="handleSendTeam"
            @vote="handleVote"
            @action="handleMissionAction"
            @assassinate="handleAssassinate"
          />

          <!-- 投票面板 -->
          <VotingPanel
            v-else-if="currentPanelType === 'voting'"
            :game="gameState"
            :current-player-id="store.profile?.id || ''"
            :selected-players="selectedPlayers"
            @send-team="handleSendTeam"
            @vote="handleVote"
            @action="handleMissionAction"
            @assassinate="handleAssassinate"
          />

          <!-- 任务执行面板 -->
          <MissionActionPanel
            v-else-if="currentPanelType === 'missionAction'"
            :game="gameState"
            :current-player-id="store.profile?.id || ''"
            :selected-players="selectedPlayers"
            @send-team="handleSendTeam"
            @vote="handleVote"
            @action="handleMissionAction"
            @assassinate="handleAssassinate"
          />

          <!-- 刺杀面板 -->
          <AssassinationPanel
            v-else-if="currentPanelType === 'assassination'"
            :game="gameState"
            :current-player-id="store.profile?.id || ''"
            :selected-players="selectedPlayers"
            @send-team="handleSendTeam"
            @vote="handleVote"
            @action="handleMissionAction"
            @assassinate="handleAssassinate"
          />

          <!-- 等待指示器 -->
          <ActionWaitingIndicator :players="gameState.players" />
        </view>

        <!-- 游戏配置（在等待阶段显示） -->
        <view v-if="(roomState.stage === 'created' || roomState.stage === 'locked') && hasGameOptions" class="options-section">
          <text class="section-title">游戏配置</text>
          <view class="options-grid">
            <text v-if="roomState.options.roles.merlin" class="option-badge">梅林</text>
            <text v-if="roomState.options.roles.percival" class="option-badge">派西维尔</text>
            <text v-if="roomState.options.roles.morgana" class="option-badge">莫甘娜</text>
            <text v-if="roomState.options.roles.mordred" class="option-badge">莫德雷德</text>
            <text v-if="roomState.options.roles.oberon" class="option-badge">奥伯伦</text>
            <text v-if="roomState.options.addons.lady_of_lake" class="option-badge">湖中女神</text>
            <text v-if="roomState.options.addons.excalibur" class="option-badge">圣剑</text>
          </view>
        </view>

        <!-- 操作按钮（固定在底部） -->
        <view class="actions-section">
          <!-- 房主菜单 -->
          <view v-if="isRoomLeader" class="host-actions">
            <HostPanel
              :room-uuid="roomUuid"
              :room-stage="roomState.stage"
              @open-settings="showGameSettings = true"
              @share="handleShareRoom"
            />
          </view>

          <!-- 开始游戏按钮 -->
          <button
            v-if="isRoomLeader && (roomState.stage === 'created' || roomState.stage === 'locked')"
            class="primary-btn"
            @click="handleStartGame"
            :disabled="roomState.players.length < 5"
          >
            {{ roomState.players.length < 5 ? '至少需要5名玩家' : '开始游戏' }}
          </button>

          <!-- 离开房间按钮 -->
          <button class="secondary-btn" @click="handleBackToLobby">
            {{ roomState.stage === 'started' ? '观战模式' : '离开房间' }}
          </button>
        </view>
      </view>

      <!-- 游戏设置弹窗 -->
      <GameSettings
        v-if="roomState"
        :visible="showGameSettings"
        :room-uuid="roomUuid"
        :options="roomState.options"
        @close="showGameSettings = false"
      />

      <!-- 加载中 -->
      <view v-else class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useMainStore } from '@/store';
import { socket } from '@/api/socket';
import type { TRoomState, ISocketError, VisualGameState, TVoteOption, TMissionResult } from '@/types';
import Board from '@/components/board/Board.vue';
import HostPanel from '@/components/room/HostPanel.vue';
import GameSettings from '@/components/room/GameSettings.vue';
// 游戏组件
import GameStateDisplay from '@/components/game/GameStateDisplay.vue';
import MissionBoard from '@/components/game/MissionBoard.vue';
import TeamSelectionPanel from '@/components/game/TeamSelectionPanel.vue';
import VotingPanel from '@/components/game/VotingPanel.vue';
import MissionActionPanel from '@/components/game/MissionActionPanel.vue';
import AssassinationPanel from '@/components/game/AssassinationPanel.vue';
import GameResultDisplay from '@/components/game/GameResultDisplay.vue';
import ActionWaitingIndicator from '@/components/game/ActionWaitingIndicator.vue';

const store = useMainStore();
const roomUuid = ref<string>('');
const roomState = ref<TRoomState | null>(null);
const errorMessage = ref<ISocketError | null>(null);
const showGameSettings = ref<boolean>(false);
const selectedPlayers = ref<string[]>([]); // 用于selectTeam阶段选择的玩家

// 计算属性
const isRoomLeader = computed(() => {
  if (!roomState.value || !store.profile) return false;
  return roomState.value.leaderID === store.profile.id;
});

const hasGameOptions = computed(() => {
  if (!roomState.value) return false;
  const { roles, addons } = roomState.value.options;
  return [...Object.values(roles), ...Object.values(addons)].some((el) => Boolean(el));
});

const gameResult = computed(() => {
  if (roomState.value?.stage === 'started' && roomState.value.game?.result) {
    return roomState.value.game.result.winner;
  }
  return undefined;
});

const gamePlayers = computed(() => {
  if (roomState.value?.stage === 'started' && roomState.value.game?.players) {
    return roomState.value.game.players;
  }
  return [];
});

const gameState = computed((): VisualGameState | null => {
  if (roomState.value?.stage === 'started' && roomState.value.game) {
    return roomState.value.game;
  }
  return null;
});

// 是否可以选择玩家
const canSelectPlayer = computed(() => {
  // 房主在等待阶段可以踢人（点击玩家）
  if (isRoomLeader.value && (roomState.value?.stage === 'created' || roomState.value?.stage === 'locked')) {
    return true;
  }

  // 游戏中的selectTeam阶段，领袖可以选择
  if (roomState.value?.stage === 'started' && gameState.value?.stage === 'selectTeam') {
    const currentPlayer = gameState.value.players.find(p => p.id === store.profile?.id);
    return currentPlayer?.features.isLeader || false;
  }

  return false;
});

// 根据游戏阶段返回当前应该显示的面板类型
const currentPanelType = computed(() => {
  if (!gameState.value || !store.profile) return null;

  const stage = gameState.value.stage;
  const currentPlayer = gameState.value.players.find(p => p.id === store.profile?.id);

  // 游戏结束
  if (stage === 'end') {
    return 'result';
  }

  // 只有需要行动的玩家才显示面板
  if (!currentPlayer?.features.waitForAction) {
    return null;
  }

  // 根据阶段返回对应面板类型
  switch (stage) {
    case 'selectTeam':
      // 只有领袖才显示选择队伍面板
      if (currentPlayer.features.isLeader) {
        return 'teamSelection';
      }
      return null;

    case 'votingForTeam':
      return 'voting';

    case 'onMission':
      // 只有在任务中的玩家才显示
      if (currentPlayer.features.isSent) {
        return 'missionAction';
      }
      return null;

    case 'assassinate':
      // 只显示给刺客
      // 假设刺客角色的判断逻辑
      if (currentPlayer.role === 'assassin' || (currentPlayer.loyalty === 'evil' && currentPlayer.features.waitForAction)) {
        return 'assassination';
      }
      return null;

    default:
      return null;
  }
});

// 页面加载
onLoad((options: any) => {
  if (options.uuid) {
    roomUuid.value = options.uuid;
    initRoom(options.uuid);
  }
});

// 初始化房间
const initRoom = async (uuid: string) => {
  try {
    const state = await socket.emitWithAck<TRoomState | ISocketError>('joinRoom', uuid);

    if ('error' in state) {
      errorMessage.value = state;
    } else {
      roomState.value = state;
    }
  } catch (e) {
    console.error('Failed to join room:', e);
    errorMessage.value = { error: 'connection_failed' };
  }
};

// Socket 事件处理
const handleRoomUpdated = (state: TRoomState) => {
  if (state.roomID === roomUuid.value) {
    roomState.value = state;
  }
};

const handleGameUpdated = (game: any) => {
  if (game.uuid === roomUuid.value && roomState.value?.stage === 'started') {
    // 更新游戏状态
    if (roomState.value.stage === 'started') {
      roomState.value.game = game;
    }
  }
};

const handleRestartGame = (uuid: string) => {
  // 重新进入房间
  uni.redirectTo({
    url: `/pages/room?uuid=${uuid}`
  });
};

const handleDestroyRoom = (gameUUID: string) => {
  if (gameUUID === roomUuid.value) {
    uni.showToast({
      title: '房间已关闭',
      icon: 'none',
      duration: 2000
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 2000);
  }
};

// 注册Socket监听
onMounted(() => {
  socket.on('roomUpdated', handleRoomUpdated);
  socket.on('gameUpdated', handleGameUpdated);
  socket.on('restartGame', handleRestartGame);
  socket.on('destroyRoom', handleDestroyRoom);
});

// 清理Socket监听
onUnmounted(() => {
  socket.off('roomUpdated', handleRoomUpdated);
  socket.off('gameUpdated', handleGameUpdated);
  socket.off('restartGame', handleRestartGame);
  socket.off('destroyRoom', handleDestroyRoom);
});

// 页面卸载时离开房间
onUnload(() => {
  if (roomUuid.value) {
    socket.emit('leaveRoom', roomUuid.value);
  }
});

// 开始游戏
const handleStartGame = () => {
  if (!roomState.value || roomState.value.players.length < 5) {
    return;
  }

  socket.emit('startGame', roomUuid.value);
};

// 返回大厅
const handleBackToLobby = () => {
  uni.navigateBack();
};

// 处理玩家点击
const handlePlayerClick = (playerId: string) => {
  console.log('Player clicked:', playerId);

  // 游戏中的选择队伍阶段
  if (roomState.value?.stage === 'started' && gameState.value?.stage === 'selectTeam') {
    const currentPlayer = gameState.value.players.find(p => p.id === store.profile?.id);

    // 只有领袖可以选择
    if (currentPlayer?.features.isLeader) {
      // 切换玩家选中状态
      const index = selectedPlayers.value.indexOf(playerId);
      if (index > -1) {
        selectedPlayers.value.splice(index, 1);
      } else {
        selectedPlayers.value.push(playerId);
      }
    }
    return;
  }

  // 如果是房主且在等待阶段，显示踢人选项
  if (isRoomLeader.value && roomState.value && (roomState.value.stage === 'created' || roomState.value.stage === 'locked')) {
    // 不能踢自己
    if (playerId === store.profile?.id) {
      return;
    }

    // 获取玩家名称
    const userState = store.users[playerId];
    const playerName = (userState && 'profile' in userState) ? userState.profile.name : '该玩家';

    uni.showActionSheet({
      itemList: [`踢出 ${playerName}`],
      itemColor: '#ff3b30',
      success: (res) => {
        if (res.tapIndex === 0) {
          handleKickPlayer(playerId);
        }
      }
    });
  }
};

// 踢出玩家
const handleKickPlayer = (playerId: string) => {
  uni.showModal({
    title: '确认踢出',
    content: '确定要踢出该玩家吗？',
    confirmColor: '#ff3b30',
    success: (res) => {
      if (res.confirm) {
        socket.emit('kickPlayer', roomUuid.value, playerId);
        uni.showToast({
          title: '已踢出玩家',
          icon: 'success',
          duration: 1500
        });
      }
    }
  });
};

// 分享房间
const handleShareRoom = () => {
  // 小程序分享功能
  const roomId = roomUuid.value;
  const content = `房间ID: ${roomId}`;

  uni.showModal({
    title: '分享房间',
    content: content,
    confirmText: '复制ID',
    success: (res) => {
      if (res.confirm) {
        uni.setClipboardData({
          data: roomId,
          success: () => {
            uni.showToast({
              title: '房间ID已复制',
              icon: 'success',
              duration: 2000
            });
          }
        });
      }
    }
  });
};

// 获取房间状态文本
const getRoomStageText = (stage?: string): string => {
  const stageMap: Record<string, string> = {
    created: '等待中',
    locked: '已锁定',
    started: '游戏中'
  };
  return stage ? stageMap[stage] || '未知' : '未知';
};

// 获取错误文本
const getErrorText = (error: string): string => {
  const errorMap: Record<string, string> = {
    room_not_found: '房间不存在',
    room_is_full: '房间已满',
    connection_failed: '连接失败',
    not_authorized: '未授权'
  };
  return errorMap[error] || '未知错误';
};

// ============ 游戏事件处理函数 ============

// 发送队伍
const handleSendTeam = () => {
  if (!roomUuid.value || selectedPlayers.value.length === 0) return;

  socket.emit('sentSelectedPlayers', roomUuid.value, selectedPlayers.value);
  selectedPlayers.value = []; // 清空选择
};

// 投票
const handleVote = (option: TVoteOption) => {
  if (!roomUuid.value) return;

  socket.emit('vote', roomUuid.value, option);
};

// 任务执行
const handleMissionAction = (result: TMissionResult) => {
  if (!roomUuid.value) return;

  socket.emit('mission', roomUuid.value, result);
};

// 刺杀
const handleAssassinate = (targetId: string) => {
  if (!roomUuid.value) return;

  socket.emit('assassinate', roomUuid.value, targetId);
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.room {
  min-height: 100vh;
  background-color: $bg-page;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40rpx;
}

.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $bg-card;
  padding: 80rpx 60rpx;
  border-radius: $radius-xlarge;
  @include shadow-card;
}

.error-title {
  font-size: $font-xl;
  color: $error;
  margin-bottom: 40rpx;
  font-weight: bold;
}

.room-content {
  padding: 40rpx 20rpx;
}

.room-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
  padding: $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-large;
  @include shadow-card;
}

.room-id {
  font-size: $font-md;
  color: $text-primary;
  margin-bottom: 10rpx;
}

.room-stage {
  font-size: $font-sm;
  color: $text-secondary;
}

.board-area {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  padding-bottom: 180rpx; // 为底部按钮留出空间
}

.board-wrapper {
  width: 100%;
  height: 680rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20rpx 0;
}

.game-components {
  background-color: transparent;
  padding: $spacing-md 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

// 中心内容样式
.center-waiting,
.center-gaming {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.waiting-title {
  font-size: $font-lg;
  color: $text-white;
  font-weight: bold;
  opacity: 0.9;
}

.player-count-text {
  font-size: $font-xxl;
  color: $player-leader;
  font-weight: bold;
}

.game-stage-text {
  font-size: $font-xl;
  color: $text-white;
  font-weight: bold;
  opacity: 0.9;
}

.options-section {
  background-color: $bg-card;
  padding: $spacing-lg;
  border-radius: $radius-large;
  @include shadow-card;
  margin: 0 20rpx;
}

.section-title {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
  display: block;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.option-badge {
  font-size: $font-sm;
  color: $primary;
  background-color: $loyalty-good-bg;
  padding: 8rpx 16rpx;
  border-radius: $radius-small;
}

.actions-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  padding: $spacing-lg 20rpx;
  background-color: $bg-card;
  box-shadow: 0 -4rpx 12rpx $shadow-light;
  z-index: 100;
}

.host-actions {
  display: flex;
  justify-content: center;
}

.primary-btn,
.secondary-btn,
.back-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 0;
  font-size: $font-lg;
  border: none;
  background-color: transparent;
  color: $text-primary;
  font-weight: 600;
  transition: opacity $transition-normal;
}

.primary-btn:active,
.secondary-btn:active,
.back-btn:active {
  opacity: 0.6;
}

.primary-btn[disabled] {
  background-color: transparent;
  color: $btn-disabled-text;
  opacity: 0.4;
}

.primary-btn::after,
.secondary-btn::after,
.back-btn::after {
  border: none;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-text {
  font-size: $font-lg;
  color: $text-disabled;
}
</style>
