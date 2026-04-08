/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query AcademyBySlug($slug: String!) {\n  academyBySlug(slug: $slug) {\n    documentId\n    name\n    slug\n    primaryColor\n    secondaryColor\n    logo {\n      url\n      alternativeText\n    }\n  }\n}\n\nquery MyDashboard {\n  me {\n    documentId\n    name\n    email\n    phone\n    status\n    photo {\n      url\n    }\n    academy {\n      documentId\n      name\n      slug\n      primaryColor\n      secondaryColor\n      logo {\n        url\n      }\n    }\n    enrollments {\n      documentId\n      status\n      startDate\n      endDate\n      paymentMethod\n      plan {\n        documentId\n        name\n        price\n        billingCycle\n      }\n    }\n    workoutPlans {\n      documentId\n      name\n      instructor\n      isActive\n      validFrom\n      exercises {\n        name\n        sets\n        reps\n        load\n        notes\n      }\n    }\n  }\n}\n\nmutation CheckInBooking($documentId: ID!) {\n  checkInBooking(documentId: $documentId) {\n    documentId\n    status\n    checkedInAt\n  }\n}": typeof types.AcademyBySlugDocument,
};
const documents: Documents = {
    "query AcademyBySlug($slug: String!) {\n  academyBySlug(slug: $slug) {\n    documentId\n    name\n    slug\n    primaryColor\n    secondaryColor\n    logo {\n      url\n      alternativeText\n    }\n  }\n}\n\nquery MyDashboard {\n  me {\n    documentId\n    name\n    email\n    phone\n    status\n    photo {\n      url\n    }\n    academy {\n      documentId\n      name\n      slug\n      primaryColor\n      secondaryColor\n      logo {\n        url\n      }\n    }\n    enrollments {\n      documentId\n      status\n      startDate\n      endDate\n      paymentMethod\n      plan {\n        documentId\n        name\n        price\n        billingCycle\n      }\n    }\n    workoutPlans {\n      documentId\n      name\n      instructor\n      isActive\n      validFrom\n      exercises {\n        name\n        sets\n        reps\n        load\n        notes\n      }\n    }\n  }\n}\n\nmutation CheckInBooking($documentId: ID!) {\n  checkInBooking(documentId: $documentId) {\n    documentId\n    status\n    checkedInAt\n  }\n}": types.AcademyBySlugDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query AcademyBySlug($slug: String!) {\n  academyBySlug(slug: $slug) {\n    documentId\n    name\n    slug\n    primaryColor\n    secondaryColor\n    logo {\n      url\n      alternativeText\n    }\n  }\n}\n\nquery MyDashboard {\n  me {\n    documentId\n    name\n    email\n    phone\n    status\n    photo {\n      url\n    }\n    academy {\n      documentId\n      name\n      slug\n      primaryColor\n      secondaryColor\n      logo {\n        url\n      }\n    }\n    enrollments {\n      documentId\n      status\n      startDate\n      endDate\n      paymentMethod\n      plan {\n        documentId\n        name\n        price\n        billingCycle\n      }\n    }\n    workoutPlans {\n      documentId\n      name\n      instructor\n      isActive\n      validFrom\n      exercises {\n        name\n        sets\n        reps\n        load\n        notes\n      }\n    }\n  }\n}\n\nmutation CheckInBooking($documentId: ID!) {\n  checkInBooking(documentId: $documentId) {\n    documentId\n    status\n    checkedInAt\n  }\n}"): (typeof documents)["query AcademyBySlug($slug: String!) {\n  academyBySlug(slug: $slug) {\n    documentId\n    name\n    slug\n    primaryColor\n    secondaryColor\n    logo {\n      url\n      alternativeText\n    }\n  }\n}\n\nquery MyDashboard {\n  me {\n    documentId\n    name\n    email\n    phone\n    status\n    photo {\n      url\n    }\n    academy {\n      documentId\n      name\n      slug\n      primaryColor\n      secondaryColor\n      logo {\n        url\n      }\n    }\n    enrollments {\n      documentId\n      status\n      startDate\n      endDate\n      paymentMethod\n      plan {\n        documentId\n        name\n        price\n        billingCycle\n      }\n    }\n    workoutPlans {\n      documentId\n      name\n      instructor\n      isActive\n      validFrom\n      exercises {\n        name\n        sets\n        reps\n        load\n        notes\n      }\n    }\n  }\n}\n\nmutation CheckInBooking($documentId: ID!) {\n  checkInBooking(documentId: $documentId) {\n    documentId\n    status\n    checkedInAt\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;