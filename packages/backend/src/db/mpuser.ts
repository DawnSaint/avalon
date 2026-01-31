import { randomBytes } from 'crypto';
import { MPUserForUI, MPUserWithToken } from '@avalon/types';
import { mpUserModel, userAchievementModel } from '@/db/models';
import { generateMPUserJWT } from '@/user/mpuser-helpers';

export class MPUserLayer {
  /**
   * 微信登录/自动注册
   * @param openid 微信openid
   * @param userInfo 用户信息（昵称、头像、unionid）
   * @returns 用户信息和token
   */
  async wechatLogin(
    openid: string,
    userInfo?: { nickname?: string; avatarUrl?: string; unionid?: string },
  ): Promise<MPUserWithToken | { error: string }> {
    try {
      let user = await mpUserModel.findOne({ wechatOpenid: openid });

      if (!user) {
        // 生成唯一用户ID
        const userId = this.generateUserId();
        const nickname = userInfo?.nickname || `小程序用户${userId.substring(3, 9)}`;

        user = new mpUserModel({
          id: userId,
          name: nickname,
          wechatOpenid: openid,
          wechatUnionid: userInfo?.unionid,
          avatar: 'servant',
          registrationDate: new Date(),
          lastLoginDate: new Date(),
        });

        await user.save();
      } else {
        // 更新最后登录时间
        user.lastLoginDate = new Date();
        await user.save();
      }

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        token: generateMPUserJWT({ id: user.id, name: user.name, avatar: user.avatar }),
        userType: 'miniprogram',
      };
    } catch (err) {
      console.error('Mini-program WeChat login error:', err);
      return { error: 'wechatAuthFailed' };
    }
  }

  /**
   * 生成唯一用户ID（格式：mp_xxxxxxxxxxxxxxxx）
   * @returns 用户ID
   */
  generateUserId(): string {
    return `mp_${randomBytes(8).toString('hex')}`;
  }

  /**
   * 根据ID获取完整用户信息
   * @param id 用户ID
   * @returns 用户信息
   */
  async getUserByID(id: string) {
    const user = await mpUserModel.findOne({ id });

    if (!user) {
      throw new Error(`Mini-program user with ${id} does not exist`);
    }

    return user;
  }

  /**
   * 获取公开用户信息
   * @param id 用户ID
   * @returns 公开用户信息（id, name, avatar）
   */
  async getPublicUserProfile(id: string): Promise<MPUserForUI | null> {
    try {
      const user = await this.getUserByID(id);

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      };
    } catch (err) {
      return null;
    }
  }

  /**
   * 更新用户昵称
   * @param id 用户ID
   * @param name 新昵称
   */
  async updateUserName(id: string, name: string): Promise<void> {
    await mpUserModel.findOneAndUpdate({ id }, { $set: { name } });
  }

  /**
   * 获取用户完成的成就列表
   * @param userID 用户ID
   * @returns 成就ID列表
   */
  async getUserCompletedAchievements(userID: string): Promise<string[]> {
    const userAchievements = await userAchievementModel.find({
      userID: userID,
      completed: true,
    });

    return userAchievements.map((el) => el.achievementID);
  }
}
