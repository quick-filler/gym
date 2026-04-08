/**
 * Domain types used by the UI. Intentionally decoupled from the
 * generated GraphQL types so both the mock data source and the API
 * data source can conform to the same shape.
 *
 * When the API data source resolves a `MyDashboard` query, it maps
 * the GraphQL response into these types. The UI components only ever
 * see `DashboardData`.
 */

export type EnrollmentStatus = 'em_dia' | 'pendente' | 'atrasado';

export interface DashboardData {
  student: {
    name: string;
  };
  academy: {
    name: string;
    tagline: string;
    initials: string; // derived, used by the logo placeholder
    primaryColor: string;
    primaryDark: string;
  };
  nextClass: {
    name: string;
    timeLabel: string;
    room: string;
    booked: boolean;
  } | null;
  enrollment: {
    planName: string;
    amount: string; // already formatted: "R$ 99,00"
    dueDate: string; // already formatted: "15/05/2026"
    method: string; // "PIX" / "Cartão" / "Boleto"
    status: EnrollmentStatus;
  } | null;
  workout: {
    name: string;
    instructor: string;
    updatedLabel: string; // "RAFAEL · ATUALIZADO 03/04"
    exercises: Array<{
      num: number;
      name: string;
      detail: string; // "4×12"
      load: string; // "60 kg" or "—"
    }>;
  } | null;
}

/**
 * The shape every data source (mock OR Apollo) returns. Mirrors the
 * Apollo `QueryResult` subset the UI actually uses, so the hook is a
 * drop-in swap between the two.
 */
export interface DataSourceResult {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
