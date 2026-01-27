import { buildMongoURI } from '@/db/helpers';

interface Config {
  MONGODB_URI: string;
  DB_NAME: string;
  SECRET_KEY: string;
  WECHAT_APPID?: string;
  WECHAT_SECRET?: string;
}

export const config: Config = {
  MONGODB_URI: process.env.MONGODB_URI || buildMongoURI(),
  DB_NAME: process.env.DB_NAME!,
  SECRET_KEY: process.env.SECRET_KEY!,
  WECHAT_APPID: process.env.WECHAT_APPID,
  WECHAT_SECRET: process.env.WECHAT_SECRET,
};
