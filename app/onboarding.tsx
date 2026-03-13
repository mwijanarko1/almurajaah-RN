import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import {
  getAllSurahOccurrences,
  getSurahOccurrencesByJuz,
} from '@/lib/services/quranData';
import {
  requestNotificationPermissions,
  scheduleRevisionNotifications,
} from '@/lib/services/notifications';
import { useAppStore } from '@/store/app';

// Onboarding steps matching SwiftUI app
const onboardingSteps = [
  { title: "Al Muraja'ah", subtitle: 'Never forget your memorization again' },
  { title: 'What Should We Call You?', subtitle: "Let's personalize your experience" },
  { title: 'Select Your Memorized Surahs', subtitle: "Tell us what you've already memorized" },
  { title: 'Set Your Revision Cycle', subtitle: 'How often would you like to review?' },
  { title: "You're Ready to Start!", subtitle: 'Begin your Quran revision journey' },
];

// Revision cycle options matching SwiftUI
const revisionOptions = [
  { days: 3, title: 'Every 3 Days', subtitle: 'Intensive', description: 'For new memorizers or challenging portions' },
  { days: 7, title: 'Every Week', subtitle: 'Balanced', description: 'Recommended for most users' },
  { days: 10, title: 'Every 10 Days', subtitle: 'Relaxed', description: 'For well-established memorization' },
  { days: 14, title: 'Every 2 Weeks', subtitle: 'Minimal', description: 'For very strong memorization' },
];

// Juz data for organized surah selection
const JUZ_DATA = Array.from({ length: 30 }, (_, i) => {
  const juzNumber = i + 1;
  const surahs = getSurahOccurrencesByJuz(juzNumber);
  return {
    juzNumber,
    surahs,
  };
}).filter((juz) => juz.surahs.length > 0);

export default function OnboardingScreen() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const settings = useAppStore((state) => state.settings);
  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedSurahs, setSelectedSurahs] = useState<Set<number>>(new Set());
  const [expandedJuz, setExpandedJuz] = useState<Set<number>>(new Set());
  const [revisionCycleDays, setRevisionCycleDays] = useState(7);
  const [showContent, setShowContent] = useState(false);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleScale = useRef(new Animated.Value(0.8)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.8)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isSurahStep = step === 2;
  const isRevisionCycleStep = step === 3;
  const isReadyStep = step === 4;

  // Welcome page animations
  useEffect(() => {
    if (step === 0) {
      setShowContent(true);
      // Reset animations
      logoScale.setValue(0.7);
      logoOpacity.setValue(0);
      titleScale.setValue(0.8);
      titleOpacity.setValue(0);
      subtitleScale.setValue(0.8);
      subtitleOpacity.setValue(0);
      buttonScale.setValue(0.8);
      buttonOpacity.setValue(0);

      // Staggered animations
      Animated.sequence([
        Animated.parallel([
          Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 40 }),
          Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(titleScale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 40 }),
          Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(subtitleScale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 40 }),
          Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 40 }),
          Animated.timing(buttonOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();

      // Arrow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, { toValue: 3, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(arrowAnim, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();

      // Pulse animation for button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 1250, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1250, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [step]);

  // Other pages content animation
  useEffect(() => {
    if (step > 0) {
      setShowContent(false);
      setTimeout(() => setShowContent(true), 50);
    }
  }, [step]);

  const selectedCount = selectedSurahs.size;

  const handleFinish = useCallback(async () => {
    await completeOnboarding({
      userName,
      memorizedSurahIds: Array.from(selectedSurahs),
      revisionCycleDays,
    });
    await requestNotificationPermissions();
    if (settings) {
      await scheduleRevisionNotifications({
        preferences: settings.notifications,
        todayPages: 0,
        dueCount: selectedSurahs.size,
      });
    }
    router.replace('/(tabs)');
  }, [completeOnboarding, userName, selectedSurahs, revisionCycleDays, settings]);

  const toggleSurah = (surahNumber: number) => {
    setSelectedSurahs((current) => {
      const next = new Set(current);
      if (next.has(surahNumber)) {
        next.delete(surahNumber);
      } else {
        next.add(surahNumber);
      }
      return next;
    });
  };

  const toggleJuz = (juzNumber: number) => {
    const juzData = JUZ_DATA.find((j) => j.juzNumber === juzNumber);
    if (!juzData) return;

    const juzSurahNumbers = juzData.surahs.map((s) => s.surahNumber);
    const allSelected = juzSurahNumbers.every((num) => selectedSurahs.has(num));

    setSelectedSurahs((current) => {
      const next = new Set(current);
      if (allSelected) {
        // Deselect all surahs in this juz
        juzSurahNumbers.forEach((num) => next.delete(num));
      } else {
        // Select all surahs in this juz
        juzSurahNumbers.forEach((num) => next.add(num));
      }
      return next;
    });
  };

  const selectAllSurahs = () => {
    const allSurahNumbers = JUZ_DATA.flatMap((j) => j.surahs.map((s) => s.surahNumber));
    const hasAnySelected = selectedSurahs.size > 0;
    if (hasAnySelected) {
      setSelectedSurahs(new Set());
    } else {
      setSelectedSurahs(new Set(allSurahNumbers));
    }
  };

  const toggleExpandJuz = (juzNumber: number) => {
    setExpandedJuz((current) => {
      const next = new Set(current);
      if (next.has(juzNumber)) {
        next.delete(juzNumber);
      } else {
        next.add(juzNumber);
      }
      return next;
    });
  };

  const isJuzSelected = (juzNumber: number) => {
    const juzData = JUZ_DATA.find((j) => j.juzNumber === juzNumber);
    if (!juzData) return false;
    const juzSurahNumbers = juzData.surahs.map((s) => s.surahNumber);
    return juzSurahNumbers.every((num) => selectedSurahs.has(num));
  };

  const isSurahSelected = (surahNumber: number) => selectedSurahs.has(surahNumber);

  const goToNextStep = () => {
    if (step < 4) {
      setStep((current) => current + 1);
    }
  };

  const goToPrevStep = () => {
    if (step > 0) {
      setStep((current) => current - 1);
    }
  };

  // Welcome Page (Step 0)
  const renderWelcomePage = () => (
    <View style={styles.welcomeContainer}>
      {/* Background gradient effect */}
      <View style={styles.gradientBackground} />

      {/* Main content */}
      <View style={styles.welcomeContent}>
        <View style={styles.spacer} />

        {/* Hero section */}
        <View style={styles.heroSection}>
          {/* Logo with shimmer effect */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <Image
              contentFit="cover"
              source={require("@/assets/Al Muraja'ah Logo.png")}
              style={styles.logoImage}
            />
            {/* Breathing animation overlay */}
            <Animated.View
              style={[
                styles.logoGlow,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          </Animated.View>

          {/* Title section */}
          <View style={styles.titleSection}>
            <Animated.Text
              style={[
                styles.welcomeTitle,
                {
                  transform: [{ scale: titleScale }],
                  opacity: titleOpacity,
                },
              ]}
            >
              Al Muraja'ah
            </Animated.Text>

            <Animated.Text
              style={[
                styles.welcomeSubtitle,
                {
                  transform: [{ scale: subtitleScale }],
                  opacity: subtitleOpacity,
                },
              ]}
            >
              Never forget your memorization again
            </Animated.Text>
          </View>
        </View>

        <View style={styles.spacer} />

        {/* CTA Section */}
        <Animated.View
          style={[
            styles.ctaSection,
            {
              transform: [{ scale: buttonScale }],
              opacity: buttonOpacity,
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={goToNextStep}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonLabel}>Get Started</Text>
              <Animated.Text style={[styles.arrow, { transform: [{ translateX: arrowAnim }] }]}>
                →
              </Animated.Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );

  // Name Input Page (Step 1)
  const renderNameInputPage = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.pageContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageContent}>
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            <Text style={styles.pageIcon}>👤</Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            style={[
              styles.pageTitle,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            {onboardingSteps[1].title}
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            style={[
              styles.pageSubtitle,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            {onboardingSteps[1].subtitle}
          </Animated.Text>

          {/* Input */}
          <Animated.View
            style={[
              styles.inputContainer,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            <TextInput
              autoCapitalize="words"
              autoFocus
              onChangeText={setUserName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(137, 191, 159, 0.6)"
              returnKeyType="done"
              style={styles.nameInput}
              value={userName}
            />
          </Animated.View>

          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View
            style={{
              opacity: showContent ? 1 : 0,
              transform: [{ scale: showContent ? 1 : 0.8 }],
            }}
          >
            <Pressable
              disabled={!userName.trim()}
              onPress={goToNextStep}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                !userName.trim() && styles.disabled,
              ]}
            >
              <Text style={[styles.primaryButtonLabel, !userName.trim() && styles.disabledLabel]}>
                Continue
              </Text>
              <Text style={[styles.arrow, !userName.trim() && styles.disabledLabel]}>→</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Surah Selection Page (Step 2)
  const renderSurahSelectionPage = () => (
    <View style={styles.surahPageContainer}>
      {/* Header */}
      <View style={styles.surahHeader}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: showContent ? 1 : 0,
              transform: [{ scale: showContent ? 1 : 0.8 }],
            },
          ]}
        >
          <Text style={styles.pageIcon}>✓</Text>
        </Animated.View>

        <Animated.Text
          style={[
            styles.pageTitle,
            {
              opacity: showContent ? 1 : 0,
              transform: [{ scale: showContent ? 1 : 0.8 }],
            },
          ]}
        >
          {onboardingSteps[2].title}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.pageSubtitle,
            {
              opacity: showContent ? 1 : 0,
              transform: [{ scale: showContent ? 1 : 0.8 }],
            },
          ]}
        >
          {onboardingSteps[2].subtitle}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.pageDescription,
            {
              opacity: showContent ? 1 : 0,
              transform: [{ scale: showContent ? 1 : 0.8 }],
            },
          ]}
        >
          This helps us create a personalized review schedule for you.
        </Animated.Text>

        {/* Select/Deselect All Button */}
        <Animated.View
          style={{
            opacity: showContent ? 1 : 0,
            transform: [{ scale: showContent ? 1 : 0.8 }],
          }}
        >
          <Pressable onPress={selectAllSurahs} style={styles.selectAllButton}>
            <Text style={styles.selectAllIcon}>{selectedCount > 0 ? '☑' : '☐'}</Text>
            <Text style={styles.selectAllText}>
              {selectedCount > 0 ? 'Deselect All' : 'Select All'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Juz List */}
      <View style={styles.juzListContainer}>
        <FlashList
          data={JUZ_DATA}
          estimatedItemSize={80}
          keyExtractor={(item) => String(item.juzNumber)}
          renderItem={({ item: juz, index }) => {
            const isExpanded = expandedJuz.has(juz.juzNumber);
            const juzSelected = isJuzSelected(juz.juzNumber);

            return (
              <Animated.View
                style={{
                  opacity: showContent ? 1 : 0,
                  transform: [{ scale: showContent ? 1 : 0.8 }],
                }}
                // @ts-ignore - React Native Web doesn't support animation delay in style
                delay={index * 100}
              >
                {/* Juz Header */}
                <Pressable
                  onPress={() => toggleExpandJuz(juz.juzNumber)}
                  style={[styles.juzHeader, juzSelected && styles.juzHeaderSelected]}
                >
                  <View style={styles.juzHeaderLeft}>
                    <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                    <Text style={styles.juzTitle}>Juz {juz.juzNumber}</Text>
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleJuz(juz.juzNumber);
                    }}
                    style={styles.juzToggle}
                  >
                    <View style={[styles.toggleTrack, juzSelected && styles.toggleTrackActive]}>
                      <View style={[styles.toggleThumb, juzSelected && styles.toggleThumbActive]} />
                    </View>
                  </Pressable>
                </Pressable>

                {/* Surahs (if expanded) */}
                {isExpanded && (
                  <View style={styles.surahList}>
                    {juz.surahs.map((surah, surahIndex) => {
                      const isSelected = isSurahSelected(surah.surahNumber);
                      return (
                        <Pressable
                          key={surah.surahNumber}
                          onPress={() => toggleSurah(surah.surahNumber)}
                          style={[
                            styles.surahRow,
                            isSelected && styles.surahRowSelected,
                            surahIndex === juz.surahs.length - 1 && styles.surahRowLast,
                          ]}
                        >
                          <View style={styles.surahInfo}>
                            <Text style={styles.surahName}>{surah.englishName}</Text>
                            <Text style={styles.surahArabic}>{surah.name}</Text>
                          </View>
                          <Pressable
                            hitSlop={8}
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleSurah(surah.surahNumber);
                            }}
                            style={styles.surahToggle}
                          >
                            <View style={[styles.toggleTrack, isSelected && styles.toggleTrackActive]}>
                              <View style={[styles.toggleThumb, isSelected && styles.toggleThumbActive]} />
                            </View>
                          </Pressable>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </Animated.View>
            );
          }}
        />
      </View>

      {/* Footer */}
      <View style={styles.surahFooter}>
        {selectedCount > 0 && (
          <Text style={styles.selectedCount}>
            {selectedCount} Surah{selectedCount === 1 ? '' : 's'} selected
          </Text>
        )}
        <Pressable
          onPress={goToNextStep}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonLabel}>Continue</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );

  // Revision Cycle Page (Step 3)
  const renderRevisionCyclePage = () => (
    <View style={styles.pageContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageContent}>
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            <Text style={styles.pageIcon}>⏰</Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            style={[
              styles.pageTitle,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            {onboardingSteps[3].title}
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            style={[
              styles.pageSubtitle,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            {onboardingSteps[3].subtitle}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.pageDescription,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            Choose how many days between each complete revision of your memorized portions.
          </Animated.Text>

          {/* Revision Options */}
          <View style={styles.optionsContainer}>
            {revisionOptions.map((option, index) => {
              const isSelected = revisionCycleDays === option.days;
              return (
                <Animated.View
                  key={option.days}
                  style={{
                    opacity: showContent ? 1 : 0,
                    transform: [{ scale: showContent ? 1 : 0.8 }],
                  }}
                  // @ts-ignore
                  delay={1000 + index * 100}
                >
                  <Pressable
                    onPress={() => setRevisionCycleDays(option.days)}
                    style={[styles.revisionOption, isSelected && styles.revisionOptionSelected]}
                  >
                    <View style={styles.optionSelector}>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                        {isSelected && <Text style={styles.radioCheck}>✓</Text>}
                      </View>
                    </View>
                    <View style={styles.optionContent}>
                      <View style={styles.optionHeader}>
                        <Text style={styles.optionTitle}>{option.title}</Text>
                        <View style={styles.optionBadge}>
                          <Text style={styles.optionBadgeText}>{option.subtitle}</Text>
                        </View>
                      </View>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.spacer} />

          {/* Continue Button */}
          <Animated.View
            style={{
              opacity: showContent ? 1 : 0,
              transform: [{ scale: showContent ? 1 : 0.8 }],
            }}
          >
            <Pressable
              onPress={goToNextStep}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonLabel}>Continue</Text>
              <Text style={styles.arrow}>→</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );

  // Ready Page (Step 4)
  const renderReadyPage = () => (
    <View style={styles.pageContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageContent}>
          {/* Icon with pulse animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.5 }],
              },
            ]}
          >
            <Text style={[styles.pageIcon, styles.readyIcon]}>★</Text>
          </Animated.View>

          {/* Title with gradient effect */}
          <Animated.Text
            style={[
              styles.pageTitle,
              styles.readyTitle,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            {onboardingSteps[4].title}
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            style={[
              styles.pageSubtitle,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            {onboardingSteps[4].subtitle}
          </Animated.Text>

          {/* Description */}
          <Animated.Text
            style={[
              styles.pageDescription,
              {
                opacity: showContent ? 1 : 0,
                transform: [{ scale: showContent ? 1 : 0.8 }],
              },
            ]}
          >
            Track your progress, maintain consistency, and strengthen your connection with the Quran.
          </Animated.Text>

          {selectedCount > 0 && (
            <Animated.Text
              style={[
                styles.selectedSummary,
                {
                  opacity: showContent ? 1 : 0,
                  transform: [{ scale: showContent ? 1 : 0.8 }],
                },
              ]}
            >
              Selected surahs: {selectedCount} · Revision every {revisionCycleDays} days
            </Animated.Text>
          )}

          <View style={styles.spacer} />

          {/* Bismillah Button */}
          <Animated.View
            style={{
              opacity: showContent ? 1 : 0,
              transform: [{ scale: showContent ? 1 : 0.8 }],
            }}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                disabled={selectedCount === 0}
                onPress={() => void handleFinish()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.pressed,
                  selectedCount === 0 && styles.disabled,
                ]}
              >
                <Text
                  style={[styles.primaryButtonLabel, selectedCount === 0 && styles.disabledLabel]}
                >
                  Bismillah
                </Text>
                <Animated.Text
                  style={[
                    styles.arrow,
                    selectedCount === 0 && styles.disabledLabel,
                    { transform: [{ translateX: arrowAnim }] },
                  ]}
                >
                  →
                </Animated.Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );

  // Back Button
  const renderBackButton = () => {
    if (step === 0) return null;
    return (
      <Pressable
        accessibilityLabel="Go back"
        onPress={goToPrevStep}
        style={styles.backButton}
      >
        <Text style={styles.backButtonIcon}>‹</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {renderBackButton()}

        {step === 0 && renderWelcomePage()}
        {step === 1 && renderNameInputPage()}
        {step === 2 && renderSurahSelectionPage()}
        {step === 3 && renderRevisionCyclePage()}
        {step === 4 && renderReadyPage()}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brandPrimary,
  },
  safeArea: {
    flex: 1,
  },

  // Welcome Page Styles
  welcomeContainer: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.brandPrimary,
    opacity: 1,
  },
  welcomeContent: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    zIndex: 1,
  },
  spacer: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    gap: SPACING.xl,
  },
  logoContainer: {
    position: 'relative',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowColor: COLORS.night,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 70,
    backgroundColor: 'transparent',
    shadowColor: COLORS.brandSecondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  titleSection: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  welcomeTitle: {
    fontFamily: FONT_FAMILIES.display,
    fontSize: 46,
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  welcomeSubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.brandSecondary,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 32,
    paddingHorizontal: SPACING.md,
  },
  ctaSection: {
    alignItems: 'center',
    paddingBottom: SPACING.xxl,
  },

  // Common Page Styles
  pageContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 80,
    paddingBottom: SPACING.xxl,
  },
  pageContent: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  pageIcon: {
    fontSize: 90,
    color: COLORS.brandSecondary,
  },
  readyIcon: {
    textShadowColor: 'rgba(137, 191, 159, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  pageTitle: {
    fontFamily: FONT_FAMILIES.display,
    fontSize: 36,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  readyTitle: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  pageSubtitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.brandSecondary,
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  pageDescription: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.brandSecondary,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    lineHeight: 22,
  },
  selectedSummary: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    color: COLORS.brandSecondary,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: SPACING.md,
  },

  // Name Input Styles
  inputContainer: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  nameInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(137, 191, 159, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    textAlign: 'center',
  },

  // Surah Selection Styles
  surahPageContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
  },
  surahHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(137, 191, 159, 0.5)',
    marginTop: SPACING.md,
  },
  selectAllIcon: {
    fontSize: 16,
    color: COLORS.brandSecondary,
  },
  selectAllText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.brandSecondary,
  },
  juzListContainer: {
    flex: 1,
    marginTop: SPACING.md,
  },
  juzHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(137, 191, 159, 0.3)',
    marginBottom: 8,
  },
  juzHeaderSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(137, 191, 159, 0.6)',
  },
  juzHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.brandSecondary,
  },
  juzTitle: {
    fontFamily: FONT_FAMILIES.display,
    fontSize: 18,
    color: COLORS.white,
  },
  juzToggle: {
    padding: 4,
  },
  surahList: {
    paddingLeft: 28,
    paddingBottom: 12,
  },
  surahRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(137, 191, 159, 0.1)',
  },
  surahRowSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  surahRowLast: {
    borderBottomWidth: 0,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  surahArabic: {
    fontFamily: FONT_FAMILIES.quran,
    fontSize: 16,
    color: COLORS.brandSecondary,
    opacity: 0.8,
  },
  surahToggle: {
    padding: 4,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: COLORS.brandSecondary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    transform: [{ translateX: 0 }],
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  surahFooter: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.md,
  },
  selectedCount: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    color: COLORS.brandSecondary,
    opacity: 0.8,
  },

  // Revision Cycle Styles
  optionsContainer: {
    width: '100%',
    gap: 12,
    marginTop: SPACING.md,
  },
  revisionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(137, 191, 159, 0.2)',
  },
  revisionOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(137, 191, 159, 0.6)',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  optionSelector: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: COLORS.brandSecondary,
  },
  radioCheck: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.brandPrimary,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionTitle: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  optionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(137, 191, 159, 0.2)',
  },
  optionBadgeText: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.brandSecondary,
  },
  optionDescription: {
    fontFamily: FONT_FAMILIES.body,
    fontSize: 13,
    color: COLORS.brandSecondary,
    opacity: 0.8,
  },

  // Button Styles
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 54,
    borderRadius: 27,
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.brandSecondary,
    shadowColor: COLORS.brandSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 4,
    minWidth: 200,
  },
  primaryButtonLabel: {
    color: COLORS.brandPrimary,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '600',
  },
  arrow: {
    color: COLORS.brandPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  disabledLabel: {
    opacity: 0.7,
  },

  // Back Button
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
  },
});
