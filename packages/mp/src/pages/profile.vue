<template>
  <view class="profile-page">
    <!-- 返回按钮 -->
    <view v-if="currentView !== 'profile' && store.profile" class="back-button" @click="handleBack">
      <text class="back-icon">‹</text>
    </view>

    <view v-if="store.profile" class="profile-container">
      <!-- 个人资料视图 -->
      <view v-if="currentView === 'profile'">
        <!-- 头部信息 -->
        <view class="profile-header">
          <view class="profile-info">
            <text class="profile-name">{{ store.profile.name }}</text>

            <!-- 统计信息 -->
            <view v-if="statsLoading" class="profile-stats">
              <text class="stats-loading">加载中...</text>
            </view>
            <view v-else class="profile-stats">
              <view class="stat-item">
                <text class="stat-label">评分</text>
                <text class="stat-value">{{ displayRating }}</text>
              </view>
              <view class="stat-divider"></view>
              <view class="stat-item">
                <text class="stat-label">胜率</text>
                <text class="stat-value" :class="winrateClass">{{ displayWinrate }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 功能菜单 -->
        <view class="menu-section">
          <view class="menu-list">
            <view class="menu-item" @click="handleViewHistory">
              <text class="menu-label">历史战绩</text>
              <text class="menu-arrow">›</text>
            </view>
            <!-- <view class="menu-item" @click="handleViewAchievements">
              <text class="menu-label">查看成就</text>
              <text class="menu-arrow">›</text>
            </view> -->
          </view>
        </view>
      </view>

      <!-- 历史战绩视图 -->
      <view v-else-if="currentView === 'history'">
        <HistoryView />
      </view>

      <!-- 成就视图 -->
      <view v-else-if="currentView === 'achievements'">
        <AchievementsView />
      </view>
    </view>

    <!-- 未登录状态 - 显示登录表单 -->
    <view v-else class="auth-container">
      <!-- 错误提示 -->
      <view v-if="loginError" class="error-message">
        <text>{{ loginError }}</text>
      </view>

      <!-- 微信登录 -->
      <view v-if="!showNicknameInput" class="form">
        <button
          class="wechat-login-btn"
          :class="{ disabled: loginLoading }"
          @click="handleWechatLogin"
          :disabled="loginLoading"
        >
          {{ loginLoading ? '登录中...' : '微信登录' }}
        </button>
      </view>

      <!-- 昵称和头像设置 -->
      <NicknameAvatarForm v-else ref="nicknameFormRef" :loading="loginLoading" @confirm="handleConfirmNickname" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useMainStore } from '@/store';
import { socket } from '@/api/socket';
import HistoryView from '@/components/profile/HistoryView.vue';
import AchievementsView from '@/components/profile/AchievementsView.vue';
import NicknameAvatarForm from '@/components/NicknameAvatarForm.vue';

const store = useMainStore();

// 视图切换状态
type ViewType = 'profile' | 'history' | 'achievements';
const currentView = ref<ViewType>('profile');

// 登录相关状态
const loginLoading = ref(false);
const loginError = ref('');
const showNicknameInput = ref(false);
const wechatCode = ref('');
const nicknameFormRef = ref<InstanceType<typeof NicknameAvatarForm> | null>(null);

// 统计信息相关状态
const statsLoading = ref(true);
const trueSkillRating = ref<number | null>(null);
const winrate = ref<number | null>(null);

// 获取 TrueSkill 评分
const fetchTrueSkillRating = async () => {
  if (!store.profile) return;

  try {
    const result = await socket.emitWithAck('getTrueSkillRating', store.profile.id);
    if (result.success && result.rating?.mu) {
      trueSkillRating.value = Math.round(result.rating.mu);
    }
  } catch (error) {
    console.error('Failed to fetch TrueSkill rating:', error);
  }
};

// 计算胜率
const fetchWinrate = async () => {
  if (!store.profile) return;

  try {
    const games = await socket.emitWithAck('getPlayerGames', store.profile.id);

    if (Array.isArray(games) && games.length > 0) {
      let wins = 0;
      let total = 0;

      for (const game of games) {
        if (game.result?.winner) {
          total++;
          // 找到当前玩家在游戏中的角色
          const player = game.players.find((p: any) => p.id === store.profile?.id);
          if (player) {
            // 判断玩家阵营
            const role = player.role.toLowerCase();
            const evilRoles = ['minion', 'morgana', 'mordred', 'oberon', 'evil_lancelot'];
            const playerLoyalty = evilRoles.includes(role) ? 'evil' : 'good';

            // 判断是否获胜
            if (game.result.winner === playerLoyalty) {
              wins++;
            }
          }
        }
      }

      if (total > 0) {
        winrate.value = (wins / total) * 100;
      }
    }
  } catch (error) {
    console.error('Failed to fetch winrate:', error);
  }
};

// 显示评分
const displayRating = computed(() => {
  return trueSkillRating.value !== null ? trueSkillRating.value : '---';
});

// 显示胜率
const displayWinrate = computed(() => {
  return winrate.value !== null ? `${winrate.value.toFixed(2)}%` : '---';
});

// 胜率颜色样式
const winrateClass = computed(() => {
  if (winrate.value === null) return '';
  if (winrate.value < 40) return 'winrate-low';
  if (winrate.value < 50) return 'winrate-medium';
  return 'winrate-high';
});

// 初始化统计数据
const initStats = async () => {
  statsLoading.value = true;
  await Promise.all([fetchTrueSkillRating(), fetchWinrate()]);
  statsLoading.value = false;
};

// 页面加载时获取统计数据
onMounted(() => {
  if (store.profile) {
    initStats();
  }
});

// 微信登录 - 第一步：获取授权码
const handleWechatLogin = async () => {
  loginLoading.value = true;
  loginError.value = '';

  try {
    // 获取微信授权码
    const loginRes = await new Promise<any>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      });
    });

    if (!loginRes.code) {
      loginError.value = '获取微信授权失败';
      loginLoading.value = false;
      return;
    }

    // 保存授权码，显示昵称输入界面
    wechatCode.value = loginRes.code;
    showNicknameInput.value = true;
    loginLoading.value = false;
  } catch (e) {
    console.error('WeChat login error:', e);
    loginError.value = '微信登录失败，请稍后重试';
    loginLoading.value = false;
  }
};

// 确认昵称并完成登录
const handleConfirmNickname = async (userInfo: { nickname: string; avatarUrl?: string }) => {
  loginLoading.value = true;
  loginError.value = '';

  try {
    // 发送到后端登录
    const result = await store.wechatLogin(wechatCode.value, userInfo);

    if (result && 'error' in result) {
      loginError.value = result.error === 'wechatAuthFailed' ? '微信授权失败，请重试' : result.error;
      // 重置状态，让用户重新登录
      showNicknameInput.value = false;
      wechatCode.value = '';
      nicknameFormRef.value?.reset();
    } else {
      // 登录成功
      uni.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000,
      });
      // 重置临时数据
      showNicknameInput.value = false;
      wechatCode.value = '';
      nicknameFormRef.value?.reset();
      // 获取统计数据
      initStats();
    }
  } catch (e) {
    console.error('WeChat login error:', e);
    loginError.value = '登录失败，请稍后重试';
    // 重置状态
    showNicknameInput.value = false;
    wechatCode.value = '';
    nicknameFormRef.value?.reset();
  } finally {
    loginLoading.value = false;
  }
};

// 查看成就
const handleViewAchievements = () => {
  currentView.value = 'achievements';
};

// 查看历史战绩
const handleViewHistory = () => {
  currentView.value = 'history';
};

// 返回个人资料
const handleBack = () => {
  currentView.value = 'profile';
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.profile-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 160rpx 30rpx 140rpx; // 底部留空给TabBar
  position: relative;
}

.back-button {
  position: fixed;
  top: 30rpx;
  left: 30rpx;
  z-index: 100;
  padding: 10rpx;

  &:active {
    opacity: 0.5;
  }
}

.back-icon {
  font-size: 50rpx;
  color: $text-secondary;
  line-height: 1;
}

.profile-container {
  max-width: 700rpx;
  margin: 0 auto;
}

.profile-header {
  background: transparent;
  border-radius: 0;
  padding: 60rpx 40rpx;
  margin-bottom: $spacing-lg;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.05);
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.profile-name {
  color: $text-primary;
  font-size: $font-xxl;
  font-weight: bold;
  text-align: center;
}

.profile-stats {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  margin-top: $spacing-sm;
}

.stats-loading {
  font-size: $font-md;
  color: $text-disabled;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.stat-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.stat-value {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
}

.stat-divider {
  width: 2rpx;
  height: 50rpx;
  background-color: rgba(0, 0, 0, 0.1);
}

.winrate-low {
  color: $error;
}

.winrate-medium {
  color: #ff9800;
}

.winrate-high {
  color: $success;
}

.menu-section {
  margin-top: $spacing-xl;
}

.menu-list {
  display: flex;
  flex-direction: column;
  background: transparent;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-lg $spacing-md;
  background: transparent;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.05);
  transition: background-color $transition-normal;

  &:active {
    background-color: rgba(0, 0, 0, 0.02);
  }
}

.menu-icon {
  font-size: 32rpx;
  margin-right: $spacing-md;
}

.menu-label {
  flex: 1;
  font-size: $font-lg;
  color: $text-primary;
  font-weight: 500;
}

.menu-arrow {
  font-size: 40rpx;
  color: $text-secondary;
  margin-left: $spacing-sm;
}

// 未登录时的登录表单样式
.auth-container {
  max-width: 600rpx;
  margin: 0 auto;
  padding: 60rpx 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.error-message {
  background-color: lighten($error, 45%);
  border: 2rpx solid lighten($error, 35%);
  border-radius: $radius-medium;
  padding: 20rpx;
  margin-bottom: $spacing-lg;
  width: 100%;
  text-align: center;
}

.error-message text {
  color: $error;
  font-size: $font-sm;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
  width: 100%;
}

.wechat-login-btn {
  width: auto;
  padding: 20rpx 60rpx;
  background: transparent;
  color: $text-primary;
  border-radius: 0;
  font-size: $font-xl;
  font-weight: 600;
  border: none;
  transition: opacity $transition-normal;
}

.wechat-login-btn:active {
  opacity: 0.6;
}

.wechat-login-btn::after {
  border: none;
}

.wechat-login-btn.disabled {
  opacity: 0.6;
}
</style>
