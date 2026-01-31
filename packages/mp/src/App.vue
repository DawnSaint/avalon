<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useMainStore } from '@/store';

onLaunch(() => {
  console.log('App Launch');

  // 初始化 store
  const store = useMainStore();

  // 检查用户登录状态
  if (store.profile) {
    console.log('User logged in:', store.profile.name);
  }
});

onShow(() => {
  console.log('App Show');
});

onHide(() => {
  console.log('App Hide');
});
</script>

<style lang="scss">
/* 自定义字体 */
@font-face {
  font-family: 'Overt';
  src: url('@/static/Overt.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block; /* 字体加载完成前不显示文字（最多阻塞3秒） */
}

/* 全局样式 */
uni-page,
page {
  background-color: $bg;
  box-sizing: border-box;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
    'Helvetica Neue', sans-serif;
}
</style>
