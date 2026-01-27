<template>
  <view class="history-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 无数据 -->
    <view v-else-if="games.length === 0" class="empty-container">
      <text class="empty-text">暂无游戏记录</text>
    </view>

    <!-- 游戏列表 -->
    <template v-else>
      <view class="page-header">
        <text class="page-title">历史战绩</text>
        <text class="page-subtitle">共 {{ games.length }} 场游戏</text>
      </view>

      <view class="games-list">
        <GameHistoryCard
          v-for="game in games"
          :key="game.uuid"
          :game="game"
        />
      </view>
    </template>

    <!-- 底部导航栏 -->
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useMainStore } from '@/store';
import { socket } from '@/api/socket';
import GameHistoryCard from '@/components/history/GameHistoryCard.vue';
import TabBar from '@/components/TabBar.vue';

interface GameResult {
  winner?: 'good' | 'evil';
  reason: string;
}

interface Player {
  id: string;
  index: number;
  role: string;
  features: {
    isLeader?: boolean;
  };
}

interface GameHistory {
  uuid: string;
  stage: string;
  result?: GameResult;
  players: Player[];
  mission: number;
  vote: number;
}

const store = useMainStore();
const loading = ref(true);
const games = ref<GameHistory[]>([]);

// 获取游戏历史
const fetchGameHistory = async () => {
  if (!store.profile) return;

  try {
    loading.value = true;

    const result = await socket.emitWithAck('getPlayerGames', store.profile.id);

    if (Array.isArray(result)) {
      games.value = result;
    }
  } catch (error) {
    console.error('Failed to fetch game history:', error);
    uni.showToast({
      title: '获取战绩失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchGameHistory();
});
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.history-page {
  min-height: 100vh;
  padding: $spacing-lg $spacing-lg 140rpx;
}

.loading-container,
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-text,
.empty-text {
  font-size: $font-lg;
  color: $text-disabled;
}

.page-header {
  margin-bottom: $spacing-xl;
  padding-bottom: $spacing-md;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.1);
}

.page-title {
  display: block;
  font-size: $font-xxl;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.page-subtitle {
  display: block;
  font-size: $font-md;
  color: $text-secondary;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
</style>
