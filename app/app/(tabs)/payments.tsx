/**
 * Finanças tab — next bill, payment history, saved method.
 *
 * Mirrors `mockups/app-payments.html`. The header holds the
 * "próxima cobrança" balance card; the content area below has a
 * status banner (tudo em dia / em atraso), a six-month history list,
 * and the active payment method + an "adicionar cartão" CTA.
 *
 * Data:
 *   - Academy branding from `useDashboard()`.
 *   - Payments content from `MOCK_PAYMENTS`. Swap the import for a
 *     `usePayments()` hook when the backend ships the query.
 */

import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Check,
  CreditCard,
  Download,
  FileText,
  Plus,
  Receipt,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import { useDashboard } from '../../hooks/useDashboard';
import { MOCK_PAYMENTS } from '../../lib/mock-data';
import { theme, withAlpha } from '../../lib/theme';
import type {
  PaymentMethodType,
  PaymentRecord,
  PaymentsData,
} from '../../lib/types';

export default function PaymentsScreen() {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const academyName = data?.academy.name ?? 'Gym';
  const initials = data?.academy.initials ?? 'G';

  const payments = MOCK_PAYMENTS;

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
              accessibilityLabel="Baixar extrato"
            >
              <Download size={18} color="#fff" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eyebrow}>FINANÇAS</Text>
          <Text style={styles.title}>Pagamentos</Text>

          {/* Balance card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Próxima cobrança</Text>
            <View style={styles.balanceAmountRow}>
              <Text style={styles.balanceCurrency}>
                {payments.nextBill.currency}
              </Text>
              <Text style={styles.balanceAmount}>
                {payments.nextBill.amount}
              </Text>
            </View>
            <View style={styles.balanceMeta}>
              <View>
                <Text style={styles.balanceMetaLabel}>VENCIMENTO</Text>
                <Text style={styles.balanceMetaStrong}>
                  {payments.nextBill.dueDate}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.balanceMetaLabel}>MÉTODO</Text>
                <Text style={styles.balanceMetaStrong}>
                  {payments.nextBill.method}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <StatusBanner banner={payments.statusBanner} />

          <Text style={styles.sectionLabel}>HISTÓRICO · ÚLTIMOS 6 MESES</Text>
          {payments.history.map((record) => (
            <PaymentRow key={record.id} record={record} accent={accent} />
          ))}

          <Text style={styles.sectionLabel}>FORMA DE PAGAMENTO</Text>
          <View style={styles.payRow}>
            <View
              style={[
                styles.payIcon,
                { backgroundColor: withAlpha(accent, 0.1) },
              ]}
            >
              <Zap size={18} color={accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.payName}>{payments.savedMethod.label}</Text>
              <Text style={styles.payMeta}>
                {payments.savedMethod.detail}
              </Text>
            </View>
            <View style={styles.payStatusOk}>
              <Text style={styles.payStatusOkText}>ATIVO</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.addMethod}>
            <Plus size={16} color={theme.ink500} strokeWidth={2} />
            <Text style={styles.addMethodText}>
              Adicionar cartão de crédito
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ==================================================================
 * STATUS BANNER — "tudo em dia" / "em atraso"
 * ================================================================ */
function StatusBanner({
  banner,
}: {
  banner: PaymentsData['statusBanner'];
}) {
  const palette = {
    ok:     { bg: '#ecfdf5', border: '#a7f3d0', icon: '#059669' },
    warn:   { bg: '#fffbeb', border: '#fcd34d', icon: '#d97706' },
    danger: { bg: '#fef2f2', border: '#fecaca', icon: '#be123c' },
  }[banner.tone];

  return (
    <View
      style={[
        styles.statusBanner,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <View style={[styles.bannerIcon, { backgroundColor: palette.icon }]}>
        <Check size={18} color="#fff" strokeWidth={2.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>{banner.title}</Text>
        <Text style={styles.bannerSub}>{banner.body}</Text>
      </View>
    </View>
  );
}

/* ==================================================================
 * PAYMENT ROW — one row in the history list
 * ================================================================ */
function PaymentRow({
  record,
  accent,
}: {
  record: PaymentRecord;
  accent: string;
}) {
  const Icon = iconFor(record.method);
  return (
    <View style={styles.payRow}>
      <View
        style={[
          styles.payIcon,
          { backgroundColor: withAlpha(accent, 0.1) },
        ]}
      >
        <Icon size={18} color={accent} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.payName} numberOfLines={1}>
          {record.name}
        </Text>
        <Text style={styles.payMeta}>{record.meta}</Text>
      </View>
      <View style={styles.payRight}>
        <Text style={styles.payAmount}>{record.amount}</Text>
        <PayStatusPill status={record.status} />
      </View>
    </View>
  );
}

function PayStatusPill({ status }: { status: PaymentRecord['status'] }) {
  const map = {
    paid:    { label: 'PAGO',     bg: '#ecfdf5', color: '#059669' },
    pending: { label: 'PENDENTE', bg: '#fffbeb', color: '#d97706' },
    overdue: { label: 'ATRASO',   bg: '#fef2f2', color: '#be123c' },
  }[status];

  return (
    <View style={[styles.payStatus, { backgroundColor: map.bg }]}>
      <Text style={[styles.payStatusText, { color: map.color }]}>
        {map.label}
      </Text>
    </View>
  );
}

function iconFor(method: PaymentMethodType): LucideIcon {
  switch (method) {
    case 'pix':
      return Zap;
    case 'card':
      return CreditCard;
    case 'boleto':
      return FileText;
    case 'other':
    default:
      return Receipt;
  }
}

// Suppress unused-import warnings for the Wallet icon kept as future use.
void Wallet;

/* ==================================================================
 * STYLES
 * ================================================================ */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 32 },

  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 32,
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

  balanceCard: {
    marginTop: 20,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  balanceCurrency: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
    marginTop: 6,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 42,
  },
  balanceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  balanceMetaLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  balanceMetaStrong: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: -0.2,
  },

  content: {
    marginTop: -20,
    backgroundColor: theme.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.ink900,
  },
  bannerSub: {
    fontSize: 12,
    color: theme.ink500,
    marginTop: 2,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  payIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.ink900,
  },
  payMeta: {
    fontSize: 10,
    color: theme.ink400,
    marginTop: 3,
    letterSpacing: 0.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  payRight: {
    alignItems: 'flex-end',
  },
  payAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.ink900,
  },
  payStatus: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 5,
  },
  payStatusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  payStatusOk: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.emerald50,
  },
  payStatusOkText: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.emerald,
    letterSpacing: 0.5,
  },

  addMethod: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.line,
    borderRadius: 14,
  },
  addMethodText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.ink500,
  },
});
