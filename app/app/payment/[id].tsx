/**
 * Payment checkout screen (Fase 4).
 *
 * Three method tabs — PIX / Boleto / Cartão — each driving a charge
 * through the backend's provider-agnostic gateway (mocked until a real
 * provider is chosen). PIX/boleto return artifacts and stay "pending"
 * until confirmed; the "Simular confirmação" button stands in for the
 * gateway webhook so the cycle completes without a real provider. Card
 * is approved/declined synchronously by the mock.
 *
 * The payment itself is read from usePayments() (student-scoped), so a
 * deep-link can't surface someone else's charge.
 */

import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  FileText,
  Zap,
} from 'lucide-react-native';
import { useMutation } from '@apollo/client/react';

import { usePayments } from '../../hooks/usePayments';
import {
  ConfirmMockChargeDocument,
  MyNextPaymentDocument,
  MyPaymentsDocument,
  PayChargeBoletoDocument,
  PayChargeCardDocument,
  PayChargePixDocument,
} from '../../gql/graphql';
import { theme, withAlpha } from '../../lib/theme';
import { useDashboard } from '../../hooks/useDashboard';

type Method = 'pix' | 'boleto' | 'card';

const REFETCH = [
  { query: MyPaymentsDocument, variables: { limit: 24 } },
  { query: MyNextPaymentDocument },
];

export default function PaymentCheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: dash } = useDashboard();
  const accent = dash?.academy.primaryColor ?? theme.ink900;

  const { history, loading, refetch } = usePayments();
  const record = useMemo(
    () => history.find((p) => p.documentId === id) ?? null,
    [history, id],
  );

  const [method, setMethod] = useState<Method>('pix');
  const [done, setDone] = useState(false);

  // PIX / boleto artifacts.
  const [pix, setPix] = useState<{ copyPaste: string; expiresAt: string } | null>(null);
  const [boleto, setBoleto] = useState<{ boletoUrl: string; barCode: string } | null>(null);

  // Card form.
  const [card, setCard] = useState({ number: '', holderName: '', expiry: '', cvv: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const [chargePix, pixState] = useMutation<any>(PayChargePixDocument);
  const [chargeBoleto, boletoState] = useMutation<any>(PayChargeBoletoDocument);
  const [chargeCard, cardState] = useMutation<any>(PayChargeCardDocument, {
    refetchQueries: REFETCH,
  });
  const [confirmMock, confirmState] = useMutation<any>(ConfirmMockChargeDocument, {
    refetchQueries: REFETCH,
  });

  const finish = () => {
    setDone(true);
    refetch();
  };

  const onGeneratePix = async () => {
    setFormError(null);
    try {
      const res = await chargePix({ variables: { paymentId: id } });
      const c = res.data?.payChargePix;
      if (c) setPix({ copyPaste: c.copyPaste, expiresAt: c.expiresAt });
    } catch (e: any) {
      setFormError(e?.message ?? 'Falha ao gerar PIX.');
    }
  };

  const onGenerateBoleto = async () => {
    setFormError(null);
    try {
      const res = await chargeBoleto({ variables: { paymentId: id } });
      const c = res.data?.payChargeBoleto;
      if (c) setBoleto({ boletoUrl: c.boletoUrl, barCode: c.barCode });
    } catch (e: any) {
      setFormError(e?.message ?? 'Falha ao gerar boleto.');
    }
  };

  const onPayCard = async () => {
    setFormError(null);
    if (!card.number || !card.holderName || !card.expiry || !card.cvv) {
      setFormError('Preencha todos os campos do cartão.');
      return;
    }
    try {
      const res = await chargeCard({ variables: { paymentId: id, card } });
      if (res.data?.payChargeCard?.status === 'paid') finish();
      else setFormError('Pagamento não confirmado.');
    } catch (e: any) {
      setFormError(e?.message ?? 'Cartão recusado.');
    }
  };

  const onSimulateConfirm = async () => {
    try {
      await confirmMock({ variables: { paymentId: id } });
      finish();
    } catch (e: any) {
      setFormError(e?.message ?? 'Falha ao confirmar.');
    }
  };

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  /* ---------- render ---------- */
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.ink900} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Cobrança</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading && !record ? (
          <ActivityIndicator color={accent} style={{ marginTop: 40 }} />
        ) : !record ? (
          <Text style={styles.muted}>Cobrança não encontrada.</Text>
        ) : done || record.status === 'paid' ? (
          <PaidState accent={accent} amount={record.amount} name={record.name} />
        ) : (
          <>
            {/* Summary */}
            <View style={styles.summary}>
              <Text style={styles.summaryName}>{record.name}</Text>
              <Text style={styles.summaryMeta}>{record.meta}</Text>
              <Text style={[styles.summaryAmount, { color: accent }]}>{record.amount}</Text>
            </View>

            {/* Method tabs */}
            <View style={styles.tabs}>
              <MethodTab label="PIX" icon={Zap} active={method === 'pix'} accent={accent} onPress={() => setMethod('pix')} />
              <MethodTab label="Boleto" icon={FileText} active={method === 'boleto'} accent={accent} onPress={() => setMethod('boleto')} />
              <MethodTab label="Cartão" icon={CreditCard} active={method === 'card'} accent={accent} onPress={() => setMethod('card')} />
            </View>

            {formError ? <Text style={styles.error}>{formError}</Text> : null}

            {method === 'pix' && (
              <View style={styles.panel}>
                {!pix ? (
                  <PrimaryButton accent={accent} busy={pixState.loading} onPress={onGeneratePix} label="Gerar código PIX" />
                ) : (
                  <>
                    <Text style={styles.label}>PIX COPIA E COLA</Text>
                    <View style={styles.codeBox}>
                      <Text style={styles.code} selectable numberOfLines={3}>
                        {pix.copyPaste}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.copyBtn} onPress={() => copy(pix.copyPaste)} activeOpacity={0.8}>
                      <Copy size={15} color={accent} strokeWidth={2.2} />
                      <Text style={[styles.copyText, { color: accent }]}>Copiar código</Text>
                    </TouchableOpacity>
                    <Text style={styles.hint}>
                      Expira em {new Date(pix.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
                    </Text>
                    <SimulateButton busy={confirmState.loading} onPress={onSimulateConfirm} />
                  </>
                )}
              </View>
            )}

            {method === 'boleto' && (
              <View style={styles.panel}>
                {!boleto ? (
                  <PrimaryButton accent={accent} busy={boletoState.loading} onPress={onGenerateBoleto} label="Gerar boleto" />
                ) : (
                  <>
                    <Text style={styles.label}>LINHA DIGITÁVEL</Text>
                    <View style={styles.codeBox}>
                      <Text style={styles.code} selectable>{boleto.barCode}</Text>
                    </View>
                    <TouchableOpacity style={styles.copyBtn} onPress={() => copy(boleto.barCode)} activeOpacity={0.8}>
                      <Copy size={15} color={accent} strokeWidth={2.2} />
                      <Text style={[styles.copyText, { color: accent }]}>Copiar linha digitável</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.copyBtn} onPress={() => Linking.openURL(boleto.boletoUrl)} activeOpacity={0.8}>
                      <FileText size={15} color={accent} strokeWidth={2.2} />
                      <Text style={[styles.copyText, { color: accent }]}>Abrir boleto (PDF)</Text>
                    </TouchableOpacity>
                    <SimulateButton busy={confirmState.loading} onPress={onSimulateConfirm} />
                  </>
                )}
              </View>
            )}

            {method === 'card' && (
              <View style={styles.panel}>
                <Field label="NÚMERO DO CARTÃO" value={card.number} onChange={(v: string) => setCard({ ...card, number: v })} placeholder="0000 0000 0000 0000" keyboardType="number-pad" />
                <Field label="NOME IMPRESSO" value={card.holderName} onChange={(v: string) => setCard({ ...card, holderName: v })} placeholder="NOME COMPLETO" autoCapitalize="characters" />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Field label="VALIDADE" value={card.expiry} onChange={(v: string) => setCard({ ...card, expiry: v })} placeholder="MM/AA" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="CVV" value={card.cvv} onChange={(v: string) => setCard({ ...card, cvv: v })} placeholder="123" keyboardType="number-pad" secureTextEntry />
                  </View>
                </View>
                <PrimaryButton accent={accent} busy={cardState.loading} onPress={onPayCard} label={`Pagar ${record.amount}`} />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- subcomponents ---------- */
function MethodTab({ label, icon: Icon, active, accent, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && { backgroundColor: withAlpha(accent, 0.1), borderColor: accent }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon size={16} color={active ? accent : theme.ink400} strokeWidth={2.2} />
      <Text style={[styles.tabText, { color: active ? accent : theme.ink500 }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function PrimaryButton({ accent, busy, onPress, label }: any) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, { backgroundColor: accent }, busy && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={busy}
      activeOpacity={0.85}
    >
      {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{label}</Text>}
    </TouchableOpacity>
  );
}

function SimulateButton({ busy, onPress }: any) {
  return (
    <TouchableOpacity style={styles.simulate} onPress={onPress} disabled={busy} activeOpacity={0.8}>
      <Text style={styles.simulateText}>{busy ? 'Confirmando…' : 'Simular confirmação (mock)'}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, value, onChange, ...rest }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={theme.ink300}
        {...rest}
      />
    </View>
  );
}

function PaidState({ accent, amount, name }: { accent: string; amount: string; name: string }) {
  return (
    <View style={styles.paid}>
      <View style={[styles.paidIcon, { backgroundColor: theme.emerald }]}>
        <Check size={32} color="#fff" strokeWidth={3} />
      </View>
      <Text style={styles.paidTitle}>Pagamento confirmado</Text>
      <Text style={styles.paidSub}>{name}</Text>
      <Text style={[styles.paidAmount, { color: accent }]}>{amount}</Text>
      <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: accent, marginTop: 24 }]} onPress={() => router.back()} activeOpacity={0.85}>
        <Text style={styles.primaryText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- styles ---------- */
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
  content: { padding: 20, paddingBottom: 48 },
  muted: { fontSize: 15, color: theme.ink500, textAlign: 'center', marginTop: 40 },

  summary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  summaryName: { fontSize: 16, fontWeight: '700', color: theme.ink900 },
  summaryMeta: {
    fontSize: 10,
    color: theme.ink400,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryAmount: { fontSize: 30, fontWeight: '800', marginTop: 12, letterSpacing: -1 },

  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: '#fff',
  },
  tabText: { fontSize: 13, fontWeight: '700' },

  panel: { marginTop: 4 },
  error: {
    color: '#be123c',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },

  label: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  codeBox: {
    backgroundColor: theme.paper2,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    padding: 14,
  },
  code: { fontFamily: 'monospace', fontSize: 13, color: theme.ink700, lineHeight: 20 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  copyText: { fontSize: 13, fontWeight: '700' },
  hint: { fontSize: 12, color: theme.ink400, textAlign: 'center', marginTop: 12 },

  input: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.ink900,
    backgroundColor: '#fff',
  },

  primaryBtn: {
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  simulate: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.line,
    alignItems: 'center',
  },
  simulateText: { color: theme.ink500, fontWeight: '600', fontSize: 12 },

  paid: { alignItems: 'center', paddingTop: 48 },
  paidIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paidTitle: { fontSize: 20, fontWeight: '800', color: theme.ink900 },
  paidSub: { fontSize: 14, color: theme.ink500, marginTop: 6 },
  paidAmount: { fontSize: 28, fontWeight: '800', marginTop: 10, letterSpacing: -1 },
});
