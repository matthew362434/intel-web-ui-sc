// INTEL CONFIDENTIAL
//
// Copyright (C) 2021 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

export enum SortMenuActionKey {
    NAME = 'Media Name',
    DATE = 'Media Upload Date',
}

export interface AdvancedFilterSortingOptions {
    sortBy?: string;
    sortDir?: string;
}

export type AdvancedFilterOptions =
    | Record<string, never>
    | { condition: 'and' | 'or' | 'nor'; rules: SearchOptionsRule[] };

export interface SearchOptionsRule {
    id: string;
    field: SearchRuleField | '';
    operator: SearchRuleOperator | '';
    value: SearchRuleValue;
    isUnremovable?: boolean;
}

export type SearchRuleValue = string | string[] | number;

export enum SearchRuleField {
    LabelId = 'LABEL_ID',
    MediaName = 'MEDIA_NAME',
    MediaWidth = 'MEDIA_WIDTH',
    MediaUploadDate = 'MEDIA_UPLOAD_DATE',
    MediaHeight = 'MEDIA_HEIGHT',
    AnnotationCreationDate = 'ANNOTATION_CREATION_DATE',
    AnnotationSceneState = 'ANNOTATION_SCENE_STATE',
}

export enum SearchRuleOperator {
    Less = 'LESS',
    In = 'IN',
    NotIn = 'NOT_IN',
    Equal = 'EQUAL',
    Greater = 'GREATER',
    NotEqual = 'NOT_EQUAL',
    GreaterOrEqual = 'GREATER_OR_EQUAL',
    LessOrEqual = 'LESS_OR_EQUAL',
}

export enum AnnotationSceneState {
    NONE = 'NONE',
    REVISIT = 'TO_REVISIT',
    ANNOTATED = 'ANNOTATED',
    PARTIALLY_ANNOTATED = 'PARTIALLY_ANNOTATED',
}

export enum SearchOptionsActionsType {
    ADD = 'ADD',
    UPDATE = 'UPDATE',
    UPDATE_ALL = 'UPDATE_ALL',
    REMOVE = 'REMOVE',
    REMOVE_ALL = 'REMOVE_ALL',
}

export type SearchOptionsActions =
    | { type: SearchOptionsActionsType.ADD }
    | { type: SearchOptionsActionsType.REMOVE_ALL }
    | { type: SearchOptionsActionsType.REMOVE; id: string }
    | { type: SearchOptionsActionsType.UPDATE; id: string; rule: SearchOptionsRule }
    | { type: SearchOptionsActionsType.UPDATE_ALL; filterOptions: AdvancedFilterOptions };
