# Home Screen Design Parity Report

**Compared against:** `Documents/CURSOR CODES/Deployed/Al Murajaah App` (Swift/iOS)

**Reference:** `RedesignedHomeView.swift` + `TrackerHomeComponents.swift` + child components

---

## Executive Summary

The RN home screen does **not** have full design parity with the deployed Swift app. The Swift app uses a redesigned layout with a unified summary card, cycle statistics, section wrappers, icons, and a different content structure. Below are the gaps.

---

## 1. Top-Level Layout & Background

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Navigation bar | Hidden | Screen shows title "Home" + subtitle | ❌ |
| Background | `TrackerHomePalette.backgroundGradient` (light: #F4F8F5→white→#F0F6F2; dark: #10191D→brandPrimary→#0A1217) | Screen gradient (theme-dependent) | ⚠️ Different |
| Scroll | ScrollViewReader + ScrollView | Screen with ScrollView | ✅ |

**Gap:** Swift hides nav bar; RN shows Screen header. Swift uses a specific gradient palette.

---

## 2. Summary Card vs. Separate Blocks

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Structure | **TrackerHomeSummaryCard** – single card | Separate `welcomeHeader` + `progressCard` + `quickStatsRow` | ❌ |
| Greeting | "Assalamu alaikum," + greetingName | Same | ✅ |
| Profile badge | activeProfileName as pill (Capsule) | Not shown on home | ❌ |
| Profile selector | ProfileSelector in summary card | Not on home | ❌ |
| Streak badge | TrackerSmallBadge (Streak Xd) in summary card | In quick stats row | ⚠️ Different placement |
| Subtitle | Dynamic: "Track the surahs..." or "X surahs need attention across Y ajza'" | Static: "Track your memorized juz and surahs..." | ❌ |

**Gap:** Swift uses one unified summary card; RN splits greeting, progress, and stats.

---

## 3. Cycle Statistics & Progress

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Metrics | Cycle %, Pending surahs, Tracked surahs (TrackerSummaryMetric) | Relax count, Need revision count, Progress (X/114) | ❌ |
| Progress bar | `ProgressView` with "Cycle X" and "X days left" | Progress bars for Relax / Need revise / Progress | ❌ |
| Data source | `getCycleStatistics()` (cycleNumber, completionPercentage, daysRemaining, etc.) | `buildProgressSummary` exists but not used for this UI | ❌ |

**Gap:** Swift shows cycle-based stats; RN shows Relax/Need revise/Progress columns. Different UX and data.

---

## 4. Quick Stats (Streak, Today's Pages, All Time)

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Layout | LazyVGrid, 3 columns | flexDirection: row, 3 cards | ✅ |
| Icons | flame.fill, book.fill, chart.bar.fill | Colored dot only | ❌ |
| Card design | QuickStatCard: icon in circle, value 28pt, title, subtitle, rounded rect 24pt, shadow | Simple card with dot, value, label, unit | ❌ |
| Tap behavior | Opens modals (Streak, Today Pages, All Time) | No tap / no modals | ❌ |
| Colors | Orange, blue, green | #D97706, #2563EB, #1E8E5A | ✅ Similar |

**Gap:** Swift uses icons and modal drill-down; RN uses dots and no modals.

---

## 5. Filter Section

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Wrapper | TrackerSurfaceSection: "Filter" + "Sort your tracker by urgency..." | No section wrapper | ❌ |
| Filter options | All, Needs Revision, Hardest First, Easiest First, Oldest Revised, Least Revised | Same labels | ✅ |
| Chip style | Capsule, brandPrimary when selected, brandSecondary text | Rounded pill, forest green when selected | ⚠️ Similar |
| Spacing | HStack spacing 12 | gap SPACING.sm | ✅ |

**Gap:** Swift wraps filters in a titled section; RN does not.

---

## 6. Browse / View Mode Selector

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Wrapper | TrackerSurfaceSection: "Browse" + "Switch between Juz, Surah, and spaced review..." | No section wrapper | ❌ |
| Modes | Juz, Surah, Revise (spaced) | Juz, Surah, Revise | ✅ |
| Icons | square.grid.2x2, text.justify, clock.arrow.circlepath | None | ❌ |
| Button style | Rounded rect 18pt, brandPrimary when selected | Same radius, forest when selected | ⚠️ Similar |

**Gap:** Swift uses section + icons; RN has no section and text-only buttons.

---

## 7. List Header

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Header | TrackerListHeader: "Juz Tracker" / "Surah Tracker" / "Spaced Review" + subtitle | None | ❌ |
| Subtitle | Mode-specific (e.g. "Browse your tracked ajza'...") | N/A | ❌ |

**Gap:** Swift shows a list header above content; RN does not.

---

## 8. Juz List Content

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Structure | FilteredJuzView: disclosure sections (Needs Revision, Recently Revised, or filter-based) | Flat list of juz cards | ❌ |
| Sections | JuzDisclosureSection: expandable, tint dot, count, chevron | N/A | ❌ |
| Card | JuzCard (from Shared) | juzCard with header, badges | ⚠️ Different layout |

**Gap:** Swift uses collapsible sections; RN uses a flat list.

---

## 9. Surah List Content

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Layout | LazyVGrid, 2 columns | Flat list (stack) | ⚠️ Different |
| Card | SurahCard | surahCard | ⚠️ Compare per-field |

**Gap:** Swift uses a 2-column grid; RN uses a vertical stack.

---

## 10. Revise / Spaced Mode

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Content | **SpacedReviewView**: surah picker menu, flip card, rating buttons, "X surahs remaining" | Simple list of needs-revision surahs with "Revise now" button | ❌ |
| UX | Card-based review with difficulty rating | Mark-revised list | ❌ |

**Gap:** Swift has a full spaced-review flow; RN has a basic list of items to revise.

---

## 11. Profile Selector

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Location | In TrackerHomeSummaryCard | Not on home | ❌ |

**Gap:** Swift shows profile selector on home; RN does not.

---

## 12. Quick Stats Modals

| Aspect | Deployed (Swift) | RN (Current) | Parity |
|--------|------------------|---------------|--------|
| Streak | StreakActivityModal | None | ❌ |
| Today's Pages | TodayPagesModal | None | ❌ |
| All Time | AllTimePagesModal | None | ❌ |

**Gap:** Swift uses modals for drill-down; RN has no modals.

---

## Summary of Gaps

| Category | Priority | Effort |
|----------|----------|--------|
| Unified summary card (replace welcome + progress + integrate cycle stats) | High | High |
| Cycle statistics (Cycle %, Pending, Tracked, progress bar, days left) | High | Medium |
| Quick stats icons + modals | Medium | Medium |
| Filter/Browse section wrappers | Medium | Low |
| View mode icons | Low | Low |
| List header (Juz Tracker / Surah Tracker / Spaced Review) | Medium | Low |
| Juz disclosure sections | High | Medium |
| Surah grid (2 columns) | Low | Low |
| SpacedReviewView (card-based review) | High | High |
| Profile selector on home | Medium | Medium |
| Background gradient | Low | Low |
| Hide Screen title | Low | Low |

---

## Recommended Implementation Order

1. **Phase 1 – Layout & structure**
   - Remove/hide Screen title
   - Add TrackerSurfaceSection-style wrappers for Filter and Browse
   - Add TrackerListHeader above content

2. **Phase 2 – Summary card**
   - Build unified TrackerHomeSummaryCard
   - Add cycle statistics (use `buildProgressSummary`)
   - Add profile badge + ProfileSelector

3. **Phase 3 – Quick stats**
   - Add icons to quick stat cards
   - Implement Streak, Today Pages, All Time modals

4. **Phase 4 – Content**
   - Refactor Juz list to disclosure sections
   - Refactor Surah list to 2-column grid
   - Add view mode icons

5. **Phase 5 – Spaced review**
   - Implement SpacedReviewView-style card flow (or equivalent)

---

## Files to Reference

- `Deployed/Al Murajaah App/.../RedesignedHomeView.swift`
- `Deployed/Al Murajaah App/.../TrackerHomeComponents.swift`
- `Deployed/Al Murajaah App/.../QuickStatsGridView.swift`
- `Deployed/Al Murajaah App/.../HomeSharedComponents.swift` (QuickStatCard)
- `Deployed/Al Murajaah App/.../RevisionFiltersView.swift`
- `Deployed/Al Murajaah App/.../ViewModeSelectorView.swift`
- `Deployed/Al Murajaah App/.../FilteredJuzView.swift`
- `Deployed/Al Murajaah App/.../FilteredSurahView.swift`
- `Deployed/Al Murajaah App/.../SpacedReviewView.swift`
