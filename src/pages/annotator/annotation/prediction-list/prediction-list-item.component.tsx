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

import { useEffect, useState } from 'react';

import { View, Flex, ActionButton, useNumberFormatter, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { useHover } from '@react-aria/interactions';
import { Text } from '@react-spectrum/text';
import noop from 'lodash/noop';

import { Reject, Accept, CaretRightIcon } from '../../../../assets/icons';
import { COLOR_MODE } from '../../../../assets/icons/color-mode.enum';
import { Annotation, AnnotationLabel } from '../../../../core/annotations';
import { Label, LABEL_SOURCE } from '../../../../core/labels';
import { DOMAIN } from '../../../../core/projects';
import { usePrevious } from '../../../../hooks/use-previous/use-previous.hook';
import { TruncatedText } from '../../../../shared/components/truncated-text';
import { LabelSearch } from '../../components/labels/label-search/label-search.component';
import { SelectionIndicator } from '../../components/labels/label-search/selection-indicator.component';
import { AnnotationToolContext } from '../../core';
import { useAnnotationScene, useTask } from '../../providers';
import { AnnotationListItemThumbnail } from '../annotation-list/annotation-list-item/annotation-list-item-thumbnail.component';
import { DEFAULT_LABEL_WIDTH } from '../labels/label.component';
import { getAvailableLabelsWithoutEmpty, getLabelsFromTask } from '../labels/utils';
import { ToggleVisibilityButton } from '../toggle-visibility-button';
import classes from './prediction-list.module.scss';

const SCORE_PERCENTAGE_OFFSET = 20;
const ICON_OFFSET = 26;

interface ToggleRejectButtonProps {
    id: string;
    onPress: () => void;
    isRejected: boolean;
}

export const useSyncHiddenStateBasedOnRejection = (isRejected: boolean, isHidden: boolean, annotationId: string) => {
    const { hideAnnotation, showAnnotation } = useAnnotationScene();
    const prevIsRejected = usePrevious(isRejected);

    useEffect(() => {
        if (prevIsRejected === isRejected) {
            if (isRejected && !isHidden) {
                hideAnnotation(annotationId);
            }

            return;
        }

        if (isRejected && !isHidden) {
            hideAnnotation(annotationId);
        }

        if (!isRejected && isHidden) {
            showAnnotation(annotationId);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRejected, prevIsRejected, isHidden, annotationId]);
};

export const ToggleRejectButton = ({ id, onPress, isRejected }: ToggleRejectButtonProps): JSX.Element => {
    return (
        <ActionButton
            isQuiet
            onPress={onPress}
            id={`annotation-${id}-toggle-reject`}
            aria-label={isRejected ? 'accept prediction' : 'reject prediction'}
        >
            {isRejected ? <Accept /> : <Reject />}
        </ActionButton>
    );
};

export const PredictionLabelList = ({
    labels,
    annotation,
}: {
    labels: readonly AnnotationLabel[];
    annotation: Annotation;
}): JSX.Element => {
    const formatter = useNumberFormatter({
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return (
        <ul className={classes.labelList}>
            {labels.map((label, labelIndex) => {
                const hasChildren = labels.some(({ parentLabelId }) => label.id === parentLabelId);

                // Prediction list item has a prefix icon and a suffix percentage, which is why
                // a few offsets were added so the label fits correctly between these two.
                const labelWidth =
                    Math.round(DEFAULT_LABEL_WIDTH / labels.length) - SCORE_PERCENTAGE_OFFSET - ICON_OFFSET;
                const labelScore =
                    label.score && label.source.type === LABEL_SOURCE.MODEL ? formatter.format(label.score) : '';

                return (
                    <li key={label.id} id={`${annotation.id}-labels-${label.id}`} className={classes.labelList}>
                        <TruncatedText width={labelWidth}>{label.name}</TruncatedText>
                        {` ${labelScore}`}
                        {hasChildren ? <CaretRightIcon /> : <></>}
                        {!hasChildren && labelIndex < labels.length - 1 ? ', ' : <></>}
                    </li>
                );
            })}
        </ul>
    );
};

interface PredictionListItemProps {
    annotation: Annotation;
    isRejected: boolean;
    onPressReject: () => void;
    onPressVisibility: () => void;
    onHoverStart: () => void;
    onHoverEnd: () => void;
    annotationToolContext: AnnotationToolContext;
}

export const PredictionListItem = ({
    annotation,
    isRejected,
    onHoverEnd,
    onHoverStart,
    onPressReject,
    onPressVisibility,
    annotationToolContext,
}: PredictionListItemProps): JSX.Element => {
    const [selectLabel, setSelectLabel] = useState(false);

    const { isTaskChainDomainSelected } = useTask();
    const isTaskChainSelectedClassification = isTaskChainDomainSelected(DOMAIN.CLASSIFICATION);

    const { isHidden } = annotation;
    const { removeLabels, addLabel, selectAnnotation, unselectAnnotation } = annotationToolContext.scene;

    // From the current annotation, get only the labels that belong to the current selected task
    const annotationTaskLabels = getLabelsFromTask(annotation, annotationToolContext.selectedTask);

    // Labels for the current annotation, either by task or all of them
    const labels = annotationToolContext.selectedTask ? annotationTaskLabels : annotation.labels;

    const availableLabels = getAvailableLabelsWithoutEmpty(annotationToolContext, annotation);

    const { hoverProps, isHovered } = useHover({ onHoverStart, onHoverEnd });

    useSyncHiddenStateBasedOnRejection(isRejected, isHidden, annotation.id);

    const toggleLabel = (label: Label) => {
        if (annotation.labels.some((currentLabel) => label.id === currentLabel.id)) {
            removeLabels([label], [annotation.id]);
        } else {
            addLabel(label, [annotation.id]);
        }

        setSelectLabel(false);
    };

    const handleSelectAnnotation = (isSelected: boolean): void => {
        if (isSelected) {
            selectAnnotation(annotation.id);
        } else {
            unselectAnnotation(annotation.id);
        }
    };

    return (
        <li {...hoverProps} aria-label='Predicted annotation'>
            <View
                borderBottomColor='gray-50'
                borderBottomWidth='thin'
                padding='size-100'
                backgroundColor={isHovered ? 'gray-300' : 'gray-200'}
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
                    {isRejected ? <Reject color={COLOR_MODE.NEGATIVE} /> : <Accept color={COLOR_MODE.POSITIVE} />}
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
                                        isSelected={annotation.labels.some(({ id: labelId }) => labelId === label.id)}
                                    />
                                );
                            }}
                        />
                    ) : (
                        <div
                            onClick={() => {
                                if (isTaskChainSelectedClassification) {
                                    handleSelectAnnotation(true);

                                    return;
                                }

                                if (annotation.labels.length === 0) {
                                    setSelectLabel(true);
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <Text
                                id={`prediction-${annotation.id}-labels`}
                                UNSAFE_className={isHidden ? classes.hiddenColor : ''}
                            >
                                <PredictionLabelList labels={labels} annotation={annotation} />
                            </Text>
                        </div>
                    )}
                    <Flex marginStart='auto'>
                        <View UNSAFE_style={{ opacity: !isHovered && !isHidden ? 0.0 : 1.0 }}>
                            <TooltipTrigger>
                                <ToggleVisibilityButton
                                    onPress={isRejected ? noop : onPressVisibility}
                                    isHidden={isHidden}
                                    id={annotation.id}
                                />
                                <Tooltip>{isHidden ? 'Unhide' : 'Hide'}</Tooltip>
                            </TooltipTrigger>
                        </View>
                        <View UNSAFE_style={{ opacity: !isHovered && !isRejected ? 0.0 : 1.0 }}>
                            <TooltipTrigger>
                                <ToggleRejectButton
                                    isRejected={isRejected}
                                    onPress={onPressReject}
                                    id={annotation.id}
                                />
                                <Tooltip>{isRejected ? 'Accept' : 'Reject'}</Tooltip>
                            </TooltipTrigger>
                        </View>
                    </Flex>
                </Flex>
            </View>
        </li>
    );
};
