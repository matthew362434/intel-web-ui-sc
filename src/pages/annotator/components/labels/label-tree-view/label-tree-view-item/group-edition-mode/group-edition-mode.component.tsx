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

import { ActionButton, Flex, Switch, Text } from '@adobe/react-spectrum';
import { TextFieldRef } from '@react-types/textfield';
import { ValidationError } from 'yup';

import { Accept, Reject } from '../../../../../../../assets/icons';
import { getFlattenedItems } from '../../../../../../../core/labels';
import { useOutsideClick } from '../../../../../../../hooks';
import { LimitedTextField, ValidationErrorMsg } from '../../../../../../../shared/components';
import { idMatchingFormat } from '../../../../../../../test-utils';
import { newLabelNameSchema } from '../../../../../../create-project';
import { LabelsRelationType } from '../../../../../../create-project/components/select-project-template/utils';
import { isYupValidationError } from '../../../../../../profile-page/utils';
import { LabelItemEditionState, LabelTreeGroup, LabelTreeItem } from '../../label-tree-view.interface';
import { DEFAULT_GROUP } from '../../utils';

interface GroupEditionModeProps {
    group?: LabelTreeGroup;
    projectGroups: LabelTreeItem[];
    finishEdition?: () => void;
    newGroup?: boolean;
    save: (editedGroup?: LabelTreeGroup, previousId?: string) => void;
}

enum ErrorPath {
    NEW_LABEL_NAME = 'name',
}

export const GroupEditionMode = ({
    group,
    projectGroups,
    finishEdition,
    save,
    newGroup,
}: GroupEditionModeProps): JSX.Element => {
    const DEFAULT_ERROR = '';
    const [newName, setNewName] = useState<string>(group?.name || '');
    const [error, setError] = useState<string>(DEFAULT_ERROR);
    const [isDirty, setDirty] = useState<{ name: boolean; mode: boolean }>({ name: false, mode: false });
    const [multipleSelectionOn, setMultipleSelectionOn] = useState(
        group?.relation === LabelsRelationType.MULTI_SELECTION
    );

    const setMultipleSelectionOnHandler = (value: boolean) => {
        setMultipleSelectionOn(value);
        setDirty({ ...isDirty, mode: true });
    };

    const ref = useRef(null);

    const cancel = () => {
        save();
        finishEdition && finishEdition();
    };

    useOutsideClick({
        ref: ref,
        callback: () => {
            !!error ? cancel() : addWrapper();
            finishEdition && finishEdition();
        },
    });

    const inputRef = useRef<TextFieldRef>(null);

    useEffect(() => {
        //Set focus on name field on mounting
        inputRef.current && inputRef.current.focus();
        validateName(newName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clean = () => {
        setNewName('');
        setDirty({ name: false, mode: false });
        validateName('');
    };

    const addWrapper = () => {
        const relation = multipleSelectionOn ? LabelsRelationType.MULTI_SELECTION : LabelsRelationType.SINGLE_SELECTION;

        const updatedGroup = {
            ...group,
            name: newName,
            id: idMatchingFormat(newName),
            relation,
            inEditMode: false,
            state:
                group?.state === LabelItemEditionState.NEW_EMPTY
                    ? LabelItemEditionState.NEW
                    : LabelItemEditionState.CHANGED,
            children:
                group?.children.map((child) => ({
                    ...child,
                    relation,
                    parentLabelId: idMatchingFormat(newName),
                    group: newName,
                })) || [],
        } as LabelTreeGroup;

        const updatedOrNew: LabelTreeGroup = !!group
            ? updatedGroup
            : DEFAULT_GROUP({ name: newName, relation: relation, inEditMode: false, parentName: null });

        save(updatedOrNew, group?.id || undefined);
        clean();
        finishEdition && finishEdition();
    };

    const handleOnSubmit = (event: FormEvent) => {
        addWrapper();
        event.preventDefault();
    };

    const validateName = (changedName: string): void => {
        setError(DEFAULT_ERROR);

        try {
            newLabelNameSchema(
                changedName,
                getFlattenedItems(projectGroups).filter((item) => group?.id !== item.id)
            ).validateSync({ name: changedName }, { abortEarly: false });
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

    const handleNameChange = (value: string) => {
        setDirty({ ...isDirty, name: true });
        validateName(value);
        setNewName(value);
    };

    return (
        <form onSubmit={handleOnSubmit} style={{ width: '100%' }}>
            <Flex direction={'column'} ref={ref}>
                <Flex alignItems={'center'} justifyContent={'space-between'}>
                    <Flex gap={'size-100'} width={'100%'} alignItems={'center'}>
                        <Flex width={'100%'}>
                            <LimitedTextField
                                ref={inputRef}
                                value={newName}
                                width={'100%'}
                                onChange={handleNameChange}
                                placeholder={'Group name'}
                                aria-label={'Group name'}
                                id={'project-label-group-input-id'}
                            />
                        </Flex>
                        <Text UNSAFE_style={{ whiteSpace: 'nowrap' }}>Multiple selection</Text>
                        <Switch
                            onChange={setMultipleSelectionOnHandler}
                            isSelected={multipleSelectionOn}
                            width={'size-1200'}
                        >
                            {multipleSelectionOn ? 'On' : 'Off'}
                        </Switch>
                    </Flex>

                    {finishEdition && (
                        <ActionButton isQuiet onPress={cancel} aria-label={'discard changes'}>
                            <Reject />
                        </ActionButton>
                    )}
                    <ActionButton
                        isQuiet={!error}
                        isDisabled={!!error || !(isDirty.name || isDirty.mode)}
                        type='submit'
                        data-testid={'add-label-button'}
                        id={'add-label-button'}
                        aria-label={'save changes'}
                    >
                        <Accept />
                    </ActionButton>
                </Flex>
                <ValidationErrorMsg inheritHeight={!newGroup} errorMsg={isDirty.name ? error : ''} />
            </Flex>
        </form>
    );
};
