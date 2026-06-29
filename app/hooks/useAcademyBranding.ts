/**
 * useAcademyBranding — public branding query for the login screen.
 *
 * Uses `academyBySlug` (auth-free) so the login screen can show the
 * academy's name and primary color before the user authenticates.
 * In mock mode returns the MOCK_DASHBOARD academy directly.
 *
 * The slug is the active academy chosen in the picker (or a baked
 * single-tenant slug), read from AcademyProvider. Shows generic branding
 * when there's no slug yet or the query fails.
 */

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

import { USE_MOCKS } from '../lib/config';
import { useActiveAcademy } from '../lib/academy-provider';
import { MOCK_DASHBOARD } from '../lib/mock-data';

const ACADEMY_BY_SLUG = gql`
  query AcademyBySlugBranding($slug: String!) {
    academyBySlug(slug: $slug) {
      documentId
      name
      primaryColor
    }
  }
`;

export interface AcademyBranding {
  name: string;
  initials: string;
  primaryColor: string;
}

const FALLBACK: AcademyBranding = {
  name: 'Gym',
  initials: 'G',
  primaryColor: '#0A84FF',
};

function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function useAcademyBranding(): AcademyBranding {
  if (USE_MOCKS) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useMemo(() => {
      const a = MOCK_DASHBOARD.academy;
      return { name: a.name, initials: a.initials, primaryColor: a.primaryColor };
    }, []);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { slug } = useActiveAcademy();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data } = useQuery<{
    academyBySlug: { documentId: string; name: string; primaryColor: string } | null;
  }>(ACADEMY_BY_SLUG, {
    variables: { slug: slug ?? '' },
    skip: !slug,
    fetchPolicy: 'cache-first',
  });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => {
    const a = data?.academyBySlug;
    if (!a) return FALLBACK;
    return {
      name: a.name,
      initials: initialsOf(a.name),
      primaryColor: a.primaryColor,
    };
  }, [data]);
}
