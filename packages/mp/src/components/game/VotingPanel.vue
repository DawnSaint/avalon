<template>
  <view class="voting-panel">
    <view class="panel-header">
      <text class="header-title">投票决定派遣</text>
      <text class="header-subtitle">投票轮 {{ voteRound }}/5</text>
    </view>

    <view class="proposed-team">
      <text class="team-label">提议的队伍:</text>
      <view class="team-members">
        <text v-for="(player, index) in proposedTeamNames" :key="index" class="member-name">
          {{ player }}
        </text>
      </view>
    </view>

    <view v-if="!hasVoted" class="vote-buttons">
      <button class="vote-btn approve" @click="handleVote('approve')">
        <text>赞成</text>
      </button>
      <button class="vote-btn reject" @click="handleVote('reject')">
        <text>反对</text>
      </button>
    </view>

    <view v-else class="voted-indicator">
      <text>已投票，等待其他玩家...</text>
    </view>

    <view v-if="showVoteResult" class="vote-result">
      <text class="result-title">投票结果:</text>
      <view class="result-stats">
        <text class="stat approve">赞成: {{ approveCount }}</text>
        <text class="stat reject">反对: {{ rejectCount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { VisualGameState, TVoteOption } from '@/types';

interface Props {
  game: VisualGameState;
  currentPlayerId: string;
}

interface Emits {
  (e: 'vote', option: TVoteOption): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const voteRound = computed(() => {
  return props.game.vote + 1;
});

// 获取提议队伍的玩家名称
const proposedTeamNames = computed(() => {
  const selectedPlayers = props.game.players.filter((p) => p.features.isSent);
  return selectedPlayers.map((p) => p.name);
});

// 检查当前玩家是否已投票
const hasVoted = computed(() => {
  const currentPlayer = props.game.players.find((p) => p.id === props.currentPlayerId);
  return currentPlayer ? !currentPlayer.features.waitForAction : false;
});

// 检查是否显示投票结果（所有人都投票完成）
const showVoteResult = computed(() => {
  const allVoted = props.game.players.every((p) => !p.features.waitForAction);
  return allVoted && props.game.history.length > 0;
});

// 计算赞成和反对的数量
const approveCount = computed(() => {
  if (!showVoteResult.value) return 0;

  // 从历史记录中获取最近的投票记录
  const voteHistory = props.game.history.filter((h) => h.type === 'vote');
  if (voteHistory.length === 0) return 0;

  const latestVote = voteHistory[voteHistory.length - 1];
  if ('votes' in latestVote) {
    return latestVote.votes.filter((v: any) => v.value === 'approve').length;
  }
  return 0;
});

const rejectCount = computed(() => {
  if (!showVoteResult.value) return 0;

  const voteHistory = props.game.history.filter((h) => h.type === 'vote');
  if (voteHistory.length === 0) return 0;

  const latestVote = voteHistory[voteHistory.length - 1];
  if ('votes' in latestVote) {
    return latestVote.votes.filter((v: any) => v.value === 'reject').length;
  }
  return 0;
});

const handleVote = (option: TVoteOption) => {
  emit('vote', option);
};
</script>

<style scoped lang="scss">
.voting-panel {
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
  font-size: $font-sm;
  color: $text-secondary;
}

.proposed-team {
  margin-bottom: $spacing-lg;
  text-align: center;
}

.team-label {
  display: block;
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

.team-members {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $spacing-sm;
}

.member-name {
  padding: $spacing-xs $spacing-sm;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: $radius-small;
  font-size: $font-sm;
  color: $text-primary;
}

.vote-buttons {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
  margin-bottom: $spacing-lg;
}

.vote-btn {
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

.vote-btn:active {
  opacity: 0.6;
}

.vote-btn::after {
  border: none;
}

.vote-btn.approve {
  color: $loyalty-good;
}

.vote-btn.reject {
  color: $loyalty-evil;
}

.voted-indicator {
  text-align: center;
  padding: $spacing-lg;
  color: $text-secondary;
  font-size: $font-md;
}

.vote-result {
  margin-top: $spacing-lg;
  text-align: center;
}

.result-title {
  display: block;
  font-size: $font-md;
  color: $text-primary;
  margin-bottom: $spacing-sm;
  font-weight: 500;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
}

.stat {
  font-size: $font-md;
  font-weight: 500;
}

.stat.approve {
  color: $loyalty-good;
}

.stat.reject {
  color: $loyalty-evil;
}
</style>
