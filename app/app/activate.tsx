/**
 * Activation screen — self-service first access ("completar cadastro").
 *
 * For students imported in bulk (or created without a chosen password).
 * They prove identity with data the academy already has on file (email +
 * birthdate, falling back to phone) and set their own password. On success
 * the backend returns a JWT and the student lands logged in.
 *
 * Mirrors the login screen's white-labeled look. The academy comes from
 * EXPO_PUBLIC_ACADEMY_SLUG (this build's tenant).
 */

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
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
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { useAcademyBranding } from '../hooks/useAcademyBranding';
import { activateAccount } from '../lib/auth';
import { ACADEMY_SLUG } from '../lib/config';
import { brDateToISO } from '../lib/format';
import { theme, withAlpha } from '../lib/theme';

export default function ActivateScreen() {
  const branding = useAcademyBranding();
  const accent = branding.primaryColor;

  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim()) return setError('Informe seu e-mail.');
    if (!birthdate.trim() && !phone.trim()) {
      return setError('Confirme sua data de nascimento ou telefone.');
    }
    if (password.length < 6) {
      return setError('A senha precisa ter pelo menos 6 caracteres.');
    }
    if (password !== confirm) {
      return setError('As senhas não conferem.');
    }
    if (!ACADEMY_SLUG) {
      return setError(
        'Academia não configurada neste app. Fale com a recepção.',
      );
    }

    const iso = brDateToISO(birthdate);
    if (birthdate.trim() && !iso) {
      return setError('Data de nascimento inválida. Use DD/MM/AAAA.');
    }

    setSubmitting(true);
    try {
      await activateAccount({
        academySlug: ACADEMY_SLUG,
        email: email.trim(),
        birthdate: iso || undefined,
        phone: phone.trim() || undefined,
        password,
      });
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao ativar a conta.');
      setSubmitting(false);
    }
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
          {/* Header */}
          <View style={[styles.header, { backgroundColor: accent }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
              accessibilityLabel="Voltar"
            >
              <ArrowLeft size={18} color="#fff" strokeWidth={2.2} />
              <Text style={styles.backText}>Entrar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Primeiro acesso</Text>
            <Text style={styles.subtitle}>
              Ative sua conta na {branding.name} e crie sua senha.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View
              style={[styles.hint, { backgroundColor: withAlpha(accent, 0.08) }]}
            >
              <Text style={styles.hintText}>
                Confirme o e-mail cadastrado na academia e a sua{' '}
                <Text style={styles.hintStrong}>data de nascimento</Text> ou{' '}
                <Text style={styles.hintStrong}>telefone</Text> para a gente te
                identificar.
              </Text>
            </View>

            <Field label="E-mail">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="voce@email.com"
                placeholderTextColor={theme.ink300}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={styles.input}
              />
            </Field>

            <Field label="Data de nascimento" help="DD/MM/AAAA">
              <TextInput
                value={birthdate}
                onChangeText={setBirthdate}
                placeholder="01/12/1990"
                placeholderTextColor={theme.ink300}
                keyboardType="numbers-and-punctuation"
                style={styles.input}
              />
            </Field>

            <Field label="Telefone" help="se não souber a data de nascimento">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="(11) 98888-1111"
                placeholderTextColor={theme.ink300}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </Field>

            <View style={styles.divider} />

            <Field label="Crie uma senha">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="mínimo 6 caracteres"
                placeholderTextColor={theme.ink300}
                secureTextEntry
                style={styles.input}
              />
            </Field>

            <Field label="Confirme a senha">
              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="repita a senha"
                placeholderTextColor={theme.ink300}
                secureTextEntry
                style={styles.input}
              />
            </Field>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: accent, opacity: submitting ? 0.7 : 1 },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={submitting}
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? 'Ativando…' : 'Ativar e entrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={styles.loginLink}
            >
              <Text style={styles.loginLinkText}>
                Já tem senha?{' '}
                <Text style={[styles.loginLinkStrong, { color: accent }]}>
                  Entrar
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {help ? <Text style={styles.help}>{help}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: theme.paper },
  header: {
    paddingTop: 12,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '500' },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 26,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  form: {
    marginTop: -28,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: theme.paper,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
  },
  hint: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  hintText: { fontSize: 13, color: theme.ink600, lineHeight: 19 },
  hintStrong: { fontWeight: '700', color: theme.ink900 },
  field: { marginBottom: 14 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { fontSize: 12.5, fontWeight: '500', color: theme.ink700 },
  help: { fontSize: 11, color: theme.ink400 },
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
  divider: {
    height: 1,
    backgroundColor: theme.line,
    marginVertical: 8,
  },
  errorText: { fontSize: 13, color: '#be123c', marginBottom: 10 },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    shadowOpacity: 0.18,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  loginLink: { marginTop: 18, alignItems: 'center' },
  loginLinkText: { fontSize: 13.5, color: theme.ink500 },
  loginLinkStrong: { fontWeight: '600' },
});
