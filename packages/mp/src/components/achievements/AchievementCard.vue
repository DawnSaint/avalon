<template>
  <view
    class="achievement-card"
    :class="{
      'achievement-card--completed': achievement.completed,
    }"
  >
    <view class="achievement-icon">
      <!-- Achievement icon -->
    </view>

    <view class="achievement-content">
      <text class="achievement-name">{{ achievementName }}</text>
      <text class="achievement-description">{{ achievementDescription }}</text>

      <!-- 进度条 -->
      <view v-if="shouldShowProgress" class="achievement-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
        </view>
        <text class="progress-text">
          {{ achievement.progress.currentValue }} / {{ achievement.progress.maxValue }}
        </text>
      </view>

      <!-- 详细进度（角色进度） -->
      <view v-if="showRolesProgress" class="detailed-progress">
        <text class="detailed-title">角色进度:</text>
        <view class="detailed-grid">
          <view
            v-for="role in rolesMetadata"
            :key="role"
            class="detailed-item"
            :class="{ completed: achievement.state?.[role] }"
          >
            <text class="detail-icon">{{ achievement.state?.[role] ? '√' : '×' }}</text>
            <text class="detail-label">{{ getRoleName(role) }}</text>
          </view>
        </view>
      </view>

      <!-- 详细进度（玩家数量进度） -->
      <view v-if="showPlayerCountsProgress" class="detailed-progress">
        <text class="detailed-title">人数进度:</text>
        <view class="detailed-grid">
          <view
            v-for="count in playerCountsMetadata"
            :key="count"
            class="detailed-item"
            :class="{ completed: achievement.state?.[count] }"
          >
            <text class="detail-icon">{{ achievement.state?.[count] ? '√' : '×' }}</text>
            <text class="detail-label">{{ count }}人</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 完成标识 -->
    <view v-if="achievement.completed" class="completed-badge">
      <text class="badge-text">√</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMainStore } from '@/store';

interface Props {
  achievement: {
    id: string;
    completed: boolean;
    progress: {
      currentValue: number;
      maxValue: number;
    };
    metadata?: {
      roles?: string[];
      playerCounts?: number[];
    };
    state?: Record<string, boolean>;
  };
}

const props = defineProps<Props>();

const store = useMainStore();

// 成就配置数据
const ACHIEVEMENTS_CONFIG: Record<string, { name: string; description: string }> = {
  light_wins: { name: '除了恐惧本身，别无所惧！', description: '作为光明方获胜10次' },
  dark_wins: { name: '黑暗的降临', description: '作为黑暗方获胜10次' },
  all_standard_roles: { name: '全能高手', description: '使用所有标准角色获胜' },
  different_player_count: { name: '人生是一连串的选择', description: '在5-10人游戏中获胜' },
  assassin_kills: { name: '我看到死去的人。', description: '作为刺客成功刺杀梅林5次' },
  secret_hunter: { name: '秘密猎人', description: '在网站上找到秘密' },
  undercover_agent: { name: '卧底特工', description: '作为梅林选择莫甘娜参加任务2次后赢得游戏' },
  useless_role: { name: '这角色有啥用', description: '作为牧师5次执行第一次任务' },
  still_worthy: { name: '依然值得', description: '在第5次任务中使用圣剑并作为好人赢得游戏' },
  detective: { name: '侦探', description: '作为梅林使用湖中仙女查验莫德雷德' },
  mistakes_happen: { name: '失误难免', description: '在任务中所有坏人都按了失败' },
  serial_killer: { name: '连环杀手', description: '至少各刺杀一次梅林、牧师和情侣' },
  wrong_choice: { name: '错误的选择', description: '作为莫甘娜参加3次失败的任务' },
  bodyguard: { name: '保镖', description: '作为派西维尔被刺客射击' },
  seer: { name: '先知', description: '作为忠臣组建所有任务队伍都没有坏人' },
};

// 角色名称映射
const ROLE_NAMES: Record<string, string> = {
  servant: '忠臣',
  merlin: '梅林',
  percival: '派西维尔',
  mordred: '莫德雷德',
  morgana: '莫甘娜',
  oberon: '奥伯伦',
  minion: '爪牙',
};

// 计算属性
const achievementName = computed(() => {
  const config = ACHIEVEMENTS_CONFIG[props.achievement.id];
  if (!config) return props.achievement.id;

  return config.name;
});

const achievementDescription = computed(() => {
  const config = ACHIEVEMENTS_CONFIG[props.achievement.id];
  if (!config) return '';

  return config.description;
});

const shouldShowProgress = computed(() => {
  return !props.achievement.completed && props.achievement.progress.maxValue > 0;
});

const progressPercentage = computed(() => {
  if (props.achievement.progress.maxValue === 0) return 0;
  return Math.min(
    100,
    Math.round((props.achievement.progress.currentValue / props.achievement.progress.maxValue) * 100),
  );
});

const rolesMetadata = computed(() => {
  return props.achievement.metadata?.roles || [];
});

const playerCountsMetadata = computed(() => {
  return props.achievement.metadata?.playerCounts || [];
});

const showRolesProgress = computed(() => {
  return rolesMetadata.value.length > 0 && props.achievement.state && !props.achievement.completed;
});

const showPlayerCountsProgress = computed(() => {
  return playerCountsMetadata.value.length > 0 && props.achievement.state && !props.achievement.completed;
});

const getRoleName = (role: string): string => {
  return ROLE_NAMES[role] || role;
};
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.achievement-card {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-large;
  @include shadow-card;
  position: relative;
  transition: all $transition-normal;

  &--completed {
    border-left: 4rpx solid $success;
  }
}

.achievement-icon {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary 0%, lighten($primary, 20%) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  @include shadow-elevated;
}

.icon-text {
  font-size: 40rpx;
}

.achievement-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.achievement-name {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
}

.achievement-description {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.5;
}

.achievement-progress {
  margin-top: $spacing-sm;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: $radius-small;
  overflow: hidden;
  margin-bottom: $spacing-xs;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary 0%, lighten($primary, 15%) 100%);
  transition: width $transition-normal;
}

.progress-text {
  font-size: $font-xs;
  color: $text-secondary;
}

.detailed-progress {
  margin-top: $spacing-md;
}

.detailed-title {
  display: block;
  font-size: $font-sm;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.detailed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-xs;
}

.detailed-item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: $radius-small;

  &.completed {
    background-color: rgba($success, 0.1);

    .detail-icon {
      color: $success;
    }
  }
}

.detail-icon {
  font-size: $font-sm;
  color: $error;
}

.detail-label {
  font-size: $font-xs;
  color: $text-secondary;
}

.completed-badge {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: $success;
  display: flex;
  align-items: center;
  justify-content: center;
  @include shadow-elevated;
}

.badge-text {
  color: $text-white;
  font-size: $font-md;
  font-weight: bold;
}
</style>
