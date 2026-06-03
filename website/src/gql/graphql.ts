/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: string; output: string; }
  /** A string used to identify an i18n locale */
  I18NLocaleCode: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: unknown; output: unknown; }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  Long: { input: any; output: any; }
  /** A time string with format HH:mm:ss.SSS */
  Time: { input: any; output: any; }
};

export type Academy = {
  __typename?: 'Academy';
  address?: Maybe<Scalars['String']['output']>;
  billingMode?: Maybe<Scalars['String']['output']>;
  businessType?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  email?: Maybe<Scalars['String']['output']>;
  enabledModules?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  logo?: Maybe<Media>;
  /** Square version of the logo, used for favicon and small icons. Optional — fall back to logo when absent. */
  logoSquare?: Maybe<Media>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  plan?: Maybe<Scalars['String']['output']>;
  /** Pool target ranges (pH/cloro/temperatura). Sempre presente: criada via lifecycle no afterCreate ou backfill no boot. */
  poolSettings?: Maybe<PoolSettings>;
  primaryColor?: Maybe<Scalars['String']['output']>;
  secondaryColor?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  /** Active SaaS subscription. Holds the tier (via platformPlan), trial/cycle state, and billing data. Null only on legacy rows that the backfill could not link. */
  subscription?: Maybe<AcademySubscription>;
};

export type AcademyInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  billingMode?: InputMaybe<Scalars['String']['input']>;
  businessType?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  enabledModules?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['ID']['input']>;
  logoSquare?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  plan?: InputMaybe<Scalars['String']['input']>;
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  secondaryColor?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

/** Active SaaS subscription for an Academy. Links the academy to a PlatformPlan with cycle + trial + billing state. */
export type AcademySubscription = {
  __typename?: 'AcademySubscription';
  academy?: Maybe<Academy>;
  billingAddressLine1?: Maybe<Scalars['String']['output']>;
  billingAddressLine2?: Maybe<Scalars['String']['output']>;
  billingCity?: Maybe<Scalars['String']['output']>;
  billingDocumentNumber?: Maybe<Scalars['String']['output']>;
  billingDocumentType?: Maybe<Scalars['String']['output']>;
  billingEmail?: Maybe<Scalars['String']['output']>;
  billingName?: Maybe<Scalars['String']['output']>;
  billingNumber?: Maybe<Scalars['String']['output']>;
  billingState?: Maybe<Scalars['String']['output']>;
  billingZipcode?: Maybe<Scalars['String']['output']>;
  cancelAt?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['String']['output']>;
  currentPeriodEnd?: Maybe<Scalars['String']['output']>;
  currentPeriodStart?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  featuresSnapshot?: Maybe<Scalars['JSON']['output']>;
  limitsSnapshot?: Maybe<Scalars['JSON']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  platformPlan?: Maybe<PlatformPlan>;
  priceAnnualSnapshot?: Maybe<Scalars['Float']['output']>;
  priceMonthlySnapshot?: Maybe<Scalars['Float']['output']>;
  recurrency: Scalars['String']['output'];
  startedAt?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  trialDaysLeft?: Maybe<Scalars['Int']['output']>;
  trialEndsAt?: Maybe<Scalars['String']['output']>;
};

export type AcademyUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  billingMode?: InputMaybe<Scalars['String']['input']>;
  businessType?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  enabledModules?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['ID']['input']>;
  logoSquare?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  plan?: InputMaybe<Scalars['String']['input']>;
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  secondaryColor?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type Address = {
  __typename?: 'Address';
  cep?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  complement?: Maybe<Scalars['String']['output']>;
  neighborhood?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type AddressInput = {
  cep?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  complement?: InputMaybe<Scalars['String']['input']>;
  neighborhood?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type AdminDashboard = {
  __typename?: 'AdminDashboard';
  metrics: Array<MetricCard>;
  recentStudents: Array<DashboardStudentRow>;
  todayClasses: Array<DashboardClassRow>;
  upcomingPayments: Array<DashboardPaymentRow>;
};

/** Asaas credential update. Empty/null fields are preserved (never wipe an existing key with a blank submit). */
export type AsaasSettingsInput = {
  apiKey?: InputMaybe<Scalars['String']['input']>;
  environment?: InputMaybe<Scalars['String']['input']>;
  webhookToken?: InputMaybe<Scalars['String']['input']>;
};

/** Asaas configuration status — surfaces whether credentials are set without exposing them. */
export type AsaasSettingsStatus = {
  __typename?: 'AsaasSettingsStatus';
  apiKeyConfigured: Scalars['Boolean']['output'];
  apiKeyHint?: Maybe<Scalars['String']['output']>;
  environment: Scalars['String']['output'];
  webhookTokenConfigured: Scalars['Boolean']['output'];
  webhookUrl: Scalars['String']['output'];
};

/** Billing fields that the academy admin can edit on their own subscription. Empty strings preserve existing values (use null to clear). */
export type BillingInfoInput = {
  billingAddressLine1?: InputMaybe<Scalars['String']['input']>;
  billingAddressLine2?: InputMaybe<Scalars['String']['input']>;
  billingCity?: InputMaybe<Scalars['String']['input']>;
  billingDocumentNumber?: InputMaybe<Scalars['String']['input']>;
  billingDocumentType?: InputMaybe<Scalars['String']['input']>;
  billingEmail?: InputMaybe<Scalars['String']['input']>;
  billingName?: InputMaybe<Scalars['String']['input']>;
  billingNumber?: InputMaybe<Scalars['String']['input']>;
  billingState?: InputMaybe<Scalars['String']['input']>;
  billingZipcode?: InputMaybe<Scalars['String']['input']>;
};

export type BodyAssessment = {
  __typename?: 'BodyAssessment';
  bodyFat?: Maybe<Scalars['Float']['output']>;
  date: Scalars['String']['output'];
  documentId: Scalars['ID']['output'];
  height?: Maybe<Scalars['Float']['output']>;
  instructor?: Maybe<Scalars['String']['output']>;
  measurements?: Maybe<Measurements>;
  notes?: Maybe<Scalars['String']['output']>;
  student?: Maybe<Student>;
  weight?: Maybe<Scalars['Float']['output']>;
};

export type BodyAssessmentInput = {
  bodyFat?: InputMaybe<Scalars['Float']['input']>;
  date: Scalars['String']['input'];
  dependent?: InputMaybe<Scalars['ID']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<MeasurementsInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  student?: InputMaybe<Scalars['ID']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type BodyAssessmentUpdateInput = {
  bodyFat?: InputMaybe<Scalars['Float']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<MeasurementsInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type BooleanFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  contains?: InputMaybe<Scalars['Boolean']['input']>;
  containsi?: InputMaybe<Scalars['Boolean']['input']>;
  endsWith?: InputMaybe<Scalars['Boolean']['input']>;
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  eqi?: InputMaybe<Scalars['Boolean']['input']>;
  gt?: InputMaybe<Scalars['Boolean']['input']>;
  gte?: InputMaybe<Scalars['Boolean']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  lt?: InputMaybe<Scalars['Boolean']['input']>;
  lte?: InputMaybe<Scalars['Boolean']['input']>;
  ne?: InputMaybe<Scalars['Boolean']['input']>;
  nei?: InputMaybe<Scalars['Boolean']['input']>;
  not?: InputMaybe<BooleanFilterInput>;
  notContains?: InputMaybe<Scalars['Boolean']['input']>;
  notContainsi?: InputMaybe<Scalars['Boolean']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  startsWith?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BulkImportItem = {
  __typename?: 'BulkImportItem';
  dependentDocumentId?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  rowNumber: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  studentDocumentId?: Maybe<Scalars['String']['output']>;
};

export type BulkImportResult = {
  __typename?: 'BulkImportResult';
  created: Scalars['Int']['output'];
  errors: Scalars['Int']['output'];
  items: Array<BulkImportItem>;
  skipped: Scalars['Int']['output'];
};

export type ClassBooking = {
  __typename?: 'ClassBooking';
  checkedInAt?: Maybe<Scalars['String']['output']>;
  classSchedule?: Maybe<ClassSchedule>;
  date: Scalars['String']['output'];
  documentId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  student?: Maybe<Student>;
};

export type ClassBookingInput = {
  classSchedule: Scalars['ID']['input'];
  date: Scalars['String']['input'];
  dependent?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  student?: InputMaybe<Scalars['ID']['input']>;
};

export type ClassBookingUpdateInput = {
  checkedInAt?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type ClassSchedule = {
  __typename?: 'ClassSchedule';
  academy?: Maybe<Academy>;
  documentId: Scalars['ID']['output'];
  endTime?: Maybe<Scalars['String']['output']>;
  instructor?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  maxCapacity?: Maybe<Scalars['Int']['output']>;
  modality?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  room?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
  weekdays?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
};

export type ClassScheduleInput = {
  endTime?: InputMaybe<Scalars['String']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxCapacity?: InputMaybe<Scalars['Int']['input']>;
  modality?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  room?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  weekdays?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type ClassScheduleUpdateInput = {
  endTime?: InputMaybe<Scalars['String']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxCapacity?: InputMaybe<Scalars['Int']['input']>;
  modality?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  room?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  weekdays?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type ContactFormInput = {
  academyName?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  message: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  studentCount?: InputMaybe<Scalars['String']['input']>;
};

export type ContactFormResult = {
  __typename?: 'ContactFormResult';
  ok: Scalars['Boolean']['output'];
};

/** Settings to provision the new Academy + admin user when converting a lead. */
export type ConvertLeadInput = {
  academyName?: InputMaybe<Scalars['String']['input']>;
  businessType?: InputMaybe<Scalars['String']['input']>;
  plan: Scalars['String']['input'];
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  secondaryColor?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
};

/** Outcome of a lead → academy conversion. passwordResetUrl is included so the platform admin can copy it manually if email delivery fails. */
export type ConvertLeadResult = {
  __typename?: 'ConvertLeadResult';
  academy: Academy;
  adminEmail: Scalars['String']['output'];
  emailSent: Scalars['Boolean']['output'];
  passwordResetUrl: Scalars['String']['output'];
};

export type DreCashFlowPoint = {
  __typename?: 'DRECashFlowPoint';
  expenses: Scalars['Float']['output'];
  label: Scalars['String']['output'];
  profit: Scalars['Float']['output'];
  revenue: Scalars['Float']['output'];
};

export type DreCategoryBreakdown = {
  __typename?: 'DRECategoryBreakdown';
  amount: Scalars['String']['output'];
  category: Scalars['String']['output'];
  label: Scalars['String']['output'];
  percent: Scalars['Float']['output'];
};

export type DreExpenseRow = {
  __typename?: 'DREExpenseRow';
  amount: Scalars['String']['output'];
  category: Scalars['String']['output'];
  categoryLabel: Scalars['String']['output'];
  description: Scalars['String']['output'];
  dueDate: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status: Scalars['String']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type DreHeroExpenses = {
  __typename?: 'DREHeroExpenses';
  fixed: Scalars['String']['output'];
  total: Scalars['String']['output'];
  variable: Scalars['String']['output'];
};

export type DreHeroProfit = {
  __typename?: 'DREHeroProfit';
  marginPercent: Scalars['Float']['output'];
  total: Scalars['String']['output'];
};

export type DreHeroRevenue = {
  __typename?: 'DREHeroRevenue';
  deltaLabel: Scalars['String']['output'];
  total: Scalars['String']['output'];
  trend: Scalars['String']['output'];
};

export type DreOverview = {
  __typename?: 'DREOverview';
  cashFlow: Array<DreCashFlowPoint>;
  categoryBreakdown: Array<DreCategoryBreakdown>;
  expenseRows: Array<DreExpenseRow>;
  expenses: DreHeroExpenses;
  expensesTotalLabel: Scalars['String']['output'];
  monthLabel: Scalars['String']['output'];
  profit: DreHeroProfit;
  revenue: DreHeroRevenue;
  revenueRows: Array<DreRevenueRow>;
  revenueTotalLabel: Scalars['String']['output'];
};

/** A single recognised revenue line in the month — a payment that was marked as paid in the period. */
export type DreRevenueRow = {
  __typename?: 'DRERevenueRow';
  amount: Scalars['String']['output'];
  id: Scalars['String']['output'];
  method: Scalars['String']['output'];
  paidAt: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  student: Scalars['String']['output'];
};

/** Roster of all classes happening on a given date. */
export type DailyAttendance = {
  __typename?: 'DailyAttendance';
  classes: Array<DailyAttendanceClass>;
  date: Scalars['String']['output'];
  weekdayLabel: Scalars['String']['output'];
};

/** A class occurring on a specific date with its booking roster, used by the daily attendance page. */
export type DailyAttendanceClass = {
  __typename?: 'DailyAttendanceClass';
  attendedCount: Scalars['Int']['output'];
  bookedCount: Scalars['Int']['output'];
  bookings: Array<ClassBooking>;
  capacity?: Maybe<Scalars['Int']['output']>;
  endTime: Scalars['String']['output'];
  instructor?: Maybe<Scalars['String']['output']>;
  missedCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  room?: Maybe<Scalars['String']['output']>;
  scheduleDocumentId: Scalars['ID']['output'];
  startTime: Scalars['String']['output'];
};

export type DashboardClassRow = {
  __typename?: 'DashboardClassRow';
  booked: Scalars['Int']['output'];
  capacity: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  instructor?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  time: Scalars['String']['output'];
};

export type DashboardPaymentRow = {
  __typename?: 'DashboardPaymentRow';
  amount: Scalars['String']['output'];
  dueDate: Scalars['String']['output'];
  id: Scalars['String']['output'];
  method: Scalars['String']['output'];
  student: Scalars['String']['output'];
};

export type DashboardStudentRow = {
  __typename?: 'DashboardStudentRow';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  initials: Scalars['String']['output'];
  joinedAt?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  plan: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type DateFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  contains?: InputMaybe<Scalars['Date']['input']>;
  containsi?: InputMaybe<Scalars['Date']['input']>;
  endsWith?: InputMaybe<Scalars['Date']['input']>;
  eq?: InputMaybe<Scalars['Date']['input']>;
  eqi?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  ne?: InputMaybe<Scalars['Date']['input']>;
  nei?: InputMaybe<Scalars['Date']['input']>;
  not?: InputMaybe<DateFilterInput>;
  notContains?: InputMaybe<Scalars['Date']['input']>;
  notContainsi?: InputMaybe<Scalars['Date']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Date']['input']>>>;
  startsWith?: InputMaybe<Scalars['Date']['input']>;
};

export type DateTimeFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  contains?: InputMaybe<Scalars['DateTime']['input']>;
  containsi?: InputMaybe<Scalars['DateTime']['input']>;
  endsWith?: InputMaybe<Scalars['DateTime']['input']>;
  eq?: InputMaybe<Scalars['DateTime']['input']>;
  eqi?: InputMaybe<Scalars['DateTime']['input']>;
  gt?: InputMaybe<Scalars['DateTime']['input']>;
  gte?: InputMaybe<Scalars['DateTime']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  lt?: InputMaybe<Scalars['DateTime']['input']>;
  lte?: InputMaybe<Scalars['DateTime']['input']>;
  ne?: InputMaybe<Scalars['DateTime']['input']>;
  nei?: InputMaybe<Scalars['DateTime']['input']>;
  not?: InputMaybe<DateTimeFilterInput>;
  notContains?: InputMaybe<Scalars['DateTime']['input']>;
  notContainsi?: InputMaybe<Scalars['DateTime']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  startsWith?: InputMaybe<Scalars['DateTime']['input']>;
};

export type DeleteMutationResponse = {
  __typename?: 'DeleteMutationResponse';
  documentId: Scalars['ID']['output'];
};

export type Dependent = {
  __typename?: 'Dependent';
  academy?: Maybe<Academy>;
  address?: Maybe<Address>;
  allergies?: Maybe<Scalars['String']['output']>;
  birthdate: Scalars['String']['output'];
  bloodType?: Maybe<Scalars['String']['output']>;
  bookings?: Maybe<Array<Maybe<ClassBooking>>>;
  cpf?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  emergencyContactName?: Maybe<Scalars['String']['output']>;
  emergencyContactPhone?: Maybe<Scalars['String']['output']>;
  enrollments?: Maybe<Array<Maybe<Enrollment>>>;
  gender?: Maybe<Scalars['String']['output']>;
  guardian?: Maybe<Student>;
  medicalAlert?: Maybe<Scalars['String']['output']>;
  medicalNotes?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  photo?: Maybe<Media>;
  relationship?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  workoutPlans?: Maybe<Array<Maybe<WorkoutPlan>>>;
};

export type DependentInput = {
  address?: InputMaybe<AddressInput>;
  allergies?: InputMaybe<Scalars['String']['input']>;
  birthdate: Scalars['String']['input'];
  bloodType?: InputMaybe<Scalars['String']['input']>;
  cpf?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  guardian?: InputMaybe<Scalars['ID']['input']>;
  medicalAlert?: InputMaybe<Scalars['String']['input']>;
  medicalNotes?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  relationship?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type DependentUpdateInput = {
  address?: InputMaybe<AddressInput>;
  allergies?: InputMaybe<Scalars['String']['input']>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  bloodType?: InputMaybe<Scalars['String']['input']>;
  cpf?: InputMaybe<Scalars['String']['input']>;
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  medicalAlert?: InputMaybe<Scalars['String']['input']>;
  medicalNotes?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  relationship?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type Enrollment = {
  __typename?: 'Enrollment';
  documentId: Scalars['ID']['output'];
  endDate?: Maybe<Scalars['String']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  payments?: Maybe<Array<Maybe<Payment>>>;
  plan?: Maybe<Plan>;
  startDate: Scalars['String']['output'];
  status: Scalars['String']['output'];
  student?: Maybe<Student>;
};

export type EnrollmentInput = {
  dependent?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  plan: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  student?: InputMaybe<Scalars['ID']['input']>;
};

export type EnrollmentUpdateInput = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type Error = {
  __typename?: 'Error';
  code: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
};

export type Exercise = {
  __typename?: 'Exercise';
  load?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  reps?: Maybe<Scalars['Int']['output']>;
  sets?: Maybe<Scalars['Int']['output']>;
};

export type ExerciseInput = {
  load?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  reps?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Scalars['Int']['input']>;
};

export type Expense = {
  __typename?: 'Expense';
  academy?: Maybe<Academy>;
  amount: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  date: Scalars['String']['output'];
  description: Scalars['String']['output'];
  documentId: Scalars['ID']['output'];
  dueDate?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['String']['output']>;
  receipt?: Maybe<Media>;
  recurrenceDay?: Maybe<Scalars['Int']['output']>;
  recurrent?: Maybe<Scalars['Boolean']['output']>;
  status: Scalars['String']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type ExpenseInput = {
  amount: Scalars['Float']['input'];
  category: Scalars['String']['input'];
  date: Scalars['String']['input'];
  description: Scalars['String']['input'];
  dueDate?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  paidAt?: InputMaybe<Scalars['String']['input']>;
  recurrenceDay?: InputMaybe<Scalars['Int']['input']>;
  recurrent?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};

export type ExpenseUpdateInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  paidAt?: InputMaybe<Scalars['String']['input']>;
  recurrenceDay?: InputMaybe<Scalars['Int']['input']>;
  recurrent?: InputMaybe<Scalars['Boolean']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type FinanceCharge = {
  __typename?: 'FinanceCharge';
  amount: Scalars['Float']['output'];
  amountFormatted: Scalars['String']['output'];
  dueDate: Scalars['String']['output'];
  id: Scalars['String']['output'];
  method: Scalars['String']['output'];
  paidAt?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  student: Scalars['String']['output'];
  studentInitials: Scalars['String']['output'];
};

export type FinanceMethodRow = {
  __typename?: 'FinanceMethodRow';
  amount: Scalars['String']['output'];
  label: Scalars['String']['output'];
  method: Scalars['String']['output'];
  percent: Scalars['Int']['output'];
};

export type FinanceOverview = {
  __typename?: 'FinanceOverview';
  charges: Array<FinanceCharge>;
  kpis: Array<MetricCard>;
  methodBreakdown: Array<FinanceMethodRow>;
};

export type FloatFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  contains?: InputMaybe<Scalars['Float']['input']>;
  containsi?: InputMaybe<Scalars['Float']['input']>;
  endsWith?: InputMaybe<Scalars['Float']['input']>;
  eq?: InputMaybe<Scalars['Float']['input']>;
  eqi?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  ne?: InputMaybe<Scalars['Float']['input']>;
  nei?: InputMaybe<Scalars['Float']['input']>;
  not?: InputMaybe<FloatFilterInput>;
  notContains?: InputMaybe<Scalars['Float']['input']>;
  notContainsi?: InputMaybe<Scalars['Float']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  startsWith?: InputMaybe<Scalars['Float']['input']>;
};

export type GuardianFamily = {
  __typename?: 'GuardianFamily';
  dependents: Array<GuardianFamilyDependent>;
  guardian: GuardianFamilyGuardian;
};

export type GuardianFamilyDependent = {
  __typename?: 'GuardianFamilyDependent';
  age: Scalars['Int']['output'];
  className?: Maybe<Scalars['String']['output']>;
  classTime?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  medicalAlert?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type GuardianFamilyGuardian = {
  __typename?: 'GuardianFamilyGuardian';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  initials: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
};

export type IdFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contains?: InputMaybe<Scalars['ID']['input']>;
  containsi?: InputMaybe<Scalars['ID']['input']>;
  endsWith?: InputMaybe<Scalars['ID']['input']>;
  eq?: InputMaybe<Scalars['ID']['input']>;
  eqi?: InputMaybe<Scalars['ID']['input']>;
  gt?: InputMaybe<Scalars['ID']['input']>;
  gte?: InputMaybe<Scalars['ID']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lt?: InputMaybe<Scalars['ID']['input']>;
  lte?: InputMaybe<Scalars['ID']['input']>;
  ne?: InputMaybe<Scalars['ID']['input']>;
  nei?: InputMaybe<Scalars['ID']['input']>;
  not?: InputMaybe<IdFilterInput>;
  notContains?: InputMaybe<Scalars['ID']['input']>;
  notContainsi?: InputMaybe<Scalars['ID']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  startsWith?: InputMaybe<Scalars['ID']['input']>;
};

export type IntFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  contains?: InputMaybe<Scalars['Int']['input']>;
  containsi?: InputMaybe<Scalars['Int']['input']>;
  endsWith?: InputMaybe<Scalars['Int']['input']>;
  eq?: InputMaybe<Scalars['Int']['input']>;
  eqi?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  ne?: InputMaybe<Scalars['Int']['input']>;
  nei?: InputMaybe<Scalars['Int']['input']>;
  not?: InputMaybe<IntFilterInput>;
  notContains?: InputMaybe<Scalars['Int']['input']>;
  notContainsi?: InputMaybe<Scalars['Int']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startsWith?: InputMaybe<Scalars['Int']['input']>;
};

export type JsonFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  contains?: InputMaybe<Scalars['JSON']['input']>;
  containsi?: InputMaybe<Scalars['JSON']['input']>;
  endsWith?: InputMaybe<Scalars['JSON']['input']>;
  eq?: InputMaybe<Scalars['JSON']['input']>;
  eqi?: InputMaybe<Scalars['JSON']['input']>;
  gt?: InputMaybe<Scalars['JSON']['input']>;
  gte?: InputMaybe<Scalars['JSON']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  lt?: InputMaybe<Scalars['JSON']['input']>;
  lte?: InputMaybe<Scalars['JSON']['input']>;
  ne?: InputMaybe<Scalars['JSON']['input']>;
  nei?: InputMaybe<Scalars['JSON']['input']>;
  not?: InputMaybe<JsonFilterInput>;
  notContains?: InputMaybe<Scalars['JSON']['input']>;
  notContainsi?: InputMaybe<Scalars['JSON']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  startsWith?: InputMaybe<Scalars['JSON']['input']>;
};

export type Lead = {
  __typename?: 'Lead';
  academyName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['String']['output'];
  email: Scalars['String']['output'];
  message: Scalars['String']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  planInterest?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  studentCount?: Maybe<Scalars['String']['output']>;
};

export type LeadListResult = {
  __typename?: 'LeadListResult';
  items: Array<Lead>;
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type LongFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  contains?: InputMaybe<Scalars['Long']['input']>;
  containsi?: InputMaybe<Scalars['Long']['input']>;
  endsWith?: InputMaybe<Scalars['Long']['input']>;
  eq?: InputMaybe<Scalars['Long']['input']>;
  eqi?: InputMaybe<Scalars['Long']['input']>;
  gt?: InputMaybe<Scalars['Long']['input']>;
  gte?: InputMaybe<Scalars['Long']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  lt?: InputMaybe<Scalars['Long']['input']>;
  lte?: InputMaybe<Scalars['Long']['input']>;
  ne?: InputMaybe<Scalars['Long']['input']>;
  nei?: InputMaybe<Scalars['Long']['input']>;
  not?: InputMaybe<LongFilterInput>;
  notContains?: InputMaybe<Scalars['Long']['input']>;
  notContainsi?: InputMaybe<Scalars['Long']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Long']['input']>>>;
  startsWith?: InputMaybe<Scalars['Long']['input']>;
};

export type Measurements = {
  __typename?: 'Measurements';
  arms?: Maybe<Scalars['Float']['output']>;
  calves?: Maybe<Scalars['Float']['output']>;
  chest?: Maybe<Scalars['Float']['output']>;
  hips?: Maybe<Scalars['Float']['output']>;
  shoulders?: Maybe<Scalars['Float']['output']>;
  thighs?: Maybe<Scalars['Float']['output']>;
  waist?: Maybe<Scalars['Float']['output']>;
};

export type MeasurementsInput = {
  arms?: InputMaybe<Scalars['Float']['input']>;
  calves?: InputMaybe<Scalars['Float']['input']>;
  chest?: InputMaybe<Scalars['Float']['input']>;
  hips?: InputMaybe<Scalars['Float']['input']>;
  shoulders?: InputMaybe<Scalars['Float']['input']>;
  thighs?: InputMaybe<Scalars['Float']['input']>;
  waist?: InputMaybe<Scalars['Float']['input']>;
};

/** Reference to an uploaded file (logo, photo, etc.) */
export type Media = {
  __typename?: 'Media';
  alternativeText?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  mime?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};

export type MetricCard = {
  __typename?: 'MetricCard';
  delta?: Maybe<MetricDelta>;
  highlighted?: Maybe<Scalars['Boolean']['output']>;
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type MetricDelta = {
  __typename?: 'MetricDelta';
  trend: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

/** Suggested toggleable modules for a given businessType. Frontend shows this as a diff against the current Academy.enabledModules so the admin can accept or ignore. */
export type ModulePresetSuggestion = {
  __typename?: 'ModulePresetSuggestion';
  businessType: Scalars['String']['output'];
  modules: Array<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  bulkImportStudents?: Maybe<BulkImportResult>;
  /** Platform admin only — moves an academy to a different PlatformPlan. Re-snapshots price/features/limits. */
  changeSubscriptionPlan?: Maybe<AcademySubscription>;
  /** Mark a booking as attended and stamp checkedInAt. */
  checkInBooking?: Maybe<ClassBooking>;
  /** Registers a previously-uploaded S3 object as a Strapi Media file. Run after a successful PUT to the URL returned by mintUploadUrl. */
  confirmUpload?: Maybe<Media>;
  /** Manual escape hatch: provisiona um lead específico com slug/plan custom (útil pra leads antigos ou casos onde o auto-provision falhou). Self-serve via submitContactForm cobre 99% dos casos. */
  convertLead?: Maybe<ConvertLeadResult>;
  createAcademy?: Maybe<Academy>;
  createBodyAssessment?: Maybe<BodyAssessment>;
  createClassBooking?: Maybe<ClassBooking>;
  createClassSchedule?: Maybe<ClassSchedule>;
  createDependent?: Maybe<Dependent>;
  createEnrollment?: Maybe<Enrollment>;
  createExpense?: Maybe<Expense>;
  createPayment?: Maybe<Payment>;
  createPlan?: Maybe<Plan>;
  createPlatformPlan?: Maybe<PlatformPlan>;
  createPoolInspection?: Maybe<PoolInspection>;
  createStudent?: Maybe<Student>;
  createWorkoutPlan?: Maybe<WorkoutPlan>;
  deleteAcademy?: Maybe<Academy>;
  deleteBodyAssessment?: Maybe<BodyAssessment>;
  deleteClassBooking?: Maybe<ClassBooking>;
  deleteClassSchedule?: Maybe<ClassSchedule>;
  deleteDependent?: Maybe<Dependent>;
  deleteEnrollment?: Maybe<Enrollment>;
  deleteExpense?: Maybe<Expense>;
  deletePlan?: Maybe<Plan>;
  deletePlatformPlan?: Maybe<PlatformPlan>;
  deleteStudent?: Maybe<Student>;
  deleteWorkoutPlan?: Maybe<WorkoutPlan>;
  mintUploadUrl?: Maybe<PresignedUpload>;
  submitContactForm?: Maybe<ContactFormResult>;
  updateAcademy?: Maybe<Academy>;
  updateBodyAssessment?: Maybe<BodyAssessment>;
  updateClassBooking?: Maybe<ClassBooking>;
  updateClassSchedule?: Maybe<ClassSchedule>;
  updateDependent?: Maybe<Dependent>;
  updateEnrollment?: Maybe<Enrollment>;
  updateExpense?: Maybe<Expense>;
  updateLead?: Maybe<Lead>;
  /** Updates Asaas credentials for the caller's academy. Empty fields preserve the existing values — pass apiKey only when rotating. */
  updateMyAsaasSettings?: Maybe<AsaasSettingsStatus>;
  /** Updates billing info on the caller's subscription. Restricted to academy_admin. */
  updateMyBilling?: Maybe<AcademySubscription>;
  updateMyPoolSettings?: Maybe<PoolSettings>;
  updatePayment?: Maybe<Payment>;
  updatePlan?: Maybe<Plan>;
  updatePlatformPlan?: Maybe<PlatformPlan>;
  updatePoolInspection?: Maybe<PoolInspection>;
  updateStudent?: Maybe<Student>;
  updateWorkoutPlan?: Maybe<WorkoutPlan>;
};


export type MutationBulkImportStudentsArgs = {
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
  rows: Array<StudentImportRow>;
};


export type MutationChangeSubscriptionPlanArgs = {
  documentId: Scalars['ID']['input'];
  platformPlanSlug: Scalars['String']['input'];
  recurrency?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCheckInBookingArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationConfirmUploadArgs = {
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
};


export type MutationConvertLeadArgs = {
  data: ConvertLeadInput;
  documentId: Scalars['ID']['input'];
};


export type MutationCreateAcademyArgs = {
  data: AcademyInput;
};


export type MutationCreateBodyAssessmentArgs = {
  data: BodyAssessmentInput;
};


export type MutationCreateClassBookingArgs = {
  data: ClassBookingInput;
};


export type MutationCreateClassScheduleArgs = {
  data: ClassScheduleInput;
};


export type MutationCreateDependentArgs = {
  data: DependentInput;
};


export type MutationCreateEnrollmentArgs = {
  data: EnrollmentInput;
};


export type MutationCreateExpenseArgs = {
  data: ExpenseInput;
};


export type MutationCreatePaymentArgs = {
  data: PaymentInput;
};


export type MutationCreatePlanArgs = {
  data: PlanInput;
};


export type MutationCreatePlatformPlanArgs = {
  data: PlatformPlanInput;
};


export type MutationCreatePoolInspectionArgs = {
  data: PoolInspectionInput;
};


export type MutationCreateStudentArgs = {
  data: StudentInput;
  sendInvite?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationCreateWorkoutPlanArgs = {
  data: WorkoutPlanInput;
};


export type MutationDeleteAcademyArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteBodyAssessmentArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteClassBookingArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteClassScheduleArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteDependentArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteEnrollmentArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteExpenseArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeletePlanArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeletePlatformPlanArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteStudentArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteWorkoutPlanArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationMintUploadUrlArgs = {
  contentType: Scalars['String']['input'];
  filename: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};


export type MutationSubmitContactFormArgs = {
  input: ContactFormInput;
};


export type MutationUpdateAcademyArgs = {
  data: AcademyUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateBodyAssessmentArgs = {
  data: BodyAssessmentUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateClassBookingArgs = {
  data: ClassBookingUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateClassScheduleArgs = {
  data: ClassScheduleUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateDependentArgs = {
  data: DependentUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateEnrollmentArgs = {
  data: EnrollmentUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateExpenseArgs = {
  data: ExpenseUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateLeadArgs = {
  data: UpdateLeadInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateMyAsaasSettingsArgs = {
  data: AsaasSettingsInput;
};


export type MutationUpdateMyBillingArgs = {
  data: BillingInfoInput;
};


export type MutationUpdateMyPoolSettingsArgs = {
  data: PoolSettingsInput;
};


export type MutationUpdatePaymentArgs = {
  data: PaymentUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdatePlanArgs = {
  data: PlanUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdatePlatformPlanArgs = {
  data: PlatformPlanUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdatePoolInspectionArgs = {
  data: PoolInspectionInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateStudentArgs = {
  data: StudentUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdateWorkoutPlanArgs = {
  data: WorkoutPlanUpdateInput;
  documentId: Scalars['ID']['input'];
};

export type Pagination = {
  __typename?: 'Pagination';
  page: Scalars['Int']['output'];
  pageCount: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
};

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Float']['output'];
  dependent?: Maybe<Dependent>;
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  dueDate: Scalars['String']['output'];
  enrollment?: Maybe<Enrollment>;
  externalId?: Maybe<Scalars['String']['output']>;
  method?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['String']['output']>;
  receiptUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  student?: Maybe<Student>;
};

export type PaymentInput = {
  amount: Scalars['Float']['input'];
  dependent?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate: Scalars['String']['input'];
  enrollment?: InputMaybe<Scalars['ID']['input']>;
  method?: InputMaybe<Scalars['String']['input']>;
  paidAt?: InputMaybe<Scalars['String']['input']>;
  receiptUrl?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  student?: InputMaybe<Scalars['ID']['input']>;
};

export type PaymentUpdateInput = {
  paidAt?: InputMaybe<Scalars['String']['input']>;
  receiptUrl?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type Plan = {
  __typename?: 'Plan';
  academy?: Maybe<Academy>;
  billingCycle: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  features?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  maxStudents?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
};

export type PlanInput = {
  billingCycle: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxStudents?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
};

export type PlanUpdateInput = {
  billingCycle?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxStudents?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
};

export type PlatformAcademy = {
  __typename?: 'PlatformAcademy';
  createdAt?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  plan: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  studentCount: Scalars['Int']['output'];
};

export type PlatformAcademyList = {
  __typename?: 'PlatformAcademyList';
  items: Array<PlatformAcademy>;
  total: Scalars['Int']['output'];
};

export type PlatformDashboard = {
  __typename?: 'PlatformDashboard';
  activeAcademies: Scalars['Int']['output'];
  leadsThisMonth: Scalars['Int']['output'];
  mrr: Scalars['String']['output'];
  openLeads: Scalars['Int']['output'];
  totalAcademies: Scalars['Int']['output'];
  totalStudents: Scalars['Int']['output'];
};

/** GYM SaaS tier (Starter/Business/Pro). Source of truth for /pricing and Academy.platformPlan. */
export type PlatformPlan = {
  __typename?: 'PlatformPlan';
  ctaLabel?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  featured?: Maybe<Scalars['Boolean']['output']>;
  features?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  limits?: Maybe<Scalars['JSON']['output']>;
  modules?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  priceAnnual?: Maybe<Scalars['Float']['output']>;
  priceMonthly: Scalars['Float']['output'];
  slug: Scalars['String']['output'];
  sortOrder?: Maybe<Scalars['Int']['output']>;
  tag?: Maybe<Scalars['String']['output']>;
  tagline?: Maybe<Scalars['String']['output']>;
};

export type PlatformPlanInput = {
  ctaLabel?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  features?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limits?: InputMaybe<Scalars['JSON']['input']>;
  modules?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
  priceAnnual?: InputMaybe<Scalars['Float']['input']>;
  priceMonthly: Scalars['Float']['input'];
  slug: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  tagline?: InputMaybe<Scalars['String']['input']>;
};

export type PlatformPlanUpdateInput = {
  ctaLabel?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  featured?: InputMaybe<Scalars['Boolean']['input']>;
  features?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  limits?: InputMaybe<Scalars['JSON']['input']>;
  modules?: InputMaybe<Scalars['JSON']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  priceAnnual?: InputMaybe<Scalars['Float']['input']>;
  priceMonthly?: InputMaybe<Scalars['Float']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  tagline?: InputMaybe<Scalars['String']['input']>;
};

export type PoolInspection = {
  __typename?: 'PoolInspection';
  chlorine?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  date: Scalars['String']['output'];
  documentId: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  peopleCount?: Maybe<Scalars['Int']['output']>;
  peopleCountSource?: Maybe<Scalars['String']['output']>;
  ph?: Maybe<Scalars['Float']['output']>;
  scheduledTime?: Maybe<Scalars['String']['output']>;
  shift: Scalars['String']['output'];
  /** Computed: ok / warning / critical. Derived from the academy's PoolSettings target ranges + alertTolerance. */
  status: Scalars['String']['output'];
  temperature?: Maybe<Scalars['Float']['output']>;
};

export type PoolInspectionInput = {
  chlorine?: InputMaybe<Scalars['Float']['input']>;
  date: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  peopleCount?: InputMaybe<Scalars['Int']['input']>;
  peopleCountSource?: InputMaybe<Scalars['String']['input']>;
  ph?: InputMaybe<Scalars['Float']['input']>;
  scheduledTime?: InputMaybe<Scalars['String']['input']>;
  shift: Scalars['String']['input'];
  temperature?: InputMaybe<Scalars['Float']['input']>;
};

/** Per-academy pool target ranges (defaults: pH 7.2–7.8, chlorine 1–3, temp 28–31°C — Brazilian legislation). */
export type PoolSettings = {
  __typename?: 'PoolSettings';
  alertTolerance?: Maybe<Scalars['Float']['output']>;
  chlorineMax?: Maybe<Scalars['Float']['output']>;
  chlorineMin?: Maybe<Scalars['Float']['output']>;
  documentId: Scalars['ID']['output'];
  inspectionTimes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  phMax?: Maybe<Scalars['Float']['output']>;
  phMin?: Maybe<Scalars['Float']['output']>;
  temperatureMax?: Maybe<Scalars['Float']['output']>;
  temperatureMin?: Maybe<Scalars['Float']['output']>;
};

export type PoolSettingsInput = {
  alertTolerance?: InputMaybe<Scalars['Float']['input']>;
  chlorineMax?: InputMaybe<Scalars['Float']['input']>;
  chlorineMin?: InputMaybe<Scalars['Float']['input']>;
  inspectionTimes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  phMax?: InputMaybe<Scalars['Float']['input']>;
  phMin?: InputMaybe<Scalars['Float']['input']>;
  temperatureMax?: InputMaybe<Scalars['Float']['input']>;
  temperatureMin?: InputMaybe<Scalars['Float']['input']>;
};

/** URL set returned by mintUploadUrl. Frontend PUTs bytes to uploadUrl, then calls confirmUpload(publicUrl, name) once it succeeds. */
export type PresignedUpload = {
  __typename?: 'PresignedUpload';
  key: Scalars['String']['output'];
  publicUrl: Scalars['String']['output'];
  uploadUrl: Scalars['String']['output'];
};

export enum PublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type Query = {
  __typename?: 'Query';
  academies?: Maybe<Array<Maybe<Academy>>>;
  academy?: Maybe<Academy>;
  /** Public — returns branding config for the given slug. */
  academyBySlug?: Maybe<Academy>;
  adminDashboard?: Maybe<AdminDashboard>;
  allAcademies?: Maybe<PlatformAcademyList>;
  bodyAssessment?: Maybe<BodyAssessment>;
  bodyAssessments?: Maybe<Array<Maybe<BodyAssessment>>>;
  classBooking?: Maybe<ClassBooking>;
  classBookings?: Maybe<Array<Maybe<ClassBooking>>>;
  classSchedule?: Maybe<ClassSchedule>;
  classSchedules?: Maybe<Array<Maybe<ClassSchedule>>>;
  /** Returns every active class scheduled to occur on the given date with its booking roster, ordered by startTime. */
  dailyAttendance?: Maybe<DailyAttendance>;
  dependent?: Maybe<Dependent>;
  dependents?: Maybe<Array<Maybe<Dependent>>>;
  dreOverview?: Maybe<DreOverview>;
  enrollment?: Maybe<Enrollment>;
  enrollments?: Maybe<Array<Maybe<Enrollment>>>;
  expense?: Maybe<Expense>;
  expenses?: Maybe<Array<Maybe<Expense>>>;
  financeOverview?: Maybe<FinanceOverview>;
  guardians?: Maybe<Array<GuardianFamily>>;
  leads?: Maybe<LeadListResult>;
  /** Returns the authenticated user's linked Student profile. */
  me?: Maybe<Student>;
  /** Returns the Asaas configuration status for the caller's academy. Never reveals the actual credentials. */
  myAsaasSettings?: Maybe<AsaasSettingsStatus>;
  myDependents?: Maybe<Array<Maybe<Dependent>>>;
  /** Pool settings for the caller's academy. */
  myPoolSettings?: Maybe<PoolSettings>;
  /** Returns the active subscription for the caller's academy. Null if no subscription exists yet (shouldn't happen post-backfill). */
  mySubscription?: Maybe<AcademySubscription>;
  payment?: Maybe<Payment>;
  payments?: Maybe<Array<Maybe<Payment>>>;
  plan?: Maybe<Plan>;
  plans?: Maybe<Array<Maybe<Plan>>>;
  platformDashboard?: Maybe<PlatformDashboard>;
  platformPlan?: Maybe<PlatformPlan>;
  platformPlans?: Maybe<Array<Maybe<PlatformPlan>>>;
  /** Inspections for the caller's academy. Optional `date` filters to a single day; otherwise returns the most recent 60 ordered by date desc. */
  poolInspections?: Maybe<Array<Maybe<PoolInspection>>>;
  /** Bookings for a given class schedule, optionally filtered by date. */
  scheduleBookings?: Maybe<Array<Maybe<ClassBooking>>>;
  /** Returns existing schedules that would clash with the input on instructor or room. Empty list = no conflict. Tenant-scoped to the caller's academy. */
  scheduleConflicts?: Maybe<Array<ScheduleConflict>>;
  scheduleWeek?: Maybe<ScheduleWeek>;
  student?: Maybe<Student>;
  students?: Maybe<Array<Maybe<Student>>>;
  /** Platform admin only — cross-tenant listing of every academy subscription. */
  subscriptions?: Maybe<Array<Maybe<AcademySubscription>>>;
  suggestModulesForBusinessType?: Maybe<ModulePresetSuggestion>;
  workoutPlan?: Maybe<WorkoutPlan>;
  workoutPlans?: Maybe<Array<Maybe<WorkoutPlan>>>;
};


export type QueryAcademiesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryAcademyArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryAcademyBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryAllAcademiesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryBodyAssessmentArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryBodyAssessmentsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryClassBookingArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryClassBookingsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryClassScheduleArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryClassSchedulesArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryDailyAttendanceArgs = {
  date: Scalars['String']['input'];
};


export type QueryDependentArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryDependentsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryDreOverviewArgs = {
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryEnrollmentArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryEnrollmentsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryExpenseArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryExpensesArgs = {
  month?: InputMaybe<Scalars['Int']['input']>;
  pagination?: InputMaybe<PaginationInput>;
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryFinanceOverviewArgs = {
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLeadsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPaymentArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryPaymentsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryPlanArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryPlansArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QueryPlatformPlanArgs = {
  slug: Scalars['String']['input'];
};


export type QueryPoolInspectionsArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
};


export type QueryScheduleBookingsArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['ID']['input'];
};


export type QueryScheduleConflictsArgs = {
  input: ScheduleConflictInput;
};


export type QueryScheduleWeekArgs = {
  weekStart?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStudentArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryStudentsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QuerySubscriptionsArgs = {
  pagination?: InputMaybe<PaginationInput>;
};


export type QuerySuggestModulesForBusinessTypeArgs = {
  businessType: Scalars['String']['input'];
};


export type QueryWorkoutPlanArgs = {
  documentId: Scalars['ID']['input'];
};


export type QueryWorkoutPlansArgs = {
  pagination?: InputMaybe<PaginationInput>;
};

export type ResponseCollectionMeta = {
  __typename?: 'ResponseCollectionMeta';
  pagination: Pagination;
};

export type ScheduleClass = {
  __typename?: 'ScheduleClass';
  booked: Scalars['Int']['output'];
  capacity: Scalars['Int']['output'];
  color: Scalars['String']['output'];
  endTime: Scalars['String']['output'];
  id: Scalars['String']['output'];
  instructor?: Maybe<Scalars['String']['output']>;
  modality?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  scheduleDocumentId: Scalars['ID']['output'];
  startTime: Scalars['String']['output'];
  weekday: Scalars['Int']['output'];
};

/** Existing ClassSchedule that collides with a proposed input on instructor or room. */
export type ScheduleConflict = {
  __typename?: 'ScheduleConflict';
  days: Array<Scalars['Int']['output']>;
  reason: Scalars['String']['output'];
  schedule: ClassSchedule;
};

export type ScheduleConflictInput = {
  endTime: Scalars['String']['input'];
  excludeDocumentId?: InputMaybe<Scalars['ID']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  room?: InputMaybe<Scalars['String']['input']>;
  startTime: Scalars['String']['input'];
  weekdays: Array<Scalars['Int']['input']>;
};

export type ScheduleStats = {
  __typename?: 'ScheduleStats';
  capacityFill: Scalars['Int']['output'];
  totalBookings: Scalars['Int']['output'];
  totalClasses: Scalars['Int']['output'];
};

export type ScheduleUpcoming = {
  __typename?: 'ScheduleUpcoming';
  id: Scalars['String']['output'];
  instructor?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  time: Scalars['String']['output'];
};

export type ScheduleWeek = {
  __typename?: 'ScheduleWeek';
  classes: Array<ScheduleClass>;
  stats: ScheduleStats;
  upcoming: Array<ScheduleUpcoming>;
  weekLabel: Scalars['String']['output'];
  weekNumber: Scalars['Int']['output'];
};

export type StringFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contains?: InputMaybe<Scalars['String']['input']>;
  containsi?: InputMaybe<Scalars['String']['input']>;
  endsWith?: InputMaybe<Scalars['String']['input']>;
  eq?: InputMaybe<Scalars['String']['input']>;
  eqi?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  ne?: InputMaybe<Scalars['String']['input']>;
  nei?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<StringFilterInput>;
  notContains?: InputMaybe<Scalars['String']['input']>;
  notContainsi?: InputMaybe<Scalars['String']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

export type Student = {
  __typename?: 'Student';
  academy?: Maybe<Academy>;
  address?: Maybe<Address>;
  birthdate?: Maybe<Scalars['String']['output']>;
  cpf?: Maybe<Scalars['String']['output']>;
  dependents?: Maybe<Array<Maybe<Dependent>>>;
  documentId: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  enrollments?: Maybe<Array<Maybe<Enrollment>>>;
  gender?: Maybe<Scalars['String']['output']>;
  isGuardian?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Media>;
  role: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  workoutPlans?: Maybe<Array<Maybe<WorkoutPlan>>>;
};

export type StudentImportRow = {
  address?: InputMaybe<AddressInput>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  cpf?: InputMaybe<Scalars['String']['input']>;
  dependentBirthdate?: InputMaybe<Scalars['String']['input']>;
  dependentCpf?: InputMaybe<Scalars['String']['input']>;
  dependentGender?: InputMaybe<Scalars['String']['input']>;
  dependentName?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  emergencyContactName?: InputMaybe<Scalars['String']['input']>;
  emergencyContactPhone?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  kind: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  rowNumber?: InputMaybe<Scalars['Int']['input']>;
};

export type StudentInput = {
  academy?: InputMaybe<Scalars['ID']['input']>;
  address?: InputMaybe<AddressInput>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  cpf?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  isGuardian?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  photo?: InputMaybe<Scalars['ID']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['ID']['input']>;
};

export type StudentUpdateInput = {
  address?: InputMaybe<AddressInput>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  cpf?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  isGuardian?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  photo?: InputMaybe<Scalars['ID']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type TimeFilterInput = {
  and?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  between?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  contains?: InputMaybe<Scalars['Time']['input']>;
  containsi?: InputMaybe<Scalars['Time']['input']>;
  endsWith?: InputMaybe<Scalars['Time']['input']>;
  eq?: InputMaybe<Scalars['Time']['input']>;
  eqi?: InputMaybe<Scalars['Time']['input']>;
  gt?: InputMaybe<Scalars['Time']['input']>;
  gte?: InputMaybe<Scalars['Time']['input']>;
  in?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  lt?: InputMaybe<Scalars['Time']['input']>;
  lte?: InputMaybe<Scalars['Time']['input']>;
  ne?: InputMaybe<Scalars['Time']['input']>;
  nei?: InputMaybe<Scalars['Time']['input']>;
  not?: InputMaybe<TimeFilterInput>;
  notContains?: InputMaybe<Scalars['Time']['input']>;
  notContainsi?: InputMaybe<Scalars['Time']['input']>;
  notIn?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  notNull?: InputMaybe<Scalars['Boolean']['input']>;
  null?: InputMaybe<Scalars['Boolean']['input']>;
  or?: InputMaybe<Array<InputMaybe<Scalars['Time']['input']>>>;
  startsWith?: InputMaybe<Scalars['Time']['input']>;
};

export type UpdateLeadInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  planInterest?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type WorkoutPlan = {
  __typename?: 'WorkoutPlan';
  documentId: Scalars['ID']['output'];
  exercises?: Maybe<Array<Maybe<Exercise>>>;
  instructor?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  student?: Maybe<Student>;
  validFrom?: Maybe<Scalars['String']['output']>;
  validTo?: Maybe<Scalars['String']['output']>;
};

export type WorkoutPlanInput = {
  dependent?: InputMaybe<Scalars['ID']['input']>;
  exercises?: InputMaybe<Array<InputMaybe<ExerciseInput>>>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  student?: InputMaybe<Scalars['ID']['input']>;
  validFrom?: InputMaybe<Scalars['String']['input']>;
  validTo?: InputMaybe<Scalars['String']['input']>;
};

export type WorkoutPlanUpdateInput = {
  exercises?: InputMaybe<Array<InputMaybe<ExerciseInput>>>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  validFrom?: InputMaybe<Scalars['String']['input']>;
  validTo?: InputMaybe<Scalars['String']['input']>;
};

export type AdminFamilyForEditQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminFamilyForEditQuery = { __typename?: 'Query', student?: { __typename?: 'Student', documentId: string, name: string, email: string, phone?: string | null, birthdate?: string | null, cpf?: string | null, gender?: string | null, role: string, status?: string | null, notes?: string | null, address?: { __typename?: 'Address', type?: string | null, cep?: string | null, street?: string | null, number?: string | null, complement?: string | null, neighborhood?: string | null, city?: string | null, state?: string | null } | null, dependents?: Array<{ __typename?: 'Dependent', documentId: string, name: string, birthdate: string, cpf?: string | null, gender?: string | null, relationship?: string | null, status: string, bloodType?: string | null, allergies?: string | null, medicalNotes?: string | null, medicalAlert?: string | null, emergencyContactName?: string | null, emergencyContactPhone?: string | null, address?: { __typename?: 'Address', type?: string | null, cep?: string | null, street?: string | null, number?: string | null, complement?: string | null, neighborhood?: string | null, city?: string | null, state?: string | null } | null } | null> | null } | null };

export type AdminUpdateGuardianFromFamilyDialogMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: StudentUpdateInput;
}>;


export type AdminUpdateGuardianFromFamilyDialogMutation = { __typename?: 'Mutation', updateStudent?: { __typename?: 'Student', documentId: string, name: string, email: string } | null };

export type AdminUpdateDependentFromFamilyDialogMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: DependentUpdateInput;
}>;


export type AdminUpdateDependentFromFamilyDialogMutation = { __typename?: 'Mutation', updateDependent?: { __typename?: 'Dependent', documentId: string, name: string } | null };

export type AdminCreateDependentMutationVariables = Exact<{
  data: DependentInput;
}>;


export type AdminCreateDependentMutation = { __typename?: 'Mutation', createDependent?: { __typename?: 'Dependent', documentId: string, name: string, birthdate: string } | null };

export type AdminCreateGuardianStudentMutationVariables = Exact<{
  data: StudentInput;
}>;


export type AdminCreateGuardianStudentMutation = { __typename?: 'Mutation', createStudent?: { __typename?: 'Student', documentId: string, name: string, email: string, isGuardian?: boolean | null } | null };

export type AdminExpenseForEditQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminExpenseForEditQuery = { __typename?: 'Query', expense?: { __typename?: 'Expense', documentId: string, description: string, subtitle?: string | null, amount: number, date: string, category: string, type: string, status: string, notes?: string | null } | null };

export type AdminCreateExpenseMutationVariables = Exact<{
  data: ExpenseInput;
}>;


export type AdminCreateExpenseMutation = { __typename?: 'Mutation', createExpense?: { __typename?: 'Expense', documentId: string, description: string, amount: number, status: string } | null };

export type AdminUpdateExpenseMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: ExpenseUpdateInput;
}>;


export type AdminUpdateExpenseMutation = { __typename?: 'Mutation', updateExpense?: { __typename?: 'Expense', documentId: string, description: string, amount: number, status: string } | null };

export type AdminDeleteExpenseMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminDeleteExpenseMutation = { __typename?: 'Mutation', deleteExpense?: { __typename?: 'Expense', documentId: string } | null };

export type FetchForChargeQueryVariables = Exact<{ [key: string]: never; }>;


export type FetchForChargeQuery = { __typename?: 'Query', students?: Array<{ __typename?: 'Student', documentId: string, name: string, email: string, status?: string | null, enrollments?: Array<{ __typename?: 'Enrollment', documentId: string, status: string, plan?: { __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string } | null } | null> | null } | null> | null, plans?: Array<{ __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string, isActive?: boolean | null } | null> | null };

export type AdminCreateEnrollmentMutationVariables = Exact<{
  data: EnrollmentInput;
}>;


export type AdminCreateEnrollmentMutation = { __typename?: 'Mutation', createEnrollment?: { __typename?: 'Enrollment', documentId: string, status: string, plan?: { __typename?: 'Plan', documentId: string } | null, student?: { __typename?: 'Student', documentId: string } | null } | null };

export type AdminCreatePaymentMutationVariables = Exact<{
  data: PaymentInput;
}>;


export type AdminCreatePaymentMutation = { __typename?: 'Mutation', createPayment?: { __typename?: 'Payment', documentId: string, amount: number, status: string, method?: string | null, dueDate: string } | null };

export type AdminUpdatePaymentStatusMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: PaymentUpdateInput;
}>;


export type AdminUpdatePaymentStatusMutation = { __typename?: 'Mutation', updatePayment?: { __typename?: 'Payment', documentId: string, status: string, paidAt?: string | null } | null };

export type AdminUpdatePlanMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: PlanUpdateInput;
}>;


export type AdminUpdatePlanMutation = { __typename?: 'Mutation', updatePlan?: { __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string, isActive?: boolean | null } | null };

export type AdminDeletePlanMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminDeletePlanMutation = { __typename?: 'Mutation', deletePlan?: { __typename?: 'Plan', documentId: string } | null };

export type AdminCreatePlanMutationVariables = Exact<{
  data: PlanInput;
}>;


export type AdminCreatePlanMutation = { __typename?: 'Mutation', createPlan?: { __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string, isActive?: boolean | null } | null };

export type AdminCreatePoolInspectionMutationVariables = Exact<{
  data: PoolInspectionInput;
}>;


export type AdminCreatePoolInspectionMutation = { __typename?: 'Mutation', createPoolInspection?: { __typename?: 'PoolInspection', documentId: string } | null };

export type AdminUpdatePoolInspectionMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: PoolInspectionInput;
}>;


export type AdminUpdatePoolInspectionMutation = { __typename?: 'Mutation', updatePoolInspection?: { __typename?: 'PoolInspection', documentId: string } | null };

export type AdminCreateClassScheduleMutationVariables = Exact<{
  data: ClassScheduleInput;
}>;


export type AdminCreateClassScheduleMutation = { __typename?: 'Mutation', createClassSchedule?: { __typename?: 'ClassSchedule', documentId: string, name: string, instructor?: string | null } | null };

export type SuggestModulesForBusinessTypeQueryVariables = Exact<{
  businessType: Scalars['String']['input'];
}>;


export type SuggestModulesForBusinessTypeQuery = { __typename?: 'Query', suggestModulesForBusinessType?: { __typename?: 'ModulePresetSuggestion', businessType: string, modules: Array<string> } | null };

export type AssignPlanMenuPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type AssignPlanMenuPlansQuery = { __typename?: 'Query', plans?: Array<{ __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string, isActive?: boolean | null } | null> | null };

export type AssignPlanQuickMutationVariables = Exact<{
  data: EnrollmentInput;
}>;


export type AssignPlanQuickMutation = { __typename?: 'Mutation', createEnrollment?: { __typename?: 'Enrollment', documentId: string, status: string } | null };

export type AdminStudentForEditQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminStudentForEditQuery = { __typename?: 'Query', student?: { __typename?: 'Student', documentId: string, name: string, email: string, phone?: string | null, birthdate?: string | null, cpf?: string | null, gender?: string | null, role: string, status?: string | null, notes?: string | null, address?: { __typename?: 'Address', type?: string | null, cep?: string | null, street?: string | null, number?: string | null, complement?: string | null, neighborhood?: string | null, city?: string | null, state?: string | null } | null, enrollments?: Array<{ __typename?: 'Enrollment', documentId: string, status: string, startDate: string, plan?: { __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string } | null } | null> | null } | null, plans?: Array<{ __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string, isActive?: boolean | null } | null> | null };

export type AdminUpdateStudentFromDialogMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: StudentUpdateInput;
}>;


export type AdminUpdateStudentFromDialogMutation = { __typename?: 'Mutation', updateStudent?: { __typename?: 'Student', documentId: string, name: string, email: string } | null };

export type AdminCreateEnrollmentFromDialogMutationVariables = Exact<{
  data: EnrollmentInput;
}>;


export type AdminCreateEnrollmentFromDialogMutation = { __typename?: 'Mutation', createEnrollment?: { __typename?: 'Enrollment', documentId: string, status: string } | null };

export type AdminCreateStudentMutationVariables = Exact<{
  data: StudentInput;
}>;


export type AdminCreateStudentMutation = { __typename?: 'Mutation', createStudent?: { __typename?: 'Student', documentId: string, name: string, email: string, status?: string | null } | null };

export type AdminBulkImportStudentsMutationVariables = Exact<{
  rows: Array<StudentImportRow> | StudentImportRow;
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AdminBulkImportStudentsMutation = { __typename?: 'Mutation', bulkImportStudents?: { __typename?: 'BulkImportResult', created: number, skipped: number, errors: number, items: Array<{ __typename?: 'BulkImportItem', rowNumber: number, status: string, studentDocumentId?: string | null, dependentDocumentId?: string | null, message?: string | null }> } | null };

export type AdminUpdateStudentStatusMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: StudentUpdateInput;
}>;


export type AdminUpdateStudentStatusMutation = { __typename?: 'Mutation', updateStudent?: { __typename?: 'Student', documentId: string, status?: string | null } | null };

export type AdminDeleteStudentMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminDeleteStudentMutation = { __typename?: 'Mutation', deleteStudent?: { __typename?: 'Student', documentId: string } | null };

export type StudentsForWorkoutEditQueryVariables = Exact<{ [key: string]: never; }>;


export type StudentsForWorkoutEditQuery = { __typename?: 'Query', students?: Array<{ __typename?: 'Student', documentId: string, name: string } | null> | null };

export type StudentsForWorkoutQueryVariables = Exact<{ [key: string]: never; }>;


export type StudentsForWorkoutQuery = { __typename?: 'Query', students?: Array<{ __typename?: 'Student', documentId: string, name: string } | null> | null };

export type AdminCreateWorkoutPlanMutationVariables = Exact<{
  data: WorkoutPlanInput;
}>;


export type AdminCreateWorkoutPlanMutation = { __typename?: 'Mutation', createWorkoutPlan?: { __typename?: 'WorkoutPlan', documentId: string, name: string } | null };

export type AdminDuplicateWorkoutPlanMutationVariables = Exact<{
  data: WorkoutPlanInput;
}>;


export type AdminDuplicateWorkoutPlanMutation = { __typename?: 'Mutation', createWorkoutPlan?: { __typename?: 'WorkoutPlan', documentId: string, name: string } | null };

export type AllAcademiesQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllAcademiesQuery = { __typename?: 'Query', allAcademies?: { __typename?: 'PlatformAcademyList', total: number, items: Array<{ __typename?: 'PlatformAcademy', documentId: string, name: string, slug: string, plan: string, isActive: boolean, email?: string | null, studentCount: number, createdAt?: string | null }> } | null };

export type PlatformDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformDashboardQuery = { __typename?: 'Query', platformDashboard?: { __typename?: 'PlatformDashboard', totalAcademies: number, activeAcademies: number, totalStudents: number, mrr: string, openLeads: number, leadsThisMonth: number } | null };

export type ConvertLeadMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: ConvertLeadInput;
}>;


export type ConvertLeadMutation = { __typename?: 'Mutation', convertLead?: { __typename?: 'ConvertLeadResult', passwordResetUrl: string, adminEmail: string, emailSent: boolean, academy: { __typename?: 'Academy', documentId: string, name: string, slug: string, plan?: string | null } } | null };

export type PlatformLeadsQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PlatformLeadsQuery = { __typename?: 'Query', leads?: { __typename?: 'LeadListResult', total: number, page: number, pageSize: number, items: Array<{ __typename?: 'Lead', documentId: string, name: string, email: string, phone?: string | null, academyName?: string | null, studentCount?: string | null, message: string, status: string, planInterest?: string | null, notes?: string | null, createdAt?: string | null }> } | null };

export type UpdateLeadMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: UpdateLeadInput;
}>;


export type UpdateLeadMutation = { __typename?: 'Mutation', updateLead?: { __typename?: 'Lead', documentId: string, status: string, notes?: string | null, planInterest?: string | null } | null };

export type AcademyBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type AcademyBySlugQuery = { __typename?: 'Query', academyBySlug?: { __typename?: 'Academy', documentId: string, name: string, slug: string, primaryColor?: string | null, secondaryColor?: string | null, plan?: string | null, isActive?: boolean | null, logo?: { __typename?: 'Media', url?: string | null, alternativeText?: string | null } | null } | null };

export type AcademiesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AcademiesQuery = { __typename?: 'Query', academies?: Array<{ __typename?: 'Academy', documentId: string, name: string, slug: string, plan?: string | null, isActive?: boolean | null } | null> | null };

export type MyAsaasSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAsaasSettingsQuery = { __typename?: 'Query', myAsaasSettings?: { __typename?: 'AsaasSettingsStatus', apiKeyConfigured: boolean, webhookTokenConfigured: boolean, environment: string, webhookUrl: string, apiKeyHint?: string | null } | null };

export type UpdateMyAsaasSettingsMutationVariables = Exact<{
  data: AsaasSettingsInput;
}>;


export type UpdateMyAsaasSettingsMutation = { __typename?: 'Mutation', updateMyAsaasSettings?: { __typename?: 'AsaasSettingsStatus', apiKeyConfigured: boolean, webhookTokenConfigured: boolean, environment: string, webhookUrl: string, apiKeyHint?: string | null } | null };

export type SubmitContactFormMutationVariables = Exact<{
  input: ContactFormInput;
}>;


export type SubmitContactFormMutation = { __typename?: 'Mutation', submitContactForm?: { __typename?: 'ContactFormResult', ok: boolean } | null };

export type StudentByIdQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type StudentByIdQuery = { __typename?: 'Query', student?: { __typename?: 'Student', documentId: string, name: string, email: string, phone?: string | null, birthdate?: string | null, cpf?: string | null, gender?: string | null, role: string, status?: string | null, isGuardian?: boolean | null, notes?: string | null, address?: { __typename?: 'Address', type?: string | null, cep?: string | null, street?: string | null, number?: string | null, complement?: string | null, neighborhood?: string | null, city?: string | null, state?: string | null } | null, photo?: { __typename?: 'Media', url?: string | null } | null, enrollments?: Array<{ __typename?: 'Enrollment', documentId: string, status: string, startDate: string, endDate?: string | null, paymentMethod?: string | null, plan?: { __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string } | null } | null> | null, workoutPlans?: Array<{ __typename?: 'WorkoutPlan', documentId: string, name: string, instructor?: string | null, isActive?: boolean | null } | null> | null } | null };

export type AdminAvailablePlansQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminAvailablePlansQuery = { __typename?: 'Query', plans?: Array<{ __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string, isActive?: boolean | null } | null> | null };

export type UpdateStudentMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: StudentUpdateInput;
}>;


export type UpdateStudentMutation = { __typename?: 'Mutation', updateStudent?: { __typename?: 'Student', documentId: string, name: string, email: string, status?: string | null } | null };

export type CreateEnrollmentFromStudentMutationVariables = Exact<{
  data: EnrollmentInput;
}>;


export type CreateEnrollmentFromStudentMutation = { __typename?: 'Mutation', createEnrollment?: { __typename?: 'Enrollment', documentId: string, status: string, startDate: string, paymentMethod?: string | null, plan?: { __typename?: 'Plan', documentId: string, name: string } | null } | null };

export type CreateStudentMutationVariables = Exact<{
  data: StudentInput;
}>;


export type CreateStudentMutation = { __typename?: 'Mutation', createStudent?: { __typename?: 'Student', documentId: string, name: string, email: string, status?: string | null } | null };

export type BulkImportStudentsMutationVariables = Exact<{
  rows: Array<StudentImportRow> | StudentImportRow;
  dryRun?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type BulkImportStudentsMutation = { __typename?: 'Mutation', bulkImportStudents?: { __typename?: 'BulkImportResult', created: number, skipped: number, errors: number, items: Array<{ __typename?: 'BulkImportItem', rowNumber: number, status: string, studentDocumentId?: string | null, dependentDocumentId?: string | null, message?: string | null }> } | null };

export type AdminDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminDashboardQuery = { __typename?: 'Query', adminDashboard?: { __typename?: 'AdminDashboard', metrics: Array<{ __typename?: 'MetricCard', id: string, label: string, value: string, highlighted?: boolean | null, delta?: { __typename?: 'MetricDelta', value: string, trend: string } | null }>, recentStudents: Array<{ __typename?: 'DashboardStudentRow', id: string, name: string, email: string, plan: string, status: string, initials: string, joinedAt?: string | null }>, todayClasses: Array<{ __typename?: 'DashboardClassRow', id: string, name: string, instructor?: string | null, time: string, booked: number, capacity: number }>, upcomingPayments: Array<{ __typename?: 'DashboardPaymentRow', id: string, student: string, amount: string, dueDate: string, method: string }> } | null };

export type FinanceOverviewQueryVariables = Exact<{
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FinanceOverviewQuery = { __typename?: 'Query', financeOverview?: { __typename?: 'FinanceOverview', kpis: Array<{ __typename?: 'MetricCard', id: string, label: string, value: string, highlighted?: boolean | null, delta?: { __typename?: 'MetricDelta', value: string, trend: string } | null }>, charges: Array<{ __typename?: 'FinanceCharge', id: string, student: string, studentInitials: string, amount: number, amountFormatted: string, method: string, status: string, dueDate: string, paidAt?: string | null }> } | null };

export type DreOverviewQueryVariables = Exact<{
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DreOverviewQuery = { __typename?: 'Query', dreOverview?: { __typename?: 'DREOverview', monthLabel: string, expensesTotalLabel: string, revenueTotalLabel: string, revenue: { __typename?: 'DREHeroRevenue', total: string, deltaLabel: string, trend: string }, expenses: { __typename?: 'DREHeroExpenses', total: string, fixed: string, variable: string }, profit: { __typename?: 'DREHeroProfit', total: string, marginPercent: number }, cashFlow: Array<{ __typename?: 'DRECashFlowPoint', label: string, revenue: number, expenses: number, profit: number }>, categoryBreakdown: Array<{ __typename?: 'DRECategoryBreakdown', category: string, label: string, amount: string, percent: number }>, expenseRows: Array<{ __typename?: 'DREExpenseRow', id: string, description: string, subtitle?: string | null, category: string, categoryLabel: string, type: string, dueDate: string, amount: string, status: string }>, revenueRows: Array<{ __typename?: 'DRERevenueRow', id: string, student: string, source?: string | null, paidAt: string, amount: string, method: string }> } | null };

export type ScheduleWeekQueryVariables = Exact<{
  weekStart?: InputMaybe<Scalars['String']['input']>;
}>;


export type ScheduleWeekQuery = { __typename?: 'Query', scheduleWeek?: { __typename?: 'ScheduleWeek', weekLabel: string, weekNumber: number, stats: { __typename?: 'ScheduleStats', totalClasses: number, totalBookings: number, capacityFill: number }, classes: Array<{ __typename?: 'ScheduleClass', id: string, scheduleDocumentId: string, name: string, instructor?: string | null, modality?: string | null, weekday: number, startTime: string, endTime: string, booked: number, capacity: number, color: string }>, upcoming: Array<{ __typename?: 'ScheduleUpcoming', id: string, name: string, time: string, instructor?: string | null }> } | null };

export type AdminClassScheduleQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminClassScheduleQuery = { __typename?: 'Query', classSchedule?: { __typename?: 'ClassSchedule', documentId: string, name: string, instructor?: string | null, modality?: string | null, weekdays?: Array<number | null> | null, startTime?: string | null, endTime?: string | null, maxCapacity?: number | null, room?: string | null, isActive?: boolean | null } | null };

export type AdminScheduleConflictsQueryVariables = Exact<{
  input: ScheduleConflictInput;
}>;


export type AdminScheduleConflictsQuery = { __typename?: 'Query', scheduleConflicts?: Array<{ __typename?: 'ScheduleConflict', reason: string, days: Array<number>, schedule: { __typename?: 'ClassSchedule', documentId: string, name: string, instructor?: string | null, room?: string | null, startTime?: string | null, endTime?: string | null } }> | null };

export type AdminUpdateClassScheduleMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: ClassScheduleUpdateInput;
}>;


export type AdminUpdateClassScheduleMutation = { __typename?: 'Mutation', updateClassSchedule?: { __typename?: 'ClassSchedule', documentId: string, name: string, isActive?: boolean | null } | null };

export type ScheduleBookingsQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
  date?: InputMaybe<Scalars['String']['input']>;
}>;


export type ScheduleBookingsQuery = { __typename?: 'Query', scheduleBookings?: Array<{ __typename?: 'ClassBooking', documentId: string, date: string, status: string, checkedInAt?: string | null, student?: { __typename?: 'Student', documentId: string, name: string, photo?: { __typename?: 'Media', url?: string | null } | null } | null } | null> | null };

export type AdminCheckInBookingMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminCheckInBookingMutation = { __typename?: 'Mutation', checkInBooking?: { __typename?: 'ClassBooking', documentId: string, status: string, checkedInAt?: string | null } | null };

export type AdminUpdateBookingStatusMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: ClassBookingUpdateInput;
}>;


export type AdminUpdateBookingStatusMutation = { __typename?: 'Mutation', updateClassBooking?: { __typename?: 'ClassBooking', documentId: string, status: string, checkedInAt?: string | null } | null };

export type AdminDailyAttendanceQueryVariables = Exact<{
  date: Scalars['String']['input'];
}>;


export type AdminDailyAttendanceQuery = { __typename?: 'Query', dailyAttendance?: { __typename?: 'DailyAttendance', date: string, weekdayLabel: string, classes: Array<{ __typename?: 'DailyAttendanceClass', scheduleDocumentId: string, name: string, instructor?: string | null, room?: string | null, startTime: string, endTime: string, capacity?: number | null, bookedCount: number, attendedCount: number, missedCount: number, bookings: Array<{ __typename?: 'ClassBooking', documentId: string, date: string, status: string, checkedInAt?: string | null, student?: { __typename?: 'Student', documentId: string, name: string, photo?: { __typename?: 'Media', url?: string | null } | null } | null }> }> } | null };

export type GuardiansQueryVariables = Exact<{ [key: string]: never; }>;


export type GuardiansQuery = { __typename?: 'Query', guardians?: Array<{ __typename?: 'GuardianFamily', guardian: { __typename?: 'GuardianFamilyGuardian', id: string, name: string, initials: string, email: string, phone?: string | null }, dependents: Array<{ __typename?: 'GuardianFamilyDependent', id: string, name: string, age: number, className?: string | null, classTime?: string | null, status: string, gender?: string | null, medicalAlert?: string | null }> }> | null };

export type AdminWorkoutsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminWorkoutsQuery = { __typename?: 'Query', workoutPlans?: Array<{ __typename?: 'WorkoutPlan', documentId: string, name: string, instructor?: string | null, isActive?: boolean | null, validFrom?: string | null, exercises?: Array<{ __typename?: 'Exercise', name: string, sets?: number | null, reps?: number | null, load?: string | null } | null> | null, student?: { __typename?: 'Student', documentId: string, name: string } | null } | null> | null };

export type AdminWorkoutPlanQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminWorkoutPlanQuery = { __typename?: 'Query', workoutPlan?: { __typename?: 'WorkoutPlan', documentId: string, name: string, instructor?: string | null, isActive?: boolean | null, validFrom?: string | null, validTo?: string | null, exercises?: Array<{ __typename?: 'Exercise', name: string, sets?: number | null, reps?: number | null, load?: string | null, notes?: string | null } | null> | null, student?: { __typename?: 'Student', documentId: string, name: string } | null } | null };

export type AdminUpdateWorkoutPlanMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: WorkoutPlanUpdateInput;
}>;


export type AdminUpdateWorkoutPlanMutation = { __typename?: 'Mutation', updateWorkoutPlan?: { __typename?: 'WorkoutPlan', documentId: string, name: string, isActive?: boolean | null } | null };

export type AdminDeleteWorkoutPlanMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminDeleteWorkoutPlanMutation = { __typename?: 'Mutation', deleteWorkoutPlan?: { __typename?: 'WorkoutPlan', documentId: string } | null };

export type StudentsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type StudentsQuery = { __typename?: 'Query', students?: Array<{ __typename?: 'Student', documentId: string, name: string, email: string, phone?: string | null, status?: string | null, isGuardian?: boolean | null, enrollments?: Array<{ __typename?: 'Enrollment', documentId: string, startDate: string, endDate?: string | null, paymentMethod?: string | null, status: string, plan?: { __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string } | null } | null> | null } | null> | null };

export type MyAcademyQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAcademyQuery = { __typename?: 'Query', me?: { __typename?: 'Student', documentId: string, name: string, email: string, role: string, photo?: { __typename?: 'Media', url?: string | null, alternativeText?: string | null } | null, academy?: { __typename?: 'Academy', documentId: string, name: string, slug: string, primaryColor?: string | null, secondaryColor?: string | null, plan?: string | null, businessType?: string | null, enabledModules?: Array<string | null> | null, email?: string | null, phone?: string | null, address?: string | null, logo?: { __typename?: 'Media', documentId: string, url?: string | null, alternativeText?: string | null } | null, logoSquare?: { __typename?: 'Media', documentId: string, url?: string | null, alternativeText?: string | null } | null } | null } | null };

export type AcademyBySlugForLoginQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type AcademyBySlugForLoginQuery = { __typename?: 'Query', academyBySlug?: { __typename?: 'Academy', documentId: string, name: string, slug: string, primaryColor?: string | null, secondaryColor?: string | null, logo?: { __typename?: 'Media', url?: string | null, alternativeText?: string | null } | null, logoSquare?: { __typename?: 'Media', url?: string | null, alternativeText?: string | null } | null } | null };

export type AdminUpdateAcademyMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: AcademyUpdateInput;
}>;


export type AdminUpdateAcademyMutation = { __typename?: 'Mutation', updateAcademy?: { __typename?: 'Academy', documentId: string, name: string, slug: string, primaryColor?: string | null, secondaryColor?: string | null, email?: string | null, phone?: string | null, address?: string | null, logo?: { __typename?: 'Media', documentId: string, url?: string | null, alternativeText?: string | null } | null, logoSquare?: { __typename?: 'Media', documentId: string, url?: string | null, alternativeText?: string | null } | null } | null };

export type PlatformPlansPublicQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformPlansPublicQuery = { __typename?: 'Query', platformPlans?: Array<{ __typename?: 'PlatformPlan', documentId: string, slug: string, name: string, tagline?: string | null, tag?: string | null, priceMonthly: number, priceAnnual?: number | null, currency?: string | null, features?: Array<string | null> | null, ctaLabel?: string | null, featured?: boolean | null, sortOrder?: number | null, isActive?: boolean | null } | null> | null };

export type AdminPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminPlansQuery = { __typename?: 'Query', plans?: Array<{ __typename?: 'Plan', documentId: string, name: string, description?: string | null, price: number, billingCycle: string, maxStudents?: number | null, features?: Array<string | null> | null, isActive?: boolean | null } | null> | null };

export type MySubscriptionQueryVariables = Exact<{ [key: string]: never; }>;


export type MySubscriptionQuery = { __typename?: 'Query', mySubscription?: { __typename?: 'AcademySubscription', documentId: string, status: string, recurrency: string, trialEndsAt?: string | null, trialDaysLeft?: number | null, currentPeriodEnd?: string | null, platformPlan?: { __typename?: 'PlatformPlan', documentId: string, slug: string, name: string } | null } | null };

export type MyPoolSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyPoolSettingsQuery = { __typename?: 'Query', myPoolSettings?: { __typename?: 'PoolSettings', documentId: string, phMin?: number | null, phMax?: number | null, chlorineMin?: number | null, chlorineMax?: number | null, temperatureMin?: number | null, temperatureMax?: number | null, alertTolerance?: number | null, inspectionTimes?: Array<string | null> | null } | null };

export type PoolInspectionsQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
}>;


export type PoolInspectionsQuery = { __typename?: 'Query', poolInspections?: Array<{ __typename?: 'PoolInspection', documentId: string, date: string, shift: string, scheduledTime?: string | null, chlorine?: number | null, ph?: number | null, temperature?: number | null, peopleCount?: number | null, peopleCountSource?: string | null, notes?: string | null, status: string, createdAt?: string | null } | null> | null };

export type MintUploadUrlMutationVariables = Exact<{
  filename: Scalars['String']['input'];
  contentType: Scalars['String']['input'];
  size: Scalars['Int']['input'];
}>;


export type MintUploadUrlMutation = { __typename?: 'Mutation', mintUploadUrl?: { __typename?: 'PresignedUpload', uploadUrl: string, publicUrl: string, key: string } | null };

export type ConfirmUploadMutationVariables = Exact<{
  url: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type ConfirmUploadMutation = { __typename?: 'Mutation', confirmUpload?: { __typename?: 'Media', documentId: string, url?: string | null, mime?: string | null } | null };


export const AdminFamilyForEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminFamilyForEdit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"birthdate"}},{"kind":"Field","name":{"kind":"Name","value":"cpf"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"cep"}},{"kind":"Field","name":{"kind":"Name","value":"street"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"complement"}},{"kind":"Field","name":{"kind":"Name","value":"neighborhood"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dependents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"birthdate"}},{"kind":"Field","name":{"kind":"Name","value":"cpf"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"relationship"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"bloodType"}},{"kind":"Field","name":{"kind":"Name","value":"allergies"}},{"kind":"Field","name":{"kind":"Name","value":"medicalNotes"}},{"kind":"Field","name":{"kind":"Name","value":"medicalAlert"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactName"}},{"kind":"Field","name":{"kind":"Name","value":"emergencyContactPhone"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"cep"}},{"kind":"Field","name":{"kind":"Name","value":"street"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"complement"}},{"kind":"Field","name":{"kind":"Name","value":"neighborhood"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AdminFamilyForEditQuery, AdminFamilyForEditQueryVariables>;
export const AdminUpdateGuardianFromFamilyDialogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateGuardianFromFamilyDialog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateGuardianFromFamilyDialogMutation, AdminUpdateGuardianFromFamilyDialogMutationVariables>;
export const AdminUpdateDependentFromFamilyDialogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateDependentFromFamilyDialog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DependentUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDependent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateDependentFromFamilyDialogMutation, AdminUpdateDependentFromFamilyDialogMutationVariables>;
export const AdminCreateDependentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateDependent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DependentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDependent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"birthdate"}}]}}]}}]} as unknown as DocumentNode<AdminCreateDependentMutation, AdminCreateDependentMutationVariables>;
export const AdminCreateGuardianStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateGuardianStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isGuardian"}}]}}]}}]} as unknown as DocumentNode<AdminCreateGuardianStudentMutation, AdminCreateGuardianStudentMutationVariables>;
export const AdminExpenseForEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminExpenseForEdit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"expense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}}]}}]} as unknown as DocumentNode<AdminExpenseForEditQuery, AdminExpenseForEditQueryVariables>;
export const AdminCreateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AdminCreateExpenseMutation, AdminCreateExpenseMutationVariables>;
export const AdminUpdateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateExpenseMutation, AdminUpdateExpenseMutationVariables>;
export const AdminDeleteExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]} as unknown as DocumentNode<AdminDeleteExpenseMutation, AdminDeleteExpenseMutationVariables>;
export const FetchForChargeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchForCharge"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"500"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"enrollments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"plans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<FetchForChargeQuery, FetchForChargeQueryVariables>;
export const AdminCreateEnrollmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateEnrollment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnrollmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEnrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]}}]} as unknown as DocumentNode<AdminCreateEnrollmentMutation, AdminCreateEnrollmentMutationVariables>;
export const AdminCreatePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreatePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}}]}}]}}]} as unknown as DocumentNode<AdminCreatePaymentMutation, AdminCreatePaymentMutationVariables>;
export const AdminUpdatePaymentStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdatePaymentStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}}]}}]}}]} as unknown as DocumentNode<AdminUpdatePaymentStatusMutation, AdminUpdatePaymentStatusMutationVariables>;
export const AdminUpdatePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdatePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlanUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminUpdatePlanMutation, AdminUpdatePlanMutationVariables>;
export const AdminDeletePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeletePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]} as unknown as DocumentNode<AdminDeletePlanMutation, AdminDeletePlanMutationVariables>;
export const AdminCreatePlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreatePlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminCreatePlanMutation, AdminCreatePlanMutationVariables>;
export const AdminCreatePoolInspectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreatePoolInspection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PoolInspectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPoolInspection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]} as unknown as DocumentNode<AdminCreatePoolInspectionMutation, AdminCreatePoolInspectionMutationVariables>;
export const AdminUpdatePoolInspectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdatePoolInspection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PoolInspectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePoolInspection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]} as unknown as DocumentNode<AdminUpdatePoolInspectionMutation, AdminUpdatePoolInspectionMutationVariables>;
export const AdminCreateClassScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateClassSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ClassScheduleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createClassSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}}]}}]}}]} as unknown as DocumentNode<AdminCreateClassScheduleMutation, AdminCreateClassScheduleMutationVariables>;
export const SuggestModulesForBusinessTypeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SuggestModulesForBusinessType"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"businessType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"suggestModulesForBusinessType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"businessType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"businessType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"businessType"}},{"kind":"Field","name":{"kind":"Name","value":"modules"}}]}}]}}]} as unknown as DocumentNode<SuggestModulesForBusinessTypeQuery, SuggestModulesForBusinessTypeQueryVariables>;
export const AssignPlanMenuPlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AssignPlanMenuPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AssignPlanMenuPlansQuery, AssignPlanMenuPlansQueryVariables>;
export const AssignPlanQuickDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignPlanQuick"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnrollmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEnrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AssignPlanQuickMutation, AssignPlanQuickMutationVariables>;
export const AdminStudentForEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminStudentForEdit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"birthdate"}},{"kind":"Field","name":{"kind":"Name","value":"cpf"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"cep"}},{"kind":"Field","name":{"kind":"Name","value":"street"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"complement"}},{"kind":"Field","name":{"kind":"Name","value":"neighborhood"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"enrollments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"plans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminStudentForEditQuery, AdminStudentForEditQueryVariables>;
export const AdminUpdateStudentFromDialogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateStudentFromDialog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateStudentFromDialogMutation, AdminUpdateStudentFromDialogMutationVariables>;
export const AdminCreateEnrollmentFromDialogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateEnrollmentFromDialog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnrollmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEnrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AdminCreateEnrollmentFromDialogMutation, AdminCreateEnrollmentFromDialogMutationVariables>;
export const AdminCreateStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AdminCreateStudentMutation, AdminCreateStudentMutationVariables>;
export const AdminBulkImportStudentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminBulkImportStudents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rows"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentImportRow"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dryRun"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkImportStudents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"rows"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rows"}}},{"kind":"Argument","name":{"kind":"Name","value":"dryRun"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dryRun"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"skipped"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rowNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"studentDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"dependentDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<AdminBulkImportStudentsMutation, AdminBulkImportStudentsMutationVariables>;
export const AdminUpdateStudentStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateStudentStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateStudentStatusMutation, AdminUpdateStudentStatusMutationVariables>;
export const AdminDeleteStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]} as unknown as DocumentNode<AdminDeleteStudentMutation, AdminDeleteStudentMutationVariables>;
export const StudentsForWorkoutEditDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentsForWorkoutEdit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<StudentsForWorkoutEditQuery, StudentsForWorkoutEditQueryVariables>;
export const StudentsForWorkoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentsForWorkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<StudentsForWorkoutQuery, StudentsForWorkoutQueryVariables>;
export const AdminCreateWorkoutPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateWorkoutPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutPlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkoutPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AdminCreateWorkoutPlanMutation, AdminCreateWorkoutPlanMutationVariables>;
export const AdminDuplicateWorkoutPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDuplicateWorkoutPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutPlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkoutPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AdminDuplicateWorkoutPlanMutation, AdminDuplicateWorkoutPlanMutationVariables>;
export const AllAcademiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllAcademies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allAcademies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"studentCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]} as unknown as DocumentNode<AllAcademiesQuery, AllAcademiesQueryVariables>;
export const PlatformDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platformDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalAcademies"}},{"kind":"Field","name":{"kind":"Name","value":"activeAcademies"}},{"kind":"Field","name":{"kind":"Name","value":"totalStudents"}},{"kind":"Field","name":{"kind":"Name","value":"mrr"}},{"kind":"Field","name":{"kind":"Name","value":"openLeads"}},{"kind":"Field","name":{"kind":"Name","value":"leadsThisMonth"}}]}}]}}]} as unknown as DocumentNode<PlatformDashboardQuery, PlatformDashboardQueryVariables>;
export const ConvertLeadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConvertLead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ConvertLeadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"convertLead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"academy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}}]}},{"kind":"Field","name":{"kind":"Name","value":"passwordResetUrl"}},{"kind":"Field","name":{"kind":"Name","value":"adminEmail"}},{"kind":"Field","name":{"kind":"Name","value":"emailSent"}}]}}]}}]} as unknown as DocumentNode<ConvertLeadMutation, ConvertLeadMutationVariables>;
export const PlatformLeadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformLeads"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"leads"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"IntValue","value":"25"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"academyName"}},{"kind":"Field","name":{"kind":"Name","value":"studentCount"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"planInterest"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}}]}}]}}]} as unknown as DocumentNode<PlatformLeadsQuery, PlatformLeadsQueryVariables>;
export const UpdateLeadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateLead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateLeadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateLead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"planInterest"}}]}}]}}]} as unknown as DocumentNode<UpdateLeadMutation, UpdateLeadMutationVariables>;
export const AcademyBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AcademyBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"academyBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}}]}}]} as unknown as DocumentNode<AcademyBySlugQuery, AcademyBySlugQueryVariables>;
export const AcademiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Academies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"academies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AcademiesQuery, AcademiesQueryVariables>;
export const MyAsaasSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAsaasSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myAsaasSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiKeyConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"webhookTokenConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"environment"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"apiKeyHint"}}]}}]}}]} as unknown as DocumentNode<MyAsaasSettingsQuery, MyAsaasSettingsQueryVariables>;
export const UpdateMyAsaasSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMyAsaasSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AsaasSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMyAsaasSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiKeyConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"webhookTokenConfigured"}},{"kind":"Field","name":{"kind":"Name","value":"environment"}},{"kind":"Field","name":{"kind":"Name","value":"webhookUrl"}},{"kind":"Field","name":{"kind":"Name","value":"apiKeyHint"}}]}}]}}]} as unknown as DocumentNode<UpdateMyAsaasSettingsMutation, UpdateMyAsaasSettingsMutationVariables>;
export const SubmitContactFormDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitContactForm"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ContactFormInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitContactForm"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<SubmitContactFormMutation, SubmitContactFormMutationVariables>;
export const StudentByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"birthdate"}},{"kind":"Field","name":{"kind":"Name","value":"cpf"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"cep"}},{"kind":"Field","name":{"kind":"Name","value":"street"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"complement"}},{"kind":"Field","name":{"kind":"Name","value":"neighborhood"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isGuardian"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"photo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"enrollments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"workoutPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]}}]} as unknown as DocumentNode<StudentByIdQuery, StudentByIdQueryVariables>;
export const AdminAvailablePlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminAvailablePlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminAvailablePlansQuery, AdminAvailablePlansQueryVariables>;
export const UpdateStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<UpdateStudentMutation, UpdateStudentMutationVariables>;
export const CreateEnrollmentFromStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEnrollmentFromStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnrollmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEnrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<CreateEnrollmentFromStudentMutation, CreateEnrollmentFromStudentMutationVariables>;
export const CreateStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateStudentMutation, CreateStudentMutationVariables>;
export const BulkImportStudentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BulkImportStudents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"rows"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentImportRow"}}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dryRun"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bulkImportStudents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"rows"},"value":{"kind":"Variable","name":{"kind":"Name","value":"rows"}}},{"kind":"Argument","name":{"kind":"Name","value":"dryRun"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dryRun"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"created"}},{"kind":"Field","name":{"kind":"Name","value":"skipped"}},{"kind":"Field","name":{"kind":"Name","value":"errors"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rowNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"studentDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"dependentDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<BulkImportStudentsMutation, BulkImportStudentsMutationVariables>;
export const AdminDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"highlighted"}},{"kind":"Field","name":{"kind":"Name","value":"delta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"recentStudents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"todayClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"booked"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upcomingPayments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"student"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}}]}}]}}]} as unknown as DocumentNode<AdminDashboardQuery, AdminDashboardQueryVariables>;
export const FinanceOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinanceOverview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"financeOverview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"highlighted"}},{"kind":"Field","name":{"kind":"Name","value":"delta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"charges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"student"}},{"kind":"Field","name":{"kind":"Name","value":"studentInitials"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}}]}}]}}]}}]} as unknown as DocumentNode<FinanceOverviewQuery, FinanceOverviewQueryVariables>;
export const DreOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DREOverview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dreOverview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthLabel"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"deltaLabel"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"fixed"}},{"kind":"Field","name":{"kind":"Name","value":"variable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"profit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"marginPercent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cashFlow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"expenses"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categoryBreakdown"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expensesTotalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"expenseRows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"categoryLabel"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}},{"kind":"Field","name":{"kind":"Name","value":"revenueTotalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"revenueRows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"student"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}}]}}]}}]} as unknown as DocumentNode<DreOverviewQuery, DreOverviewQueryVariables>;
export const ScheduleWeekDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ScheduleWeek"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekStart"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduleWeek"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"weekStart"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekStart"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weekLabel"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalClasses"}},{"kind":"Field","name":{"kind":"Name","value":"totalBookings"}},{"kind":"Field","name":{"kind":"Name","value":"capacityFill"}}]}},{"kind":"Field","name":{"kind":"Name","value":"classes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scheduleDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"modality"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"booked"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upcoming"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}}]}}]}}]}}]} as unknown as DocumentNode<ScheduleWeekQuery, ScheduleWeekQueryVariables>;
export const AdminClassScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminClassSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"classSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"modality"}},{"kind":"Field","name":{"kind":"Name","value":"weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"maxCapacity"}},{"kind":"Field","name":{"kind":"Name","value":"room"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminClassScheduleQuery, AdminClassScheduleQueryVariables>;
export const AdminScheduleConflictsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminScheduleConflicts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduleConflictInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduleConflicts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"days"}},{"kind":"Field","name":{"kind":"Name","value":"schedule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"room"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}}]}}]}}]}}]} as unknown as DocumentNode<AdminScheduleConflictsQuery, AdminScheduleConflictsQueryVariables>;
export const AdminUpdateClassScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateClassSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ClassScheduleUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateClassSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateClassScheduleMutation, AdminUpdateClassScheduleMutationVariables>;
export const ScheduleBookingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ScheduleBookings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduleBookings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"checkedInAt"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"photo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ScheduleBookingsQuery, ScheduleBookingsQueryVariables>;
export const AdminCheckInBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCheckInBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkInBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"checkedInAt"}}]}}]}}]} as unknown as DocumentNode<AdminCheckInBookingMutation, AdminCheckInBookingMutationVariables>;
export const AdminUpdateBookingStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateBookingStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ClassBookingUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateClassBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"checkedInAt"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateBookingStatusMutation, AdminUpdateBookingStatusMutationVariables>;
export const AdminDailyAttendanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminDailyAttendance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dailyAttendance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weekdayLabel"}},{"kind":"Field","name":{"kind":"Name","value":"classes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduleDocumentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"room"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"bookedCount"}},{"kind":"Field","name":{"kind":"Name","value":"attendedCount"}},{"kind":"Field","name":{"kind":"Name","value":"missedCount"}},{"kind":"Field","name":{"kind":"Name","value":"bookings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"checkedInAt"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"photo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<AdminDailyAttendanceQuery, AdminDailyAttendanceQueryVariables>;
export const GuardiansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Guardians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guardians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guardian"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dependents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"className"}},{"kind":"Field","name":{"kind":"Name","value":"classTime"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"medicalAlert"}}]}}]}}]}}]} as unknown as DocumentNode<GuardiansQuery, GuardiansQueryVariables>;
export const AdminWorkoutsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminWorkouts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workoutPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"validFrom"}},{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sets"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"load"}}]}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AdminWorkoutsQuery, AdminWorkoutsQueryVariables>;
export const AdminWorkoutPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminWorkoutPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workoutPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"validFrom"}},{"kind":"Field","name":{"kind":"Name","value":"validTo"}},{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sets"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"load"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AdminWorkoutPlanQuery, AdminWorkoutPlanQueryVariables>;
export const AdminUpdateWorkoutPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateWorkoutPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutPlanUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkoutPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateWorkoutPlanMutation, AdminUpdateWorkoutPlanMutationVariables>;
export const AdminDeleteWorkoutPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteWorkoutPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkoutPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]} as unknown as DocumentNode<AdminDeleteWorkoutPlanMutation, AdminDeleteWorkoutPlanMutationVariables>;
export const StudentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Students"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isGuardian"}},{"kind":"Field","name":{"kind":"Name","value":"enrollments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}}]}}]}}]}}]}}]} as unknown as DocumentNode<StudentsQuery, StudentsQueryVariables>;
export const MyAcademyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAcademy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"photo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"academy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"businessType"}},{"kind":"Field","name":{"kind":"Name","value":"enabledModules"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"logoSquare"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyAcademyQuery, MyAcademyQueryVariables>;
export const AcademyBySlugForLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AcademyBySlugForLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"academyBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"logoSquare"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}}]}}]} as unknown as DocumentNode<AcademyBySlugForLoginQuery, AcademyBySlugForLoginQueryVariables>;
export const AdminUpdateAcademyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateAcademy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AcademyUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAcademy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"logoSquare"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}}]}}]} as unknown as DocumentNode<AdminUpdateAcademyMutation, AdminUpdateAcademyMutationVariables>;
export const PlatformPlansPublicDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformPlansPublic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platformPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"tagline"}},{"kind":"Field","name":{"kind":"Name","value":"tag"}},{"kind":"Field","name":{"kind":"Name","value":"priceMonthly"}},{"kind":"Field","name":{"kind":"Name","value":"priceAnnual"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"features"}},{"kind":"Field","name":{"kind":"Name","value":"ctaLabel"}},{"kind":"Field","name":{"kind":"Name","value":"featured"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<PlatformPlansPublicQuery, PlatformPlansPublicQueryVariables>;
export const AdminPlansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"maxStudents"}},{"kind":"Field","name":{"kind":"Name","value":"features"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AdminPlansQuery, AdminPlansQueryVariables>;
export const MySubscriptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MySubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mySubscription"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"recurrency"}},{"kind":"Field","name":{"kind":"Name","value":"trialEndsAt"}},{"kind":"Field","name":{"kind":"Name","value":"trialDaysLeft"}},{"kind":"Field","name":{"kind":"Name","value":"currentPeriodEnd"}},{"kind":"Field","name":{"kind":"Name","value":"platformPlan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<MySubscriptionQuery, MySubscriptionQueryVariables>;
export const MyPoolSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyPoolSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myPoolSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"phMin"}},{"kind":"Field","name":{"kind":"Name","value":"phMax"}},{"kind":"Field","name":{"kind":"Name","value":"chlorineMin"}},{"kind":"Field","name":{"kind":"Name","value":"chlorineMax"}},{"kind":"Field","name":{"kind":"Name","value":"temperatureMin"}},{"kind":"Field","name":{"kind":"Name","value":"temperatureMax"}},{"kind":"Field","name":{"kind":"Name","value":"alertTolerance"}},{"kind":"Field","name":{"kind":"Name","value":"inspectionTimes"}}]}}]}}]} as unknown as DocumentNode<MyPoolSettingsQuery, MyPoolSettingsQueryVariables>;
export const PoolInspectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PoolInspections"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"poolInspections"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"shift"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledTime"}},{"kind":"Field","name":{"kind":"Name","value":"chlorine"}},{"kind":"Field","name":{"kind":"Name","value":"ph"}},{"kind":"Field","name":{"kind":"Name","value":"temperature"}},{"kind":"Field","name":{"kind":"Name","value":"peopleCount"}},{"kind":"Field","name":{"kind":"Name","value":"peopleCountSource"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<PoolInspectionsQuery, PoolInspectionsQueryVariables>;
export const MintUploadUrlDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MintUploadUrl"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filename"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contentType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mintUploadUrl"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filename"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filename"}}},{"kind":"Argument","name":{"kind":"Name","value":"contentType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contentType"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uploadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"publicUrl"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]}}]} as unknown as DocumentNode<MintUploadUrlMutation, MintUploadUrlMutationVariables>;
export const ConfirmUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"mime"}}]}}]}}]} as unknown as DocumentNode<ConfirmUploadMutation, ConfirmUploadMutationVariables>;