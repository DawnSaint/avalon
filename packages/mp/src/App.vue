<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useMainStore } from "@/store";

onLaunch(() => {
  console.log("App Launch");

  // 初始化 store
  const store = useMainStore();

  // 检查用户登录状态
  if (store.profile) {
    console.log("User logged in:", store.profile.name);
  }
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
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

/* 文本样式 */
text {
  font-size: 28rpx;
}

/* 通用容器样式 */
.container {
  padding: 20rpx;
}
</style>
