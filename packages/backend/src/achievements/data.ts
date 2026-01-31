import { Achievement } from '@avalon/types';
import {
  ACHIEVEMENT_LIGHT_WINS,
  ACHIEVEMENT_DARK_WINS,
  ACHIEVEMENT_ALL_STANDARD_ROLES,
  ACHIEVEMENT_DIFFERENT_PLAYER_COUNT,
  ACHIEVEMENT_ASSASSIN_KILLS,
  ACHIEVEMENT_UNDERCOVER_AGENT,
  ACHIEVEMENT_USELESS_ROLE,
  ACHIEVEMENT_STILL_WORTHY,
  ACHIEVEMENT_DETECTIVE,
  ACHIEVEMENT_MISTAKES_HAPPEN,
  ACHIEVEMENT_SERIAL_KILLER,
  ACHIEVEMENT_WRONG_CHOICE,
  ACHIEVEMENT_BODYGUARD,
  ACHIEVEMENT_SEER,
  ACHIEVEMENT_SECRET_HUNTER,
  SUPPORTED_PLAYER_COUNTS,
  ASSASSIN_TARGETS,
  STANDARD_ROLES,
} from '@avalon/types';

/**
 * Данные для инициализации достижений
 */
export const achievementsData: Achievement[] = [
  {
    id: ACHIEVEMENT_LIGHT_WINS,
    name: '除了恐惧本身，别无所惧！',
    description: '作为蓝方获胜10次',
    requirement: 10,
  },
  {
    id: ACHIEVEMENT_DARK_WINS,
    name: '黑暗的降临',
    description: '作为红方获胜10次',
    requirement: 10,
  },
  {
    id: ACHIEVEMENT_ALL_STANDARD_ROLES,
    name: '全能高手',
    description: '使用所有标准角色获胜',
    requirement: STANDARD_ROLES.length,
    metadata: {
      roles: STANDARD_ROLES,
    },
  },
  {
    id: ACHIEVEMENT_DIFFERENT_PLAYER_COUNT,
    name: '人生是一连串的选择',
    description: '在5-10人游戏中获胜',
    requirement: SUPPORTED_PLAYER_COUNTS.length,
    metadata: {
      playerCounts: SUPPORTED_PLAYER_COUNTS,
    },
  },
  {
    id: ACHIEVEMENT_ASSASSIN_KILLS,
    name: '我看到死去的人。',
    description: '作为刺客成功刺杀梅林5次',
    requirement: 5,
  },
  {
    id: ACHIEVEMENT_SECRET_HUNTER,
    name: '秘密猎人',
    description: '在网站上找到秘密',
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_UNDERCOVER_AGENT,
    name: '卧底特工',
    description: '作为梅林选择莫甘娜参加任务2次后赢得游戏',
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_USELESS_ROLE,
    name: '这角色有啥用',
    description: '作为牧师5次执行第一次任务',
    requirement: 5,
  },
  {
    id: ACHIEVEMENT_STILL_WORTHY,
    name: '依然值得',
    description: '在第5次任务中使用圣剑并作为好人赢得游戏',
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_DETECTIVE,
    name: '侦探',
    description: '作为梅林使用湖中仙女查验莫德雷德',
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_MISTAKES_HAPPEN,
    name: '失误难免',
    description: '在任务中所有坏人都按了失败',
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_SERIAL_KILLER,
    name: '连环杀手',
    description: '至少各刺杀一次梅林、牧师和情侣',
    requirement: ASSASSIN_TARGETS.length,
    metadata: {
      targets: ASSASSIN_TARGETS,
    },
  },
  {
    id: ACHIEVEMENT_WRONG_CHOICE,
    name: '错误的选择',
    description: '作为莫甘娜参加3次失败的任务',
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_BODYGUARD,
    name: '贴身护卫',
    description: '作为派西维尔被刺客射击',
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_SEER,
    name: '先知',
    description: '作为忠臣组建所有任务队伍都没有坏人',
    requirement: 1,
  },
];
