import { useMainStore } from '@/store';

export interface WechatLoginResult {
  success: boolean;
  needsNickname: boolean;
  code?: string;
  error?: string;
}

/**
 * 微信登录 - 第一步：获取授权码（不调用后端，避免 code 被消耗）
 * @returns 登录结果，总是返回 needsNickname=true，要求用户填写昵称
 */
export async function wechatLogin(): Promise<WechatLoginResult> {
  try {
    // 获取微信授权码
    const loginRes = await new Promise<any>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      });
    });

    if (!loginRes.code) {
      return {
        success: false,
        needsNickname: false,
        error: '获取微信授权码失败',
      };
    }

    // 不立即调用后端，而是返回 code，让用户填写昵称后再一次性登录
    // 这样可以避免 code 被重复使用的问题
    return {
      success: false,
      needsNickname: true,
      code: loginRes.code,
    };
  } catch (e) {
    console.error('WeChat login error:', e);
    return {
      success: false,
      needsNickname: false,
      error: '登录过程中发生错误',
    };
  }
}

/**
 * 确认昵称并完成登录
 * @param code 微信授权码
 * @param userInfo 用户信息（昵称和头像）
 * @returns 登录是否成功
 */
export async function confirmNicknameAndLogin(
  code: string,
  userInfo: { nickname: string; avatarUrl?: string },
): Promise<{ success: boolean; error?: string }> {
  try {
    const store = useMainStore();
    const result = await store.wechatLogin(code, userInfo);

    if (result && 'error' in result) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
    };
  } catch (e) {
    console.error('Confirm nickname error:', e);
    return {
      success: false,
      error: '登录过程中发生错误',
    };
  }
}
