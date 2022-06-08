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

import { Key } from 'react';

import * as yup from 'yup';

import { ProjectProps } from '../../../core/projects';
import { LabelItemType, LabelTreeItem, LabelTreeLabel } from '../../annotator/components/labels/label-tree-view';

const labelNameNotAllowedMultipleSpaces = new RegExp(/^((?! {2}).)*$/);

export const REQUIRED_NAME_VALIDATION_MESSAGE = 'Name cannot be empty';
export const REQUIRED_GROUP_VALIDATION_MESSAGE = 'Group cannot be empty';
export const ONE_SPACE_VALIDATION_MESSAGE = 'You can only use single space';
export const UNIQUE_HOTKEY_VALIDATION_MESSAGE = 'This hotkey is already used';
export const REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE = 'Please, type project name';
export const MORE_THAT_ONE_HUNDRED_VALIDATION_MESSAGE = 'Name cannot have more than 100 characters';
export const UNIQUE_VALIDATION_MESSAGE = (name: string): string => `Label '${name}' already exists`;
const NOT_EMPTY_LABELS_VALIDATION_MESSAGE = 'You should add at least one label';

const returnLabelItems = (items: LabelTreeItem[]): LabelTreeLabel[] =>
    items.filter(({ type }) => type === LabelItemType.LABEL) as LabelTreeLabel[];

export const trimAndLowerCase = (text: string): string => text.trim().toLocaleLowerCase();

const isUniqueInProjectLabels =
    (projectLabels: LabelTreeLabel[], property: 'name' | 'hotkey') =>
    (name?: string): boolean =>
        name !== undefined &&
        !projectLabels?.some((item) => trimAndLowerCase(item[property] as string) === trimAndLowerCase(name));

const isUniqueNameInProjectItems =
    (labels: LabelTreeItem[]) =>
    (name?: string): boolean =>
        name !== undefined && !labels.some((item) => trimAndLowerCase(item.name) === trimAndLowerCase(name));

export const newLabelNameSchema = (
    name: string | undefined,
    projectLabels: LabelTreeItem[]
): yup.SchemaOf<{ name: string }> => {
    return yup.object({
        name: yup
            .string()
            .trim()
            .required(REQUIRED_NAME_VALIDATION_MESSAGE)
            .max(100, MORE_THAT_ONE_HUNDRED_VALIDATION_MESSAGE)
            .test(
                'unique',
                UNIQUE_VALIDATION_MESSAGE(name ? name.trim() : ''),
                isUniqueNameInProjectItems(projectLabels)
            )
            .matches(labelNameNotAllowedMultipleSpaces, ONE_SPACE_VALIDATION_MESSAGE),
    });
};

export const newLabelGroupSchema = (): yup.SchemaOf<{ group: string }> =>
    yup.object({
        group: yup.string().required(REQUIRED_GROUP_VALIDATION_MESSAGE),
    });

export const newLabelHotkeySchema = (projectLabels: LabelTreeItem[]): yup.SchemaOf<{ hotkey: string | undefined }> =>
    yup.object({
        hotkey: yup
            .string()
            .test(
                'unique',
                UNIQUE_HOTKEY_VALIDATION_MESSAGE,
                isUniqueInProjectLabels(returnLabelItems(projectLabels), 'hotkey')
            ),
    });

export const labelsListSchema = yup.object({
    labels: yup.array().min(1, NOT_EMPTY_LABELS_VALIDATION_MESSAGE),
});

export const getListOfLabelAttribute = (
    current: string[] = [],
    label: LabelTreeItem,
    field: Key,
    filteredId?: string
): string[] => {
    if (label.id !== filteredId) {
        current.push(label[field as keyof LabelTreeItem] as string);
    }

    if (label.children.length > 0) {
        label.children.forEach((child: LabelTreeItem) => {
            getListOfLabelAttribute(current, child, field, filteredId);
        });
    }
    return current;
};

export const projectNameSchema = (projectName: string, projects?: ProjectProps[]): yup.SchemaOf<{ name: string }> =>
    yup.object({
        name: yup
            .string()
            .trim()
            .required('Please, type project name')
            .max(100, MORE_THAT_ONE_HUNDRED_VALIDATION_MESSAGE)
            .test('unique', `Project '${projectName.trim()}' already exists`, (item?: string): boolean => {
                if (item && projects?.length) {
                    return !projects
                        .map((project: ProjectProps) => project.name.toLowerCase())
                        .includes(item.toLowerCase());
                }

                return true;
            }),
    });

export enum ProjectNameErrorPath {
    NAME = 'name',
}
