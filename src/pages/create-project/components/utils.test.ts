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

import { MORE_THAN_100_CHARS_NAME } from '../../../test-utils';
import { getMockedTreeLabel, getMockedProject } from '../../../test-utils/mocked-items-factory';
import { LabelTreeItem } from '../../annotator/components/labels/label-tree-view';
import {
    MORE_THAT_ONE_HUNDRED_VALIDATION_MESSAGE,
    newLabelNameSchema,
    ONE_SPACE_VALIDATION_MESSAGE,
    projectNameSchema,
    REQUIRED_NAME_VALIDATION_MESSAGE,
    REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE,
    UNIQUE_VALIDATION_MESSAGE,
} from './utils';

const emptyLabels: LabelTreeItem[] = [];

describe('label name validation', () => {
    it('name should be unique', () => {
        const labelName = 'test';
        const labels = [getMockedTreeLabel({ name: 'test' })];

        expect(() => newLabelNameSchema(labelName, labels).validateSync({ name: labelName })).toThrow(
            UNIQUE_VALIDATION_MESSAGE('test')
        );
    });

    it('empty name should throw an error', () => {
        const emptyName = '';

        expect(() => newLabelNameSchema(emptyName, emptyLabels).validateSync({ name: emptyName })).toThrow(
            REQUIRED_NAME_VALIDATION_MESSAGE
        );
    });

    it('white spaces should throw an error', () => {
        const labelName = ' ';

        expect(() => newLabelNameSchema(labelName, emptyLabels).validateSync({ name: labelName })).toThrow(
            REQUIRED_NAME_VALIDATION_MESSAGE
        );
    });

    it('name with Leading space show throw an error', () => {
        const name = 'test';
        const labelName = ` ${name}`;
        const labels = [getMockedTreeLabel({ name })];

        expect(() => newLabelNameSchema(labelName, labels).validateSync({ name: labelName })).toThrow(
            UNIQUE_VALIDATION_MESSAGE(name)
        );
    });

    it('name with trailing spaces show throw an error', () => {
        const name = 'test';
        const labelName = `${name} `;
        const labels = [getMockedTreeLabel({ name })];

        expect(() => newLabelNameSchema(labelName, labels).validateSync({ name: labelName })).toThrow(
            UNIQUE_VALIDATION_MESSAGE(name)
        );
    });

    it('previously saved names with trailing spaces are trim and validate', () => {
        const name = 'test';
        const labels = [getMockedTreeLabel({ name: `${name} ` })];

        expect(() => newLabelNameSchema(name, labels).validateSync({ name: name })).toThrow(
            UNIQUE_VALIDATION_MESSAGE(name)
        );
    });

    it('name with more than 100 character throw an error', () => {
        const labelName = MORE_THAN_100_CHARS_NAME;

        expect(() => newLabelNameSchema(labelName, emptyLabels).validateSync({ name: labelName })).toThrow(
            MORE_THAT_ONE_HUNDRED_VALIDATION_MESSAGE
        );
    });

    it('name containing two spaces in row are not permitted', () => {
        const labelName = 'label  name';

        expect(() => newLabelNameSchema(labelName, emptyLabels).validateSync({ name: labelName })).toThrow(
            ONE_SPACE_VALIDATION_MESSAGE
        );
    });
});

describe('project name validation', () => {
    const projectName = 'test';
    const projects = [getMockedProject({ name: projectName })];

    it('name should be unique', () => {
        expect(() => projectNameSchema(projectName, projects).validateSync({ name: projectName })).toThrow(
            `Project '${projectName}' already exists`
        );
    });

    it('empty name should throw an error', () => {
        const emptyName = '';
        expect(() => projectNameSchema(emptyName, projects).validateSync({ name: emptyName })).toThrow(
            REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE
        );
    });

    it('white spaces should throw an error', () => {
        const emptyName = ' ';

        expect(() => projectNameSchema(emptyName, projects).validateSync({ name: emptyName })).toThrow(
            REQUIRED_PROJECT_NAME_VALIDATION_MESSAGE
        );
    });

    it('name with Leading space show throw an error', () => {
        const { name } = projects[0];
        const newProjectName = ` ${name}`;

        expect(() => projectNameSchema(newProjectName, projects).validateSync({ name: newProjectName })).toThrow(
            `Project '${name}' already exists`
        );
    });

    it('name with trailing spaces show throw an error', () => {
        const { name } = projects[0];
        const newProjectName = `${name} `;

        expect(() => projectNameSchema(newProjectName, projects).validateSync({ name: newProjectName })).toThrow(
            `Project '${name}' already exists`
        );
    });

    it('name with more than 100 character throw an error', () => {
        const newProjectName = MORE_THAN_100_CHARS_NAME;

        expect(() => projectNameSchema(newProjectName, projects).validateSync({ name: newProjectName })).toThrow(
            MORE_THAT_ONE_HUNDRED_VALIDATION_MESSAGE
        );
    });
});
