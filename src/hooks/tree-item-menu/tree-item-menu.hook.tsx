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
import { ActionButton } from '@adobe/react-spectrum';

import { Add, Delete, Edit, FolderAdd } from '../../assets/icons';

export const useTreeItemMenu = (
    setEditMode?: () => void,
    addLabel?: () => void,
    addGroup?: () => void,
    deleteLabel?: () => void
): JSX.Element[] => {
    const addLabelButton = !!addLabel ? (
        <ActionButton
            isQuiet
            key={'add-child-label-button'}
            onPress={addLabel}
            id={'add-child-label-button'}
            data-testid={'add-child-label-button'}
            aria-label={'add-child-label-button'}
        >
            <Add aria-label={'add child'} width={'16px'} height={'16px'} />
        </ActionButton>
    ) : undefined;

    const addGroupButton = !!addGroup ? (
        <ActionButton
            isQuiet
            key={'add-child-group-button'}
            onPress={addGroup}
            id={'add-child-group-button'}
            aria-label={'add-child-group-button'}
        >
            <FolderAdd aria-label={'add child'} width={'16px'} height={'16px'} />
        </ActionButton>
    ) : undefined;

    const editButton = !!setEditMode ? (
        <ActionButton
            isQuiet
            key={'edit-button'}
            onPress={setEditMode}
            id={'edit-label-button'}
            aria-label={'edit-label-button'}
        >
            <Edit aria-label={'edit label'} width={'16px'} height={'16px'} />
        </ActionButton>
    ) : undefined;

    const deleteButton = !!deleteLabel ? (
        <ActionButton isQuiet key={'delete-button'} onPress={deleteLabel} id={'delete-label-button'}>
            <Delete aria-label={'delete'} width={'16px'} height={'16px'} />
        </ActionButton>
    ) : undefined;

    const buttons: (JSX.Element | undefined)[] = [addGroupButton, addLabelButton, editButton, deleteButton];

    return buttons.filter((button) => {
        return button !== undefined;
    }) as JSX.Element[];
};
