/**
 * Booking detail — /booking/[id] (Fase 2 — wired).
 *
 * Reads a single ClassBooking via the BookingDetail query and lets the
 * owner cancel it (same 24h-window rule the backend enforces — the error
 * surfaces here if outside the window).
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
import { ArrowLeft, Calendar, Clock, MapPin, User } from 'lucide-react-native';

import { BookingDetailDocument, CancelMyBookingDocument } from '../../gql/graphql';
import { useDashboard } from '../../hooks/useDashboard';
import { USE_MOCKS } from '../../lib/config';
import { fmtDateBR, hhmm } from '../../lib/format';
import { theme, withAlpha } from '../../lib/theme';

const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  confirmed: { label: 'CONFIRMADA', bg: theme.emerald50, fg: theme.emerald },
  waitlist: { label: 'LISTA DE ESPERA', bg: '#fffbeb', fg: '#d97706' },
  cancelled: { label: 'CANCELADA', bg: '#fef2f2', fg: '#be123c' },
  attended: { label: 'PRESENÇA CONFIRMADA', bg: theme.emerald50, fg: theme.emerald },
  missed: { label: 'FALTOU', bg: '#fef2f2', fg: '#be123c' },
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dash } = useDashboard();
  const accent = dash?.academy.primaryColor ?? theme.ink900;

  const { data, loading, error, refetch } = useQuery<any>(BookingDetailDocument, {
    variables: { documentId: id },
    skip: USE_MOCKS || !id,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const [cancelMutation, { loading: cancelling }] = useMutation<any>(
    CancelMyBookingDocument,
  );

  const booking = data?.classBooking;
  const sched = booking?.classSchedule;
  const status = booking?.status as string | undefined;
  const canCancel = status === 'confirmed' || status === 'waitlist';

  const onCancel = () => {
    Alert.alert('Cancelar reserva', 'Deseja cancelar esta reserva?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMutation({ variables: { documentId: id } });
            await refetch();
            Alert.alert('Pronto', 'Reserva cancelada.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (err: any) {
            Alert.alert(
              'Não foi possível',
              err?.graphQLErrors?.[0]?.message ??
                err?.message ??
                'Erro ao cancelar.',
            );
          }
        },
      },
    ]);
  };

  const pill = (status && STATUS_LABEL[status]) || null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.ink900} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Reserva</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {USE_MOCKS ? (
          <Text style={styles.placeholder}>
            Detalhe de reserva indisponível no modo demonstração.
          </Text>
        ) : loading && !booking ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={accent} />
          </View>
        ) : error && !booking ? (
          <View style={styles.centerBox}>
            <Text style={styles.errTitle}>Não conseguimos carregar</Text>
            <Text style={styles.errBody}>{error.message}</Text>
          </View>
        ) : !booking ? (
          <Text style={styles.placeholder}>Reserva não encontrada.</Text>
        ) : (
          <>
            <Text style={styles.className}>{sched?.name ?? 'Aula'}</Text>
            {pill ? (
              <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                <Text style={[styles.pillText, { color: pill.fg }]}>{pill.label}</Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <InfoRow Icon={Calendar} label="Data" value={fmtDateBR(booking.date)} accent={accent} />
              <InfoRow
                Icon={Clock}
                label="Horário"
                value={
                  sched?.startTime
                    ? `${hhmm(sched.startTime)}${sched?.endTime ? ` → ${hhmm(sched.endTime)}` : ''}`
                    : '—'
                }
                accent={accent}
              />
              <InfoRow Icon={User} label="Instrutor" value={sched?.instructor || '—'} accent={accent} />
              <InfoRow Icon={MapPin} label="Sala" value={sched?.room || '—'} accent={accent} last />
            </View>

            {canCancel ? (
              <TouchableOpacity
                onPress={onCancel}
                disabled={cancelling}
                activeOpacity={0.85}
                style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
              >
                {cancelling ? (
                  <ActivityIndicator color="#be123c" />
                ) : (
                  <Text style={styles.cancelBtnText}>Cancelar reserva</Text>
                )}
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  Icon,
  label,
  value,
  accent,
  last,
}: {
  Icon: any;
  label: string;
  value: string;
  accent: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <View style={[styles.rowIcon, { backgroundColor: withAlpha(accent, 0.1) }]}>
        <Icon size={16} color={accent} strokeWidth={2.2} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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

  className: { fontSize: 24, fontWeight: '800', color: theme.ink900, letterSpacing: -0.5 },
  pill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  pillText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.paper2,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 13, color: theme.ink400, flex: 1 },
  rowValue: { fontSize: 14, fontWeight: '600', color: theme.ink900 },

  cancelBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelBtnText: { color: '#be123c', fontWeight: '700', fontSize: 14 },
});
