/**
 * Academy picker (Fase 9) — first launch of a generic (multi-tenant) build.
 *
 * The student types their academy's identifier (slug) — or pastes a link /
 * deep link — and we validate it against the public `academyBySlug` query.
 * On a hit we preview the academy's branding, persist the slug to SecureStore
 * (via AcademyProvider), and continue to login. A baked single-tenant build
 * never reaches here (the entry gate already has a slug).
 *
 * Accepts a `?slug=` param so `gymapp://academy?slug=<slug>` deep-links
 * straight to a pre-filled, auto-validated picker.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useLazyQuery } from '@apollo/client/react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ArrowRight, Building2, QrCode, X } from 'lucide-react-native';

import { AcademyBySlugDocument } from '../gql/graphql';
import { useActiveAcademy } from '../lib/academy-provider';
import { normalizeSlug } from '../lib/academy';
import { theme } from '../lib/theme';

const BRAND = '#0A84FF';

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function AcademyPickerScreen() {
  const { setSlug } = useActiveAcademy();
  const params = useLocalSearchParams<{ slug?: string }>();

  const [value, setValue] = useState('');
  const [entering, setEntering] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [lookup, { data, loading, error, called }] = useLazyQuery<any>(
    AcademyBySlugDocument,
    { fetchPolicy: 'network-only' },
  );

  const academy = data?.academyBySlug ?? null;
  const notFound = called && !loading && !error && !academy;

  const submit = (raw: string) => {
    const slug = normalizeSlug(raw);
    if (!slug) return;
    lookup({ variables: { slug } });
  };

  const openScanner = async () => {
    setScanError(null);
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setScanError('Permissão de câmera negada. Você pode digitar o identificador.');
        return;
      }
    }
    setScanning(true);
  };

  // A QR encodes a deep link / URL / slug; normalizeSlug pulls out the slug.
  const onScanned = ({ data: raw }: { data: string }) => {
    if (!scanning) return; // ignore the burst after the first hit
    const slug = normalizeSlug(raw);
    setScanning(false);
    if (!slug) {
      setScanError('QR não reconhecido. Tente de novo ou digite o identificador.');
      return;
    }
    setValue(slug);
    submit(slug);
  };

  // Deep-link prefill: gymapp://academy?slug=<slug>
  useEffect(() => {
    const incoming = normalizeSlug(
      typeof params.slug === 'string' ? params.slug : undefined,
    );
    if (incoming) {
      setValue(incoming);
      submit(incoming);
    }
    // run once on mount with the incoming param
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accent = academy?.primaryColor || BRAND;

  const handleContinue = async () => {
    if (!academy?.slug) return;
    setEntering(true);
    await setSlug(academy.slug);
    router.replace('/login');
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: accent }]}>
      <StatusBar barStyle="light-content" backgroundColor={accent} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, { backgroundColor: accent }]}>
            <View style={styles.logoBox}>
              <Building2 size={30} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.title}>Encontre sua academia</Text>
            <Text style={styles.subtitle}>
              Digite o identificador da sua academia para começar.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Identificador da academia</Text>
            <TextInput
              value={value}
              onChangeText={setValue}
              onSubmitEditing={() => submit(value)}
              placeholder="ex: crossfit-sp"
              placeholderTextColor={theme.ink300}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.input}
            />
            <Text style={styles.hint}>
              É o nome curto da sua academia (ou cole o link que ela enviou).
            </Text>

            <TouchableOpacity
              style={[styles.scanBtn, { borderColor: accent }]}
              onPress={openScanner}
              activeOpacity={0.85}
            >
              <QrCode size={18} color={accent} strokeWidth={2.2} />
              <Text style={[styles.scanBtnText, { color: accent }]}>Escanear QR da academia</Text>
            </TouchableOpacity>

            {scanError ? <Text style={styles.errorText}>{scanError}</Text> : null}

            {loading ? (
              <View style={styles.statusRow}>
                <ActivityIndicator color={accent} />
                <Text style={styles.statusText}>Procurando…</Text>
              </View>
            ) : null}

            {error ? (
              <Text style={styles.errorText}>
                Não foi possível verificar agora. Tente de novo.
              </Text>
            ) : null}

            {notFound ? (
              <Text style={styles.errorText}>
                Academia não encontrada. Confira o identificador.
              </Text>
            ) : null}

            {academy ? (
              <View style={[styles.preview, { borderColor: accent }]}>
                <View style={[styles.previewLogo, { backgroundColor: accent }]}>
                  <Text style={styles.previewInitials}>{initialsOf(academy.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewName}>{academy.name}</Text>
                  <Text style={styles.previewSlug}>{academy.slug}</Text>
                </View>
              </View>
            ) : null}

            {academy ? (
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: accent, opacity: entering ? 0.7 : 1 }]}
                onPress={handleContinue}
                activeOpacity={0.85}
                disabled={entering}
              >
                <Text style={styles.primaryBtnText}>
                  {entering ? 'Entrando…' : `Entrar na ${academy.name}`}
                </Text>
                <ArrowRight size={18} color="#fff" strokeWidth={2.4} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: accent, opacity: normalizeSlug(value) ? 1 : 0.5 },
                ]}
                onPress={() => submit(value)}
                activeOpacity={0.85}
                disabled={!normalizeSlug(value) || loading}
              >
                <Text style={styles.primaryBtnText}>Continuar</Text>
                <ArrowRight size={18} color="#fff" strokeWidth={2.4} />
              </TouchableOpacity>
            )}

            <View style={styles.poweredWrap}>
              <Text style={styles.powered}>POWERED BY GYM</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={scanning} animationType="slide" onRequestClose={() => setScanning(false)}>
        <View style={styles.scanRoot}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanning ? onScanned : undefined}
          />
          <SafeAreaView style={styles.scanOverlay} edges={['top', 'bottom']}>
            <Text style={styles.scanHint}>Aponte para o QR da sua academia</Text>
            <View style={styles.scanFrame} />
            <TouchableOpacity
              style={styles.scanCancel}
              onPress={() => setScanning(false)}
              activeOpacity={0.8}
            >
              <X size={18} color="#fff" strokeWidth={2.4} />
              <Text style={styles.scanCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: theme.paper },
  header: {
    paddingTop: 48,
    paddingBottom: 72,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { color: '#fff', fontWeight: '700', fontSize: 24, letterSpacing: -0.5 },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginTop: -28,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: theme.paper,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
  },
  label: { fontSize: 12.5, fontWeight: '500', color: theme.ink700, marginBottom: 6 },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    fontSize: 15,
    color: theme.ink900,
  },
  hint: { fontSize: 12, color: theme.ink400, marginTop: 8, lineHeight: 17 },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  scanBtnText: { fontSize: 14, fontWeight: '700' },
  scanRoot: { flex: 1, backgroundColor: '#000' },
  scanOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scanHint: {
    position: 'absolute',
    top: 80,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: 'transparent',
  },
  scanCancel: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanCancelText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  statusText: { fontSize: 13, color: theme.ink500 },
  errorText: { fontSize: 13, color: '#be123c', marginTop: 16 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  previewLogo: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInitials: { color: '#fff', fontWeight: '700', fontSize: 15 },
  previewName: { fontSize: 15, fontWeight: '700', color: theme.ink900, letterSpacing: -0.2 },
  previewSlug: { fontSize: 12.5, color: theme.ink400, marginTop: 2 },
  primaryBtn: {
    marginTop: 24,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  poweredWrap: {
    marginTop: 'auto',
    paddingTop: 24,
    alignItems: 'center',
  },
  powered: {
    fontSize: 10,
    color: theme.ink300,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
});
