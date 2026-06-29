/**
 * DependentForm — shared add/edit form for a guardian's dependent (Fase 6).
 *
 * Collects the whitelisted, guardian-editable fields and a photo (uploaded
 * direct-to-S3 via the presigned flow: mintUploadUrl → PUT → confirmUpload).
 * `onSubmit` receives the GraphQL-ready input (photo id included only when a
 * new image was picked) and returns a result; the form surfaces its error.
 * Used by `/dependent/new` (no `initial`) and `/dependent/[id]/edit`.
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
import { useLazyQuery, useMutation } from '@apollo/client/react';

import {
  CepLookupDocument,
  ConfirmUploadDocument,
  MintUploadUrlDocument,
} from '../gql/graphql';
import {
  brDateToISO,
  cepDigits,
  fmtDateBR,
  maskCEP,
  maskDateBR,
  maskPhoneBR,
} from '../lib/format';
import { theme, withAlpha } from '../lib/theme';
import type { DependentActionResult, DependentEditable } from '../lib/types';

/** ISO/raw editable values → masked, display-ready form values. */
function toFormView(d: DependentEditable): DependentEditable {
  return {
    ...d,
    birthdate: fmtDateBR(d.birthdate),
    emergencyContactPhone: maskPhoneBR(d.emergencyContactPhone),
    address: { ...d.address, cep: maskCEP(d.address?.cep) },
  };
}

// Mirrors the Dependent content-type enums (girl/boy/other and the
// relationship set) so submits pass server-side validation.
const GENDERS: Array<{ value: string; label: string }> = [
  { value: 'girl', label: 'Menina' },
  { value: 'boy', label: 'Menino' },
  { value: 'other', label: 'Outro' },
];

const RELATIONSHIPS: Array<{ value: string; label: string }> = [
  { value: 'son', label: 'Filho' },
  { value: 'daughter', label: 'Filha' },
  { value: 'grandchild', label: 'Neto(a)' },
  { value: 'nibling', label: 'Sobrinho(a)' },
  { value: 'ward', label: 'Tutelado(a)' },
  { value: 'other', label: 'Outro' },
];

const EMPTY: DependentEditable = {
  id: '',
  name: '',
  birthdate: '',
  cpf: '',
  gender: '',
  relationship: '',
  bloodType: '',
  allergies: '',
  medicalNotes: '',
  medicalAlert: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  address: {
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  },
  photoUrl: null,
};

export function DependentForm({
  accent,
  title,
  initial,
  submitLabel,
  saving,
  onSubmit,
}: {
  accent: string;
  title: string;
  initial?: DependentEditable | null;
  submitLabel: string;
  saving: boolean;
  onSubmit: (input: Record<string, unknown>) => Promise<DependentActionResult>;
}) {
  const [form, setForm] = useState<DependentEditable>(() => toFormView(initial ?? EMPTY));
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial?.photoUrl ?? null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const numberRef = useRef<TextInput>(null);

  // Hydrate once when an edit record first resolves (no-op for /new).
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current || !initial) return;
    hydrated.current = true;
    setForm(toFormView(initial));
    setPhotoPreview(initial.photoUrl);
  }, [initial]);

  const [mintUrl] = useMutation<any>(MintUploadUrlDocument);
  const [confirmUpload] = useMutation<any>(ConfirmUploadDocument);
  const [lookupCep, cepState] = useLazyQuery<any>(CepLookupDocument);

  const set = (key: keyof DependentEditable, v: string) =>
    setForm((f) => ({ ...f, [key]: v }));
  const setAddr = (key: keyof DependentEditable['address'], v: string) =>
    setForm((f) => ({ ...f, address: { ...f.address, [key]: v } }));

  // CEP autofill: 8 digits → resolve via backend (ViaCEP) and fill the address,
  // then focus the number field. Best-effort.
  const onCepChange = async (v: string) => {
    setAddr('cep', maskCEP(v));
    const digits = cepDigits(v);
    if (digits.length !== 8) return;
    try {
      const res = await lookupCep({ variables: { cep: digits } });
      const a = res?.data?.cepLookup;
      if (!a) return;
      setForm((f) => ({
        ...f,
        address: {
          ...f.address,
          cep: maskCEP(a.cep),
          street: a.street || f.address.street,
          neighborhood: a.neighborhood || f.address.neighborhood,
          city: a.city || f.address.city,
          state: a.state || f.address.state,
        },
      }));
      numberRef.current?.focus();
    } catch {
      /* keep manual entry */
    }
  };

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
      const filename = asset.fileName ?? `dependent-${Date.now()}.jpg`;
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

      const confirmed = await confirmUpload({ variables: { url: publicUrl, name: filename } });
      setPhotoId(confirmed.data.confirmUpload.documentId);
      setPhotoPreview(confirmed.data.confirmUpload.url ?? asset.uri);
    } catch (e: any) {
      setError(e?.message ?? 'Falha no upload da foto.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim()) {
      setError('Informe o nome do dependente.');
      return;
    }
    const isoBirth = brDateToISO(form.birthdate);
    if (!isoBirth) {
      setError('Informe a data de nascimento (DD/MM/AAAA).');
      return;
    }
    const input: Record<string, unknown> = {
      name: form.name.trim(),
      birthdate: isoBirth,
      cpf: form.cpf || null,
      gender: form.gender || null,
      relationship: form.relationship || null,
      bloodType: form.bloodType || null,
      allergies: form.allergies || null,
      medicalNotes: form.medicalNotes || null,
      medicalAlert: form.medicalAlert || null,
      emergencyContactName: form.emergencyContactName || null,
      emergencyContactPhone: form.emergencyContactPhone || null,
      address: form.address,
    };
    if (photoId) input.photo = photoId;
    const res = await onSubmit(input);
    if (!res.ok) setError(res.message);
  };

  const busy = saving || uploading;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.ink900} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
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

          <Field label="NOME" value={form.name} onChange={(v: string) => set('name', v)} placeholder="Nome completo" />
          <Field label="DATA DE NASCIMENTO" value={form.birthdate} onChange={(v: string) => set('birthdate', maskDateBR(v))} placeholder="DD/MM/AAAA" keyboardType="number-pad" maxLength={10} />
          <Field label="CPF" value={form.cpf} onChange={(v: string) => set('cpf', v)} placeholder="000.000.000-00" keyboardType="number-pad" />

          <Text style={styles.label}>GÊNERO</Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => {
              const active = form.gender === g.value;
              return (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.genderChip, active && { backgroundColor: withAlpha(accent, 0.12), borderColor: accent }]}
                  onPress={() => set('gender', g.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genderText, { color: active ? accent : theme.ink500 }]}>{g.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>PARENTESCO</Text>
          <View style={styles.chipWrap}>
            {RELATIONSHIPS.map((rel) => {
              const active = form.relationship === rel.value;
              return (
                <TouchableOpacity
                  key={rel.value}
                  style={[styles.chip, active && { backgroundColor: withAlpha(accent, 0.12), borderColor: accent }]}
                  onPress={() => set('relationship', rel.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.genderText, { color: active ? accent : theme.ink500 }]}>{rel.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.section}>SAÚDE</Text>
          <Field label="TIPO SANGUÍNEO" value={form.bloodType} onChange={(v: string) => set('bloodType', v)} placeholder="A+, O-…" autoCapitalize="characters" />
          <Field label="ALERTA MÉDICO" value={form.medicalAlert} onChange={(v: string) => set('medicalAlert', v)} placeholder="Ex.: alergia a cloro" />
          <Field label="ALERGIAS" value={form.allergies} onChange={(v: string) => set('allergies', v)} placeholder="Alergias conhecidas" />
          <Field label="OBSERVAÇÕES MÉDICAS" value={form.medicalNotes} onChange={(v: string) => set('medicalNotes', v)} placeholder="Outras observações" multiline />

          <Text style={styles.section}>CONTATO DE EMERGÊNCIA</Text>
          <Field label="NOME" value={form.emergencyContactName} onChange={(v: string) => set('emergencyContactName', v)} placeholder="Responsável" />
          <Field label="TELEFONE" value={form.emergencyContactPhone} onChange={(v: string) => set('emergencyContactPhone', maskPhoneBR(v))} placeholder="(11) 90000-0000" keyboardType="phone-pad" maxLength={15} />

          <Text style={styles.section}>ENDEREÇO</Text>
          <View>
            <Field label="CEP" value={form.address.cep} onChange={onCepChange} placeholder="00000-000" keyboardType="number-pad" maxLength={9} />
            {cepState.loading ? (
              <ActivityIndicator color={accent} size="small" style={styles.cepSpinner} />
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 3 }}>
              <Field label="RUA" value={form.address.street} onChange={(v: string) => setAddr('street', v)} placeholder="Rua / Av." />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Nº" value={form.address.number} onChange={(v: string) => setAddr('number', v)} placeholder="123" keyboardType="number-pad" inputRef={numberRef} />
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
            style={[styles.saveBtn, { backgroundColor: accent }, busy && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={busy}
            activeOpacity={0.85}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>{submitLabel}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, inputRef, ...rest }: any) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
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
  photo: { width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
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
  cepSpinner: { position: 'absolute', right: 14, top: 34 },

  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  genderChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  genderText: { fontSize: 13, fontWeight: '700' },

  saveBtn: { marginTop: 20, paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
