<template>
  <view v-if="visible" class="settings-overlay" @tap="handleClose">
    <view class="settings-content" @tap.stop>
      <view class="settings-header">
        <text class="settings-title">游戏设置</text>
        <view class="close-btn" @tap="handleClose">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <scroll-view class="settings-body" scroll-y>
        <!-- 角色设置 -->
        <view class="settings-section">
          <view class="section-header">
            <text class="section-title">🎭 角色配置</text>
            <text class="section-hint">选择游戏中包含的角色</text>
          </view>

          <view class="options-grid">
            <!-- 好人阵营 -->
            <view class="option-group">
              <text class="group-title">正义阵营</text>
              <view
                v-for="role in goodRoles"
                :key="role.key"
                class="option-item"
                :class="{ active: localOptions.roles[role.key] }"
                @tap="toggleRole(role.key)"
              >
                <text class="option-icon">{{ role.icon }}</text>
                <text class="option-name">{{ role.name }}</text>
              </view>
            </view>

            <!-- 坏人阵营 -->
            <view class="option-group">
              <text class="group-title">邪恶阵营</text>
              <view
                v-for="role in evilRoles"
                :key="role.key"
                class="option-item"
                :class="{ active: localOptions.roles[role.key] }"
                @tap="toggleRole(role.key)"
              >
                <text class="option-icon">{{ role.icon }}</text>
                <text class="option-name">{{ role.name }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 扩展内容 -->
        <view class="settings-section">
          <view class="section-header">
            <text class="section-title">🎲 扩展内容</text>
            <text class="section-hint">添加额外的游戏机制</text>
          </view>

          <view class="options-list">
            <view
              v-for="addon in addons"
              :key="addon.key"
              class="addon-item"
              :class="{ active: localOptions.addons[addon.key] }"
              @tap="toggleAddon(addon.key)"
            >
              <view class="addon-info">
                <text class="addon-icon">{{ addon.icon }}</text>
                <view class="addon-text">
                  <text class="addon-name">{{ addon.name }}</text>
                  <text class="addon-desc">{{ addon.desc }}</text>
                </view>
              </view>
              <view class="addon-toggle">
                <text v-if="localOptions.addons[addon.key]">✓</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 其他功能 -->
        <view class="settings-section">
          <view class="section-header">
            <text class="section-title">⚙️ 其他设置</text>
          </view>

          <view class="feature-item" @tap="toggleFeature('lookingForPlayers')">
            <view class="feature-info">
              <text class="feature-name">寻找玩家</text>
              <text class="feature-desc">在大厅中标记为"寻找玩家"</text>
            </view>
            <view class="feature-toggle" :class="{ active: localOptions.features?.lookingForPlayers }">
              <view class="toggle-dot"></view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="settings-footer">
        <button class="footer-btn cancel" @tap="handleClose">取消</button>
        <button class="footer-btn confirm" @tap="handleSave">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { socket } from '@/api/socket';
import type { GameOptions, GameOptionsRoles, GameOptionsAddons } from '@/types';

interface Props {
  visible: boolean;
  roomUuid: string;
  options: GameOptions;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

// 本地选项副本
const localOptions = ref<GameOptions>({
  roles: { ...props.options.roles },
  addons: { ...props.options.addons },
  features: { ...props.options.features }
});

// 监听 props 变化，更新本地副本
watch(() => props.options, (newOptions) => {
  localOptions.value = {
    roles: { ...newOptions.roles },
    addons: { ...newOptions.addons },
    features: { ...newOptions.features }
  };
}, { deep: true });

// 角色配置
const goodRoles = [
  { key: 'merlin', name: '梅林', icon: '🧙' },
  { key: 'percival', name: '派西维尔', icon: '🛡️' },
  { key: 'guinevere', name: '桂妮薇儿', icon: '👸' },
  { key: 'cleric', name: '牧师', icon: '⛪' },
  { key: 'revealer', name: '揭示者', icon: '🔍' }
];

const evilRoles = [
  { key: 'morgana', name: '莫甘娜', icon: '🧙‍♀️' },
  { key: 'mordred', name: '莫德雷德', icon: '⚔️' },
  { key: 'oberon', name: '奥伯伦', icon: '👤' },
  { key: 'witch', name: '女巫', icon: '🔮' },
  { key: 'brute', name: '蛮族', icon: '💪' },
  { key: 'lunatic', name: '疯子', icon: '🤪' }
];

// 扩展配置
const addons = [
  {
    key: 'lady_of_lake',
    name: '湖中女神',
    icon: '🌊',
    desc: '可以查看其他玩家的阵营'
  },
  {
    key: 'excalibur',
    name: '圣剑',
    icon: '⚔️',
    desc: '领袖可以使用圣剑强制任务成功'
  },
  {
    key: 'lady_of_sea',
    name: '海之女神',
    icon: '🌊',
    desc: '湖中女神的变体版本'
  },
  {
    key: 'plot_cards',
    name: '阴谋卡牌',
    icon: '🃏',
    desc: '增加特殊能力卡牌'
  }
];

// 切换角色
const toggleRole = (roleKey: keyof GameOptionsRoles) => {
  localOptions.value.roles[roleKey] = !localOptions.value.roles[roleKey];
};

// 切换扩展
const toggleAddon = (addonKey: keyof GameOptionsAddons) => {
  localOptions.value.addons[addonKey] = !localOptions.value.addons[addonKey];
};

// 切换功能
const toggleFeature = (featureKey: string) => {
  if (!localOptions.value.features) {
    localOptions.value.features = {};
  }
  localOptions.value.features[featureKey] = !localOptions.value.features[featureKey];
};

// 关闭
const handleClose = () => {
  emit('close');
};

// 保存设置
const handleSave = () => {
  socket.emit('updateOptions', props.roomUuid, localOptions.value);
  uni.showToast({
    title: '设置已保存',
    icon: 'success',
    duration: 1500
  });
  emit('close');
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1001;
  animation: fadeIn 0.3s ease;
}

.settings-content {
  width: 100%;
  max-height: 90vh;
  background-color: $bg-page;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.settings-header {
  position: relative;
  padding: 40rpx 30rpx 20rpx;
  border-bottom: 1rpx solid $border-color;
  flex-shrink: 0;
}

.settings-title {
  font-size: $font-xl;
  font-weight: bold;
  color: $text-primary;
}

.close-btn {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: $border-light;
}

.close-icon {
  font-size: $font-xl;
  color: $text-secondary;
}

.settings-body {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 40rpx;
}

.section-header {
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-xs;
}

.section-hint {
  font-size: $font-sm;
  color: $text-disabled;
  display: block;
}

.options-grid {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.group-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #666;
  margin-bottom: 5rpx;
}

.option-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  background-color: $btn-secondary;
  border-radius: $radius-medium;
  border: 2rpx solid transparent;
  transition: all $transition-normal;
}

.option-item.active {
  background-color: $loyalty-good-bg;
  border-color: $primary;
}

.option-icon {
  font-size: $font-xl;
}

.option-name {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.addon-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background-color: $btn-secondary;
  border-radius: $radius-medium;
  border: 2rpx solid transparent;
  transition: all $transition-normal;
}

.addon-item.active {
  background-color: $loyalty-good-bg;
  border-color: $primary;
}

.addon-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.addon-icon {
  font-size: 40rpx;
}

.addon-text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.addon-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.addon-desc {
  font-size: 22rpx;
  color: #999;
}

.addon-toggle {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: $btn-disabled;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $transition-normal;
}

.addon-item.active .addon-toggle {
  background-color: $primary;
}

.addon-toggle text {
  font-size: $font-md;
  color: $text-white;
  font-weight: bold;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.feature-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.feature-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.feature-desc {
  font-size: 22rpx;
  color: #999;
}

.feature-toggle {
  width: 88rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background-color: $btn-disabled;
  position: relative;
  transition: all $transition-normal;
}

.feature-toggle.active {
  background-color: $primary;
}

.toggle-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: all 0.3s;
}

.feature-toggle.active .toggle-dot {
  left: 44rpx;
}

.settings-footer {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-top: 1rpx solid $border-color;
  flex-shrink: 0;
}

.footer-btn {
  flex: 1;
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

.footer-btn:active {
  opacity: 0.6;
}

.footer-btn::after {
  border: none;
}

.footer-btn.cancel {
  background-color: transparent;
  color: $text-secondary;
}

.footer-btn.confirm {
  background: transparent;
  color: $text-primary;
  font-weight: 600;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
