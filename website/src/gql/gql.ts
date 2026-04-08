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
    "query AcademyBySlug($slug: String!) {\n  academyBySlug(slug: $slug) {\n    documentId\n    name\n    slug\n    primaryColor\n    secondaryColor\n    plan\n    isActive\n    logo {\n      url\n      alternativeText\n    }\n  }\n}\n\nquery Academies($pagination: PaginationInput) {\n  academies(pagination: $pagination) {\n    documentId\n    name\n    slug\n    plan\n    isActive\n  }\n}": typeof types.AcademyBySlugDocument,
    "query Students($pagination: PaginationInput) {\n  students(pagination: $pagination) {\n    documentId\n    name\n    email\n    phone\n    status\n    photo {\n      url\n    }\n  }\n}\n\nquery StudentById($documentId: ID!) {\n  student(documentId: $documentId) {\n    documentId\n    name\n    email\n    phone\n    birthdate\n    status\n    notes\n    photo {\n      url\n    }\n    enrollments {\n      documentId\n      status\n      startDate\n      endDate\n      paymentMethod\n      plan {\n        documentId\n        name\n        price\n        billingCycle\n      }\n    }\n    workoutPlans {\n      documentId\n      name\n      instructor\n      isActive\n    }\n  }\n}\n\nmutation CreateStudent($data: StudentInput!) {\n  createStudent(data: $data) {\n    documentId\n    name\n    email\n    status\n  }\n}": typeof types.StudentsDocument,
};
const documents: Documents = {
    "query AcademyBySlug($slug: String!) {\n  academyBySlug(slug: $slug) {\n    documentId\n    name\n    slug\n    primaryColor\n    secondaryColor\n    plan\n    isActive\n    logo {\n      url\n      alternativeText\n    }\n  }\n}\n\nquery Academies($pagination: PaginationInput) {\n  academies(pagination: $pagination) {\n    documentId\n    name\n    slug\n    plan\n    isActive\n  }\n}": types.AcademyBySlugDocument,
    "query Students($pagination: PaginationInput) {\n  students(pagination: $pagination) {\n    documentId\n    name\n    email\n    phone\n    status\n    photo {\n      url\n    }\n  }\n}\n\nquery StudentById($documentId: ID!) {\n  student(documentId: $documentId) {\n    documentId\n    name\n    email\n    phone\n    birthdate\n    status\n    notes\n    photo {\n      url\n    }\n    enrollments {\n      documentId\n      status\n      startDate\n      endDate\n      paymentMethod\n      plan {\n        documentId\n        name\n        price\n        billingCycle\n      }\n    }\n    workoutPlans {\n      documentId\n      name\n      instructor\n      isActive\n    }\n  }\n}\n\nmutation CreateStudent($data: StudentInput!) {\n  createStudent(data: $data) {\n    documentId\n    name\n    email\n    status\n  }\n}": types.StudentsDocument,
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
export function graphql(source: "query AcademyBySlug($slug: String!) {\n  academyBySlug(slug: $slug) {\n    documentId\n    name\n    slug\n    primaryColor\n    secondaryColor\n    plan\n    isActive\n    logo {\n      url\n      alternativeText\n    }\n  }\n}\n\nquery Academies($pagination: PaginationInput) {\n  academies(pagination: $pagination) {\n    documentId\n    name\n    slug\n    plan\n    isActive\n  }\n}"): (typeof documents)["query AcademyBySlug($slug: String!) {\n  academyBySlug(slug: $slug) {\n    documentId\n    name\n    slug\n    primaryColor\n    secondaryColor\n    plan\n    isActive\n    logo {\n      url\n      alternativeText\n    }\n  }\n}\n\nquery Academies($pagination: PaginationInput) {\n  academies(pagination: $pagination) {\n    documentId\n    name\n    slug\n    plan\n    isActive\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Students($pagination: PaginationInput) {\n  students(pagination: $pagination) {\n    documentId\n    name\n    email\n    phone\n    status\n    photo {\n      url\n    }\n  }\n}\n\nquery StudentById($documentId: ID!) {\n  student(documentId: $documentId) {\n    documentId\n    name\n    email\n    phone\n    birthdate\n    status\n    notes\n    photo {\n      url\n    }\n    enrollments {\n      documentId\n      status\n      startDate\n      endDate\n      paymentMethod\n      plan {\n        documentId\n        name\n        price\n        billingCycle\n      }\n    }\n    workoutPlans {\n      documentId\n      name\n      instructor\n      isActive\n    }\n  }\n}\n\nmutation CreateStudent($data: StudentInput!) {\n  createStudent(data: $data) {\n    documentId\n    name\n    email\n    status\n  }\n}"): (typeof documents)["query Students($pagination: PaginationInput) {\n  students(pagination: $pagination) {\n    documentId\n    name\n    email\n    phone\n    status\n    photo {\n      url\n    }\n  }\n}\n\nquery StudentById($documentId: ID!) {\n  student(documentId: $documentId) {\n    documentId\n    name\n    email\n    phone\n    birthdate\n    status\n    notes\n    photo {\n      url\n    }\n    enrollments {\n      documentId\n      status\n      startDate\n      endDate\n      paymentMethod\n      plan {\n        documentId\n        name\n        price\n        billingCycle\n      }\n    }\n    workoutPlans {\n      documentId\n      name\n      instructor\n      isActive\n    }\n  }\n}\n\nmutation CreateStudent($data: StudentInput!) {\n  createStudent(data: $data) {\n    documentId\n    name\n    email\n    status\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;