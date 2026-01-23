import { defineStore } from 'pinia';
import { socket } from '@/api/socket';
import { userProfilePath, userSettingsPath, alertStoragePath } from '@/api/const';
import type {
  UserWithToken,
  IUserSettings,
  TUserState,
  TAlerts,
  TAlertsName,
  Dictionary
} from '@/types';

interface State {
  profile: UserWithToken | null;
  users: Dictionary<TUserState>;
  settings: IUserSettings | null;
  hideSpoilers: boolean;
  connect: boolean | null;
  alerts: TAlerts;
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

// 开发环境虚拟用户
function getDevProfile(): UserWithToken | null {
  // 仅在开发环境下生效
  // @ts-ignore
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return null;
  }

  const storedProfile = getStorageData<UserWithToken | null>(userProfilePath, null);

  // 如果已有profile，返回已有的
  if (storedProfile) {
    return storedProfile;
  }

  // 开发环境默认虚拟用户
  const devProfile: UserWithToken = {
    id: 'dev-user-' + Date.now(),
    name: '开发测试用户',
    login: 'dev_user',
    email: 'dev@test.com',
    token: 'dev-token-' + Date.now(),
    knownAchievements: []
  };

  console.log('[Dev Mode] 使用虚拟登录状态:', devProfile);

  return devProfile;
}

export const useMainStore = defineStore('main', {
  state: (): State => ({
    profile: getStorageData<UserWithToken | null>(userProfilePath, null) || getDevProfile(),
    users: {},
    settings: getStorageData<IUserSettings | null>(userSettingsPath, null),
    hideSpoilers: false,
    connect: null,
    alerts: getStorageData<TAlerts>(alertStoragePath, {})
  }),

  getters: {
    isLoggedIn: (state) => !!state.profile,
    userName: (state) => state.profile?.name || '',
    userAvatar: (state) => state.profile?.avatar || ''
  },

  actions: {
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

    // 更新用户成就
    updateUserAchievements(achievementNameOrArray: string | string[]) {
      if (this.profile) {
        this.profile.knownAchievements = this.profile.knownAchievements || [];

        if (Array.isArray(achievementNameOrArray)) {
          this.profile.knownAchievements = achievementNameOrArray;
        } else if (!this.profile.knownAchievements.includes(achievementNameOrArray)) {
          this.profile.knownAchievements.push(achievementNameOrArray);
        }

        setStorageData(userProfilePath, this.profile);
      }
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

    // 微信登录
    async wechatLogin(code: string) {
      const user = await socket.emitWithAck<UserWithToken | { error: string }>('wechatLogin', code);

      if (user && !('error' in user)) {
        this.updateUserProfile(user);
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

    // 更新用户头像
    async updateUserAvatar(avatarID: string) {
      const result = await socket.emitWithAck<boolean>('updateUserAvatar', avatarID);

      if (this.profile && result === true) {
        this.updateUserProfile({ ...this.profile, avatar: avatarID }, { updateToken: false });
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

        socket.emitWithAck('getUserProfile', uuid).then((profile) => {
          this.updateUsersState(uuid, { status: 'ready', profile });
        });
      }

      return this.users[uuid];
    }
  }
});

// 监听 Socket 事件
socket.on('connect', () => {
  const store = useMainStore();
  store.updateConnectState(true);
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
  store.updateUserAchievements(achievementID);
});

socket.on('hiddenAchievementsList', (achievements: string[]) => {
  const store = useMainStore();
  store.updateUserAchievements(achievements);
});
