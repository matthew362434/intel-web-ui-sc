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

import { Dispatch, Key, ReactNode, SetStateAction, useState } from 'react';

import { ActionButton, AlertDialog, DialogContainer } from '@adobe/react-spectrum';

import { MenuTrigger } from '../menu-trigger';

const CANCEL = 'Cancel';

interface MenuTriggerPopupProps {
    menuTriggerId?: string;
    question: string;
    items?: string[];
    children?: ReactNode;
    isButtonDisabled?: boolean;
    onPrimaryAction: () => void;
    setDeleteUserDialog?: Dispatch<SetStateAction<boolean>>;
    onOpenChange?: Dispatch<SetStateAction<boolean>>;
}

export const MenuTriggerPopup = ({
    menuTriggerId,
    items,
    onPrimaryAction,
    question,
    setDeleteUserDialog,
    children,
    isButtonDisabled,
    onOpenChange,
}: MenuTriggerPopupProps): JSX.Element => {
    const [dialog, setDialog] = useState<Key>();

    return (
        <>
            {!children && items?.length && (
                <MenuTrigger
                    id={menuTriggerId ?? ''}
                    onAction={() => {
                        setDialog('delete');
                        setDeleteUserDialog && setDeleteUserDialog(true);
                    }}
                    onOpenChange={onOpenChange}
                    items={items}
                    quiet
                />
            )}
            {!items?.length && children && (
                <ActionButton isQuiet isDisabled={isButtonDisabled} onPress={() => setDialog('delete')}>
                    {children}
                </ActionButton>
            )}
            <DialogContainer
                onDismiss={() => {
                    setDialog(undefined);
                    setDeleteUserDialog && setDeleteUserDialog(false);
                }}
            >
                {dialog === 'delete' && (
                    <AlertDialog
                        title='Delete'
                        variant='destructive'
                        primaryActionLabel='Delete'
                        onPrimaryAction={onPrimaryAction}
                        cancelLabel={CANCEL}
                    >
                        {question}
                    </AlertDialog>
                )}
            </DialogContainer>
        </>
    );
};
