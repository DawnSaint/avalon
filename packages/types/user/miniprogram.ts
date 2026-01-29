import { prop, modelOptions, index } from '@typegoose/typegoose';

// 公开用户信息
export class MPUserPublicProfile {
  @prop({ required: true })
  public id!: string;

  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public avatar!: string;
}

// 完整用户资料（数据库模型）
@modelOptions({ schemaOptions: { collection: 'miniprogramusers', timestamps: true } })
@index({ id: 1 }, { unique: true })
@index({ wechatOpenid: 1 }, { unique: true })
@index({ wechatUnionid: 1 }, { unique: true, sparse: true })
export class MiniProgramUser extends MPUserPublicProfile {
  @prop({ required: true })
  public wechatOpenid!: string;

  @prop()
  public wechatUnionid?: string;

  @prop({ required: true })
  public registrationDate!: Date;

  @prop()
  public lastLoginDate?: Date;
}

// UI 展示模型
export class MPUserForUI extends MPUserPublicProfile {}

// 登录响应（包含 token）
export interface MPUserWithToken extends MPUserForUI {
  token: string;
  userType: 'miniprogram';
}
