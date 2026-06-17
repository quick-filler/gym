/**
 * Workout execution session — /workout/session/[id] (Fase 3, new screen).
 *
 * Two modes, driven by the session's `finishedAt`:
 *   - OPEN  → live timer, a checkbox + editable load per exercise, a notes
 *             field, and "Finalizar" (finishWorkoutSession) / "Cancelar".
 *   - DONE  → read-only summary: duration, the logged checklist and notes.
 *
 * The execution checklist is seeded server-side from the plan on start, so
 * the screen just hydrates local state from `exercisesCompleted`.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { ArrowLeft, Check, CheckCircle2, Circle, Clock } from 'lucide-react-native';

import {
  CancelWorkoutSessionDocument,
  FinishWorkoutSessionDocument,
  WorkoutSessionDetailDocument,
} from '../../../gql/graphql';
import { useDashboard } from '../../../hooks/useDashboard';
import { USE_MOCKS } from '../../../lib/config';
import { theme, withAlpha } from '../../../lib/theme';

interface ChecklistItem {
  name: string;
  sets?: number | null;
  reps?: number | null;
  load?: string | null;
  completed: boolean;
}

function exLabel(sets?: number | null, reps?: number | null): string {
  if (sets != null && reps != null) return `${sets}×${reps}`;
  if (sets != null) return `${sets} séries`;
  return '';
}

/** Seconds → "MM:SS" or "H:MM:SS". */
function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dash } = useDashboard();
  const accent = dash?.academy.primaryColor ?? theme.ink900;

  const { data, loading, error } = useQuery<any>(WorkoutSessionDetailDocument, {
    variables: { documentId: id },
    skip: USE_MOCKS || !id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const [finishMutation, { loading: finishing }] = useMutation<any>(
    FinishWorkoutSessionDocument,
  );
  const [cancelMutation, { loading: cancelling }] = useMutation<any>(
    CancelWorkoutSessionDocument,
  );

  const session = data?.workoutSession;
  const isDone = !!session?.finishedAt;

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState('');
  const hydrated = useRef(false);

  useEffect(() => {
    if (!session || hydrated.current) return;
    const items: any[] = Array.isArray(session.exercisesCompleted)
      ? session.exercisesCompleted
      : [];
    setChecklist(
      items.map((it) => ({
        name: it?.name ?? '',
        sets: it?.sets ?? null,
        reps: it?.reps ?? null,
        load: it?.load ?? null,
        completed: !!it?.completed,
      })),
    );
    setNotes(session.notes ?? '');
    hydrated.current = true;
  }, [session]);

  // Live elapsed timer (open sessions only).
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (isDone || !session?.startedAt) return;
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [isDone, session?.startedAt]);

  const elapsedSec = useMemo(() => {
    if (!session?.startedAt) return 0;
    const start = new Date(session.startedAt).getTime();
    const end = isDone && session.finishedAt ? new Date(session.finishedAt).getTime() : Date.now();
    return (end - start) / 1000;
  }, [session?.startedAt, session?.finishedAt, isDone, checklist]); // checklist dep keeps it fresh on tick

  const doneCount = checklist.filter((c) => c.completed).length;

  const toggle = (i: number) =>
    setChecklist((prev) => prev.map((c, idx) => (idx === i ? { ...c, completed: !c.completed } : c)));

  const setLoad = (i: number, load: string) =>
    setChecklist((prev) => prev.map((c, idx) => (idx === i ? { ...c, load } : c)));

  const onFinish = () => {
    Alert.alert('Finalizar treino', 'Deseja finalizar e salvar este treino?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: async () => {
          try {
            await finishMutation({
              variables: { sessionId: id, exercisesCompleted: checklist, notes: notes || null },
            });
            Alert.alert('Treino concluído!', 'Sua sessão foi registrada no histórico.', [
              { text: 'OK', onPress: () => router.replace('/(tabs)/workouts') },
            ]);
          } catch (err: any) {
            Alert.alert(
              'Não foi possível',
              err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Erro ao finalizar.',
            );
          }
        },
      },
    ]);
  };

  const onCancel = () => {
    Alert.alert('Cancelar treino', 'Descartar esta sessão sem salvar?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMutation({ variables: { sessionId: id } });
            router.replace('/(tabs)/workouts');
          } catch (err: any) {
            Alert.alert(
              'Não foi possível',
              err?.graphQLErrors?.[0]?.message ?? err?.message ?? 'Erro ao cancelar.',
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.ink900} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>{isDone ? 'Sessão' : 'Em andamento'}</Text>
        <View style={styles.back} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {USE_MOCKS ? (
            <Text style={styles.placeholder}>Sessão indisponível no modo demonstração.</Text>
          ) : loading && !session ? (
            <View style={styles.centerBox}>
              <ActivityIndicator color={accent} />
            </View>
          ) : error && !session ? (
            <View style={styles.centerBox}>
              <Text style={styles.errTitle}>Não conseguimos carregar</Text>
              <Text style={styles.errBody}>{error.message}</Text>
            </View>
          ) : !session ? (
            <Text style={styles.placeholder}>Sessão não encontrada.</Text>
          ) : (
            <>
              <Text style={styles.planName}>{session.workoutPlan?.name ?? 'Treino'}</Text>

              {/* Timer / duration */}
              <View style={[styles.timerBox, { backgroundColor: withAlpha(accent, 0.08), borderColor: withAlpha(accent, 0.25) }]}>
                <Clock size={18} color={accent} strokeWidth={2.2} />
                <Text style={[styles.timer, { color: accent }]}>{fmtClock(elapsedSec)}</Text>
                <Text style={styles.timerLabel}>
                  {isDone ? 'DURAÇÃO' : 'EM ANDAMENTO'} · {doneCount}/{checklist.length}
                </Text>
              </View>

              {/* Checklist */}
              <View style={styles.card}>
                {checklist.length === 0 ? (
                  <Text style={styles.noEx}>Sem exercícios nesta sessão.</Text>
                ) : (
                  checklist.map((ex, i) => (
                    <View
                      key={`${i}-${ex.name}`}
                      style={[styles.exRow, i === checklist.length - 1 && styles.exRowLast]}
                    >
                      <TouchableOpacity
                        onPress={() => !isDone && toggle(i)}
                        disabled={isDone}
                        activeOpacity={0.7}
                        style={styles.checkBtn}
                      >
                        {ex.completed ? (
                          <CheckCircle2 size={24} color={accent} strokeWidth={2.2} />
                        ) : (
                          <Circle size={24} color={theme.ink300} strokeWidth={2} />
                        )}
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.exName, ex.completed && styles.exNameDone]}>
                          {ex.name}
                        </Text>
                        <Text style={styles.exDetail}>{exLabel(ex.sets, ex.reps)}</Text>
                      </View>
                      {isDone ? (
                        <Text style={[styles.exLoad, { color: accent }]}>{ex.load || '—'}</Text>
                      ) : (
                        <TextInput
                          value={ex.load ?? ''}
                          onChangeText={(v) => setLoad(i, v)}
                          placeholder="carga"
                          placeholderTextColor={theme.ink300}
                          style={styles.loadInput}
                        />
                      )}
                    </View>
                  ))
                )}
              </View>

              {/* Notes */}
              {isDone ? (
                session.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>OBSERVAÇÕES</Text>
                    <Text style={styles.notesText}>{session.notes}</Text>
                  </View>
                ) : null
              ) : (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>OBSERVAÇÕES</Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Como foi o treino? (opcional)"
                    placeholderTextColor={theme.ink300}
                    multiline
                    style={styles.notesInput}
                  />
                </View>
              )}

              {/* Actions */}
              {!isDone ? (
                <>
                  <TouchableOpacity
                    onPress={onFinish}
                    disabled={finishing}
                    activeOpacity={0.85}
                    style={[styles.cta, { backgroundColor: accent }, finishing && { opacity: 0.6 }]}
                  >
                    {finishing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Check size={18} color="#fff" strokeWidth={2.6} />
                        <Text style={styles.ctaText}>Finalizar treino</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onCancel}
                    disabled={cancelling}
                    activeOpacity={0.7}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelText}>Cancelar treino</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: theme.ink900 },
  content: { padding: 20, paddingBottom: 40 },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, gap: 10 },
  placeholder: { fontSize: 15, color: theme.ink500, textAlign: 'center', marginTop: 40 },
  errTitle: { fontSize: 16, fontWeight: '800', color: theme.ink900 },
  errBody: { fontSize: 13, color: theme.ink500, textAlign: 'center' },

  planName: { fontSize: 22, fontWeight: '800', color: theme.ink900, letterSpacing: -0.5 },

  timerBox: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
  },
  timer: { fontSize: 40, fontWeight: '800', letterSpacing: -1, fontVariant: ['tabular-nums'] },
  timerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.line,
  },
  noEx: { fontSize: 14, color: theme.ink500, textAlign: 'center', paddingVertical: 22 },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.paper2,
  },
  exRowLast: { borderBottomWidth: 0 },
  checkBtn: { width: 28, alignItems: 'center', justifyContent: 'center' },
  exName: { fontSize: 15, fontWeight: '600', color: theme.ink900 },
  exNameDone: { textDecorationLine: 'line-through', color: theme.ink400 },
  exDetail: { fontSize: 12, color: theme.ink400, marginTop: 2 },
  exLoad: { fontSize: 13, fontWeight: '800', minWidth: 56, textAlign: 'right' },
  loadInput: {
    width: 72,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.paper,
    fontSize: 13,
    fontWeight: '700',
    color: theme.ink900,
    textAlign: 'center',
  },

  notesBox: {
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 14,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  notesText: { fontSize: 14, color: theme.ink700, lineHeight: 20 },
  notesInput: { fontSize: 14, color: theme.ink900, minHeight: 64, textAlignVertical: 'top' },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 15,
    borderRadius: 14,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  cancelBtn: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: theme.ink400, fontSize: 14, fontWeight: '600' },
});
