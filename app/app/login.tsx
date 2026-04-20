/**
 * Login screen — student sign-in into the white-labeled app.
 *
 * Mirrors `mockups/app-login.html`. Accent color is the tenant's
 * primary (from `useDashboard`) so the header re-skins per academy.
 * In mock mode, any credentials accept and route to the dashboard.
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
import { Check, Scan } from 'lucide-react-native';

import { useDashboard } from '../hooks/useDashboard';
import { theme, withAlpha } from '../lib/theme';

export default function LoginScreen() {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? '#0A84FF';
  const academyName = data?.academy.name ?? 'Gym';
  const initials = data?.academy.initials ?? 'G';
  const tagline = 'Unidade Vila Mariana';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const handleSubmit = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safe, { backgroundColor: accent }]}
    >
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
            <View
              style={[
                styles.logoBox,
                { backgroundColor: withAlpha('#ffffff', 0.18) },
              ]}
            >
              <Text style={styles.logoText}>{initials}</Text>
            </View>
            <Text style={styles.academyName}>{academyName}</Text>
            <Text style={styles.tagline}>{tagline}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.welcome}>Bem-vindo de volta.</Text>
            <Text style={styles.welcomeSub}>Acesse o app da sua academia.</Text>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="voce@email.com"
                placeholderTextColor={theme.ink300}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={[
                  styles.input,
                  email.length > 0 && {
                    borderColor: accent,
                    shadowColor: accent,
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                  },
                ]}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={theme.ink300}
                secureTextEntry
                autoComplete="current-password"
                style={styles.input}
              />
            </View>

            <View style={styles.extras}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setKeepSignedIn((v) => !v)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    keepSignedIn && {
                      backgroundColor: accent,
                      borderColor: accent,
                    },
                  ]}
                >
                  {keepSignedIn && <Check size={12} color="#fff" strokeWidth={3} />}
                </View>
                <Text style={styles.checkboxLabel}>Manter conectado</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.6}>
                <Text style={[styles.forgot, { color: accent }]}>
                  Esqueci a senha
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: accent }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.biometricBtn} activeOpacity={0.7}>
              <Scan size={18} color={theme.ink700} strokeWidth={1.8} />
              <Text style={styles.biometricText}>Entrar com Face ID</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Não é aluno ainda?{' '}
                <Text style={[styles.footerLink, { color: theme.ink700 }]}>
                  Conheça a {academyName}
                </Text>
              </Text>
              <View style={styles.poweredWrap}>
                <Text style={styles.powered}>POWERED BY GYM</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: theme.paper },
  header: {
    paddingTop: 36,
    paddingBottom: 72,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 26,
    letterSpacing: -0.5,
  },
  academyName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 26,
    letterSpacing: -0.5,
  },
  tagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 6,
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
  welcome: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.ink900,
    letterSpacing: -0.4,
  },
  welcomeSub: {
    fontSize: 14,
    color: theme.ink500,
    marginTop: 4,
    marginBottom: 24,
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 12.5,
    fontWeight: '500',
    color: theme.ink700,
    marginBottom: 6,
  },
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
  extras: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: theme.line,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 13,
    color: theme.ink700,
  },
  forgot: {
    fontSize: 13,
    fontWeight: '500',
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    shadowOpacity: 0.18,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  biometricBtn: {
    marginTop: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 14,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.ink700,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12.5,
    color: theme.ink400,
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: '500',
  },
  poweredWrap: {
    marginTop: 14,
    paddingTop: 14,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: theme.line,
    alignItems: 'center',
  },
  powered: {
    fontSize: 10,
    color: theme.ink300,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
});
