<template>
  <view class="user-menu">
    <!-- 已登录状态 -->
    <view v-if="store.profile" class="user-info" @click="toggleMenu">
      <view class="user-avatar">
        <text>{{ userInitial }}</text>
      </view>
      <text class="user-name">{{ store.profile.name }}</text>
    </view>

    <!-- 未登录状态 -->
    <view v-else class="login-btn" @click="goToAuth">
      <text>登录/注册</text>
    </view>

    <!-- 菜单弹出层 -->
    <view v-if="showMenu && store.profile" class="menu-overlay" @click="toggleMenu">
      <view class="menu-popup" @click.stop>
        <view class="menu-header">
          <view class="menu-user-avatar">
            <text>{{ userInitial }}</text>
          </view>
          <view class="menu-user-info">
            <text class="menu-user-name">{{ store.profile.name }}</text>
            <text class="menu-user-id">ID: {{ store.profile.id.slice(0, 8) }}</text>
          </view>
        </view>

        <view class="menu-list">
          <view class="menu-item" @click="goToProfile">
            <text class="menu-item-icon">👤</text>
            <text class="menu-item-text">个人资料</text>
          </view>

          <view class="menu-item" @click="goToStats">
            <text class="menu-item-icon">📊</text>
            <text class="menu-item-text">统计数据</text>
          </view>

          <view class="menu-item" @click="goToLeaderboard">
            <text class="menu-item-icon">🏆</text>
            <text class="menu-item-text">排行榜</text>
          </view>

          <view class="menu-item" @click="goToWiki">
            <text class="menu-item-icon">📖</text>
            <text class="menu-item-text">游戏规则</text>
          </view>

          <view class="menu-item" @click="goToAbout">
            <text class="menu-item-icon">ℹ️</text>
            <text class="menu-item-text">关于</text>
          </view>

          <view class="menu-divider"></view>

          <view class="menu-item danger" @click="handleLogout">
            <text class="menu-item-icon">🚪</text>
            <text class="menu-item-text">退出登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMainStore } from '@/store';

const store = useMainStore();
const showMenu = ref(false);

// 获取用户名首字母
const userInitial = computed(() => {
  if (!store.profile?.name) return '?';
  return store.profile.name.charAt(0).toUpperCase();
});

// 切换菜单显示
const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

// 跳转到登录页（现在会跳转到 profile 页面，未登录时会显示登录表单）
const goToAuth = () => {
  uni.navigateTo({
    url: '/pages/profile'
  });
};

// 跳转到个人资料
const goToProfile = () => {
  showMenu.value = false;
  uni.navigateTo({
    url: '/pages/profile'
  });
};

// 跳转到统计数据
const goToStats = () => {
  showMenu.value = false;
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 跳转到排行榜
const goToLeaderboard = () => {
  showMenu.value = false;
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 跳转到规则
const goToWiki = () => {
  showMenu.value = false;
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 跳转到关于
const goToAbout = () => {
  showMenu.value = false;
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        store.clearUserProfile();
        showMenu.value = false;
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        });
      }
    }
  });
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: transparent;
  border-radius: 0;
  transition: opacity $transition-normal;
}

.user-info:active {
  opacity: 0.6;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.2);
}

.user-avatar text {
  color: $text-primary;
  font-size: $font-md;
  font-weight: bold;
}

.user-name {
  color: $text-primary;
  font-size: $font-md;
  max-width: 150rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.login-btn {
  padding: 16rpx 32rpx;
  background-color: transparent;
  border-radius: 0;
  transition: opacity $transition-normal;
}

.login-btn:active {
  opacity: 0.6;
}

.login-btn text {
  color: $text-primary;
  font-size: $font-md;
  font-weight: 600;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 100rpx 20rpx 20rpx;
}

.menu-popup {
  width: 500rpx;
  background-color: $bg-page;
  border-radius: 0;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-header {
  background: transparent;
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.05);
}

.menu-user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.1);
}

.menu-user-avatar text {
  color: $text-primary;
  font-size: $font-xxl;
  font-weight: bold;
}

.menu-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-user-name {
  color: $text-primary;
  font-size: $font-lg;
  font-weight: bold;
  margin-bottom: $spacing-xs;
}

.menu-user-id {
  color: $text-secondary;
  font-size: $font-xs;
}

.menu-list {
  padding: 20rpx 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 30rpx;
  transition: background-color $transition-normal;
}

.menu-item:active {
  background-color: $bg-hover;
}

.menu-item-icon {
  font-size: $font-xl;
  margin-right: 20rpx;
  width: 40rpx;
  text-align: center;
}

.menu-item-text {
  font-size: $font-md;
  color: $text-primary;
}

.menu-item.danger .menu-item-text {
  color: $error;
}

.menu-divider {
  height: 2rpx;
  background-color: $border-light;
  margin: 10rpx 30rpx;
}
</style>
