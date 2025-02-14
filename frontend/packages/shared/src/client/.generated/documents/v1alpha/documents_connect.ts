// @generated by protoc-gen-connect-es v1.1.3 with parameter "target=ts,import_extension=none"
// @generated from file documents/v1alpha/documents.proto (package com.mintter.documents.v1alpha, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { CreateDraftRequest, DeleteDraftRequest, DeletePublicationRequest, Document, GetDraftRequest, GetPublicationRequest, ListAccountPublicationsRequest, ListDraftsRequest, ListDraftsResponse, ListPublicationsRequest, ListPublicationsResponse, Publication, PublishDraftRequest, PushPublicationRequest, UpdateDraftRequest, UpdateDraftResponse } from "./documents_pb";
import { Empty, MethodKind } from "@bufbuild/protobuf";

/**
 * Drafts service exposes the functionality
 *
 * @generated from service com.mintter.documents.v1alpha.Drafts
 */
export const Drafts = {
  typeName: "com.mintter.documents.v1alpha.Drafts",
  methods: {
    /**
     * Creates a new draft with a new permanent document ID.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Drafts.CreateDraft
     */
    createDraft: {
      name: "CreateDraft",
      I: CreateDraftRequest,
      O: Document,
      kind: MethodKind.Unary,
    },
    /**
     * Deletes a draft by its document ID.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Drafts.DeleteDraft
     */
    deleteDraft: {
      name: "DeleteDraft",
      I: DeleteDraftRequest,
      O: Empty,
      kind: MethodKind.Unary,
    },
    /**
     * Gets a single draft if exists.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Drafts.GetDraft
     */
    getDraft: {
      name: "GetDraft",
      I: GetDraftRequest,
      O: Document,
      kind: MethodKind.Unary,
    },
    /**
     * Updates a draft using granular update operations.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Drafts.UpdateDraft
     */
    updateDraft: {
      name: "UpdateDraft",
      I: UpdateDraftRequest,
      O: UpdateDraftResponse,
      kind: MethodKind.Unary,
    },
    /**
     * List currently stored drafts.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Drafts.ListDrafts
     */
    listDrafts: {
      name: "ListDrafts",
      I: ListDraftsRequest,
      O: ListDraftsResponse,
      kind: MethodKind.Unary,
    },
    /**
     * Publishes a draft. I.e. draft will become a publication, and will no longer appear in drafts section.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Drafts.PublishDraft
     */
    publishDraft: {
      name: "PublishDraft",
      I: PublishDraftRequest,
      O: Publication,
      kind: MethodKind.Unary,
    },
  }
} as const;

/**
 * Publications service provides access to published documents.
 *
 * @generated from service com.mintter.documents.v1alpha.Publications
 */
export const Publications = {
  typeName: "com.mintter.documents.v1alpha.Publications",
  methods: {
    /**
     * Gets a single publication.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Publications.GetPublication
     */
    getPublication: {
      name: "GetPublication",
      I: GetPublicationRequest,
      O: Publication,
      kind: MethodKind.Unary,
    },
    /**
     * Deletes a publication from the local node. It removes all the patches corresponding to a document.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Publications.DeletePublication
     */
    deletePublication: {
      name: "DeletePublication",
      I: DeletePublicationRequest,
      O: Empty,
      kind: MethodKind.Unary,
    },
    /**
     * Lists stored publications. Only the most recent versions show up.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Publications.ListPublications
     */
    listPublications: {
      name: "ListPublications",
      I: ListPublicationsRequest,
      O: ListPublicationsResponse,
      kind: MethodKind.Unary,
    },
    /**
     * Push Local publication to the gateway.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Publications.PushPublication
     */
    pushPublication: {
      name: "PushPublication",
      I: PushPublicationRequest,
      O: Empty,
      kind: MethodKind.Unary,
    },
    /**
     * Lists publications owned by a given account.
     *
     * @generated from rpc com.mintter.documents.v1alpha.Publications.ListAccountPublications
     */
    listAccountPublications: {
      name: "ListAccountPublications",
      I: ListAccountPublicationsRequest,
      O: ListPublicationsResponse,
      kind: MethodKind.Unary,
    },
  }
} as const;

