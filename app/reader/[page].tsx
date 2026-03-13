import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React from 'react';
import {
  FlatList,
  type ListRenderItem,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { COLORS, FONT_FAMILIES, SPACING } from '@/constants/theme';
import { getMushafPageAsset } from '@/lib/assets/mushafPages';
import { getReaderPageContext } from '@/lib/services/quranData';
import { useAppStore, useReaderData } from '@/store/app';

const TOTAL_PAGES = 604;

function getJuzNumberForPage(pageNumber: number): number {
  if (pageNumber <= 21) return 1;
  if (pageNumber <= 41) return 2;
  if (pageNumber <= 61) return 3;
  if (pageNumber <= 81) return 4;
  if (pageNumber <= 101) return 5;
  if (pageNumber <= 120) return 6;
  if (pageNumber <= 141) return 7;
  if (pageNumber <= 161) return 8;
  if (pageNumber <= 181) return 9;
  if (pageNumber <= 200) return 10;
  if (pageNumber <= 221) return 11;
  if (pageNumber <= 241) return 12;
  if (pageNumber <= 261) return 13;
  if (pageNumber <= 281) return 14;
  if (pageNumber <= 301) return 15;
  if (pageNumber <= 321) return 16;
  if (pageNumber <= 341) return 17;
  if (pageNumber <= 361) return 18;
  if (pageNumber <= 381) return 19;
  if (pageNumber <= 401) return 20;
  if (pageNumber <= 421) return 21;
  if (pageNumber <= 441) return 22;
  if (pageNumber <= 461) return 23;
  if (pageNumber <= 481) return 24;
  if (pageNumber <= 501) return 25;
  if (pageNumber <= 521) return 26;
  if (pageNumber <= 541) return 27;
  if (pageNumber <= 561) return 28;
  if (pageNumber <= 581) return 29;
  return 30;
}

function getSurahNamesForPage(pageNumber: number): string {
  const context = getReaderPageContext(pageNumber, ['en-saheeh']);
  return context.surahNames.length > 0 ? context.surahNames.join(' • ') : 'Al-Fatihah';
}

export default function ReaderScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ page: string; highlight?: string }>();
  const initialPage = Math.max(1, Math.min(TOTAL_PAGES, Number(params.page ?? '1')));
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isLandscape = width > height;
  const isTablet = Platform.OS === 'ios' ? width >= 768 : width >= 600;
  const verticalScrolling = readerPreferences?.verticalScrollingEnabled ?? false;
  const isDoublePageMode = !verticalScrolling && isTablet && isLandscape;

  const readerPreferences = useAppStore((state) => state.readerPreferences);
  const readerBookmarks = useAppStore((state) => state.readerBookmarks);
  const readerHighlights = useAppStore((state) => state.readerHighlights);
  const readerNotes = useAppStore((state) => state.readerNotes);
  const setReaderPage = useAppStore((state) => state.setReaderPage);
  const toggleReaderBookmark = useAppStore((state) => state.toggleReaderBookmark);
  const saveReaderHighlight = useAppStore((state) => state.saveReaderHighlight);
  const removeReaderHighlight = useAppStore((state) => state.removeReaderHighlight);
  const saveReaderNote = useAppStore((state) => state.saveReaderNote);
  const deleteReaderNote = useAppStore((state) => state.deleteReaderNote);
  const updateReaderPreferences = useAppStore((state) => state.updateReaderPreferences);

  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [selectedReference, setSelectedReference] = React.useState<string | null>(params.highlight ?? null);
  const [noteDraft, setNoteDraft] = React.useState('');
  const [uiVisible, setUiVisible] = React.useState(true);
  const flatListRef = React.useRef<FlatList>(null);

  const highlightKey = params.highlight ?? null;

  React.useEffect(() => {
    setReaderPage(initialPage, params.highlight ?? null);
  }, [initialPage, params.highlight, setReaderPage]);

  React.useEffect(() => {
    setSelectedReference(highlightKey);
  }, [highlightKey]);

  React.useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const data = React.useMemo(() => {
    if (isDoublePageMode) {
      return Array.from({ length: Math.ceil(TOTAL_PAGES / 2) }, (_, i) => ({
        type: 'spread' as const,
        index: i,
        rightPage: i * 2 + 1,
        leftPage: Math.min(i * 2 + 2, TOTAL_PAGES),
      }));
    }
    return Array.from({ length: TOTAL_PAGES }, (_, i) => ({
      type: 'single' as const,
      index: i,
      pageNumber: i + 1,
    }));
  }, [isDoublePageMode]);

  const initialScrollIndex = React.useMemo(() => {
    if (isDoublePageMode) {
      return Math.floor((currentPage - 1) / 2);
    }
    return currentPage - 1;
  }, [currentPage, isDoublePageMode]);

  const { context } = useReaderData(currentPage);
  const note = readerNotes.find((item) => item.referenceKey === selectedReference);
  const selectedVerse = context.verses.find((item) => item.referenceKey === selectedReference);
  const isBookmarked = readerBookmarks.includes(currentPage);
  const hasHighlight = readerHighlights.some((item) => item.referenceKey === selectedReference);

  React.useEffect(() => {
    setNoteDraft(note?.text ?? '');
  }, [note?.text]);

  const onViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: Array<{ item: (typeof data)[0]; index: number | null }> }) => {
      const item = viewableItems[0]?.item;
      if (!item) return;
      const page = item.type === 'single' ? item.pageNumber : item.leftPage;
      setCurrentPage(page);
      setReaderPage(page, null);
    }
  ).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 50,
  }).current;

  const renderItem: ListRenderItem<(typeof data)[0]> = ({ item }) => {
    if (item.type === 'spread') {
      return (
        <View style={[styles.spreadContainer, { width }]}>
          <View style={styles.spreadRow}>
            <MushafPageCell
              pageNumber={item.leftPage}
              containerWidth={width / 2}
              isDoublePageMode
              selectedReference={selectedReference}
              setSelectedReference={setSelectedReference}
              isDark={isDark}
            />
            <MushafPageCell
              pageNumber={item.rightPage}
              containerWidth={width / 2}
              isDoublePageMode
              selectedReference={selectedReference}
              setSelectedReference={setSelectedReference}
              isDark={isDark}
            />
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.singleContainer, { width }]}>
        <MushafPageCell
          pageNumber={item.pageNumber}
          containerWidth={width}
          isDoublePageMode={false}
          selectedReference={selectedReference}
          setSelectedReference={setSelectedReference}
          isDark={isDark}
        />
      </View>
    );
  };

  const handleTap = () => setUiVisible((v) => !v);

  if (verticalScrolling) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {uiVisible && (
          <View style={[styles.toolbar, { paddingHorizontal: insets.left + SPACING.md, paddingRight: insets.right + SPACING.md }]}>
            <AppButton
              label="Prev"
              onPress={() => {
                const prev = Math.max(1, currentPage - 1);
                setCurrentPage(prev);
                setReaderPage(prev, null);
              }}
              variant="secondary"
            />
            <View style={styles.toolbarCenter}>
              <Text style={styles.toolbarTitle}>Page {currentPage}</Text>
              <Text style={styles.toolbarSubtitle}>
                Juz {getJuzNumberForPage(currentPage)} • {getSurahNamesForPage(currentPage)}
              </Text>
            </View>
            <AppButton
              label={isBookmarked ? 'Bookmarked' : 'Bookmark'}
              onPress={() => void toggleReaderBookmark(currentPage)}
              variant={isBookmarked ? 'primary' : 'secondary'}
            />
            <AppButton
              label="Next"
              onPress={() => {
                const next = Math.min(TOTAL_PAGES, currentPage + 1);
                setCurrentPage(next);
                setReaderPage(next, null);
              }}
              variant="secondary"
            />
          </View>
        )}
        <Pressable style={styles.readerArea} onPress={handleTap}>
          <ScrollView style={styles.verticalScroll} contentContainerStyle={[styles.verticalScrollContent, { minHeight: height * 3 }]}>
            {[Math.max(1, currentPage - 1), currentPage, Math.min(TOTAL_PAGES, currentPage + 1)].map((page) => (
              <View key={page} style={[styles.verticalPageWrap, { height: height - 120 }]}>
                <MushafPageCell
                  pageNumber={page}
                  containerWidth={width}
                  isDoublePageMode={false}
                  selectedReference={selectedReference}
                  setSelectedReference={setSelectedReference}
                  isDark={isDark}
                />
              </View>
            ))}
          </ScrollView>
        </Pressable>
        {uiVisible && (
          <View style={[styles.preferencesRow, { paddingHorizontal: insets.left + SPACING.md }]}>
            <AppButton
              label={readerPreferences?.mode === 'mushaf' ? 'Mushaf' : 'Translation'}
              onPress={() =>
                void updateReaderPreferences({
                  mode: readerPreferences?.mode === 'mushaf' ? 'translation' : 'mushaf',
                })
              }
              variant="secondary"
            />
            <AppButton
              label="Paged mode"
              onPress={() => void updateReaderPreferences({ verticalScrollingEnabled: false })}
              variant="secondary"
            />
          </View>
        )}
        {selectedVerse && uiVisible && (
          <View style={[styles.selectionPanel, { marginHorizontal: insets.left + SPACING.md, marginRight: insets.right + SPACING.md }]}>
            <Text style={styles.selectionRef}>{selectedVerse.referenceKey}</Text>
            <Text style={styles.selectionArabic}>{selectedVerse.arabicText}</Text>
            <Text style={styles.selectionTranslation}>{selectedVerse.translationText}</Text>
            <View style={styles.selectionActions}>
              <AppButton
                label={hasHighlight ? 'Remove highlight' : 'Highlight'}
                onPress={() =>
                  hasHighlight
                    ? void removeReaderHighlight(selectedVerse.referenceKey)
                    : void saveReaderHighlight({
                        referenceKey: selectedVerse.referenceKey,
                        surahNumber: selectedVerse.surahNumber,
                        verseNumber: selectedVerse.verseNumber,
                        colorHex: '#F3D56B',
                        createdAt: new Date().toISOString(),
                      })
                }
                variant={hasHighlight ? 'primary' : 'secondary'}
                style={styles.flexButton}
              />
              <AppButton
                label="Share"
                onPress={() =>
                  void Share.share({
                    message: `${selectedVerse.referenceKey}\n${selectedVerse.arabicText}\n${selectedVerse.translationText}`,
                  })
                }
                variant="secondary"
                style={styles.flexButton}
              />
            </View>
            <TextInput
              multiline
              onChangeText={setNoteDraft}
              placeholder="Add a note for this ayah selection"
              placeholderTextColor={COLORS.muted}
              style={styles.noteInput}
              value={noteDraft}
            />
            <View style={styles.selectionActions}>
              <AppButton
                label="Save note"
                onPress={() =>
                  void saveReaderNote({
                    referenceKey: selectedVerse.referenceKey,
                    references: [selectedVerse.referenceKey],
                    text: noteDraft.trim(),
                    createdAt: new Date().toISOString(),
                  })
                }
                style={styles.flexButton}
              />
              {note ? (
                <AppButton label="Delete note" onPress={() => void deleteReaderNote(note.referenceKey)} variant="secondary" style={styles.flexButton} />
              ) : null}
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.readerArea} onPress={handleTap}>
        <FlatList
          key={isDoublePageMode ? 'double' : 'single'}
          ref={flatListRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item.type === 'single' ? `single-${item.pageNumber}` : `spread-${item.rightPage}-${item.leftPage}`
          }
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="start"
          snapToInterval={width}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          initialScrollIndex={Math.max(0, Math.min(initialScrollIndex, data.length - 1))}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
        />
      </Pressable>

      {uiVisible && (
        <>
          <View style={[styles.toolbar, { paddingHorizontal: insets.left + SPACING.md, paddingRight: insets.right + SPACING.md }]}>
            <AppButton
              label="Prev"
              onPress={() => {
                const prev = isDoublePageMode ? Math.max(2, currentPage - 2) : Math.max(1, currentPage - 1);
                setCurrentPage(prev);
                setReaderPage(prev, null);
                const idx = isDoublePageMode ? Math.floor((prev - 1) / 2) : prev - 1;
                flatListRef.current?.scrollToIndex({ index: idx, animated: true });
              }}
              variant="secondary"
            />
            <View style={styles.toolbarCenter}>
              <Text style={styles.toolbarTitle}>Page {currentPage}</Text>
              <Text style={styles.toolbarSubtitle}>
                Juz {getJuzNumberForPage(currentPage)} • {getSurahNamesForPage(currentPage)}
              </Text>
            </View>
            <AppButton
              label={isBookmarked ? 'Bookmarked' : 'Bookmark'}
              onPress={() => void toggleReaderBookmark(currentPage)}
              variant={isBookmarked ? 'primary' : 'secondary'}
            />
            <AppButton
              label="Next"
              onPress={() => {
                const next = isDoublePageMode ? Math.min(TOTAL_PAGES, currentPage + 2) : Math.min(TOTAL_PAGES, currentPage + 1);
                setCurrentPage(next);
                setReaderPage(next, null);
                const idx = isDoublePageMode ? Math.floor((next - 1) / 2) : next - 1;
                flatListRef.current?.scrollToIndex({ index: idx, animated: true });
              }}
              variant="secondary"
            />
          </View>

          <View style={[styles.preferencesRow, { paddingHorizontal: insets.left + SPACING.md }]}>
            <AppButton
              label={readerPreferences?.mode === 'mushaf' ? 'Mushaf' : 'Translation'}
              onPress={() =>
                void updateReaderPreferences({
                  mode: readerPreferences?.mode === 'mushaf' ? 'translation' : 'mushaf',
                })
              }
              variant="secondary"
            />
            <AppButton
              label={readerPreferences?.verticalScrollingEnabled ? 'Paged mode' : 'Vertical mode'}
              onPress={() =>
                void updateReaderPreferences({
                  verticalScrollingEnabled: !readerPreferences?.verticalScrollingEnabled,
                })
              }
              variant="secondary"
            />
          </View>
        </>
      )}

      {selectedVerse && uiVisible && (
        <View style={[styles.selectionPanel, { marginHorizontal: insets.left + SPACING.md, marginRight: insets.right + SPACING.md }]}>
          <Text style={styles.selectionRef}>{selectedVerse.referenceKey}</Text>
          <Text style={styles.selectionArabic}>{selectedVerse.arabicText}</Text>
          <Text style={styles.selectionTranslation}>{selectedVerse.translationText}</Text>
          <View style={styles.selectionActions}>
            <AppButton
              label={hasHighlight ? 'Remove highlight' : 'Highlight'}
              onPress={() =>
                hasHighlight
                  ? void removeReaderHighlight(selectedVerse.referenceKey)
                  : void saveReaderHighlight({
                      referenceKey: selectedVerse.referenceKey,
                      surahNumber: selectedVerse.surahNumber,
                      verseNumber: selectedVerse.verseNumber,
                      colorHex: '#F3D56B',
                      createdAt: new Date().toISOString(),
                    })
              }
              variant={hasHighlight ? 'primary' : 'secondary'}
              style={styles.flexButton}
            />
            <AppButton
              label="Share"
              onPress={() =>
                void Share.share({
                  message: `${selectedVerse.referenceKey}\n${selectedVerse.arabicText}\n${selectedVerse.translationText}`,
                })
              }
              variant="secondary"
              style={styles.flexButton}
            />
          </View>
          <TextInput
            multiline
            onChangeText={setNoteDraft}
            placeholder="Add a note for this ayah selection"
            placeholderTextColor={COLORS.muted}
            style={styles.noteInput}
            value={noteDraft}
          />
          <View style={styles.selectionActions}>
            <AppButton
              label="Save note"
              onPress={() =>
                void saveReaderNote({
                  referenceKey: selectedVerse.referenceKey,
                  references: [selectedVerse.referenceKey],
                  text: noteDraft.trim(),
                  createdAt: new Date().toISOString(),
                })
              }
              style={styles.flexButton}
            />
            {note ? (
              <AppButton
                label="Delete note"
                onPress={() => void deleteReaderNote(note.referenceKey)}
                variant="secondary"
                style={styles.flexButton}
              />
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

function MushafPageCell({
  pageNumber,
  containerWidth,
  selectedReference,
  setSelectedReference,
}: {
  pageNumber: number;
  containerWidth: number;
  isDoublePageMode: boolean;
  selectedReference: string | null;
  setSelectedReference: (v: string | null) => void;
  isDark: boolean;
}) {
  const { context, geometries } = useReaderData(pageNumber);
  const readerPreferences = useAppStore((state) => state.readerPreferences);
  const juzNumber = getJuzNumberForPage(pageNumber);
  const surahNames = getSurahNamesForPage(pageNumber);

  return (
    <View style={[styles.pageCell, { width: containerWidth }]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderJuz}>Juz {juzNumber}</Text>
        <Text style={styles.pageHeaderSurah} numberOfLines={1}>
          {surahNames}
        </Text>
      </View>

      <View style={styles.pageContent}>
        <Image
          contentFit="contain"
          source={getMushafPageAsset(pageNumber)}
          style={styles.pageImage}
          recyclingKey={`mushaf-${pageNumber}`}
        />
        {readerPreferences?.mode === 'translation' ? (
          <View style={styles.translationOverlay}>
            {context.verses.map((verse) => (
              <Text key={verse.referenceKey} style={styles.translationVerse}>
                <Text style={styles.translationVerseRef}>{verse.referenceKey} </Text>
                {verse.translationText}
              </Text>
            ))}
          </View>
        ) : (
          <View pointerEvents="box-none" style={styles.geometryLayer}>
            {geometries.map((geometry) => (
              <View
                key={geometry.referenceKey}
                style={[
                  styles.geometryHit,
                  {
                    left: `${geometry.x * 100}%`,
                    top: `${geometry.y * 100}%`,
                    width: `${geometry.width * 100}%`,
                    height: `${geometry.height * 100}%`,
                    borderColor: selectedReference === geometry.referenceKey ? COLORS.gold : 'transparent',
                  },
                ]}
              >
                <Pressable
                  onPress={() =>
                    setSelectedReference(selectedReference === geometry.referenceKey ? null : geometry.referenceKey)
                  }
                  style={styles.geometryTouch}
                />
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.pageFooter}>
        <Text style={styles.pageFooterText}>{pageNumber}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.night,
  },
  readerArea: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  verticalScrollContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  verticalPageWrap: {
    width: '100%',
  },
  spreadContainer: {
    flex: 1,
  },
  spreadRow: {
    flex: 1,
    flexDirection: 'row',
  },
  singleContainer: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.night,
    borderTopWidth: 1,
    borderTopColor: '#25332A',
  },
  toolbarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  toolbarTitle: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 18,
    fontWeight: '800',
  },
  toolbarSubtitle: {
    color: COLORS.muted,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    marginTop: 2,
  },
  preferencesRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  pageCell: {
    flex: 1,
    backgroundColor: '#0A0E0B',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pageHeaderJuz: {
    color: COLORS.cream,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
  },
  pageHeaderSurah: {
    color: COLORS.cream,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  pageContent: {
    flex: 1,
    position: 'relative',
    minHeight: 200,
  },
  pageImage: {
    width: '100%',
    height: '100%',
  },
  pageFooter: {
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pageFooterText: {
    color: COLORS.cream,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
  },
  geometryLayer: {
    position: 'absolute',
    inset: 0,
  },
  geometryHit: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'rgba(243, 213, 107, 0.05)',
  },
  geometryTouch: {
    width: '100%',
    height: '100%',
  },
  translationOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(11, 17, 13, 0.94)',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  translationVerse: {
    color: COLORS.cream,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    lineHeight: 22,
  },
  translationVerseRef: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  selectionPanel: {
    borderRadius: 22,
    backgroundColor: COLORS.nightPanel,
    borderWidth: 1,
    borderColor: '#25332A',
    padding: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  selectionRef: {
    color: COLORS.gold,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  selectionArabic: {
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.quran,
    fontSize: 26,
    lineHeight: 44,
    textAlign: 'right',
  },
  selectionTranslation: {
    color: COLORS.sand,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    lineHeight: 22,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  flexButton: {
    flex: 1,
  },
  noteInput: {
    borderRadius: 18,
    backgroundColor: '#111914',
    borderWidth: 1,
    borderColor: '#2A3A31',
    padding: SPACING.md,
    minHeight: 88,
    color: COLORS.white,
    fontFamily: FONT_FAMILIES.body,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});
