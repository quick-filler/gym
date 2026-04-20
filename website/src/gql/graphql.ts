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
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  plan?: Maybe<Scalars['String']['output']>;
  primaryColor?: Maybe<Scalars['String']['output']>;
  secondaryColor?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
};

export type AcademyInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  billingMode?: InputMaybe<Scalars['String']['input']>;
  businessType?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  enabledModules?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  plan?: InputMaybe<Scalars['String']['input']>;
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  secondaryColor?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type AcademyUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  billingMode?: InputMaybe<Scalars['String']['input']>;
  businessType?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  enabledModules?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  plan?: InputMaybe<Scalars['String']['input']>;
  primaryColor?: InputMaybe<Scalars['String']['input']>;
  secondaryColor?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type AdminDashboard = {
  __typename?: 'AdminDashboard';
  metrics: Array<MetricCard>;
  recentStudents: Array<DashboardStudentRow>;
  todayClasses: Array<DashboardClassRow>;
  upcomingPayments: Array<DashboardPaymentRow>;
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
  height?: InputMaybe<Scalars['Float']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<MeasurementsInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  student: Scalars['ID']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type BodyAssessmentUpdateInput = {
  bodyFat?: InputMaybe<Scalars['Float']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  measurements?: InputMaybe<MeasurementsInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  student?: InputMaybe<Scalars['ID']['input']>;
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
  status?: InputMaybe<Scalars['String']['input']>;
  student: Scalars['ID']['input'];
};

export type ClassBookingUpdateInput = {
  checkedInAt?: InputMaybe<Scalars['String']['input']>;
  classSchedule?: InputMaybe<Scalars['ID']['input']>;
  date?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  student?: InputMaybe<Scalars['ID']['input']>;
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
  academy?: InputMaybe<Scalars['ID']['input']>;
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
  academy?: InputMaybe<Scalars['ID']['input']>;
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
  allergies?: Maybe<Scalars['String']['output']>;
  birthdate: Scalars['String']['output'];
  bloodType?: Maybe<Scalars['String']['output']>;
  bookings?: Maybe<Array<Maybe<ClassBooking>>>;
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
  academy?: InputMaybe<Scalars['ID']['input']>;
  allergies?: InputMaybe<Scalars['String']['input']>;
  birthdate: Scalars['String']['input'];
  bloodType?: InputMaybe<Scalars['String']['input']>;
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
  allergies?: InputMaybe<Scalars['String']['input']>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  bloodType?: InputMaybe<Scalars['String']['input']>;
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
  endDate?: InputMaybe<Scalars['String']['input']>;
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  plan: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  student: Scalars['ID']['input'];
};

export type EnrollmentUpdateInput = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  paymentMethod?: InputMaybe<Scalars['String']['input']>;
  plan?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  student?: InputMaybe<Scalars['ID']['input']>;
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
  academy?: InputMaybe<Scalars['ID']['input']>;
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

export type Mutation = {
  __typename?: 'Mutation';
  /** Mark a booking as attended and stamp checkedInAt. */
  checkInBooking?: Maybe<ClassBooking>;
  createAcademy?: Maybe<Academy>;
  createBodyAssessment?: Maybe<BodyAssessment>;
  createClassBooking?: Maybe<ClassBooking>;
  createClassSchedule?: Maybe<ClassSchedule>;
  createDependent?: Maybe<Dependent>;
  createEnrollment?: Maybe<Enrollment>;
  createExpense?: Maybe<Expense>;
  createPayment?: Maybe<Payment>;
  createPlan?: Maybe<Plan>;
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
  deleteStudent?: Maybe<Student>;
  deleteWorkoutPlan?: Maybe<WorkoutPlan>;
  updateAcademy?: Maybe<Academy>;
  updateBodyAssessment?: Maybe<BodyAssessment>;
  updateClassBooking?: Maybe<ClassBooking>;
  updateClassSchedule?: Maybe<ClassSchedule>;
  updateDependent?: Maybe<Dependent>;
  updateEnrollment?: Maybe<Enrollment>;
  updateExpense?: Maybe<Expense>;
  updatePayment?: Maybe<Payment>;
  updatePlan?: Maybe<Plan>;
  updateStudent?: Maybe<Student>;
  updateWorkoutPlan?: Maybe<WorkoutPlan>;
};


export type MutationCheckInBookingArgs = {
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


export type MutationCreateStudentArgs = {
  data: StudentInput;
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


export type MutationDeleteStudentArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteWorkoutPlanArgs = {
  documentId: Scalars['ID']['input'];
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


export type MutationUpdatePaymentArgs = {
  data: PaymentUpdateInput;
  documentId: Scalars['ID']['input'];
};


export type MutationUpdatePlanArgs = {
  data: PlanUpdateInput;
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
  documentId: Scalars['ID']['output'];
  dueDate: Scalars['String']['output'];
  enrollment?: Maybe<Enrollment>;
  externalId?: Maybe<Scalars['String']['output']>;
  method?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['String']['output']>;
  receiptUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type PaymentInput = {
  amount: Scalars['Float']['input'];
  dueDate: Scalars['String']['input'];
  enrollment: Scalars['ID']['input'];
  method?: InputMaybe<Scalars['String']['input']>;
  paidAt?: InputMaybe<Scalars['String']['input']>;
  receiptUrl?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
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
  academy?: InputMaybe<Scalars['ID']['input']>;
  billingCycle: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxStudents?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
};

export type PlanUpdateInput = {
  academy?: InputMaybe<Scalars['ID']['input']>;
  billingCycle?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  features?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxStudents?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
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
  bodyAssessment?: Maybe<BodyAssessment>;
  bodyAssessments?: Maybe<Array<Maybe<BodyAssessment>>>;
  classBooking?: Maybe<ClassBooking>;
  classBookings?: Maybe<Array<Maybe<ClassBooking>>>;
  classSchedule?: Maybe<ClassSchedule>;
  classSchedules?: Maybe<Array<Maybe<ClassSchedule>>>;
  dependent?: Maybe<Dependent>;
  dependents?: Maybe<Array<Maybe<Dependent>>>;
  dreOverview?: Maybe<DreOverview>;
  enrollment?: Maybe<Enrollment>;
  enrollments?: Maybe<Array<Maybe<Enrollment>>>;
  expense?: Maybe<Expense>;
  expenses?: Maybe<Array<Maybe<Expense>>>;
  financeOverview?: Maybe<FinanceOverview>;
  guardians?: Maybe<Array<GuardianFamily>>;
  /** Returns the authenticated user's linked Student profile. */
  me?: Maybe<Student>;
  myDependents?: Maybe<Array<Maybe<Dependent>>>;
  payment?: Maybe<Payment>;
  payments?: Maybe<Array<Maybe<Payment>>>;
  plan?: Maybe<Plan>;
  plans?: Maybe<Array<Maybe<Plan>>>;
  /** Bookings for a given class schedule, optionally filtered by date. */
  scheduleBookings?: Maybe<Array<Maybe<ClassBooking>>>;
  scheduleWeek?: Maybe<ScheduleWeek>;
  student?: Maybe<Student>;
  students?: Maybe<Array<Maybe<Student>>>;
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


export type QueryScheduleBookingsArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['ID']['input'];
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
  name: Scalars['String']['output'];
  startTime: Scalars['String']['output'];
  weekday: Scalars['Int']['output'];
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
  birthdate?: Maybe<Scalars['String']['output']>;
  dependents?: Maybe<Array<Maybe<Dependent>>>;
  documentId: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  enrollments?: Maybe<Array<Maybe<Enrollment>>>;
  isGuardian?: Maybe<Scalars['Boolean']['output']>;
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  photo?: Maybe<Media>;
  role: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  workoutPlans?: Maybe<Array<Maybe<WorkoutPlan>>>;
};

export type StudentInput = {
  academy?: InputMaybe<Scalars['ID']['input']>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
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
  academy?: InputMaybe<Scalars['ID']['input']>;
  birthdate?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
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
  exercises?: InputMaybe<Array<InputMaybe<ExerciseInput>>>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  student: Scalars['ID']['input'];
  validFrom?: InputMaybe<Scalars['String']['input']>;
  validTo?: InputMaybe<Scalars['String']['input']>;
};

export type WorkoutPlanUpdateInput = {
  exercises?: InputMaybe<Array<InputMaybe<ExerciseInput>>>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  student?: InputMaybe<Scalars['ID']['input']>;
  validFrom?: InputMaybe<Scalars['String']['input']>;
  validTo?: InputMaybe<Scalars['String']['input']>;
};

export type AdminCreateDependentMutationVariables = Exact<{
  data: DependentInput;
}>;


export type AdminCreateDependentMutation = { __typename?: 'Mutation', createDependent?: { __typename?: 'Dependent', documentId: string, name: string, birthdate: string } | null };

export type AdminCreateGuardianStudentMutationVariables = Exact<{
  data: StudentInput;
}>;


export type AdminCreateGuardianStudentMutation = { __typename?: 'Mutation', createStudent?: { __typename?: 'Student', documentId: string, name: string, email: string, isGuardian?: boolean | null } | null };

export type AdminCreateExpenseMutationVariables = Exact<{
  data: ExpenseInput;
}>;


export type AdminCreateExpenseMutation = { __typename?: 'Mutation', createExpense?: { __typename?: 'Expense', documentId: string, description: string, amount: number, status: string } | null };

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

export type AdminCreateClassScheduleMutationVariables = Exact<{
  data: ClassScheduleInput;
}>;


export type AdminCreateClassScheduleMutation = { __typename?: 'Mutation', createClassSchedule?: { __typename?: 'ClassSchedule', documentId: string, name: string, instructor?: string | null } | null };

export type AdminCreateStudentMutationVariables = Exact<{
  data: StudentInput;
}>;


export type AdminCreateStudentMutation = { __typename?: 'Mutation', createStudent?: { __typename?: 'Student', documentId: string, name: string, email: string, status?: string | null } | null };

export type AdminUpdateStudentStatusMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
  data: StudentUpdateInput;
}>;


export type AdminUpdateStudentStatusMutation = { __typename?: 'Mutation', updateStudent?: { __typename?: 'Student', documentId: string, status?: string | null } | null };

export type AdminDeleteStudentMutationVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type AdminDeleteStudentMutation = { __typename?: 'Mutation', deleteStudent?: { __typename?: 'Student', documentId: string } | null };

export type StudentsForWorkoutQueryVariables = Exact<{ [key: string]: never; }>;


export type StudentsForWorkoutQuery = { __typename?: 'Query', students?: Array<{ __typename?: 'Student', documentId: string, name: string } | null> | null };

export type AdminCreateWorkoutPlanMutationVariables = Exact<{
  data: WorkoutPlanInput;
}>;


export type AdminCreateWorkoutPlanMutation = { __typename?: 'Mutation', createWorkoutPlan?: { __typename?: 'WorkoutPlan', documentId: string, name: string } | null };

export type AcademyBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type AcademyBySlugQuery = { __typename?: 'Query', academyBySlug?: { __typename?: 'Academy', documentId: string, name: string, slug: string, primaryColor?: string | null, secondaryColor?: string | null, plan?: string | null, isActive?: boolean | null, logo?: { __typename?: 'Media', url?: string | null, alternativeText?: string | null } | null } | null };

export type AcademiesQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type AcademiesQuery = { __typename?: 'Query', academies?: Array<{ __typename?: 'Academy', documentId: string, name: string, slug: string, plan?: string | null, isActive?: boolean | null } | null> | null };

export type StudentByIdQueryVariables = Exact<{
  documentId: Scalars['ID']['input'];
}>;


export type StudentByIdQuery = { __typename?: 'Query', student?: { __typename?: 'Student', documentId: string, name: string, email: string, phone?: string | null, birthdate?: string | null, status?: string | null, notes?: string | null, photo?: { __typename?: 'Media', url?: string | null } | null, enrollments?: Array<{ __typename?: 'Enrollment', documentId: string, status: string, startDate: string, endDate?: string | null, paymentMethod?: string | null, plan?: { __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string } | null } | null> | null, workoutPlans?: Array<{ __typename?: 'WorkoutPlan', documentId: string, name: string, instructor?: string | null, isActive?: boolean | null } | null> | null } | null };

export type CreateStudentMutationVariables = Exact<{
  data: StudentInput;
}>;


export type CreateStudentMutation = { __typename?: 'Mutation', createStudent?: { __typename?: 'Student', documentId: string, name: string, email: string, status?: string | null } | null };

export type AdminDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminDashboardQuery = { __typename?: 'Query', adminDashboard?: { __typename?: 'AdminDashboard', metrics: Array<{ __typename?: 'MetricCard', id: string, label: string, value: string, highlighted?: boolean | null, delta?: { __typename?: 'MetricDelta', value: string, trend: string } | null }>, recentStudents: Array<{ __typename?: 'DashboardStudentRow', id: string, name: string, email: string, plan: string, status: string, initials: string, joinedAt?: string | null }>, todayClasses: Array<{ __typename?: 'DashboardClassRow', id: string, name: string, instructor?: string | null, time: string, booked: number, capacity: number }>, upcomingPayments: Array<{ __typename?: 'DashboardPaymentRow', id: string, student: string, amount: string, dueDate: string, method: string }> } | null };

export type FinanceOverviewQueryVariables = Exact<{
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type FinanceOverviewQuery = { __typename?: 'Query', financeOverview?: { __typename?: 'FinanceOverview', kpis: Array<{ __typename?: 'MetricCard', id: string, label: string, value: string, highlighted?: boolean | null, delta?: { __typename?: 'MetricDelta', value: string, trend: string } | null }>, charges: Array<{ __typename?: 'FinanceCharge', id: string, student: string, studentInitials: string, amount: number, amountFormatted: string, method: string, status: string, dueDate: string, paidAt?: string | null }>, methodBreakdown: Array<{ __typename?: 'FinanceMethodRow', method: string, label: string, amount: string, percent: number }> } | null };

export type DreOverviewQueryVariables = Exact<{
  month?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type DreOverviewQuery = { __typename?: 'Query', dreOverview?: { __typename?: 'DREOverview', monthLabel: string, expensesTotalLabel: string, revenue: { __typename?: 'DREHeroRevenue', total: string, deltaLabel: string, trend: string }, expenses: { __typename?: 'DREHeroExpenses', total: string, fixed: string, variable: string }, profit: { __typename?: 'DREHeroProfit', total: string, marginPercent: number }, cashFlow: Array<{ __typename?: 'DRECashFlowPoint', label: string, revenue: number, expenses: number, profit: number }>, categoryBreakdown: Array<{ __typename?: 'DRECategoryBreakdown', category: string, label: string, amount: string, percent: number }>, expenseRows: Array<{ __typename?: 'DREExpenseRow', id: string, description: string, subtitle?: string | null, category: string, categoryLabel: string, type: string, dueDate: string, amount: string, status: string }> } | null };

export type ScheduleWeekQueryVariables = Exact<{
  weekStart?: InputMaybe<Scalars['String']['input']>;
}>;


export type ScheduleWeekQuery = { __typename?: 'Query', scheduleWeek?: { __typename?: 'ScheduleWeek', weekLabel: string, weekNumber: number, stats: { __typename?: 'ScheduleStats', totalClasses: number, totalBookings: number, capacityFill: number }, classes: Array<{ __typename?: 'ScheduleClass', id: string, name: string, instructor?: string | null, weekday: number, startTime: string, endTime: string, booked: number, capacity: number, color: string }>, upcoming: Array<{ __typename?: 'ScheduleUpcoming', id: string, name: string, time: string, instructor?: string | null }> } | null };

export type GuardiansQueryVariables = Exact<{ [key: string]: never; }>;


export type GuardiansQuery = { __typename?: 'Query', guardians?: Array<{ __typename?: 'GuardianFamily', guardian: { __typename?: 'GuardianFamilyGuardian', id: string, name: string, initials: string, email: string, phone?: string | null }, dependents: Array<{ __typename?: 'GuardianFamilyDependent', id: string, name: string, age: number, className?: string | null, classTime?: string | null, status: string, gender?: string | null, medicalAlert?: string | null }> }> | null };

export type AdminWorkoutsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminWorkoutsQuery = { __typename?: 'Query', workoutPlans?: Array<{ __typename?: 'WorkoutPlan', documentId: string, name: string, instructor?: string | null, isActive?: boolean | null, validFrom?: string | null, exercises?: Array<{ __typename?: 'Exercise', name: string, sets?: number | null, reps?: number | null, load?: string | null } | null> | null, student?: { __typename?: 'Student', documentId: string, name: string } | null } | null> | null };

export type StudentsQueryVariables = Exact<{
  pagination?: InputMaybe<PaginationInput>;
}>;


export type StudentsQuery = { __typename?: 'Query', students?: Array<{ __typename?: 'Student', documentId: string, name: string, email: string, phone?: string | null, status?: string | null, isGuardian?: boolean | null, enrollments?: Array<{ __typename?: 'Enrollment', documentId: string, startDate: string, endDate?: string | null, paymentMethod?: string | null, status: string, plan?: { __typename?: 'Plan', documentId: string, name: string, price: number, billingCycle: string } | null } | null> | null } | null> | null };

export type MyAcademyQueryVariables = Exact<{ [key: string]: never; }>;


export type MyAcademyQuery = { __typename?: 'Query', me?: { __typename?: 'Student', documentId: string, academy?: { __typename?: 'Academy', documentId: string, name: string, slug: string, primaryColor?: string | null, secondaryColor?: string | null, plan?: string | null, email?: string | null, phone?: string | null, address?: string | null, logo?: { __typename?: 'Media', url?: string | null, alternativeText?: string | null } | null } | null } | null };

export type PricingPlansPublicQueryVariables = Exact<{ [key: string]: never; }>;


export type PricingPlansPublicQuery = { __typename?: 'Query', plans?: Array<{ __typename?: 'Plan', documentId: string, name: string, description?: string | null, price: number, billingCycle: string, maxStudents?: number | null, features?: Array<string | null> | null, isActive?: boolean | null } | null> | null };


export const AdminCreateDependentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateDependent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DependentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDependent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"birthdate"}}]}}]}}]} as unknown as DocumentNode<AdminCreateDependentMutation, AdminCreateDependentMutationVariables>;
export const AdminCreateGuardianStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateGuardianStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"isGuardian"}}]}}]}}]} as unknown as DocumentNode<AdminCreateGuardianStudentMutation, AdminCreateGuardianStudentMutationVariables>;
export const AdminCreateExpenseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateExpense"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExpenseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createExpense"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AdminCreateExpenseMutation, AdminCreateExpenseMutationVariables>;
export const FetchForChargeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FetchForCharge"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"500"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"enrollments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"plans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<FetchForChargeQuery, FetchForChargeQueryVariables>;
export const AdminCreateEnrollmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateEnrollment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"EnrollmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEnrollment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]}}]} as unknown as DocumentNode<AdminCreateEnrollmentMutation, AdminCreateEnrollmentMutationVariables>;
export const AdminCreatePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreatePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}}]}}]}}]} as unknown as DocumentNode<AdminCreatePaymentMutation, AdminCreatePaymentMutationVariables>;
export const AdminCreateClassScheduleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateClassSchedule"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ClassScheduleInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createClassSchedule"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}}]}}]}}]} as unknown as DocumentNode<AdminCreateClassScheduleMutation, AdminCreateClassScheduleMutationVariables>;
export const AdminCreateStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AdminCreateStudentMutation, AdminCreateStudentMutationVariables>;
export const AdminUpdateStudentStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminUpdateStudentStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<AdminUpdateStudentStatusMutation, AdminUpdateStudentStatusMutationVariables>;
export const AdminDeleteStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminDeleteStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}}]}}]}}]} as unknown as DocumentNode<AdminDeleteStudentMutation, AdminDeleteStudentMutationVariables>;
export const StudentsForWorkoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentsForWorkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<StudentsForWorkoutQuery, StudentsForWorkoutQueryVariables>;
export const AdminCreateWorkoutPlanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdminCreateWorkoutPlan"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkoutPlanInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkoutPlan"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<AdminCreateWorkoutPlanMutation, AdminCreateWorkoutPlanMutationVariables>;
export const AcademyBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AcademyBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"academyBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}}]}}]} as unknown as DocumentNode<AcademyBySlugQuery, AcademyBySlugQueryVariables>;
export const AcademiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Academies"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"academies"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<AcademiesQuery, AcademiesQueryVariables>;
export const StudentByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"student"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"documentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"birthdate"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"photo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}},{"kind":"Field","name":{"kind":"Name","value":"enrollments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"workoutPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]}}]} as unknown as DocumentNode<StudentByIdQuery, StudentByIdQueryVariables>;
export const CreateStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateStudentMutation, CreateStudentMutationVariables>;
export const AdminDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"highlighted"}},{"kind":"Field","name":{"kind":"Name","value":"delta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"recentStudents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"todayClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"booked"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upcomingPayments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"student"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"method"}}]}}]}}]}}]} as unknown as DocumentNode<AdminDashboardQuery, AdminDashboardQueryVariables>;
export const FinanceOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FinanceOverview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"financeOverview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"highlighted"}},{"kind":"Field","name":{"kind":"Name","value":"delta"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"charges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"student"}},{"kind":"Field","name":{"kind":"Name","value":"studentInitials"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"amountFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methodBreakdown"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"method"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}}]}}]}}]} as unknown as DocumentNode<FinanceOverviewQuery, FinanceOverviewQueryVariables>;
export const DreOverviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DREOverview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"month"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dreOverview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"month"},"value":{"kind":"Variable","name":{"kind":"Name","value":"month"}}},{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"monthLabel"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"deltaLabel"}},{"kind":"Field","name":{"kind":"Name","value":"trend"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"fixed"}},{"kind":"Field","name":{"kind":"Name","value":"variable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"profit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"marginPercent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"cashFlow"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"revenue"}},{"kind":"Field","name":{"kind":"Name","value":"expenses"}},{"kind":"Field","name":{"kind":"Name","value":"profit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categoryBreakdown"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expensesTotalLabel"}},{"kind":"Field","name":{"kind":"Name","value":"expenseRows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"categoryLabel"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<DreOverviewQuery, DreOverviewQueryVariables>;
export const ScheduleWeekDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ScheduleWeek"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekStart"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"scheduleWeek"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"weekStart"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekStart"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weekLabel"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"stats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalClasses"}},{"kind":"Field","name":{"kind":"Name","value":"totalBookings"}},{"kind":"Field","name":{"kind":"Name","value":"capacityFill"}}]}},{"kind":"Field","name":{"kind":"Name","value":"classes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"booked"}},{"kind":"Field","name":{"kind":"Name","value":"capacity"}},{"kind":"Field","name":{"kind":"Name","value":"color"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upcoming"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}}]}}]}}]}}]} as unknown as DocumentNode<ScheduleWeekQuery, ScheduleWeekQueryVariables>;
export const GuardiansDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Guardians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guardians"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guardian"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dependents"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"age"}},{"kind":"Field","name":{"kind":"Name","value":"className"}},{"kind":"Field","name":{"kind":"Name","value":"classTime"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"medicalAlert"}}]}}]}}]}}]} as unknown as DocumentNode<GuardiansQuery, GuardiansQueryVariables>;
export const AdminWorkoutsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminWorkouts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workoutPlans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"validFrom"}},{"kind":"Field","name":{"kind":"Name","value":"exercises"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sets"}},{"kind":"Field","name":{"kind":"Name","value":"reps"}},{"kind":"Field","name":{"kind":"Name","value":"load"}}]}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<AdminWorkoutsQuery, AdminWorkoutsQueryVariables>;
export const StudentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Students"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PaginationInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pagination"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"isGuardian"}},{"kind":"Field","name":{"kind":"Name","value":"enrollments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"plan"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}}]}}]}}]}}]}}]} as unknown as DocumentNode<StudentsQuery, StudentsQueryVariables>;
export const MyAcademyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyAcademy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"academy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"primaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"plan"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"logo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"alternativeText"}}]}}]}}]}}]}}]} as unknown as DocumentNode<MyAcademyQuery, MyAcademyQueryVariables>;
export const PricingPlansPublicDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PricingPlansPublic"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"plans"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"billingCycle"}},{"kind":"Field","name":{"kind":"Name","value":"maxStudents"}},{"kind":"Field","name":{"kind":"Name","value":"features"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}}]}}]}}]} as unknown as DocumentNode<PricingPlansPublicQuery, PricingPlansPublicQueryVariables>;