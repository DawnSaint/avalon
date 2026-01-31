import { defineStore } from 'pinia';
import { socket } from '@/api/socket';
import { userProfilePath, userSettingsPath, alertStoragePath } from '@/api/const';
import type {
  UserWithToken,
  MPUserWithToken,
  IUserSettings,
  TUserState,
  TAlerts,
  TAlertsName,
  Dictionary,
} from '@/types';

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
  metadata?: Record<string, unknown>;
}

interface State {
  profile: UserWithToken | null;
  users: Dictionary<TUserState>;
  settings: IUserSettings | null;
  hideSpoilers: boolean;
  connect: boolean | null;
  alerts: TAlerts;
  fontLoaded: boolean;
  achievements: Achievement[];
}

// 辅助函数：从存储中读取数据
function getStorageData<T>(key: string, defaultValue: T): T {
  try {
    const data = uni.getStorageSync(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Failed to get storage data for ${key}:`, e);
    return defaultValue;
  }
}

// 辅助函数：保存数据到存储
function setStorageData(key: string, data: any) {
  try {
    uni.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to set storage data for ${key}:`, e);
  }
}

// 开发环境虚拟用户（小程序用户结构）
function getDevProfile(): UserWithToken | null {
  // 仅在开发环境下生效
  // @ts-ignore
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return null;
  }

  // 检查编译平台，如果是微信小程序则不设置默认用户
  // @ts-ignore
  const isWeChat = process.env.UNI_PLATFORM === 'mp-weixin';

  if (isWeChat) {
    return null;
  }

  const storedProfile = getStorageData<UserWithToken | null>(userProfilePath, null);

  // 如果已有profile，返回已有的
  if (storedProfile) {
    return storedProfile;
  }

  // 返回临时 profile，真实 token 会在连接后自动获取
  const tempProfile: any = {
    id: 'mp_dev000000000000',
    name: '开发测试用户',
    avatar: 'servant',
    token: 'dev-token-temp', // 临时标记，会在 socket 连接后自动替换
    userType: 'miniprogram',
  };

  return tempProfile;
}

export const useMainStore = defineStore('main', {
  state: (): State => ({
    profile: getStorageData<UserWithToken | null>(userProfilePath, null) || getDevProfile(),
    users: {},
    settings: getStorageData<IUserSettings | null>(userSettingsPath, null),
    hideSpoilers: false,
    connect: null,
    alerts: getStorageData<TAlerts>(alertStoragePath, {}),
    fontLoaded: false,
    achievements: [],
  }),

  getters: {
    isLoggedIn: (state) => !!state.profile,
    userName: (state) => state.profile?.name || '',
    userAvatar: (state) => state.profile?.avatar || '',
    getAchievementName: (state) => {
      return (achievementID: string) => {
        const achievement = state.achievements.find((a) => a.id === achievementID);
        return achievement?.name || achievementID;
      };
    },
  },

  actions: {
    // 设置字体加载状态
    setFontLoaded(loaded: boolean) {
      this.fontLoaded = loaded;
    },

    // 设置成就列表
    setAchievements(achievements: Achievement[]) {
      this.achievements = achievements;
    },

    // 更新警告计数器
    updateAlertCounter(alert: TAlertsName) {
      this.alerts[alert] = (this.alerts[alert] ?? 0) + 1;
      setStorageData(alertStoragePath, this.alerts);
    },

    // 更新用户资料
    updateUserProfile(profile: UserWithToken, options?: { updateToken?: boolean }) {
      const isNewToken = options?.updateToken !== false && this.profile?.token !== profile.token;
      this.profile = profile;
      setStorageData(userProfilePath, profile);

      if (isNewToken) {
        socket.updateAuthToken();
      }
    },

    // 更新用户设置
    updateUserSettings<T extends keyof IUserSettings>(key: T, value: IUserSettings[T]) {
      if (!this.settings) {
        this.settings = {};
      }
      this.settings[key] = value;
      setStorageData(userSettingsPath, this.settings);
    },

    // 清除用户资料
    clearUserProfile() {
      this.profile = null;
      try {
        uni.removeStorageSync(userProfilePath);
      } catch (e) {
        console.error('Failed to clear user profile:', e);
      }
    },

    // 更新连接状态
    updateConnectState(value: boolean) {
      this.connect = value;
    },

    // 更新隐藏剧透设置
    updateHideSpoilers(value: boolean) {
      this.hideSpoilers = value;
    },

    // 更新用户状态
    updateUsersState(uuid: string, user: TUserState) {
      this.users[uuid] = user;
    },

    // 登录
    async login(loginOrEmail: string, password: string) {
      const user = await socket.emitWithAck<UserWithToken | { error: string }>('login', loginOrEmail, password);

      if (user && !('error' in user)) {
        this.updateUserProfile(user);
      }

      return user;
    },

    // 微信登录（小程序专用）
    async wechatLogin(code: string, userInfo?: { nickname?: string; avatarUrl?: string; unionid?: string }) {
      const user = await socket.emitWithAck<MPUserWithToken | { error: string }>('mpWechatLogin', code, userInfo || {});

      if (user && !('error' in user)) {
        // MPUserWithToken 兼容 UserWithToken 接口，可以直接使用
        this.updateUserProfile(user as any);
      }

      return user;
    },

    // 注册用户
    async registerUser(params: { password: string; name: string; email: string; login: string }) {
      const user = await socket.emitWithAck<UserWithToken | { error: string }>('registerUser', params);

      if (user && !('error' in user)) {
        this.updateUserProfile(user);
      }

      return user;
    },

    // 更新用户密码
    async updateUserPassword(password: string, newPassword: string) {
      return await socket.emitWithAck('updateUserPassword', password, newPassword);
    },

    // 更新用户名
    updateUserName(name: string) {
      if (this.profile) {
        socket.emit('updateUserName', name);
        this.updateUserProfile({ ...this.profile, name }, { updateToken: false });
      }
    },

    // 更新用户邮箱
    async updateUserEmail(email: string, password: string) {
      const result = await socket.emitWithAck<boolean>('updateUserEmail', password, email);

      if (this.profile && result === true) {
        this.updateUserProfile({ ...this.profile, email }, { updateToken: false });
      }

      return result;
    },

    // 刷新用户资料
    async refreshProfile() {
      const result = await socket.emitWithAck<Partial<UserWithToken>>('getMyProfile');

      if (this.profile) {
        this.updateUserProfile({ ...this.profile, ...result }, { updateToken: false });
      }

      return result;
    },

    // 更新用户登录名
    async updateUserLogin(login: string, password: string) {
      const result = await socket.emitWithAck<boolean>('updateUserLogin', password, login);

      if (this.profile && result === true) {
        this.updateUserProfile({ ...this.profile, login }, { updateToken: false });
      }

      return result;
    },

    // 获取用户公开资料
    async getUserPublicProfile(uuid: string): Promise<TUserState> {
      if (!this.users[uuid]) {
        this.updateUsersState(uuid, { status: 'loading' });

        // 判断是否是小程序用户（ID 以 mp_ 开头）
        const isMPUser = uuid.startsWith('mp_');
        const eventName = isMPUser ? 'getMPUserProfile' : 'getUserProfile';

        socket.emitWithAck(eventName, uuid).then((profile) => {
          this.updateUsersState(uuid, { status: 'ready', profile });
        });
      }

      return this.users[uuid];
    },
  },
});

// 监听 Socket 事件
socket.on('connect', async () => {
  const store = useMainStore();
  store.updateConnectState(true);

  // 开发环境：自动获取真实 token
  // @ts-ignore
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev && store.profile?.token === 'dev-token-temp') {
    try {
      const user = await socket.emitWithAck<MPUserWithToken | { error: string }>('devMPLogin');
      if (user && !('error' in user)) {
        console.log('[Dev Mode] 自动获取真实 token 成功');
        store.updateUserProfile(user as any);
        // updateAuthToken 会自动重连
      }
    } catch (e) {
      console.warn('[Dev Mode] 自动获取 token 失败，后端可能未启动开发用户迁移', e);
    }
  }
});

socket.on('disconnect', () => {
  const store = useMainStore();
  store.updateConnectState(false);
});

socket.on('renewJWT', () => {
  const store = useMainStore();
  store.clearUserProfile();
});

socket.on('achievementUnlocked', (achievementID: string) => {
  const store = useMainStore();
  const achievementName = store.getAchievementName(achievementID);
  uni.showToast({
    title: `🎉 ${achievementName}`,
    icon: 'success',
    duration: 3000,
  });
});

socket.on('achievementProgress', (data: { achievementID: string; currentProgress: number; requirement: number }) => {
  const store = useMainStore();
  const achievementName = store.getAchievementName(data.achievementID);
  uni.showToast({
    title: `${achievementName} ${data.currentProgress}/${data.requirement}`,
    icon: 'none',
    duration: 2000,
  });
});
