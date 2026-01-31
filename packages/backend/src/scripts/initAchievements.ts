import { achievementModel, achievementStatsModel } from '@/db/models';
import { achievementsData } from '@/achievements/data';

/**
 * 初始化成就数据（服务启动时自动执行）
 * 使用 upsert 模式：存在则更新，不存在则插入
 */
export async function initAchievementsOnStartup() {
  try {
    console.log('Initializing achievements...');

    // 使用 bulkWrite 进行批量 upsert 操作
    const achievementOps = achievementsData.map((achievement) => ({
      updateOne: {
        filter: { id: achievement.id },
        update: { $set: achievement },
        upsert: true,
      },
    }));

    const result = await achievementModel.bulkWrite(achievementOps);
    console.log(`Achievements initialized: ${result.upsertedCount} inserted, ${result.modifiedCount} updated`);

    // 初始化成就统计数据（如果不存在）
    const statsOps = achievementsData.map((achievement) => ({
      updateOne: {
        filter: { achievementID: achievement.id },
        update: {
          $setOnInsert: {
            achievementID: achievement.id,
            totalUsers: 0,
            completedUsers: 0,
            completionPercentage: 0,
          },
        },
        upsert: true,
      },
    }));

    const statsResult = await achievementStatsModel.bulkWrite(statsOps);
    console.log(
      `Achievement stats initialized: ${statsResult.upsertedCount} inserted, ${statsResult.modifiedCount} updated`,
    );
  } catch (error) {
    console.error('Error initializing achievements:', error);
    // 不要终止服务，只是记录错误
  }
}
