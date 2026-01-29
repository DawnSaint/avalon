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
    requirement: 10,
  },
  {
    id: ACHIEVEMENT_DARK_WINS,
    requirement: 10,
  },
  {
    id: ACHIEVEMENT_ALL_STANDARD_ROLES,
    requirement: STANDARD_ROLES.length,
    metadata: {
      roles: STANDARD_ROLES,
    },
  },
  {
    id: ACHIEVEMENT_DIFFERENT_PLAYER_COUNT,
    requirement: SUPPORTED_PLAYER_COUNTS.length,
    metadata: {
      playerCounts: SUPPORTED_PLAYER_COUNTS,
    },
  },
  {
    id: ACHIEVEMENT_ASSASSIN_KILLS,
    requirement: 5,
  },
  {
    id: ACHIEVEMENT_SECRET_HUNTER,
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_UNDERCOVER_AGENT,
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_USELESS_ROLE,
    requirement: 5,
  },
  {
    id: ACHIEVEMENT_STILL_WORTHY,
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_DETECTIVE,
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_MISTAKES_HAPPEN,
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_SERIAL_KILLER,
    requirement: ASSASSIN_TARGETS.length,
    metadata: {
      targets: ASSASSIN_TARGETS,
    },
  },
  {
    id: ACHIEVEMENT_WRONG_CHOICE,
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_BODYGUARD,
    requirement: 1,
  },
  {
    id: ACHIEVEMENT_SEER,
    requirement: 1,
  },
];
