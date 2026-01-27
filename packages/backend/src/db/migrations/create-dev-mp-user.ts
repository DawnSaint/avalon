import { mpUserModel } from '@/db/models';
import { Migration } from '@/db/migrations/interface';

export const createDevMPUser: Migration = {
  name: 'create-dev-mp-user',
  async up() {
    // 仅在开发环境执行
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const devUserId = 'mp_dev000000000000';

    // 检查是否已存在
    const existingUser = await mpUserModel.findOne({ id: devUserId });

    if (!existingUser) {
      await mpUserModel.create({
        id: devUserId,
        name: '开发测试用户',
        wechatOpenid: 'dev_openid_fake_123456',
        avatar: 'servant',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
      });
    }
  },
};
