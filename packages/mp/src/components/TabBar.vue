<template>
  <view class="tabbar">
    <view
      v-for="item in tabs"
      :key="item.path"
      class="tab-item"
      :class="{ active: currentPath === item.path }"
      @click="handleTabClick(item.path)"
    >
      <text class="tab-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

interface TabItem {
  label: string;
  path: string;
}

const tabs: TabItem[] = [
  { label: '主页', path: '/pages/index' },
  { label: '规则', path: '/pages/wiki' },
  { label: '个人', path: '/pages/profile' }
];

const currentPath = computed(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  return '/' + currentPage.route;
});

const handleTabClick = (path: string) => {
  if (currentPath.value === path) {
    return;
  }

  // 如果是跳转到主页，使用reLaunch清空页面栈
  if (path === '/pages/index') {
    uni.reLaunch({ url: path });
  } else {
    // 其他页面使用navigateTo
    uni.redirectTo({ url: path });
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.tabbar { 
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.32);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom); // 适配刘海屏
  z-index: 1000;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120rpx;
  transition: opacity $transition-normal;
}

.tab-item:active {
  opacity: 0.6;
}

.tab-label {
  font-size: $font-lg;
  color: $text-secondary;
  font-weight: 500;
}

.tab-item.active .tab-label {
  color: $text-primary;
  font-weight: 600;
}
</style>
