/**
 * Agenda tab — weekly schedule, per-day class list.
 *
 * Mirrors `mockups/app-schedule.html`. The day picker at the top is a
 * horizontal scroll of pill-cards; tapping a day swaps the list of
 * classes below. Each class card shows the time range, instructor,
 * room, a capacity bar and a booking button whose state changes
 * depending on the class: available → "Reservar", booked → "✓ Reservada",
 * waitlist (full) → "Lista de espera".
 *
 * Data:
 *   - Academy branding (header color, logo) comes from `useDashboard()`
 *     so it stays in sync with white-labeling and the Apollo cache.
 *   - The class list itself is read from `MOCK_SCHEDULE` directly.
 *     When the GraphQL schema gains a `scheduleForWeek` query we'll
 *     swap this import for a `useSchedule()` hook with the same shape.
 */

import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter } from 'lucide-react-native';

import { useDashboard } from '../../hooks/useDashboard';
import { MOCK_SCHEDULE } from '../../lib/mock-data';
import { theme, withAlpha } from '../../lib/theme';
import type { ClassSlot, ScheduleDay } from '../../lib/types';

export default function ScheduleScreen() {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const academyName = data?.academy.name ?? 'Gym';
  const initials = data?.academy.initials ?? 'G';

  const days = MOCK_SCHEDULE;
  const todayId = useMemo(
    () => days.find((d) => d.isToday)?.id ?? days[0]?.id,
    [days],
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(todayId);
  const selected: ScheduleDay | undefined =
    days.find((d) => d.id === selectedId) ?? days[0];

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: accent }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={accent} />
      <ScrollView
        style={{ backgroundColor: theme.paper }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: accent }]}>
          <View style={styles.headerTop}>
            <View style={styles.brand}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>{initials}</Text>
              </View>
              <Text style={styles.academyName}>{academyName}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              accessibilityLabel="Filtros"
            >
              <Filter size={18} color="#fff" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eyebrow}>AGENDA</Text>
          <Text style={styles.title}>Suas aulas</Text>

          {/* Day picker */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayPicker}
            style={{ marginTop: 18, marginHorizontal: -20 }}
          >
            {days.map((day) => {
              const active = day.id === (selected?.id ?? todayId);
              return (
                <TouchableOpacity
                  key={day.id}
                  onPress={() => setSelectedId(day.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.day,
                    active && {
                      backgroundColor: '#fff',
                      borderColor: '#fff',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayLbl,
                      active && { color: accent, opacity: 1 },
                      day.isToday && { fontWeight: '800' },
                    ]}
                  >
                    {day.weekdayShort}
                  </Text>
                  <Text
                    style={[
                      styles.dayNum,
                      active && { color: accent },
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          {selected ? (
            <>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayTitle}>{selected.fullTitle}</Text>
                  <Text style={styles.daySub}>{selected.fullSubtitle}</Text>
                </View>
                <View
                  style={[
                    styles.dayCount,
                    { backgroundColor: withAlpha(accent, 0.1) },
                  ]}
                >
                  <Text style={[styles.dayCountText, { color: accent }]}>
                    {selected.classes.length} AULA
                    {selected.classes.length === 1 ? '' : 'S'}
                  </Text>
                </View>
              </View>

              {selected.classes.length === 0 ? (
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayTitle}>Sem aulas hoje</Text>
                  <Text style={styles.emptyDayBody}>
                    A academia não tem turmas programadas para este dia.
                  </Text>
                </View>
              ) : (
                selected.classes.map((c) => (
                  <ClassCard key={c.id} slot={c} accent={accent} />
                ))
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==================================================================
 * CLASS CARD
 * ================================================================ */
function ClassCard({ slot, accent }: { slot: ClassSlot; accent: string }) {
  const pct = Math.min(100, Math.round((slot.taken / slot.capacity) * 100));
  const isBooked = slot.status === 'booked';
  const isWait = slot.status === 'waitlist';
  const nearFull = pct >= 90;

  return (
    <View
      style={[
        styles.classCard,
        isWait && {
          backgroundColor: withAlpha(accent, 0.06),
          borderColor: withAlpha(accent, 0.25),
        },
      ]}
    >
      <View style={styles.classTop}>
        <View style={styles.classTimeBox}>
          <Text style={styles.classTime}>{slot.startTime}</Text>
          <Text style={styles.classTimeEnd}>{slot.endTime}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.className}>{slot.name}</Text>
          <Text style={styles.classMeta}>
            {slot.instructor} · {slot.room}
          </Text>
        </View>
      </View>
      <View style={styles.classActions}>
        <View style={styles.capBar}>
          <View style={styles.capLabel}>
            <Text style={styles.capLabelText}>Vagas</Text>
            <Text style={styles.capLabelStrong}>
              {slot.taken}/{slot.capacity}
            </Text>
          </View>
          <View style={styles.capTrack}>
            <View
              style={[
                styles.capFill,
                {
                  width: `${pct}%`,
                  backgroundColor: nearFull ? accent : theme.ink900,
                },
              ]}
            />
          </View>
        </View>
        <BookingButton status={slot.status} accent={accent} />
      </View>
    </View>
  );
}

function BookingButton({
  status,
  accent,
}: {
  status: ClassSlot['status'];
  accent: string;
}) {
  if (status === 'booked') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.bookBtn, { backgroundColor: theme.emerald }]}
      >
        <Text style={styles.bookBtnText}>✓ Reservada</Text>
      </TouchableOpacity>
    );
  }
  if (status === 'waitlist' || status === 'full') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[
          styles.bookBtn,
          { backgroundColor: withAlpha(accent, 0.15) },
        ]}
      >
        <Text style={[styles.bookBtnText, { color: accent }]}>
          Lista de espera
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.bookBtn, { backgroundColor: theme.ink900 }]}
    >
      <Text style={styles.bookBtnText}>Reservar</Text>
    </TouchableOpacity>
  );
}

/* ==================================================================
 * STYLES
 * ================================================================ */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 32 },

  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: -0.5 },
  academyName: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: -0.3 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginTop: 4,
  },

  dayPicker: {
    paddingHorizontal: 20,
    gap: 10,
  },
  day: {
    minWidth: 58,
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
  },
  dayLbl: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    opacity: 0.75,
  },
  dayNum: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: -0.5,
  },

  content: {
    marginTop: -20,
    backgroundColor: theme.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.ink900,
    letterSpacing: -0.5,
  },
  daySub: {
    fontSize: 12,
    color: theme.ink400,
    marginTop: 3,
    fontWeight: '500',
  },
  dayCount: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dayCountText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  emptyDay: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.line,
    borderStyle: 'dashed',
  },
  emptyDayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink700,
  },
  emptyDayBody: {
    fontSize: 12,
    color: theme.ink400,
    marginTop: 6,
    textAlign: 'center',
  },

  classCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.line,
    shadowColor: theme.ink900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  classTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  classTimeBox: { minWidth: 56 },
  classTime: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.ink900,
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  classTimeEnd: {
    fontSize: 11,
    color: theme.ink400,
    fontWeight: '500',
    marginTop: 2,
  },
  className: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink900,
    letterSpacing: -0.2,
  },
  classMeta: {
    fontSize: 11,
    color: theme.ink400,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },

  classActions: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  capBar: { flex: 1 },
  capLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  capLabelText: {
    fontSize: 11,
    color: theme.ink400,
    fontWeight: '500',
  },
  capLabelStrong: {
    fontSize: 11,
    color: theme.ink700,
    fontWeight: '700',
  },
  capTrack: {
    height: 6,
    backgroundColor: theme.paper2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  capFill: {
    height: '100%',
    borderRadius: 999,
  },

  bookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
