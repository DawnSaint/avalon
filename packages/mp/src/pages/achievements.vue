<template>
  <view class="achievements-page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <template v-else>
      <!-- 成就概览 -->
      <view class="summary-card">
        <view class="summary-header">
          <view class="summary-info">
            <text class="summary-title">我的成就</text>
            <text class="summary-subtitle">已完成: {{ completedCount }} / {{ totalCount }}</text>
          </view>
          <view class="progress-circle">
            <text class="progress-text">{{ completionPercentage }}%</text>
          </view>
        </view>
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: completionPercentage + '%' }"></view>
        </view>
      </view>

      <!-- 公开成就 -->
      <view class="achievements-section">
        <text class="section-title">公开成就</text>
        <view class="achievements-list">
          <AchievementCard
            v-for="achievement in openAchievements"
            :key="achievement.id"
            :achievement="achievement"
          />
        </view>
      </view>

      <!-- 隐藏成就 -->
      <view class="achievements-section">
        <text class="section-title">隐藏成就</text>
        <view class="achievements-list">
          <AchievementCard
            v-for="achievement in hiddenAchievements"
            :key="achievement.id"
            :achievement="achievement"
            :is-hidden="true"
          />
        </view>
      </view>
    </template>

    <!-- 底部导航栏 -->
    <TabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMainStore } from '@/store';
import { socket } from '@/api/socket';
import AchievementCard from '@/components/achievements/AchievementCard.vue';
import TabBar from '@/components/TabBar.vue';

interface Achievement {
  id: string;
  type: 'open' | 'hidden';
  requirement: number;
  metadata?: Record<string, unknown>;
}

interface UserAchievement {
  achievementID: string;
  currentProgress: number;
  completed: boolean;
  state?: Record<string, unknown>;
}

interface AchievementData {
  id: string;
  type: 'open' | 'hidden';
  completed: boolean;
  progress: {
    currentValue: number;
    maxValue: number;
  };
  metadata?: Record<string, unknown>;
  state?: Record<string, boolean>;
}

const store = useMainStore();
const loading = ref(true);
const achievements = ref<AchievementData[]>([]);

// 获取成就数据
const fetchAchievements = async () => {
  if (!store.profile) return;

  try {
    loading.value = true;

    const [achievementsResponse, userAchievementsResponse] = await Promise.all([
      socket.emitWithAck('getAllAchievements'),
      socket.emitWithAck('getUserAchievements', store.profile.id)
    ]);

    if (achievementsResponse?.success && userAchievementsResponse?.success) {
      const allAchievements = achievementsResponse.achievements || [];
      const userAchievements = userAchievementsResponse.userAchievements || [];

      achievements.value = allAchievements.map((achievement: Achievement) => {
        const userAchievement = userAchievements.find(
          (ua: UserAchievement) => ua.achievementID === achievement.id
        );

        return {
          id: achievement.id,
          type: achievement.type,
          completed: userAchievement?.completed || false,
          progress: {
            currentValue: userAchievement?.currentProgress || 0,
            maxValue: achievement.requirement
          },
          metadata: achievement.metadata,
          state: (userAchievement?.state as Record<string, boolean>) || {}
        };
      });
    }
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    uni.showToast({
      title: '获取成就失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 计算属性
const openAchievements = computed(() => {
  return achievements.value.filter(a => a.type === 'open');
});

const hiddenAchievements = computed(() => {
  return achievements.value.filter(a => a.type === 'hidden');
});

const completedCount = computed(() => {
  return achievements.value.filter(a => a.completed).length;
});

const totalCount = computed(() => {
  return achievements.value.length;
});

const completionPercentage = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

onMounted(() => {
  fetchAchievements();
});
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.achievements-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding: $spacing-lg $spacing-lg 140rpx;
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

.summary-card {
  background-color: $bg-card;
  padding: $spacing-xl;
  border-radius: $radius-large;
  margin-bottom: $spacing-xl;
  @include shadow-card;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.summary-info {
  flex: 1;
}

.summary-title {
  display: block;
  font-size: $font-xl;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.summary-subtitle {
  display: block;
  font-size: $font-md;
  color: $text-secondary;
}

.progress-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary 0%, lighten($primary, 20%) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  @include shadow-elevated;
}

.progress-text {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-white;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: $radius-small;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary 0%, lighten($primary, 15%) 100%);
  transition: width $transition-normal;
  border-radius: $radius-small;
}

.achievements-section {
  margin-bottom: $spacing-xl;
}

.section-title {
  display: block;
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
  padding-bottom: $spacing-sm;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.1);
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}
</style>
