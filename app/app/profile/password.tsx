/**
 * Change password screen (Fase 5).
 *
 * Calls updateMyPassword(oldPassword, newPassword). The backend verifies
 * the current password, enforces min length and "different from current",
 * and surfaces those as errors here.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { router } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useMutation } from '@apollo/client/react';

import { useDashboard } from '../../hooks/useDashboard';
import { UpdateMyPasswordDocument } from '../../gql/graphql';
import { theme } from '../../lib/theme';

export default function ChangePasswordScreen() {
  const { data: dash } = useDashboard();
  const accent = dash?.academy.primaryColor ?? theme.ink900;

  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [updatePassword, { loading }] = useMutation<any>(UpdateMyPasswordDocument);

  const onSubmit = async () => {
    setError(null);
    if (!oldPassword || !newPassword) {
      setError('Preencha a senha atual e a nova senha.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirm) {
      setError('A confirmação não confere com a nova senha.');
      return;
    }
    try {
      const res = await updatePassword({ variables: { oldPassword, newPassword } });
      if (res.data?.updateMyPassword) setDone(true);
      else setError('Não foi possível alterar a senha.');
    } catch (e: any) {
      setError(e?.message ?? 'Não foi possível alterar a senha.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.ink900} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Alterar senha</Text>
        <View style={styles.back} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {done ? (
            <View style={styles.doneBox}>
              <View style={[styles.doneIcon, { backgroundColor: theme.emerald }]}>
                <Check size={30} color="#fff" strokeWidth={3} />
              </View>
              <Text style={styles.doneTitle}>Senha alterada</Text>
              <Text style={styles.doneSub}>Use a nova senha no próximo login.</Text>
              <TouchableOpacity
                style={[styles.submit, { backgroundColor: accent, marginTop: 24 }]}
                onPress={() => router.back()}
                activeOpacity={0.85}
              >
                <Text style={styles.submitText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Field label="SENHA ATUAL" value={oldPassword} onChange={setOld} />
              <Field label="NOVA SENHA" value={newPassword} onChange={setNew} />
              <Field label="CONFIRMAR NOVA SENHA" value={confirm} onChange={setConfirm} />

              <TouchableOpacity
                style={[styles.submit, { backgroundColor: accent }, loading && { opacity: 0.6 }]}
                onPress={onSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Alterar senha</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        secureTextEntry
        autoCapitalize="none"
        placeholderTextColor={theme.ink300}
      />
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
  content: { padding: 20, paddingBottom: 48 },

  error: { color: '#be123c', fontSize: 13, marginBottom: 12, fontWeight: '600' },
  label: { fontSize: 10, fontWeight: '700', color: theme.ink400, letterSpacing: 0.8, marginBottom: 6 },
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
  submit: {
    marginTop: 8,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  doneBox: { alignItems: 'center', paddingTop: 48 },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  doneTitle: { fontSize: 20, fontWeight: '800', color: theme.ink900 },
  doneSub: { fontSize: 14, color: theme.ink500, marginTop: 6 },
});
