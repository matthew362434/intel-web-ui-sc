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
import { FormEvent, useEffect, useRef, useState } from 'react';

import { ActionButton, Flex } from '@adobe/react-spectrum';

import { Accept, Reject } from '../../../../../../../assets/icons';
import { getFlattenedItems } from '../../../../../../../core/labels';
import { useOutsideClick } from '../../../../../../../hooks';
import { ColorPickerDialog, newLabelNameSchema } from '../../../../../../create-project';
import { HotkeyNameField } from '../../../../../../create-project/components/project-labels-management/task-labels-management/hotkey-name-field';
import { LabelsRelationType } from '../../../../../../create-project/components/select-project-template/utils';
import { isYupValidationError } from '../../../../../../profile-page/utils';
import { getLabelId } from '../../../utils/labels-utils';
import { LabelItemEditionState, LabelTreeItem, LabelTreeLabel } from '../../label-tree-view.interface';
import { DEFAULT_GROUP_NAME, DEFAULT_LABEL, getNextColor, getUpdatedItem } from '../../utils';
import { NameEditionField } from './name-edition-field/name-edition-field.component';

interface EditLabelModeProps {
    label?: LabelTreeLabel;
    finishEdition?: () => void;
    projectLabels: LabelTreeItem[];
    save: (editedLabel?: LabelTreeLabel, id?: string) => void;
    relation: LabelsRelationType;
    state?: LabelItemEditionState;
}

export const LabelEditionMode = ({
    label,
    finishEdition,
    projectLabels,
    save,
    relation,
    state = LabelItemEditionState.IDLE,
}: EditLabelModeProps): JSX.Element => {
    const DEFAULT_ERROR = '';
    const [error, setError] = useState<string>(DEFAULT_ERROR);
    const [name, setName] = useState<string | undefined>(label?.name || '');
    const [hotkey, setHotkey] = useState<string | undefined>(label?.hotkey || undefined);
    const [isDirtyNameField, setDirtyNameField] = useState<boolean>(false);

    const [color, setColor] = useState<string>(label?.color || getNextColor(projectLabels));
    const [isColorDialogOpen, setColorDialogOpen] = useState<boolean>(false);
    const wrapperRef = useRef(null);

    const validateName = (newName: string | undefined, id: string | undefined, labels: LabelTreeItem[]): void => {
        setError(DEFAULT_ERROR);

        const otherLabels = labels ? labels.filter((item) => item.id !== id) : [];

        try {
            newLabelNameSchema(newName, otherLabels).validateSync({ name: newName });
        } catch (errors) {
            if (isYupValidationError(errors)) {
                setError(errors.errors[0]);
            }
        }
    };

    useEffect(() => {
        validateNameHandler(name);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useOutsideClick({
        ref: wrapperRef,
        callback: () => {
            if (!isColorDialogOpen) {
                !!error ? cancel() : saveHandler();
                finishEdition && finishEdition();
            }
        },
    });

    const saveHandler = (e?: FormEvent) => {
        e?.preventDefault();

        if (!name || !color) {
            return;
        }

        const updatedLabel: LabelTreeLabel | undefined = label && {
            ...label,
            name,
            hotkey,
            color,
        };

        const newLabel = !!updatedLabel
            ? getUpdatedItem(updatedLabel, { inEditMode: false })
            : DEFAULT_LABEL({
                  name,
                  hotkey,
                  color,
                  inEditMode: false,
                  groupName: relation === LabelsRelationType.SINGLE_SELECTION ? DEFAULT_GROUP_NAME : name,
                  relation,
                  state,
              });

        save(newLabel as LabelTreeLabel, label?.id);
        finishEdition && finishEdition();
    };

    const cancel = () => {
        save();
        finishEdition && finishEdition();
    };

    const validateNameHandler = (newValue: string | undefined) => {
        validateName(newValue, label?.id, projectLabels ? getFlattenedItems(projectLabels) : []);
    };

    const onNameChangeHandler = (newValue: string | undefined) => {
        setDirtyNameField(true);
        validateNameHandler(newValue);
        setName(newValue);
    };

    return (
        <form onSubmit={saveHandler} style={{ width: '100%' }}>
            <Flex alignItems='center' justifyContent={'space-between'} width={'100%'} ref={wrapperRef}>
                <Flex gap='size-100' alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                    <Flex gap='size-100' alignItems={'center'} minWidth={0} width={'100%'}>
                        <ColorPickerDialog
                            color={color}
                            onColorChange={setColor}
                            id={`${getLabelId('tree', label)}-color`}
                            size={'S'}
                            onOpenChange={setColorDialogOpen}
                        />

                        <NameEditionField
                            onChange={onNameChangeHandler}
                            value={name}
                            error={isDirtyNameField ? error : ''}
                        />
                    </Flex>
                    <Flex direction={'column'} marginEnd={'size-1000'}>
                        <HotkeyNameField text={'+ Add hot key'} value={hotkey} onChange={setHotkey} />
                    </Flex>
                </Flex>

                <Flex>
                    <ActionButton onPress={cancel} isQuiet aria-label={'Cancel'}>
                        <Reject />
                    </ActionButton>
                    <ActionButton type={'submit'} isQuiet={!error} isDisabled={!!error} aria-label={'Submit'}>
                        <Accept />
                    </ActionButton>
                </Flex>
            </Flex>
        </form>
    );
};
