/**
 * ScheduleWeekView — shared weekly-agenda body (Fase 6 refactor).
 *
 * Renders the colored header region (a screen-supplied `header` slot above a
 * horizontal day picker) plus the per-day class list with capacity bars and
 * booking buttons. Owns day selection and the book/cancel confirmation flow.
 * Powers both the Agenda tab (`useScheduleWeek`) and the dependent agenda
 * (`useDependentSchedule`) — both pass the same `ScheduleWeekResult` contract.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { theme, withAlpha } from '../lib/theme';
import type { ClassSlot, ScheduleDay, ScheduleWeekResult } from '../lib/types';

export function ScheduleWeekView({
  accent,
  result,
  header,
}: {
  accent: string;
  result: ScheduleWeekResult;
  header: React.ReactNode;
}) {
  const { days, loading, error, acting, refetch, book, cancel } = result;

  const todayId = useMemo(
    () => days.find((d) => d.isToday)?.id ?? days[0]?.id,
    [days],
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (selectedId === undefined && todayId) setSelectedId(todayId);
  }, [selectedId, todayId]);
  const selected: ScheduleDay | undefined =
    days.find((d) => d.id === (selectedId ?? todayId)) ?? days[0];

  const hasAnyClass = days.some((d) => d.classes.length > 0);
  const showLoading = loading && !hasAnyClass && !error;

  const onBook = async (slot: ClassSlot) => {
    const r = await book(slot);
    Alert.alert(r.ok ? 'Tudo certo' : 'Não foi possível', r.message);
  };
  const onCancel = (slot: ClassSlot) => {
    Alert.alert('Cancelar reserva', 'Deseja cancelar esta reserva?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: async () => {
          const r = await cancel(slot);
          Alert.alert(r.ok ? 'Pronto' : 'Não foi possível', r.message);
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: accent }]}>
      <StatusBar barStyle="light-content" backgroundColor={accent} />
      <ScrollView
        style={{ backgroundColor: theme.paper }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: accent }]}>
          {header}

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
                    active && { backgroundColor: '#fff', borderColor: '#fff' },
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
                  <Text style={[styles.dayNum, active && { color: accent }]}>
                    {day.dayNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          {showLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={accent} />
              <Text style={styles.centerText}>Carregando agenda…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Não conseguimos carregar</Text>
              <Text style={styles.errorBody}>{error.message}</Text>
              <TouchableOpacity
                onPress={refetch}
                style={[styles.retryBtn, { backgroundColor: accent }]}
                activeOpacity={0.85}
              >
                <Text style={styles.retryBtnText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : selected ? (
            <>
              <View style={styles.dayHeader}>
                <View>
                  <Text style={styles.dayTitle}>{selected.fullTitle}</Text>
                  <Text style={styles.daySub}>{selected.fullSubtitle}</Text>
                </View>
                <View
                  style={[styles.dayCount, { backgroundColor: withAlpha(accent, 0.1) }]}
                >
                  <Text style={[styles.dayCountText, { color: accent }]}>
                    {selected.classes.length} AULA
                    {selected.classes.length === 1 ? '' : 'S'}
                  </Text>
                </View>
              </View>

              {selected.classes.length === 0 ? (
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayTitle}>Sem aulas neste dia</Text>
                  <Text style={styles.emptyDayBody}>
                    A academia não tem turmas programadas para este dia.
                  </Text>
                </View>
              ) : (
                selected.classes.map((c) => (
                  <ClassCard
                    key={c.id}
                    slot={c}
                    accent={accent}
                    acting={acting}
                    onBook={onBook}
                    onCancel={onCancel}
                  />
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
function ClassCard({
  slot,
  accent,
  acting,
  onBook,
  onCancel,
}: {
  slot: ClassSlot;
  accent: string;
  acting: boolean;
  onBook: (s: ClassSlot) => void;
  onCancel: (s: ClassSlot) => void;
}) {
  const unlimited = slot.unlimited || slot.capacity <= 0;
  const pct = unlimited
    ? 0
    : Math.min(100, Math.round((slot.taken / slot.capacity) * 100));
  const isWait = slot.status === 'waitlist' || slot.status === 'waitlisted';
  const nearFull = pct >= 90;
  const hasBooking = !!slot.bookingDocumentId;

  return (
    <TouchableOpacity
      activeOpacity={hasBooking ? 0.7 : 1}
      onPress={
        hasBooking
          ? () => router.push(`/booking/${slot.bookingDocumentId}`)
          : undefined
      }
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
            {[slot.instructor, slot.room].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>
      <View style={styles.classActions}>
        <View style={styles.capBar}>
          <View style={styles.capLabel}>
            <Text style={styles.capLabelText}>Vagas</Text>
            <Text style={styles.capLabelStrong}>
              {unlimited ? 'Livre' : `${slot.taken}/${slot.capacity}`}
            </Text>
          </View>
          <View style={styles.capTrack}>
            <View
              style={[
                styles.capFill,
                {
                  width: `${unlimited ? 0 : pct}%`,
                  backgroundColor: nearFull ? accent : theme.ink900,
                },
              ]}
            />
          </View>
        </View>
        <BookingButton
          slot={slot}
          accent={accent}
          acting={acting}
          onBook={onBook}
          onCancel={onCancel}
        />
      </View>
    </TouchableOpacity>
  );
}

function BookingButton({
  slot,
  accent,
  acting,
  onBook,
  onCancel,
}: {
  slot: ClassSlot;
  accent: string;
  acting: boolean;
  onBook: (s: ClassSlot) => void;
  onCancel: (s: ClassSlot) => void;
}) {
  const closed = slot.bookable === false;
  const mine = slot.status === 'booked' || slot.status === 'waitlisted';

  let label: string;
  let bg: string;
  let fg = '#fff';
  let onPress: (() => void) | undefined;

  if (slot.status === 'booked') {
    label = '✓ Reservada';
    bg = theme.emerald;
    onPress = () => onCancel(slot);
  } else if (slot.status === 'waitlisted') {
    label = 'Na fila';
    bg = withAlpha(accent, 0.15);
    fg = accent;
    onPress = () => onCancel(slot);
  } else if (slot.status === 'waitlist' || slot.status === 'full') {
    label = closed ? 'Lotada' : 'Lista de espera';
    bg = withAlpha(accent, 0.15);
    fg = accent;
    onPress = closed ? undefined : () => onBook(slot);
  } else {
    label = closed ? 'Encerrada' : 'Reservar';
    bg = theme.ink900;
    onPress = closed ? undefined : () => onBook(slot);
  }

  const disabled = (!onPress || acting) && !mine;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={!onPress || acting}
      onPress={onPress}
      style={[styles.bookBtn, { backgroundColor: bg }, disabled && styles.bookBtnDisabled]}
    >
      {acting ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <Text style={[styles.bookBtnText, { color: fg }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

/* ==================================================================
 * STYLES
 * ================================================================ */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 32 },

  header: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 28 },

  dayPicker: { paddingHorizontal: 20, gap: 10 },
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
    minHeight: 320,
  },

  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, gap: 12 },
  centerText: { fontSize: 13, color: theme.ink500 },

  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.line,
  },
  errorTitle: { fontSize: 16, fontWeight: '800', color: theme.ink900 },
  errorBody: {
    fontSize: 13,
    color: theme.ink500,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 19,
  },
  retryBtn: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 999 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dayTitle: { fontSize: 22, fontWeight: '700', color: theme.ink900, letterSpacing: -0.5 },
  daySub: { fontSize: 12, color: theme.ink400, marginTop: 3, fontWeight: '500' },
  dayCount: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  dayCountText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  emptyDay: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.line,
    borderStyle: 'dashed',
  },
  emptyDayTitle: { fontSize: 15, fontWeight: '700', color: theme.ink700 },
  emptyDayBody: { fontSize: 12, color: theme.ink400, marginTop: 6, textAlign: 'center' },

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
  classTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  classTimeBox: { minWidth: 56 },
  classTime: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.ink900,
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  classTimeEnd: { fontSize: 11, color: theme.ink400, fontWeight: '500', marginTop: 2 },
  className: { fontSize: 15, fontWeight: '700', color: theme.ink900, letterSpacing: -0.2 },
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
  capLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  capLabelText: { fontSize: 11, color: theme.ink400, fontWeight: '500' },
  capLabelStrong: { fontSize: 11, color: theme.ink700, fontWeight: '700' },
  capTrack: { height: 6, backgroundColor: theme.paper2, borderRadius: 999, overflow: 'hidden' },
  capFill: { height: '100%', borderRadius: 999 },

  bookBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnDisabled: { opacity: 0.45 },
  bookBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
