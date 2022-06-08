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

import { useState } from 'react';

import { Checkbox, Flex } from '@adobe/react-spectrum';
import { useFocusManager } from '@react-aria/focus';

import { Annotation } from '../../../../../core/annotations';
import { Label } from '../../../../../core/labels';
import { DOMAIN } from '../../../../../core/projects';
import { LabelSearch } from '../../../components/labels/label-search/label-search.component';
import { SelectionIndicator } from '../../../components/labels/label-search/selection-indicator.component';
import { AnnotationToolContext } from '../../../core';
import { useTask } from '../../../providers';
import { getAvailableLabelsWithoutEmpty, getLabelsFromTask } from '../../labels/utils';
import { AnnotationLabelList } from '../annotation-list-label-list/annotation-list-label-list.component';
import { AnnotationListItemActions } from './annotation-list-item-actions.component';
import { AnnotationListItemMenu } from './annotation-list-item-menu.component';
import { AnnotationListItemThumbnail } from './annotation-list-item-thumbnail.component';
import classes from './annotation-list-item.module.scss';

interface AnnotationListItemContentProps {
    annotation: Annotation;
    annotationToolContext: AnnotationToolContext;
    isHovered: boolean;
}

export const AnnotationListItemContent = ({
    annotation,
    isHovered,
    annotationToolContext,
}: AnnotationListItemContentProps): JSX.Element => {
    const [selectLabel, setSelectLabel] = useState(false);
    const focusManager = useFocusManager();

    const {
        addLabel,
        removeLabels,
        selectAnnotation,
        unselectAnnotation,
        hideAnnotation,
        showAnnotation,
        removeAnnotations,
        toggleLock,
    } = annotationToolContext.scene;

    const { isTaskChainDomainSelected } = useTask();
    const isTaskChainSelectedClassification = isTaskChainDomainSelected(DOMAIN.CLASSIFICATION);

    const isAnnotationSelected = annotation.isSelected;

    // Get all the labels from the current selected task or all the labels from the scene if no task is selected
    const availableLabels = getAvailableLabelsWithoutEmpty(annotationToolContext, annotation);

    // From the current annotation, get only the labels that belong to the current selected task
    const annotationTaskLabels = getLabelsFromTask(annotation, annotationToolContext.selectedTask);

    // Labels for the current annotation, either by task or all of them
    const labels = annotationToolContext.selectedTask ? annotationTaskLabels : annotation.labels;

    const annotationListAriaLabel =
        availableLabels.length === 0 ? 'Select label' : availableLabels.map((label) => label.name).join(', ');
    const textColor = annotation.isHidden ? classes.hiddenAnnotation : '';

    const handleSelectAnnotation = (isSelected: boolean): void => {
        if (isSelected) {
            selectAnnotation(annotation.id);
        } else {
            unselectAnnotation(annotation.id);
        }
    };

    const changeVisibility = (isHidden: boolean, annotationId: string): void => {
        isHidden ? showAnnotation(annotationId) : hideAnnotation(annotationId);
    };

    const changeLock = (isLocked: boolean, annotationId: string): void => {
        toggleLock(!isLocked, annotationId);
    };

    const handleOnFocus = (): void => {
        focusManager.focusPrevious();
    };

    const toggleLabel = (label: Label) => {
        if (annotation.labels.some((currentLabel) => label.id === currentLabel.id)) {
            removeLabels([label], [annotation.id]);
        } else {
            addLabel(label, [annotation.id]);
        }

        setSelectLabel(false);
    };

    return (
        <Flex justifyContent='space-between' alignItems='center'>
            <Flex alignItems='center' direction='row' flexGrow={1}>
                {!isTaskChainSelectedClassification ? (
                    <Checkbox
                        id={`annotation-list-checkbox-${annotation.id}`}
                        isSelected={isAnnotationSelected}
                        onChange={handleSelectAnnotation}
                        onFocus={handleOnFocus}
                        UNSAFE_className={textColor}
                        aria-label={annotationListAriaLabel}
                    />
                ) : (
                    <></>
                )}

                <div
                    id={`annotation-list-annotation-labels-${annotation.id}`}
                    aria-label={`Labels of annotation with id ${annotation.id}`}
                    className={`${annotation.labels.length === 0 ? classes.disabledText : textColor} ${
                        classes.annotationLabels
                    }`}
                    onDoubleClick={() => {
                        setSelectLabel(true);
                    }}
                    onClick={() => {
                        if (isTaskChainSelectedClassification) {
                            handleSelectAnnotation(true);
                            return;
                        }

                        if (annotation.labels.length === 0) {
                            setSelectLabel(true);
                        }
                    }}
                >
                    <Flex alignItems='center' gap='size-100'>
                        {isTaskChainSelectedClassification && (
                            <AnnotationListItemThumbnail
                                annotationShape={annotation.shape}
                                annotationId={annotation.id}
                                onSelectAnnotation={handleSelectAnnotation}
                                image={annotationToolContext.image}
                                isSelected={annotation.isSelected}
                            />
                        )}

                        {selectLabel ? (
                            <LabelSearch
                                labels={availableLabels}
                                onClick={toggleLabel}
                                onReset={() => setSelectLabel(false)}
                                shouldFocusTextInput
                                size={{ labelTree: 300 }}
                                suffix={(label, state) => {
                                    return (
                                        <SelectionIndicator
                                            isHovered={state.isHovered}
                                            isSelected={annotation.labels.some(
                                                ({ id: labelId }) => labelId === label.id
                                            )}
                                        />
                                    );
                                }}
                            />
                        ) : (
                            <AnnotationLabelList labels={labels} annotation={annotation} />
                        )}
                    </Flex>
                </div>

                {isHovered && !isTaskChainSelectedClassification ? (
                    <AnnotationListItemMenu
                        id={annotation.id}
                        isHidden={annotation.isHidden}
                        isLocked={annotation.isLocked}
                        remove={() => removeAnnotations([annotation])}
                        show={() => showAnnotation(annotation.id)}
                        hide={() => hideAnnotation(annotation.id)}
                        toggleLock={() => changeLock(annotation.isLocked, annotation.id)}
                        editLabels={() => setSelectLabel(true)}
                    />
                ) : (
                    <></>
                )}
            </Flex>

            {!isTaskChainSelectedClassification && (
                <AnnotationListItemActions
                    isHovered={isHovered}
                    isLocked={annotation.isLocked}
                    textColor={textColor}
                    isHidden={annotation.isHidden}
                    annotationId={annotation.id}
                    changeLock={changeLock}
                    changeVisibility={changeVisibility}
                    mode={annotationToolContext.mode}
                />
            )}
        </Flex>
    );
};
