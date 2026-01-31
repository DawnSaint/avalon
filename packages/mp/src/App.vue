<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useMainStore } from '@/store';

onLaunch(() => {
  console.log('App Launch');

  // 初始化 store
  const store = useMainStore();

  // 预加载字体
  uni.loadFontFace({
    family: 'Overt',
    source: 'url("/static/Overt.ttf")',
    success: () => {
      console.log('Overt font loaded successfully');
      store.setFontLoaded(true);
    },
    fail: (err) => {
      console.error('Failed to load Overt font:', err);
      // 即使加载失败也允许显示（使用回退字体）
      store.setFontLoaded(true);
    },
  });

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
uni-page {
  background-color: #cfd8dc;
  position: fixed;
  padding-top: 80rpx;
  box-sizing: border-box;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
    'Helvetica Neue', sans-serif;
}

/* 重置按钮样式 */
button {
  padding: 0;
  margin: 0;
  line-height: normal;
}

button::after {
  border: none;
}
</style>
