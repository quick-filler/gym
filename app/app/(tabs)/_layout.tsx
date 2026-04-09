/**
 * Tab layout — renders the bottom navigation with a fully custom tab
 * bar so the look matches `mockups/student-dashboard.html`: paper
 * background, tiny lucide icon, all-caps label, and an accent dot
 * under the active tab.
 *
 * The accent color comes from the dashboard query so it stays in sync
 * with white-labeling. In mock mode the hook is synchronous; in API
 * mode we fall back to ink900 until the academy loads.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  CreditCard,
  Dumbbell,
  Home,
  User,
  type LucideIcon,
} from 'lucide-react-native';

import { theme } from '../../lib/theme';
import { useDashboard } from '../../hooks/useDashboard';

/* ------------------------------------------------------------------
 * Icon registry — route name → lucide component + label. Adding a new
 * tab means adding a row here and a `<Tabs.Screen>` below.
 * ------------------------------------------------------------------ */
const TAB_ICONS: Record<string, { Icon: LucideIcon; label: string }> = {
  index:    { Icon: Home,       label: 'Início' },
  schedule: { Icon: Calendar,   label: 'Agenda' },
  workouts: { Icon: Dumbbell,   label: 'Treinos' },
  payments: { Icon: CreditCard, label: 'Finanças' },
  profile:  { Icon: User,       label: 'Perfil' },
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BrandedTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="workouts" />
      <Tabs.Screen name="payments" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

/* ------------------------------------------------------------------
 * Custom tab bar — replaces the plain-<View> nav from App.tsx with a
 * Pressable per tab, so tapping actually navigates.
 * ------------------------------------------------------------------ */
function BrandedTabBar({ state, navigation }: BottomTabBarProps) {
  const { data } = useDashboard();
  const accent = data?.academy.primaryColor ?? theme.ink900;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      {state.routes.map((route, index) => {
        const entry = TAB_ICONS[route.name];
        if (!entry) return null;

        const isFocused = state.index === index;
        const { Icon, label } = entry;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={label}
            onPress={onPress}
            style={styles.tab}
            android_ripple={{ color: theme.paper2, borderless: true }}
          >
            <Icon
              size={20}
              strokeWidth={isFocused ? 2.4 : 2}
              color={isFocused ? accent : theme.ink300}
            />
            <Text
              style={[
                styles.label,
                { color: isFocused ? accent : theme.ink300 },
              ]}
            >
              {label}
            </Text>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isFocused ? accent : 'transparent',
                },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.line,
    paddingTop: 10,
  },
  tab: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
