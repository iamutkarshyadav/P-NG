import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LAYOUT } from '../theme/responsive';
import { DotGridBackground } from '../components/DotGridBackground';
import { InAppTopHeader } from '../components/InAppTopHeader';
import { InAppBottomNav, InAppTab } from '../components/InAppBottomNav';
import { DiscoverScreen } from './inapp/DiscoverScreen';
import { LikesScreen } from './inapp/LikesScreen';
import { MatchesScreen } from './inapp/MatchesScreen';
import { ProfileScreen } from './inapp/ProfileScreen';
import { ChatScreen } from './inapp/ChatScreen';
import { PreferencesScreen } from './inapp/PreferencesScreen';
import { UserAccount } from '../types/user';
import { useInboxBadges } from '../hooks/useInboxBadges';
import { useQueryClient } from '@tanstack/react-query';
import { onNotificationOpened, registerForPush } from '../services/push';
import { fetchMatches } from '../services/chat';
import type { ChatTarget } from './inapp/MatchesScreen';

interface AppHomeScreenProps {
  user: UserAccount;
  onLogout: () => void;
  onSwitchToDemo?: (demo: 'alex' | 'sam') => void;
  onReplayOnboarding?: () => void;
}

export const AppHomeScreen: React.FC<AppHomeScreenProps> = ({
  user,
  onLogout,
  onSwitchToDemo,
  onReplayOnboarding,
}) => {
  const [activeTab, setActiveTab] = useState<InAppTab>('discover');
  const [activeChat, setActiveChat] = useState<ChatTarget | null>(null);
  const { likesCount, hasUnreadMatches } = useInboxBadges(user.id);
  const queryClient = useQueryClient();

  // Ask for notification permission once the user is inside the app, and keep the token fresh.
  useEffect(() => {
    registerForPush();
  }, []);

  // Tapping a push notification opens the right conversation.
  useEffect(
    () =>
      onNotificationOpened(async (target) => {
        if (target.type === 'message' || target.type === 'match') {
          if (!target.matchId) return;
          const matches = await queryClient.fetchQuery({ queryKey: ['matches'], queryFn: fetchMatches, staleTime: 0 });
          const match = matches.find((m) => m.matchId === target.matchId);
          if (match) {
            setActiveChat({ matchId: match.matchId, partnerId: match.partnerId, partnerName: match.name });
          } else {
            setActiveTab('matches');
          }
        } else {
          setActiveTab('likes');
        }
      }),
    [queryClient]
  );
  const [showPreferences, setShowPreferences] = useState(false);
  const [isProfileSubScreenActive, setIsProfileSubScreenActive] = useState(false);
  const [profileSubScreen, setProfileSubScreen] = useState<
    'none' | 'account' | 'preferences' | 'safety' | 'settings' | 'preview'
  >('none');

  const handleOpenFilter = () => {
    setShowPreferences(true);
  };

  // If a chat is active, display the full Chat Direct screen
  if (activeChat) {
    return <ChatScreen target={activeChat} user={user} onBack={() => setActiveChat(null)} />;
  }

  // If Preferences & Filters is opened directly from Discover tab
  if (showPreferences) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <DotGridBackground />
        <View style={styles.contentViewport}>
          <PreferencesScreen
            user={user}
            onBack={() => setShowPreferences(false)}
            onPreviewProfile={() => {
              setShowPreferences(false);
              setActiveTab('profile');
            }}
          />
        </View>
        <InAppBottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setShowPreferences(false);
            setActiveTab(tab);
          }}
          likesCount={likesCount}
          hasUnreadMatches={hasUnreadMatches}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <DotGridBackground />

      {/* 1. Universal Neo-Brutalist Top Header - Hidden on sub-screens */}
      {!isProfileSubScreenActive && (
        <InAppTopHeader
          user={user}
          activeTab={activeTab}
          onPressFilter={handleOpenFilter}
          onPressAvatar={() => setActiveTab('profile')}
          onPressSettings={() => {
            setProfileSubScreen('settings');
          }}
        />
      )}

      {/* 2. Main In-App Viewport */}
      <View style={styles.contentViewport}>
        {activeTab === 'discover' && <DiscoverScreen user={user} onOpenChat={setActiveChat} />}
        {activeTab === 'likes' && <LikesScreen user={user} onOpenChat={setActiveChat} />}
        {activeTab === 'matches' && (
          <MatchesScreen user={user} onOpenChat={setActiveChat} />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen
            user={user}
            onLogout={onLogout}
            onSwitchToDemo={onSwitchToDemo}
            onReplayOnboarding={onReplayOnboarding}
            onSubScreenChange={(isSub) => setIsProfileSubScreenActive(isSub)}
            initialSubScreen={profileSubScreen}
          />
        )}
      </View>

      {/* 3. Universal Neo-Brutalist Bottom Tab Bar - Permanently fixed across all screens */}
      <InAppBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setProfileSubScreen('none');
          setIsProfileSubScreenActive(false);
        }}
        likesCount={likesCount}
        hasUnreadMatches={hasUnreadMatches}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    height: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    minHeight: Platform.OS === 'web' ? ('100vh' as any) : '100%',
    backgroundColor: '#FAF7F2',
    position: 'relative',
  },
  contentViewport: {
    flex: 1,
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingBottom: 0,
  },
});
