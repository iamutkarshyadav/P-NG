import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, {
  Circle,
  Path,
  G,
} from 'react-native-svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { LAYOUT } from '../../theme/responsive';
import { BrutalBox } from '../../components/BrutalBox';
import { DotGridBackground } from '../../components/DotGridBackground';
import { UserAccount } from '../../services/authDb';

interface ChatScreenProps {
  partnerName?: string;
  user: UserAccount;
  onBack: () => void;
}

interface MessageItem {
  id: string;
  sender: 'partner' | 'user';
  text?: string;
  time: string;
  readStatus?: boolean;
}

// Mini Teal Avatar for Chat Header
function MiniTealAvatar() {
  return (
    <Svg width="36" height="36" viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="19" fill="#0D9488" />
      <G transform="translate(4, 3)">
        <Circle cx="16" cy="15" r="12" fill="#06B6D4" />
        <Circle cx="16" cy="16" r="8" fill="#FED7AA" />
        <Path d="M 9 14 Q 16 9 23 14 Q 20 12 16 13 Q 12 12 9 14 Z" fill="#06B6D4" />
        <Circle cx="13" cy="16" r="1.2" fill="#18181B" />
        <Circle cx="19" cy="16" r="1.2" fill="#18181B" />
        <Path d="M 14.5 19 Q 16 21 17.5 19" fill="none" stroke="#E11D48" strokeWidth="1" strokeLinecap="round" />
        <Path d="M 5 30 L 9 23 Q 16 21 23 23 L 27 30 Z" fill="#F59E0B" stroke="#000" strokeWidth="1" />
      </G>
    </Svg>
  );
}

// Detailed Priya Avatar for Contact Card
function PriyaChatAvatar() {
  return (
    <Svg width="54" height="54" viewBox="0 0 60 60">
      <Circle cx="30" cy="30" r="28" fill="#FCE7F3" />
      <G transform="translate(5, 5)">
        {/* Dark bob hair */}
        <Path d="M 8 18 Q 25 6 42 18 L 45 45 Q 25 50 5 45 Z" fill="#18181B" />
        {/* Face */}
        <Circle cx="25" cy="25" r="13" fill="#FED7AA" />
        {/* Glasses */}
        <Circle cx="19" cy="24" r="4.5" fill="none" stroke="#000" strokeWidth="1.4" />
        <Circle cx="31" cy="24" r="4.5" fill="none" stroke="#000" strokeWidth="1.4" />
        <Path d="M 23.5 24 L 26.5 24" stroke="#000" strokeWidth="1.4" />
        {/* Eyes behind glasses */}
        <Circle cx="19" cy="24" r="1.5" fill="#18181B" />
        <Circle cx="31" cy="24" r="1.5" fill="#18181B" />
        {/* Wide happy smile */}
        <Path d="M 19 30 Q 25 36 31 30" fill="none" stroke="#E11D48" strokeWidth="1.8" strokeLinecap="round" />
        <Path d="M 21 31 Q 25 34 29 31" fill="#FFF" />
        {/* Yellow Jacket with collar */}
        <Path d="M 5 48 L 12 36 Q 25 34 38 36 L 45 48 Z" fill="#FFE600" stroke="#000" strokeWidth="1.5" />
        <Path d="M 18 36 L 25 44 L 32 36" fill="#18181B" />
      </G>
    </Svg>
  );
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  partnerName = 'Priya',
  onBack,
}) => {
  const [showWarning, setShowWarning] = useState(true);
  const [isPhotoUnlocked, setIsPhotoUnlocked] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [inputText, setInputText] = useState('');
  const [customMessages, setCustomMessages] = useState<MessageItem[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;

    const newMsg: MessageItem = {
      id: String(Date.now()),
      sender: 'user',
      text: text.trim(),
      time: timeStr,
      readStatus: true,
    };

    setCustomMessages((prev) => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handlePromptTap = () => {
    const promptText = 'Cowboy Bebop, Samurai Champloo, and Evangelion! What about you?';
    handleSendMessage(promptText);
  };

  const handleCall = () => {
    Alert.alert('📞 Direct Audio Call', `Calling ${partnerName}... Voice call feature coming soon!`);
  };

  const handleSafetyCenter = () => {
    Alert.alert(
      '🛡️ Safety & Verification',
      `${partnerName} is 100% verified with selfie authentication. Never send money or share personal passwords.`
    );
  };

  const handleTogglePhotoReveal = () => {
    if (!isPhotoUnlocked) {
      setIsPhotoUnlocked(true);
      Alert.alert('🔓 Both Tapped to Reveal!', 'Ephemeral photo unlocked for 10 seconds.');
    } else {
      setIsPhotoUnlocked(false);
    }
  };

  const handleToggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <DotGridBackground />

      {/* 1. TOP HEADER BAR matching ref/inAppChat.png */}
      <View style={styles.topHeaderBar}>
        {/* Back Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onBack}
          style={styles.backIconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={26} color={colors.textDark} />
        </TouchableOpacity>

        {/* Center Title */}
        <Text style={styles.chatDirectTitle}>CHAT DIRECT</Text>

        {/* Right Actions: Options Menu & Avatar */}
        <View style={styles.topRightRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert('Options', 'Chat Options:\n• Clear chat\n• Mute notifications\n• Block or report user')
            }
            style={styles.moreIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={colors.textDark} />
          </TouchableOpacity>

          <View style={styles.headerAvatarWrap}>
            <MiniTealAvatar />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 2. PARTNER CONTACT CARD */}
          <BrutalBox
            backgroundColor="#FFFFFF"
            borderColor={colors.borderBlack}
            borderWidth={2.4}
            borderRadius={18}
            shadowOffset={{ x: 3.5, y: 3.5 }}
            contentStyle={styles.contactCardContent}
          >
            <View style={styles.contactCardRow}>
              {/* Avatar with Online Dot */}
              <View style={styles.contactAvatarWrap}>
                <View style={styles.contactAvatarBorder}>
                  <PriyaChatAvatar />
                </View>
                <View style={styles.onlineDot} />
              </View>

              {/* Name & Active Status Pill */}
              <View style={styles.contactInfoCol}>
                <Text style={styles.contactName}>{partnerName.toUpperCase()}, 27</Text>
                <View style={styles.activePill}>
                  <View style={styles.greenActiveDot} />
                  <Text style={styles.activePillText}>ACTIVE TODAY</Text>
                </View>
              </View>

              {/* Action Buttons: Phone & Shield */}
              <View style={styles.contactActionsRow}>
                <TouchableOpacity activeOpacity={0.8} onPress={handleCall}>
                  <BrutalBox
                    backgroundColor="#FFFFFF"
                    borderColor={colors.borderBlack}
                    borderWidth={2}
                    borderRadius={999}
                    shadowOffset={{ x: 2, y: 2 }}
                    contentStyle={styles.actionRoundBtn}
                  >
                    <Ionicons name="call-outline" size={17} color={colors.textDark} />
                  </BrutalBox>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={handleSafetyCenter}>
                  <BrutalBox
                    backgroundColor="#FFFFFF"
                    borderColor={colors.borderBlack}
                    borderWidth={2}
                    borderRadius={999}
                    shadowOffset={{ x: 2, y: 2 }}
                    contentStyle={styles.actionRoundBtn}
                  >
                    <Ionicons name="shield-outline" size={17} color={colors.textDark} />
                  </BrutalBox>
                </TouchableOpacity>
              </View>
            </View>
          </BrutalBox>

          {/* 3. SAFETY WARNING BANNER */}
          {showWarning && (
            <BrutalBox
              backgroundColor={colors.primaryPink}
              borderColor={colors.borderBlack}
              borderWidth={2}
              borderRadius={12}
              shadowOffset={{ x: 2.5, y: 2.5 }}
              style={styles.warningContainer}
              contentStyle={styles.warningContent}
            >
              <View style={styles.warningLeftRow}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText} numberOfLines={1}>
                  KEEP CHATS IN P!NG. NEVER SEND MONE...
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowWarning(false)}
                style={styles.closeWarningBtn}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </BrutalBox>
          )}

          {/* 4. TIMESTAMP PILL */}
          <View style={styles.timestampContainer}>
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={1.8}
              borderRadius={999}
              shadowOffset={{ x: 2, y: 2 }}
              contentStyle={styles.timestampPill}
            >
              <Feather name="clock" size={12} color={colors.primaryPink} />
              <Text style={styles.timestampText}>TODAY 12:38 PM</Text>
            </BrutalBox>
          </View>

          {/* 5. INCOMING MESSAGE 1 (Priya, 12:40 PM) */}
          <View style={styles.incomingMsgContainer}>
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={18}
              shadowOffset={{ x: 3, y: 3 }}
              style={styles.incomingBubbleBox}
              contentStyle={styles.incomingBubbleContent}
            >
              <Text style={styles.incomingMsgText}>
                Let’s check out that flea market on Sunday! Heard they have tons of rare Japanese vinyl 🎶
              </Text>
            </BrutalBox>
            <Text style={styles.incomingSubTime}>12:40 PM</Text>
          </View>

          {/* 6. OUTGOING MESSAGE 1 (Alex, 12:41 PM) */}
          <View style={styles.outgoingMsgContainer}>
            <BrutalBox
              backgroundColor={colors.primaryPink}
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={18}
              shadowOffset={{ x: 3, y: 3 }}
              style={styles.outgoingBubbleBox}
              contentStyle={styles.outgoingBubbleContent}
            >
              <Text style={styles.outgoingMsgText}>
                Count me in! I’ll bring my portable turntable if you bring coffee ☕⚡
              </Text>
            </BrutalBox>
            <View style={styles.outgoingSubTimeRow}>
              <Text style={styles.outgoingSubTime}>12:41 PM</Text>
              <MaterialCommunityIcons name="check-all" size={15} color={colors.primaryPink} />
            </View>
          </View>

          {/* 7. EPHEMERAL "BOTH TAP TO REVEAL" MEDIA CARD (12:43 PM) */}
          <View style={styles.mediaCardContainer}>
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={18}
              shadowOffset={{ x: 3.5, y: 3.5 }}
              overflow="hidden"
              style={styles.mediaCardBox}
              contentStyle={styles.mediaCardContent}
            >
              {/* Lavender Upper Body with Ephemeral Tag */}
              <View style={styles.ephemeralArea}>
                {/* Ephemeral Tag */}
                <View style={styles.ephemeralTagWrap}>
                  <BrutalBox
                    backgroundColor={colors.accentYellow}
                    borderColor={colors.borderBlack}
                    borderWidth={1.8}
                    borderRadius={6}
                    shadowOffset={{ x: 1.8, y: 1.8 }}
                    contentStyle={styles.ephemeralTagContent}
                  >
                    <Text style={styles.ephemeralTagText}>EPHEMERAL</Text>
                  </BrutalBox>
                </View>

                {/* Central Lock Graphic */}
                <View style={styles.lockGraphicCircle}>
                  <Ionicons name="lock-closed" size={24} color={colors.primaryPink} />
                </View>

                {/* Unlock Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleTogglePhotoReveal}
                  style={styles.unlockBtnWrapper}
                >
                  <BrutalBox
                    backgroundColor="#FFFFFF"
                    borderColor={colors.borderBlack}
                    borderWidth={2}
                    borderRadius={999}
                    shadowOffset={{ x: 2.2, y: 2.2 }}
                    contentStyle={styles.unlockBtnContent}
                  >
                    <Text style={styles.unlockBtnEmoji}>🔒</Text>
                    <Text style={styles.unlockBtnText}>
                      {isPhotoUnlocked ? 'PHOTO UNLOCKED (TAP TO HIDE)' : 'BOTH TAP TO REVEAL'}
                    </Text>
                  </BrutalBox>
                </TouchableOpacity>

                <Text style={styles.ephemeralSubtitle}>
                  {isPhotoUnlocked
                    ? '✨ Record stash unlocked safely!'
                    : 'Tap together to unlock photo safely'}
                </Text>
              </View>

              {/* Bottom White Footer */}
              <View style={styles.mediaFooterRow}>
                <Text style={styles.mediaFooterTitle}>RECORD STASH PREVIEW.PNG</Text>
                <Text style={styles.mediaFooterTime}>12:43 PM</Text>
              </View>
            </BrutalBox>
          </View>

          {/* 8. OUTGOING AUDIO P!NG VOICE NOTE BUBBLE (12:44 PM) */}
          <View style={styles.outgoingMsgContainer}>
            <BrutalBox
              backgroundColor={colors.primaryPink}
              borderColor={colors.borderBlack}
              borderWidth={2.4}
              borderRadius={18}
              shadowOffset={{ x: 3, y: 3 }}
              style={styles.audioBubbleBox}
              contentStyle={styles.audioBubbleContent}
            >
              <View style={styles.audioBubbleRow}>
                {/* Play Button */}
                <TouchableOpacity activeOpacity={0.8} onPress={handleToggleAudio}>
                  <View style={styles.audioPlayBtn}>
                    <Ionicons
                      name={isPlayingAudio ? 'pause' : 'play'}
                      size={18}
                      color={colors.textDark}
                      style={{ marginLeft: isPlayingAudio ? 0 : 2 }}
                    />
                  </View>
                </TouchableOpacity>

                {/* Waveform Visualization */}
                <View style={styles.waveformContainer}>
                  <View style={[styles.waveBar, { height: 12, backgroundColor: '#FFE600' }]} />
                  <View style={[styles.waveBar, { height: 20, backgroundColor: '#FFFFFF' }]} />
                  <View style={[styles.waveBar, { height: 14, backgroundColor: '#FFE600' }]} />
                  <View style={[styles.waveBar, { height: 24, backgroundColor: '#FFFFFF' }]} />
                  <View style={[styles.waveBar, { height: 18, backgroundColor: '#FFE600' }]} />
                  <View style={[styles.waveBar, { height: 26, backgroundColor: '#FFFFFF' }]} />
                  <View style={[styles.waveBar, { height: 15, backgroundColor: '#FFE600' }]} />
                  <View style={[styles.waveBar, { height: 22, backgroundColor: '#FFFFFF' }]} />
                  <View style={[styles.waveBar, { height: 16, backgroundColor: '#FFE600' }]} />
                  <View style={[styles.waveBar, { height: 10, backgroundColor: '#FFFFFF' }]} />
                </View>
              </View>

              {/* Audio Subtitle Line */}
              <View style={styles.audioSubRow}>
                <Text style={styles.audioDurationText}>0:24</Text>
                <Text style={styles.audioPingBrand}>AUDIO P!NG</Text>
              </View>
            </BrutalBox>

            <View style={styles.outgoingSubTimeRow}>
              <Text style={styles.outgoingSubTime}>12:44 PM • READ</Text>
              <MaterialCommunityIcons name="check-all" size={15} color={colors.primaryPink} />
            </View>
          </View>

          {/* 9. ICEBREAKER PROMPT BANNER */}
          <TouchableOpacity activeOpacity={0.85} onPress={handlePromptTap}>
            <BrutalBox
              backgroundColor={colors.accentYellow}
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={16}
              shadowOffset={{ x: 3, y: 3 }}
              style={styles.promptContainer}
              contentStyle={styles.promptContent}
            >
              <Ionicons name="flash" size={16} color={colors.primaryPink} />
              <Text style={styles.promptText}>
                PROMPT: SHARE YOUR TOP 3 ANIME SOUNDTRACKS
              </Text>
            </BrutalBox>
          </TouchableOpacity>

          {/* 10. DYNAMIC SENT MESSAGES */}
          {customMessages.map((msg) => (
            <View key={msg.id} style={styles.outgoingMsgContainer}>
              <BrutalBox
                backgroundColor={colors.primaryPink}
                borderColor={colors.borderBlack}
                borderWidth={2.2}
                borderRadius={18}
                shadowOffset={{ x: 3, y: 3 }}
                style={styles.outgoingBubbleBox}
                contentStyle={styles.outgoingBubbleContent}
              >
                <Text style={styles.outgoingMsgText}>{msg.text}</Text>
              </BrutalBox>
              <View style={styles.outgoingSubTimeRow}>
                <Text style={styles.outgoingSubTime}>{msg.time}</Text>
                <MaterialCommunityIcons name="check-all" size={15} color={colors.primaryPink} />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* 11. BOTTOM INPUT BAR matching ref/inAppChat.png */}
        <View style={styles.inputBarContainer}>
          {/* Camera Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert('📷 Camera', 'Snap an ephemeral safe photo!')}
          >
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2}
              borderRadius={999}
              shadowOffset={{ x: 2.2, y: 2.2 }}
              contentStyle={styles.inputRoundBtn}
            >
              <Feather name="camera" size={19} color={colors.textDark} />
            </BrutalBox>
          </TouchableOpacity>

          {/* Text Input Pill */}
          <View style={styles.textInputBox}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Send a p!ng..."
              placeholderTextColor="#6B7280"
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
            />
          </View>

          {/* Voice Mic Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert('🎙️ Voice Note', 'Hold to record an Audio P!NG!')}
          >
            <BrutalBox
              backgroundColor="#FFFFFF"
              borderColor={colors.borderBlack}
              borderWidth={2}
              borderRadius={999}
              shadowOffset={{ x: 2.2, y: 2.2 }}
              contentStyle={styles.inputRoundBtn}
            >
              <Feather name="mic" size={19} color={colors.textDark} />
            </BrutalBox>
          </TouchableOpacity>

          {/* Send / Lightning Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleSendMessage()}
          >
            <BrutalBox
              backgroundColor={colors.accentYellow}
              borderColor={colors.borderBlack}
              borderWidth={2.2}
              borderRadius={999}
              shadowOffset={{ x: 2.5, y: 2.5 }}
              contentStyle={styles.sendFlashBtn}
            >
              <Ionicons name="flash" size={20} color={colors.textDark} />
            </BrutalBox>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  keyboardContainer: {
    flex: 1,
  },

  /* Top Bar */
  topHeaderBar: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FAF7F2',
  },
  backIconButton: {
    padding: 4,
  },
  chatDirectTitle: {
    fontSize: 26,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.8,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreIconButton: {
    padding: 4,
  },
  headerAvatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },

  /* Scroll Content */
  scrollContent: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },

  /* Partner Contact Card */
  contactCardContent: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  contactCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  contactAvatarBorder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.2,
    borderColor: colors.borderBlack,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contactInfoCol: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    fontSize: 20,
    fontFamily: typography.headline,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderWidth: 1.5,
    borderColor: colors.borderBlack,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    gap: 5,
  },
  greenActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  activePillText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: '#065F46',
    letterSpacing: 0.4,
  },
  contactActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionRoundBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Safety Warning Banner */
  warningContainer: {
    width: '100%',
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  warningLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  warningIcon: {
    fontSize: 16,
  },
  warningText: {
    fontSize: 11.5,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  closeWarningBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  /* Timestamp Pill */
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  timestampPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
    backgroundColor: '#FFFDF8',
  },
  timestampText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.4,
  },

  /* Incoming Message */
  incomingMsgContainer: {
    alignSelf: 'flex-start',
    maxWidth: '84%',
  },
  incomingBubbleBox: {
    width: '100%',
  },
  incomingBubbleContent: {
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  incomingMsgText: {
    fontSize: 14.5,
    fontFamily: typography.bodyBold,
    color: colors.textDark,
    lineHeight: 20,
  },
  incomingSubTime: {
    fontSize: 11,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },

  /* Outgoing Message */
  outgoingMsgContainer: {
    alignSelf: 'flex-end',
    maxWidth: '84%',
    alignItems: 'flex-end',
  },
  outgoingBubbleBox: {
    width: '100%',
  },
  outgoingBubbleContent: {
    padding: 14,
    backgroundColor: colors.primaryPink,
  },
  outgoingMsgText: {
    fontSize: 14.5,
    fontFamily: typography.bodyBold,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  outgoingSubTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginRight: 4,
  },
  outgoingSubTime: {
    fontSize: 11,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
  },

  /* Ephemeral Media Card */
  mediaCardContainer: {
    width: '88%',
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  mediaCardBox: {
    width: '100%',
  },
  mediaCardContent: {
    backgroundColor: '#FFFFFF',
  },
  ephemeralArea: {
    backgroundColor: '#C7D2FE',
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ephemeralTagWrap: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  ephemeralTagContent: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ephemeralTagText: {
    fontSize: 9.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  lockGraphicCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginBottom: 12,
  },
  unlockBtnWrapper: {
    width: '100%',
  },
  unlockBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  unlockBtnEmoji: {
    fontSize: 13,
  },
  unlockBtnText: {
    fontSize: 12.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  ephemeralSubtitle: {
    fontSize: 11.5,
    fontFamily: typography.bodyBold,
    color: '#4338CA',
    marginTop: 8,
  },
  mediaFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  mediaFooterTitle: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  mediaFooterTime: {
    fontSize: 11,
    fontFamily: typography.bodyBold,
    color: '#6B7280',
  },

  /* Audio P!NG Bubble */
  audioBubbleBox: {
    width: 210,
  },
  audioBubbleContent: {
    padding: 12,
    backgroundColor: colors.primaryPink,
  },
  audioBubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.borderBlack,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1.8, height: 1.8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 28,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    borderWidth: 0.8,
    borderColor: colors.borderBlack,
  },
  audioSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
  },
  audioDurationText: {
    fontSize: 11,
    fontFamily: typography.bodyExtraBold,
    color: '#FFFFFF',
  },
  audioPingBrand: {
    fontSize: 10,
    fontFamily: typography.bodyExtraBold,
    color: colors.accentYellow,
    letterSpacing: 0.5,
  },

  /* Icebreaker Prompt */
  promptContainer: {
    width: '100%',
    marginVertical: 4,
  },
  promptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  promptText: {
    fontSize: 12.5,
    fontFamily: typography.bodyExtraBold,
    color: colors.textDark,
    letterSpacing: 0.3,
  },

  /* Bottom Input Bar */
  inputBarContainer: {
    width: '100%',
    maxWidth: LAYOUT.shellMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#FAF7F2',
    gap: 8,
  },
  inputRoundBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputBox: {
    flex: 1,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textInput: {
    fontSize: 14,
    fontFamily: typography.bodySemiBold,
    color: colors.textDark,
  },
  sendFlashBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
