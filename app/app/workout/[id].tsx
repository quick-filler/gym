/**
 * Workout plan detail — /workout/[id] (Fase 3 — wired).
 *
 * Reads a single WorkoutPlan and lets the caller start an execution session.
 * "Iniciar treino" calls startWorkoutSession → navigates (replace) to the
 * live execution screen at /workout/session/[sessionId].
 */

import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { ArrowLeft, Dumbbell, Play, User, Waves } from 'lucide-react-native';

import {
  StartWorkoutSessionDocument,
  WorkoutPlanDetailDocument,
} from '../../gql/graphql';
import { useDashboard } from '../../hooks/useDashboard';
import { USE_MOCKS } from '../../lib/config';
import { theme, withAlpha } from '../../lib/theme';

function exDetail(sets: any, reps: any): string {
  if (sets != null && reps != null) return `${sets}×${reps}`;
  if (sets != null) return `${sets} séries`;
  return '';
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dash } = useDashboard();
  const accent = dash?.academy.primaryColor ?? theme.ink900;

  const { data, loading, error } = useQuery<any>(WorkoutPlanDetailDocument, {
    variables: { documentId: id },
    skip: USE_MOCKS || !id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const [startMutation, { loading: starting }] = useMutation<any>(StartWorkoutSessionDocument);

  const plan = data?.workoutPlan;
  const isPool = plan?.category === 'pool';
  const noun = isPool ? 'atividade' : 'treino';
  const exercises: any[] = Array.isArray(plan?.exercises) ? plan.exercises : [];

  const onStart = async () => {
    try {
      const res = await startMutation({ variables: { workoutPlanId: id } });
      const sessionId = res.data?.startWorkoutSession?.documentId;
      if (!sessionId) throw new Error('Não foi possível iniciar a sessão.');
      router.replace(`/workout/session/${sessionId}`);
    } catch (err: any) {
      Alert.alert(
        'Não foi possível iniciar',
        err?.graphQLErrors?.[0]?.message ?? err?.message ?? `Erro ao iniciar ${isPool ? 'a atividade' : 'o treino'}.`,
      );
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.ink900} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>{isPool ? 'Atividade' : 'Treino'}</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {USE_MOCKS ? (
          <Text style={styles.placeholder}>
            Detalhe de treino indisponível no modo demonstração.
          </Text>
        ) : loading && !plan ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={accent} />
          </View>
        ) : error && !plan ? (
          <View style={styles.centerBox}>
            <Text style={styles.errTitle}>Não conseguimos carregar</Text>
            <Text style={styles.errBody}>{error.message}</Text>
          </View>
        ) : !plan ? (
          <Text style={styles.placeholder}>
            {isPool ? 'Atividade não encontrada.' : 'Ficha não encontrada.'}
          </Text>
        ) : (
          <>
            <View style={[styles.planIcon, { backgroundColor: withAlpha(accent, 0.1) }]}>
              {isPool ? (
                <Waves size={26} color={accent} strokeWidth={2.2} />
              ) : (
                <Dumbbell size={26} color={accent} strokeWidth={2.2} />
              )}
            </View>
            <Text style={styles.planName}>{plan.name}</Text>
            {plan.instructor ? (
              <View style={styles.instrRow}>
                <User size={13} color={theme.ink400} strokeWidth={2} />
                <Text style={styles.instr}>{plan.instructor}</Text>
              </View>
            ) : null}

            <View style={styles.card}>
              {exercises.length === 0 ? (
                <Text style={styles.noEx}>Esta ficha ainda não tem exercícios.</Text>
              ) : (
                exercises.map((ex, i) => (
                  <View
                    key={`${i}-${ex?.name}`}
                    style={[styles.exRow, i === exercises.length - 1 && styles.exRowLast]}
                  >
                    <View style={[styles.exNum, { backgroundColor: withAlpha(accent, 0.1) }]}>
                      <Text style={[styles.exNumText, { color: accent }]}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exName}>{ex?.name}</Text>
                      {ex?.notes ? <Text style={styles.exNotes}>{ex.notes}</Text> : null}
                      <Text style={styles.exDetail}>{exDetail(ex?.sets, ex?.reps)}</Text>
                    </View>
                    <Text style={[styles.exLoad, { color: accent }]}>{ex?.load || '—'}</Text>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity
              onPress={onStart}
              disabled={starting}
              activeOpacity={0.85}
              style={[styles.cta, { backgroundColor: accent }, starting && { opacity: 0.6 }]}
            >
              {starting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Play size={16} color="#fff" strokeWidth={2.5} />
                  <Text style={styles.ctaText}>
                    {isPool ? 'Iniciar atividade' : 'Iniciar treino'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
  content: { padding: 20 },
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, gap: 10 },
  placeholder: { fontSize: 15, color: theme.ink500, textAlign: 'center', marginTop: 40 },
  errTitle: { fontSize: 16, fontWeight: '800', color: theme.ink900 },
  errBody: { fontSize: 13, color: theme.ink500, textAlign: 'center' },

  planIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  planName: { fontSize: 24, fontWeight: '800', color: theme.ink900, letterSpacing: -0.5, marginTop: 14 },
  instrRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  instr: { fontSize: 13, color: theme.ink400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.line,
  },
  noEx: { fontSize: 14, color: theme.ink500, textAlign: 'center', paddingVertical: 22 },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.paper2,
  },
  exRowLast: { borderBottomWidth: 0 },
  exNum: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  exNumText: { fontWeight: '800', fontSize: 12 },
  exName: { fontSize: 15, fontWeight: '600', color: theme.ink900 },
  exNotes: { fontSize: 12, color: theme.ink400, marginTop: 1 },
  exDetail: { fontSize: 12, color: theme.ink400, marginTop: 2 },
  exLoad: { fontSize: 13, fontWeight: '800' },

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
});
