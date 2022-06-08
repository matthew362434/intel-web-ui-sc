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
import { FormEvent, ForwardedRef, forwardRef, useEffect, useRef, useState } from 'react';

import { ActionButton, Flex } from '@adobe/react-spectrum';
import { TextFieldRef } from '@react-types/textfield';
import { ValidationError } from 'yup';

import { Accept } from '../../../../../../assets/icons';
import { getFlattenedItems } from '../../../../../../core/labels';
import { LimitedTextField, ValidationErrorMsg } from '../../../../../../shared/components';
import {
    DEFAULT_GROUP_NAME,
    DEFAULT_LABEL,
    getNextColor,
    LabelItemEditionState,
    LabelTreeItem,
} from '../../../../../annotator/components/labels/label-tree-view';
import { isYupValidationError } from '../../../../../profile-page/utils';
import { LabelsRelationType } from '../../../select-project-template/utils';
import { newLabelNameSchema } from '../../../utils';
import { LABEL_TREE_TYPE } from '../../label-tree-type.enum';
import { HotkeyNameField } from '../hotkey-name-field';
import { ColorPickerDialog } from '../index';
import classes from './new-label-tree-label.module.scss';

interface NewLabelProps {
    type: LABEL_TREE_TYPE;
    addLabel: (label: LabelTreeItem, shouldGoNext?: boolean) => void;
    labels: LabelTreeItem[];
    relation: LabelsRelationType;
    projectLabels: LabelTreeItem[];
    color: string;
    name: string;
    withLabel?: boolean;
}

enum ErrorPath {
    NEW_LABEL_NAME = 'name',
}

export const NewLabelTreeLabel = forwardRef(
    (
        { type, addLabel, color, name, labels, relation, projectLabels, withLabel = false }: NewLabelProps,
        ref: ForwardedRef<never>
    ): JSX.Element => {
        const DEFAULT_ERROR = '';
        const isSingleLabelTree = type === LABEL_TREE_TYPE.SINGLE;

        const [newColor, setNewColor] = useState<string | undefined>(color);
        const [newName, setNewName] = useState<string>(name);
        const [newHotkey, setNewHotkey] = useState<string | undefined>();
        const [error, setError] = useState<string>(DEFAULT_ERROR);
        const [isNameInputDirty, setIsNameInputDirty] = useState<boolean>(false);

        const inputRef = useRef<TextFieldRef>(null);

        const handleColorChange = (c: string) => {
            setNewColor(c);
        };

        const cleanForm = () => {
            setNewName('');
            setNewHotkey(undefined);
            handleColorChange(getNextColor(labels));

            inputRef.current && inputRef.current.focus();

            validateName('');
            setIsNameInputDirty(false);
        };

        const confirmAddLabel = (shouldGoNext = true) => {
            const isSingleSelection = relation === LabelsRelationType.SINGLE_SELECTION;
            const defaultGroupName = isSingleLabelTree ? `${DEFAULT_GROUP_NAME} root task` : DEFAULT_GROUP_NAME;
            const groupName = isSingleSelection ? defaultGroupName : newName;

            addLabel(
                DEFAULT_LABEL({
                    name: newName,
                    color: newColor || color,
                    groupName,
                    relation,
                    inEditMode: false,
                    state: LabelItemEditionState.IDLE,
                    hotkey: newHotkey,
                }),
                shouldGoNext
            );
        };

        const handleOnSubmit = (event: FormEvent) => {
            confirmAddLabel();

            if (!isSingleLabelTree) {
                inputRef.current && inputRef.current.focus();
                cleanForm();
            }

            event.preventDefault();
        };

        const validateName = (changedName: string): void => {
            setError(DEFAULT_ERROR);

            const projectLabelsFlattened = getFlattenedItems(projectLabels);
            const otherLabels = isSingleLabelTree
                ? projectLabelsFlattened.filter(({ id }) => id !== labels[0].id)
                : projectLabelsFlattened;

            try {
                newLabelNameSchema(changedName, otherLabels).validateSync({ name: changedName }, { abortEarly: false });
            } catch (validationError) {
                if (isYupValidationError(validationError)) {
                    validationError.inner.forEach(({ path, message }: ValidationError) => {
                        if (path === ErrorPath.NEW_LABEL_NAME) {
                            setError(message);
                        }
                    });
                }
            }
        };

        const saveSingleLabelTree = () => {
            confirmAddLabel(false);
        };

        const handleNameChange = (value: string) => {
            setIsNameInputDirty(true);
            validateName(value);
            setNewName(value);

            if (isSingleLabelTree) {
                confirmAddLabel(false);
            }
        };

        useEffect(() => {
            //Set focus on name field on mounting
            inputRef.current && inputRef.current.focus();

            validateName(newName);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return (
            <form onSubmit={handleOnSubmit}>
                <Flex direction={'column'} ref={ref}>
                    {withLabel && (
                        <label htmlFor={'project-label-name-input-id'} className={classes.label}>
                            Label
                        </label>
                    )}
                    <Flex alignItems={'end'} justifyContent={'space-between'}>
                        <Flex gap={'size-100'} width={'100%'}>
                            <ColorPickerDialog
                                color={newColor}
                                id={'change-color-button'}
                                data-testid={'change-color-button'}
                                onColorChange={handleColorChange}
                                size={'S'}
                            />

                            <LimitedTextField
                                ref={inputRef}
                                width={'28rem'}
                                value={newName}
                                onBlur={() => isSingleLabelTree && saveSingleLabelTree()}
                                onChange={handleNameChange}
                                placeholder={'Label name'}
                                id={'project-label-name-input-id'}
                                aria-label={'Project label name input'}
                            />
                            <HotkeyNameField text={'+ Add hot key'} value={newHotkey} onChange={setNewHotkey} />
                        </Flex>
                        {isSingleLabelTree ? (
                            <></>
                        ) : (
                            <ActionButton
                                isDisabled={!!error}
                                type='submit'
                                data-testid={'add-label-button'}
                                id={'add-label-button'}
                            >
                                <Accept />
                            </ActionButton>
                        )}
                    </Flex>
                    <ValidationErrorMsg errorMsg={isNameInputDirty ? error : ''} />
                </Flex>
            </form>
        );
    }
);
