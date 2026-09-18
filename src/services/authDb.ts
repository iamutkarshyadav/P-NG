import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarEmoji: string;
  pingsCount: number;
  likesCount: number;
  isVerifiedReal: boolean;
  birthday?: string;
  age?: number;
  zodiacSign?: string;
  gender?: string;
  showGenderOnProfile?: boolean;
  bio?: string;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

const STORAGE_KEY_USERS = '@ping_local_users_v1';
const STORAGE_KEY_SESSION = '@ping_active_session_v1';

export const ALEX_DEMO_ACCOUNT: UserAccount = {
  id: 'user_alex_dev',
  name: 'Alex Rivera',
  email: 'alex@ping.app',
  password: 'password123',
  avatarEmoji: '⚡',
  pingsCount: 38,
  likesCount: 19,
  isVerifiedReal: true,
  birthday: '2000-05-14',
  age: 26,
  zodiacSign: 'Taurus',
  hasCompletedOnboarding: true,
  createdAt: '2026-01-15T00:00:00Z',
};

export const SAM_DEMO_ACCOUNT: Omit<UserAccount, 'id' | 'createdAt'> = {
  name: 'Sam Taylor',
  email: 'sam@ping.app',
  password: 'password123',
  avatarEmoji: '❤️',
  pingsCount: 0,
  likesCount: 0,
  isVerifiedReal: true,
  hasCompletedOnboarding: false,
};

export const GOOGLE_DEMO_ACCOUNT: UserAccount = {
  id: 'user_google_sso',
  name: 'Alex Rivera (Google)',
  email: 'alex.google@ping.app',
  password: 'google_sso_verified',
  avatarEmoji: '⚡',
  pingsCount: 42,
  likesCount: 24,
  isVerifiedReal: true,
  birthday: '2000-05-14',
  age: 26,
  zodiacSign: 'Taurus',
  hasCompletedOnboarding: true,
  createdAt: '2026-02-01T00:00:00Z',
};

class AuthDbService {
  /**
   * Initializes local DB and seeds the Alex account if not already present.
   */
  async initDb(): Promise<void> {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEY_USERS);
      if (!usersJson) {
        // Seed initial DB with Alex
        await AsyncStorage.setItem(
          STORAGE_KEY_USERS,
          JSON.stringify([ALEX_DEMO_ACCOUNT])
        );
      } else {
        const users: UserAccount[] = JSON.parse(usersJson);
        const alexExists = users.some(
          (u) => u.email.toLowerCase() === ALEX_DEMO_ACCOUNT.email.toLowerCase()
        );
        if (!alexExists) {
          users.push(ALEX_DEMO_ACCOUNT);
          await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        }
      }
    } catch (e) {
      console.warn('Failed to initialize local Auth DB:', e);
    }
  }

  /**
   * Returns all registered users from local DB.
   */
  async getAllUsers(): Promise<UserAccount[]> {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEY_USERS);
      return usersJson ? JSON.parse(usersJson) : [ALEX_DEMO_ACCOUNT];
    } catch {
      return [ALEX_DEMO_ACCOUNT];
    }
  }

  /**
   * Prepares the demo account flow for development.
   * If 'alex': ensures Alex is saved in the DB ready for login.
   * If 'sam': removes Sam from DB so signing up is always a brand new account.
   */
  async prepareDemoMode(mode: 'alex' | 'sam'): Promise<void> {
    try {
      const users = await this.getAllUsers();
      if (mode === 'alex') {
        const hasAlex = users.some(
          (u) => u.email.toLowerCase() === ALEX_DEMO_ACCOUNT.email.toLowerCase()
        );
        if (!hasAlex) {
          users.push(ALEX_DEMO_ACCOUNT);
          await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        }
      } else if (mode === 'sam') {
        // Remove Sam so the signup route always creates a brand new account
        const filtered = users.filter(
          (u) => u.email.toLowerCase() !== SAM_DEMO_ACCOUNT.email.toLowerCase()
        );
        await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('prepareDemoMode error:', e);
    }
  }

  /**
   * Log In with email and password
   */
  async logIn(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    const users = await this.getAllUsers();
    const user = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      return {
        success: false,
        error: `No account found for "${trimmedEmail}". Did you mean to Sign Up?`,
      };
    }

    if (user.password !== trimmedPassword) {
      return {
        success: false,
        error: 'Incorrect password. (For demo accounts, use: password123)',
      };
    }

    // Set active session
    await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    return { success: true, user };
  }

  /**
   * Log In / Sign Up with Google SSO
   */
  async signInWithGoogle(): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    try {
      const users = await this.getAllUsers();
      let user = users.find(
        (u) => u.email.toLowerCase() === GOOGLE_DEMO_ACCOUNT.email.toLowerCase()
      );
      if (!user) {
        user = { ...GOOGLE_DEMO_ACCOUNT };
        users.push(user);
        await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      }
      await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
      return { success: true, user };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Google SSO failed.' };
    }
  }

  /**
   * Sign Up a new user account
   */
  async signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    if (trimmedPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.',
      };
    }

    const users = await this.getAllUsers();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (existing) {
      return {
        success: false,
        error: `An account with "${trimmedEmail}" already exists! Switch to Log In.`,
      };
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      name: name || (trimmedEmail.split('@')[0] ?? 'New User'),
      email: trimmedEmail,
      password: trimmedPassword,
      avatarEmoji: trimmedEmail.includes('sam') ? '❤️' : '✨',
      pingsCount: 0,
      likesCount: 1, // New user welcome bonus
      isVerifiedReal: true,
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    await AsyncStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newUser));

    return { success: true, user: newUser };
  }

  /**
   * Updates user profile data (e.g. birthday, age, onboarding completion)
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<UserAccount>
  ): Promise<UserAccount | null> {
    try {
      const users = await this.getAllUsers();
      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) return null;

      users[index] = { ...users[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      await AsyncStorage.setItem(
        STORAGE_KEY_SESSION,
        JSON.stringify(users[index])
      );
      return users[index];
    } catch (e) {
      console.warn('updateUserProfile error:', e);
      return null;
    }
  }

  /**
   * Marks onboarding as complete for a user
   */
  async completeOnboarding(userId: string): Promise<UserAccount | null> {
    return this.updateUserProfile(userId, { hasCompletedOnboarding: true });
  }

  /**
   * Retrieves active session if exists
   */
  async getActiveSession(): Promise<UserAccount | null> {
    try {
      const sessionJson = await AsyncStorage.getItem(STORAGE_KEY_SESSION);
      return sessionJson ? JSON.parse(sessionJson) : null;
    } catch {
      return null;
    }
  }

  /**
   * Log out active session
   */
  async logOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_SESSION);
    } catch (e) {
      console.warn('logOut error:', e);
    }
  }

  /**
   * Increment pings count for testing in-app interactions
   */
  async incrementPings(userId: string): Promise<UserAccount | null> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) return null;

      users[userIndex].pingsCount += 1;
      await AsyncStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      await AsyncStorage.setItem(
        STORAGE_KEY_SESSION,
        JSON.stringify(users[userIndex])
      );
      return users[userIndex];
    } catch {
      return null;
    }
  }
}

export const authDb = new AuthDbService();
