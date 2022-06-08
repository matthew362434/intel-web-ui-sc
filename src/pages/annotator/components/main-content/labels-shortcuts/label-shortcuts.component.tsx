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

import { useRef, useState } from 'react';

import { Text, View, Flex, ActionButton } from '@adobe/react-spectrum';
import { useLocalStorage } from 'use-hooks';

import { ChevronDownLight, Pin, Unpin } from '../../../../../assets/icons';
import { Annotation } from '../../../../../core/annotations';
import { isGlobal, Label } from '../../../../../core/labels';
import { useOutsideClick } from '../../../../../hooks';
import { LOCAL_STORAGE_KEYS } from '../../../../../shared/local-storage-keys';
import { useProjectIdentifier } from '../../../hooks/use-project-identifier';
import { LabelSearch } from '../../labels/label-search/label-search.component';
import { LabelShortcutButton } from './label-shortcut-item/label-shortcut-button.component';
import { LabelShortcutItem } from './label-shortcut-item/label-shortcut-item.component';
import classes from './label-shortcuts.module.scss';

interface LabelShortcutsProps {
    addLabel: (label: Label, annotationIds: string[]) => void;
    removeLabels: (labels: Label[], annotationIds: string[], skipHistory?: boolean) => void;
    annotations: readonly Annotation[];
    labels: Label[];
    taskDomain?: string;
}

export const LabelShortcuts = ({
    labels,
    annotations,
    addLabel,
    removeLabels,
    taskDomain,
}: LabelShortcutsProps): JSX.Element => {
    const DEFAULT_SHORTCUT_NUMBER = 5;
    const [labelsListOpen, setLabelsListOpen] = useState<boolean>(false);

    const wrapperRef = useRef(null);
    const { projectId } = useProjectIdentifier();

    const getLabelId = ({ id }: Label) => id;

    const [pinnedLabelsIds, setPinnedLabelsIds] = useLocalStorage<string[]>(
        `${LOCAL_STORAGE_KEYS.PINNED_LABELS}_${projectId}_${taskDomain || LOCAL_STORAGE_KEYS.ALL}`,
        labels.slice(0, DEFAULT_SHORTCUT_NUMBER).map(getLabelId)
    );
    const isPinned = (label: Label): boolean => {
        return pinnedLabelsIds.some((currentId) => label.id === currentId);
    };

    const clickHandler = (label: Label): void => {
        const selectedAnnotations = annotations.filter((annotation: Annotation) => annotation.isSelected);

        if (!selectedAnnotations.length) {
            isGlobal(label) && addLabel(label, []);
            return;
        }

        for (const annotation of selectedAnnotations) {
            if (!annotation.labels.some(({ id }) => id === label.id)) {
                addLabel(
                    label,
                    selectedAnnotations.map(({ id }) => id)
                );

                return;
            }

            removeLabels(
                [label],
                selectedAnnotations.map(({ id }) => id)
            );
        }
    };

    const pinLabel = (label: Label): void => {
        setPinnedLabelsIds([...pinnedLabelsIds, label.id]);
    };

    const unPinLabel = (label: Label): void => {
        setPinnedLabelsIds(pinnedLabelsIds.filter((id) => label.id !== id));
    };

    useOutsideClick({
        ref: wrapperRef,
        callback: () => {
            setLabelsListOpen(false);
        },
    });

    return (
        <Flex id='canvas-labels' gap='size-100'>
            <Flex minWidth={0} UNSAFE_style={{ overflow: 'auto' }} gap='size-100'>
                {labels
                    .filter(({ id }: Label) => pinnedLabelsIds.includes(id))
                    .map((label) => (
                        <LabelShortcutItem key={label.id} label={label} clickHandler={clickHandler} />
                    ))}
            </Flex>
            {labels.length > DEFAULT_SHORTCUT_NUMBER && (
                <>
                    <LabelShortcutButton onPress={() => setLabelsListOpen(!labelsListOpen)}>
                        <Flex direction={'row-reverse'} alignItems={'center'}>
                            <Text>More</Text>
                            <ChevronDownLight aria-label={'more-icon'} id={'more-icon'} />
                        </Flex>
                    </LabelShortcutButton>

                    <View
                        position={'absolute'}
                        top={'size-600'}
                        right={'size-150'}
                        backgroundColor='gray-50'
                        padding='size-200'
                        borderWidth='thin'
                        borderColor='gray-200'
                        UNSAFE_style={{ display: labelsListOpen ? 'block' : 'none' }}
                        ref={wrapperRef}
                        height={'31.2rem'}
                    >
                        <LabelSearch
                            labels={labels}
                            onClick={clickHandler}
                            isOpen
                            className={classes.labelSearch}
                            suffix={(label, { isHovered }) => {
                                return isPinned(label) ? (
                                    <ActionButton isQuiet onPress={() => unPinLabel(label)} height={'fit-content'}>
                                        <Unpin aria-label={`${label.id}-unpin-icon`} id={'unpin-icon'} />
                                    </ActionButton>
                                ) : isHovered ? (
                                    <ActionButton isQuiet onPress={() => pinLabel(label)} height={'fit-content'}>
                                        <Pin aria-label={`${label.id}-pin-icon`} id={'pin-icon'} />
                                    </ActionButton>
                                ) : (
                                    <></>
                                );
                            }}
                        />
                    </View>
                </>
            )}
        </Flex>
    );
};
