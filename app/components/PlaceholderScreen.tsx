/**
 * Shared "em breve" screen used by the not-yet-implemented tabs
 * (Agenda / Treinos / Finanças / Perfil). Keeps the branded header so
 * navigating between tabs stays visually consistent, but makes it
 * obvious the content isn't wired up yet.
 *
 * The academy accent is read from the dashboard data source so the
 * header color matches the home tab — in mock mode the hook is
 * synchronous, in API mode it uses the Apollo cache set by the
 * dashboard query.
 */

import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';

import { useDashboard } from '../hooks/useDashboard';
import { theme, withAlpha } from '../lib/theme';

interface Props {
  title: string;
  eyebrow: string;
  description: string;
  Icon: LucideIcon;
}

export function PlaceholderScreen({ title, eyebrow, description, Icon }: Props) {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const academyName = data?.academy.name ?? 'Gym';
  const initials = data?.academy.initials ?? 'G';

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
        {/* HEADER — mirrors the dashboard so navigating feels native */}
        <View style={[styles.header, { backgroundColor: accent }]}>
          <View style={styles.headerTop}>
            <View style={styles.brand}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>{initials}</Text>
              </View>
              <Text style={styles.academyName}>{academyName}</Text>
            </View>
          </View>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* BODY */}
        <View style={styles.content}>
          <View style={styles.card}>
            <View
              style={[
                styles.iconBox,
                { backgroundColor: withAlpha(accent, 0.1) },
              ]}
            >
              <Icon size={32} color={accent} strokeWidth={2} />
            </View>
            <Text style={styles.cardTitle}>Em breve</Text>
            <Text style={styles.cardBody}>{description}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    alignItems: 'center',
    marginBottom: 20,
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

  content: {
    marginTop: -20,
    backgroundColor: theme.paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.line,
    shadowColor: theme.ink900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.ink900,
    letterSpacing: -0.3,
  },
  cardBody: {
    fontSize: 13,
    color: theme.ink500,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },
});
