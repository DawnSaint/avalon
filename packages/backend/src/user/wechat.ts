import { config } from '@/config';

interface WechatSession {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

export async function getWechatOpenid(code: string): Promise<string | null> {
  if (!config.WECHAT_APPID || !config.WECHAT_SECRET) {
    console.error('WeChat APPID or SECRET not configured');
    return null;
  }

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.WECHAT_APPID}&secret=${config.WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;

  try {
    const response = await fetch(url);
    const data = (await response.json()) as WechatSession;

    if (data.errcode) {
      console.error('WeChat API error:', data.errcode, data.errmsg);
      return null;
    }

    return data.openid;
  } catch (error) {
    console.error('Failed to fetch WeChat session:', error);
    return null;
  }
}
