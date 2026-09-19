import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Platform,
} from 'react-native';
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
  const [activeChatPartner, setActiveChatPartner] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isProfileSubScreenActive, setIsProfileSubScreenActive] = useState(false);
  const [profileSubScreen, setProfileSubScreen] = useState<
    'none' | 'account' | 'preferences' | 'safety' | 'settings' | 'preview'
  >('none');

  const handleOpenFilter = () => {
    setShowPreferences(true);
  };

  // If a chat is active, display the full Chat Direct screen
  if (activeChatPartner) {
    return (
      <ChatScreen
        partnerName={activeChatPartner}
        user={user}
        onBack={() => setActiveChatPartner(null)}
      />
    );
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
          likesCount={9}
          hasUnreadMatches={true}
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
        {activeTab === 'discover' && <DiscoverScreen user={user} />}
        {activeTab === 'likes' && <LikesScreen user={user} />}
        {activeTab === 'matches' && (
          <MatchesScreen
            user={user}
            onOpenChat={(name) => setActiveChatPartner(name)}
          />
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
        likesCount={9}
        hasUnreadMatches={true}
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
