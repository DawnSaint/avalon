import mongoose from 'mongoose';
import { config } from '@/config';
import { achievementModel, achievementStatsModel } from '@/db/models';
import { achievementsData } from '@/achievements/data';

/**
 * 初始化成就数据到数据库
 * 此脚本会：
 * 1. 清除现有的成就数据
 * 2. 插入新的成就数据
 * 3. 初始化成就统计数据
 */
async function initAchievements() {
  try {
    // 连接数据库
    const connectionParams = {
      dbName: config.DB_NAME,
      authSource: 'admin',
    };

    const prodSettings =
      process.env.NODE_ENV === 'production'
        ? ({
            authMechanism: 'DEFAULT',
            retryWrites: true,
          } as const)
        : {};

    await mongoose.connect(config.MONGODB_URI, { ...connectionParams, ...prodSettings });
    console.log(`MongoDB Connected [${config.DB_NAME}]`);

    // 清除现有成就数据
    console.log('Clearing existing achievements...');
    await achievementModel.deleteMany({});
    await achievementStatsModel.deleteMany({});

    // 插入成就数据
    console.log('Inserting achievements...');
    await achievementModel.insertMany(achievementsData);
    console.log(`Inserted ${achievementsData.length} achievements`);

    // 初始化成就统计数据
    console.log('Initializing achievement stats...');
    const statsData = achievementsData.map((achievement) => ({
      achievementID: achievement.id,
      totalUnlocked: 0,
      totalProgress: 0,
    }));
    await achievementStatsModel.insertMany(statsData);
    console.log(`Initialized stats for ${statsData.length} achievements`);

    // 列出所有成就
    console.log('\nAchievements initialized:');
    achievementsData.forEach((achievement, index) => {
      console.log(`   ${index + 1}. ${achievement.id} - requirement: ${achievement.requirement}`);
    });

    console.log('\nAchievement initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing achievements:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// 运行初始化
initAchievements();
