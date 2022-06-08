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

import { renderHook } from '@testing-library/react-hooks';

import { useTreeItemMenu } from './tree-item-menu.hook';

const setEditMode = jest.fn();
const deleteLabel = jest.fn();
const addLabel = jest.fn();
const addGroup = jest.fn();

const getComponentKeys = (components: JSX.Element[]) => components.map(({ key }) => key);

describe('useTreeItemMenu', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('returns three components when type is HIERARCHY', () => {
        const { result } = renderHook(() => useTreeItemMenu(setEditMode, addLabel, addGroup, deleteLabel));
        expect(getComponentKeys(result.current)).toEqual([
            'add-child-group-button',
            'add-child-label-button',
            'edit-button',
            'delete-button',
        ]);
    });
});
