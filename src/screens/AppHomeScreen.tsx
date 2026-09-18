import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { DotGridBackground } from '../components/DotGridBackground';
import { BrutalBox } from '../components/BrutalBox';
import { InAppTopHeader } from '../components/InAppTopHeader';
import { InAppBottomNav, InAppTab } from '../components/InAppBottomNav';
import { DiscoverScreen } from './inapp/DiscoverScreen';
import { LikesScreen } from './inapp/LikesScreen';
import { MatchesScreen } from './inapp/MatchesScreen';
import { ProfileScreen } from './inapp/ProfileScreen';
import { ChatScreen } from './inapp/ChatScreen';
import { UserAccount } from '../services/authDb';

interface AppHomeScreenProps {
  user: UserAccount;
  onLogout: () => void;
  onSwitchToDemo: (demo: 'alex' | 'sam') => void;
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10);
  const [ageRange, setAgeRange] = useState('21 - 32');

  const handleOpenFilter = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilter = () => {
    setShowFilterModal(false);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <DotGridBackground />

      {/* 1. Universal Neo-Brutalist Top Header */}
      <InAppTopHeader
        user={user}
        onPressFilter={handleOpenFilter}
        onPressAvatar={() => setActiveTab('profile')}
      />

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
            onReplayOnboarding={onReplayOnboarding}
          />
        )}
      </View>

      {/* 3. Universal Neo-Brutalist Bottom Tab Bar */}
      <InAppBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        likesCount={9}
        hasUnreadMatches={true}
      />

      {/* Filter Modal / Sheet */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseFilter}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBackdrop} />
          <View style={styles.modalContent}>
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.6}
              borderRadius={24}
              shadowOffset={4}
              style={styles.filterModalCard}
            >
              {/* Header */}
              <View style={styles.filterModalHeader}>
                <View style={styles.filterTitleGroup}>
                  <Feather name="sliders" size={18} color={colors.textDark} />
                  <Text style={styles.filterModalTitle}>DISCOVERY FILTERS</Text>
                </View>
                <TouchableOpacity onPress={handleCloseFilter}>
                  <View style={styles.closeCircle}>
                    <Ionicons name="close" size={18} color={colors.textDark} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Distance Slider / Controls */}
              <View style={styles.filterSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionLabel}>MAXIMUM DISTANCE</Text>
                  <Text style={styles.sectionValue}>{maxDistance} KM</Text>
                </View>
                <View style={styles.distanceChips}>
                  {[5, 10, 25, 50].map((dist) => (
                    <TouchableOpacity
                      key={dist}
                      activeOpacity={0.8}
                      onPress={() => setMaxDistance(dist)}
                    >
                      <View
                        style={[
                          styles.distPill,
                          maxDistance === dist && styles.distPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.distPillText,
                            maxDistance === dist && styles.distPillTextActive,
                          ]}
                        >
                          {dist} KM
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Age Range */}
              <View style={styles.filterSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionLabel}>AGE RANGE</Text>
                  <Text style={styles.sectionValue}>{ageRange}</Text>
                </View>
                <View style={styles.distanceChips}>
                  {['18 - 25', '21 - 32', '28 - 40', 'Any'].map((range) => (
                    <TouchableOpacity
                      key={range}
                      activeOpacity={0.8}
                      onPress={() => setAgeRange(range)}
                    >
                      <View
                        style={[
                          styles.distPill,
                          ageRange === range && styles.distPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.distPillText,
                            ageRange === range && styles.distPillTextActive,
                          ]}
                        >
                          {range}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Verified Only Toggle */}
              <View style={styles.verifiedRow}>
                <View style={styles.verifiedInfo}>
                  <Text style={styles.verifiedTitle}>100% REAL HUMANS ONLY</Text>
                  <Text style={styles.verifiedSub}>Filter out unverified accounts</Text>
                </View>
                <View style={styles.toggleActive}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              </View>

              {/* Apply Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCloseFilter}
                style={styles.applyButtonWrapper}
              >
                <BrutalBox
                  backgroundColor={colors.accentYellow}
                  borderColor={colors.borderBlack}
                  borderWidth={2.4}
                  borderRadius={16}
                  shadowOffset={3}
                  style={styles.applyButton}
                >
                  <Text style={styles.applyButtonText}>APPLY FILTERS</Text>
                </BrutalBox>
              </TouchableOpacity>
            </BrutalBox>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  contentViewport: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    padding: 16,
    paddingBottom: 24,
  },
  filterModalCard: {
    padding: 20,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterModalTitle: {
    fontSize: 18,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.primaryPink,
  },
  distanceChips: {
    flexDirection: 'row',
    gap: 8,
  },
  distPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    backgroundColor: '#FAF7F2',
  },
  distPillActive: {
    backgroundColor: colors.accentYellow,
  },
  distPillText: {
    fontSize: 12,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
  },
  distPillTextActive: {
    fontFamily: typography.bodyExtraBold,
  },
  verifiedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1.2,
    borderBottomWidth: 1.2,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  verifiedInfo: {},
  verifiedTitle: {
    fontSize: 13,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
  },
  verifiedSub: {
    fontSize: 11,
    fontFamily: typography.bodyMedium,
    color: '#6B7280',
    marginTop: 2,
  },
  toggleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryPink,
    borderWidth: 1.8,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonWrapper: {
    width: '100%',
  },
  applyButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 17,
    fontFamily: typography.headingHero,
    color: colors.textDark,
    letterSpacing: 0.6,
  },
});
