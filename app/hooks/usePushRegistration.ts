/**
 * usePushRegistration — Expo push setup (Fase 7e).
 *
 * Post-login (mounted from the tab layout): asks notification permission, gets
 * the ExpoPushToken and registers it on the backend (registerPushToken), then
 * deep-links when the user taps a push. Fully guarded — remote push doesn't
 * work in Expo Go and there's no token on simulators, so every step is
 * try/caught and silently skipped; the in-app inbox works regardless.
 *
 * Real delivery only happens in a dev/standalone build (EAS) — see
 * design-decisions §2.16.
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useMutation } from '@apollo/client/react';

import { USE_MOCKS } from '../lib/config';
import { AppRegisterPushTokenDocument } from '../gql/graphql';

// Foreground behavior: show the banner + bump the badge.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

function deepLink(data: unknown) {
  const route = (data as { route?: string } | null | undefined)?.route;
  if (typeof route === 'string' && route && !route.startsWith('/admin')) {
    router.push(route as never);
  }
}

export function usePushRegistration() {
  const [registerToken] = useMutation<any>(AppRegisterPushTokenDocument);

  useEffect(() => {
    if (USE_MOCKS) return;
    let active = true;

    (async () => {
      try {
        if (!Device.isDevice) return; // no push on simulators
        const current = await Notifications.getPermissionsAsync();
        let status = current.status;
        if (status !== 'granted') {
          status = (await Notifications.requestPermissionsAsync()).status;
        }
        if (status !== 'granted') return;

        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        const { data: token } = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        );
        if (active && token) {
          await registerToken({ variables: { token, platform: Platform.OS } });
        }
      } catch {
        // Expo Go (no remote push) / denied / no projectId — skip silently.
      }
    })();

    // Tap on a push (app backgrounded/killed) → deep-link to the target.
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      deepLink(resp.notification.request.content.data);
    });

    return () => {
      active = false;
      sub.remove();
    };
  }, [registerToken]);
}
