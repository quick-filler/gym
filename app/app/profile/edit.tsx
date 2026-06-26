/**
 * Edit profile screen (Fase 5).
 *
 * Self-service edit of the whitelisted fields (phone, birthdate, gender,
 * address, photo). Photo upload goes direct-to-S3 via the gym's presigned
 * flow: mintUploadUrl → PUT bytes → confirmUpload → set photo id. Saving
 * calls updateMyProfile, which on the backend ignores any field outside
 * the whitelist.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { useMutation } from '@apollo/client/react';

import { useProfile } from '../../hooks/useProfile';
import { useDashboard } from '../../hooks/useDashboard';
import {
  ConfirmUploadDocument,
  MintUploadUrlDocument,
  MyProfileDocument,
  UpdateMyProfileDocument,
} from '../../gql/graphql';
import { theme, withAlpha } from '../../lib/theme';

const GENDERS: Array<{ value: string; label: string }> = [
  { value: 'female', label: 'Feminino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Outro' },
];

export default function EditProfileScreen() {
  const { data: dash } = useDashboard();
  const accent = dash?.academy.primaryColor ?? theme.ink900;

  const { editable, photoUrl, loading: loadingProfile } = useProfile();

  const [form, setForm] = useState(editable);
  const [photoPreview, setPhotoPreview] = useState<string | null>(photoUrl);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate the form once, when the profile query first resolves (API mode).
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current || loadingProfile) return;
    hydrated.current = true;
    setForm(editable);
    setPhotoPreview(photoUrl);
    // editable/photoUrl intentionally read once on first resolve.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingProfile]);

  const [updateProfile, updateState] = useMutation<any>(UpdateMyProfileDocument, {
    refetchQueries: [{ query: MyProfileDocument }],
  });
  const [mintUrl] = useMutation<any>(MintUploadUrlDocument);
  const [confirmUpload] = useMutation<any>(ConfirmUploadDocument);

  const setAddr = (key: keyof typeof form.address, v: string) =>
    setForm((f) => ({ ...f, address: { ...f.address, [key]: v } }));

  const pickPhoto = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Permissão de acesso às fotos negada.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    setUploading(true);
    try {
      const contentType = asset.mimeType ?? 'image/jpeg';
      const filename = asset.fileName ?? `photo-${Date.now()}.jpg`;
      const blob = await (await fetch(asset.uri)).blob();
      const size = asset.fileSize ?? blob.size;

      const minted = await mintUrl({ variables: { filename, contentType, size } });
      const { uploadUrl, publicUrl } = minted.data.mintUploadUrl;

      const put = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });
      if (!put.ok) throw new Error('Falha ao enviar a imagem.');

      const confirmed = await confirmUpload({
        variables: { url: publicUrl, name: filename },
      });
      setPhotoId(confirmed.data.confirmUpload.documentId);
      setPhotoPreview(confirmed.data.confirmUpload.url ?? asset.uri);
    } catch (e: any) {
      setError(e?.message ?? 'Falha no upload da foto.');
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    setError(null);
    try {
      const input: any = {
        phone: form.phone || null,
        birthdate: form.birthdate || null,
        gender: form.gender || null,
        address: form.address,
      };
      if (photoId) input.photo = photoId;
      await updateProfile({ variables: { input } });
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'Não foi possível salvar.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.ink900} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar dados</Text>
        <View style={styles.back} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Photo */}
          <View style={styles.photoWrap}>
            <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85} disabled={uploading}>
              {photoPreview ? (
                <Image source={{ uri: photoPreview }} style={styles.photo} />
              ) : (
                <View style={[styles.photo, { backgroundColor: withAlpha(accent, 0.12) }]}>
                  <Camera size={26} color={accent} strokeWidth={2} />
                </View>
              )}
              <View style={[styles.photoBadge, { backgroundColor: accent }]}>
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Camera size={14} color="#fff" strokeWidth={2.5} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>Toque para trocar a foto</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Field label="TELEFONE" value={form.phone} onChange={(v: string) => setForm((f) => ({ ...f, phone: v }))} placeholder="(11) 90000-0000" keyboardType="phone-pad" />
          <Field label="DATA DE NASCIMENTO" value={form.birthdate} onChange={(v: string) => setForm((f) => ({ ...f, birthdate: v }))} placeholder="AAAA-MM-DD" />

          <Text style={styles.label}>GÊNERO</Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => {
              const active = form.gender === g.value;
              return (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.genderChip, active && { backgroundColor: withAlpha(accent, 0.12), borderColor: accent }]}
                  onPress={() => setForm((f) => ({ ...f, gender: g.value }))}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genderText, { color: active ? accent : theme.ink500 }]}>{g.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.section}>ENDEREÇO</Text>
          <Field label="CEP" value={form.address.cep} onChange={(v: string) => setAddr('cep', v)} placeholder="00000-000" keyboardType="number-pad" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 3 }}>
              <Field label="RUA" value={form.address.street} onChange={(v: string) => setAddr('street', v)} placeholder="Rua / Av." />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Nº" value={form.address.number} onChange={(v: string) => setAddr('number', v)} placeholder="123" />
            </View>
          </View>
          <Field label="COMPLEMENTO" value={form.address.complement} onChange={(v: string) => setAddr('complement', v)} placeholder="Apto / bloco" />
          <Field label="BAIRRO" value={form.address.neighborhood} onChange={(v: string) => setAddr('neighborhood', v)} placeholder="Bairro" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 3 }}>
              <Field label="CIDADE" value={form.address.city} onChange={(v: string) => setAddr('city', v)} placeholder="Cidade" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="UF" value={form.address.state} onChange={(v: string) => setAddr('state', v)} placeholder="SP" autoCapitalize="characters" maxLength={2} />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: accent }, (updateState.loading || uploading) && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={updateState.loading || uploading}
            activeOpacity={0.85}
          >
            {updateState.loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Salvar alterações</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

  photoWrap: { alignItems: 'center', marginBottom: 20 },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadge: {
    position: 'absolute',
    right: -2,
    bottom: 24,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.paper,
  },
  photoHint: { fontSize: 12, color: theme.ink400, marginTop: 10 },

  error: { color: '#be123c', fontSize: 13, marginBottom: 12, fontWeight: '600' },

  label: { fontSize: 10, fontWeight: '700', color: theme.ink400, letterSpacing: 0.8, marginBottom: 6 },
  section: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.ink400,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 12,
  },
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

  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  genderChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  genderText: { fontSize: 13, fontWeight: '700' },

  saveBtn: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
