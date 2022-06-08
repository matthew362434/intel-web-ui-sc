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

import { ActionButton, Checkbox, Flex, Grid, repeat } from '@adobe/react-spectrum';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';

import { Delete } from '../../../../../assets/icons';
import { Annotation } from '../../../../../core/annotations';
import { DOMAIN } from '../../../../../core/projects';
import { SplitPaneWrapper } from '../../../../../shared/components/splitpane-wrapper/splitpane-wrapper.component';
import primaryBtnClasses from '../../../components/primary-toolbar/primaryToolBar.module.scss';
import { useContainerBoundingBox } from '../../../hooks/use-container-bondingbox.hook';
import { useToggleSelectAllKeyboardShortcut, useDeleteKeyboardShortcut } from '../../../hot-keys';
import { useAnnotationScene, useAnnotationToolContext, useTask } from '../../../providers';
import { useTaskChain } from '../../../providers/task-chain-provider/task-chain-provider.component';
import { useTaskChainOutput } from '../../../providers/task-chain-provider/use-task-chain-output.hook';
import { getGlobalAnnotations } from '../../../providers/task-chain-provider/utils';
import { blurActiveInput } from '../../../tools/utils';
import { ToggleLockButton } from '../../toggle-lock-button';
import { ToggleVisibilityButton } from '../../toggle-visibility-button';
import { AnnotationListThumbnailGrid } from '../annotation-list-thumbnail-grid/annotation-list-thumbnail-grid.component';
import { AnnotationList } from '../annotation-list.component';
import { reorder } from '../utils';

interface AnnotationContainerProps {
    replaceAnnotations: (annotations: Annotation[]) => void;
}

const useAnnotations = () => {
    const annotationToolContext = useAnnotationToolContext();
    const selectedTask = annotationToolContext.selectedTask;

    const roi = useContainerBoundingBox(annotationToolContext.image);
    const annotations = useTaskChainOutput(annotationToolContext);
    const globalAnnotations = getGlobalAnnotations(annotations, roi, selectedTask);

    return useTaskChainOutput(annotationToolContext).filter((annotation: Annotation) => {
        return !globalAnnotations.some(({ id }) => annotation.id === id);
    });
};

export const AnnotationListContainer = ({ replaceAnnotations }: AnnotationContainerProps): JSX.Element => {
    const {
        unselectAnnotation,
        selectAnnotation,

        removeAnnotations,
        setSelectedAnnotations,
        setHiddenAnnotations,
        setLockedAnnotations,
        hasShapePointSelected,
    } = useAnnotationScene();
    const annotationToolContext = useAnnotationToolContext();
    const { isTaskChainDomainSelected } = useTask();
    const isTaskChainSelectedClassification = isTaskChainDomainSelected(DOMAIN.CLASSIFICATION);

    const [isHidden, setIsHidden] = useState<boolean>(false);
    const [selectedAll, setSelectedAll] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(false);

    const { inputs: inputAnnotations } = useTaskChain();

    const annotations = useAnnotations();

    const reversedAnnotations = [...annotations].reverse();
    const selectedAnnotations = annotations.filter(({ isSelected }) => isSelected);
    const isTaskChainSelectedSegmentation = isTaskChainDomainSelected(DOMAIN.SEGMENTATION);
    const noSelectedAnnotations = selectedAnnotations.length === 0;

    const removeSelectedAnnotations = () => {
        removeAnnotations(selectedAnnotations);
    };

    const handleDragEnd = (result: DropResult): void => {
        if (result.destination && result.destination.index !== result.source.index) {
            const { destination, source } = result;
            const reordered: Annotation[] = reorder(annotations, -1 * source.index, -1 * destination.index);

            replaceAnnotations(reordered);
        }
    };

    const changeVisibility = (): void => {
        setHiddenAnnotations((annotation) => {
            if (selectedAnnotations.some(({ id }) => id === annotation.id)) {
                return !isHidden;
            }
            return annotation.isHidden;
        });
    };

    const changeLock = (): void => {
        setLockedAnnotations((annotation) => {
            if (selectedAnnotations.some(({ id }) => id === annotation.id)) {
                return !isLocked;
            }

            return annotation.isLocked;
        });
    };

    const setOutputAnnotationSelection = (isSelected: boolean): void => {
        setSelectedAnnotations((annotation) => {
            if (annotations.some(({ id }) => id === annotation.id)) {
                return isSelected;
            }

            return annotation.isSelected;
        });
    };

    const handleSelectAnnotation = (annotationId: string) => (isSelected: boolean) => {
        if (isSelected) {
            selectAnnotation(annotationId);
        } else {
            unselectAnnotation(annotationId);
        }
    };

    useEffect(() => {
        if (selectedAnnotations.length > 0) {
            setIsHidden(selectedAnnotations.some((annotation) => annotation.isHidden));
            setIsLocked(selectedAnnotations.some((annotation) => annotation.isLocked));
        }
    }, [selectedAnnotations]);

    useEffect(() => {
        setSelectedAll(selectedAnnotations.length === annotations.length);
    }, [selectedAnnotations, annotations.length]);

    useToggleSelectAllKeyboardShortcut(setOutputAnnotationSelection);
    useDeleteKeyboardShortcut(removeAnnotations, hasShapePointSelected, selectedAnnotations);

    return (
        <Flex direction={'column'} height={'100%'}>
            <SplitPaneWrapper withPane={isTaskChainSelectedSegmentation && !!inputAnnotations.length}>
                {isTaskChainSelectedSegmentation ? (
                    <AnnotationListThumbnailGrid
                        annotationToolContext={annotationToolContext}
                        annotations={inputAnnotations}
                        onSelectAnnotation={handleSelectAnnotation}
                    />
                ) : (
                    <></>
                )}
                <>
                    {!isTaskChainSelectedClassification ? (
                        <Grid
                            columns={repeat('auto-fit', 'size-400')}
                            autoRows='size-400'
                            gap='size-100'
                            height={'fit-content'}
                        >
                            <Flex justifyContent={'center'}>
                                <Checkbox
                                    UNSAFE_style={{ padding: 0 }}
                                    onFocusChange={blurActiveInput}
                                    id={'annotations-list-select-all'}
                                    isSelected={!noSelectedAnnotations}
                                    isDisabled={!annotations.length}
                                    isIndeterminate={!selectedAll && selectedAnnotations.length > 0}
                                    onChange={setOutputAnnotationSelection}
                                    aria-label='Select all annotations'
                                />
                            </Flex>
                            <ToggleVisibilityButton
                                onPress={changeVisibility}
                                isHidden={isHidden}
                                id={'selected-annotations'}
                                mode={annotationToolContext.mode}
                                isDisabled={noSelectedAnnotations}
                            />
                            <ActionButton
                                isQuiet
                                onPress={removeSelectedAnnotations}
                                id={'annotations-list-delete-selected'}
                                isDisabled={noSelectedAnnotations}
                                aria-label='Delete selected annotations'
                                UNSAFE_className={primaryBtnClasses.primaryToolBarBtn}
                            >
                                <Delete />
                            </ActionButton>
                            <ToggleLockButton
                                id={'selected-annotations'}
                                onPress={changeLock}
                                isLocked={isLocked}
                                isDisabled={noSelectedAnnotations}
                            />
                        </Grid>
                    ) : (
                        <></>
                    )}
                    {/* TODO: move all Dragabble components together */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId='annotation-droppable-id'>
                            {(provided: DroppableProvided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    <AnnotationList
                                        annotations={reversedAnnotations}
                                        annotationToolContext={annotationToolContext}
                                    />
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </>
            </SplitPaneWrapper>
        </Flex>
    );
};
