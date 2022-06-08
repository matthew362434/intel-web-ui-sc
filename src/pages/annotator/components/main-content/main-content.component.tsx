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

import { Flex, Heading, Text, View } from '@adobe/react-spectrum';
import { useErrorHandler } from 'react-error-boundary';

import { EmptyActiveSetIcon } from '../../../../assets/images';
import { isExclusive } from '../../../../core/labels';
import { Loading } from '../../../../shared/components';
import { AnnotatorCanvas } from '../../annotator-canvas.component';
import { AnnotationToolContext } from '../../core';
import { useAnnotator, useSubmitAnnotations, useTask, useDataset } from '../../providers';
import { getOutputFromTask } from '../../providers/task-chain-provider/utils';
import { ToolAnnotationContextProps } from '../../tools/tools.interface';
import { TransformZoom } from '../../zoom';
import { LabelShortcuts } from './labels-shortcuts/label-shortcuts.component';
import classes from './main-content.module.scss';
import { useSelectFirstMediaItem } from './use-select-first-media-item.hook';

const EmptyActiveSet = () => {
    return (
        <Flex alignItems='center' justifyContent='center' height='100%' width='100%' direction='column'>
            <EmptyActiveSetIcon className={classes.activeSetIsEmptyIcon} />

            <Heading level={4} UNSAFE_className={classes.activeSetIsEmptyHeader} marginTop='size-150'>
                Active set is empty
            </Heading>

            <Text>Select dataset or upload new media item to annotate more.</Text>
        </Flex>
    );
};

const EmptyMainContent = () => {
    useSelectFirstMediaItem();

    const { isInActiveMode, activeMediaItemsQuery } = useDataset();

    const activeSetIsEmpty = !activeMediaItemsQuery.data?.pages.some((page) => page.media.length !== 0);
    const showEmptyActiveSet = isInActiveMode && activeSetIsEmpty;

    return showEmptyActiveSet ? (
        <EmptyActiveSet />
    ) : (
        <Flex alignItems='center' justifyContent='center' height='100%' width='100%'>
            <Heading level={3} UNSAFE_className={classes.idleHeader}>
                Select a media item to annotate
            </Heading>
        </Flex>
    );
};

// For now we'll remove any empty labels from a sub task if we're in the "All tasks" view
const useLabelShortcuts = (annotationToolContext: AnnotationToolContext) => {
    const { labels: taskLabels } = useTask();

    if (annotationToolContext.tasks.length < 2 || annotationToolContext.selectedTask !== null) {
        return taskLabels;
    }

    const secondTask = annotationToolContext.tasks[1];

    return taskLabels.filter((label) => {
        if (!isExclusive(label)) {
            return true;
        }

        return !secondTask.labels.some(({ id }) => label.id === id);
    });
};

export const MainContent = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const {
        scene: { addLabel, removeLabels },
        selectedTask,
    } = annotationToolContext;
    const labels = useLabelShortcuts(annotationToolContext);

    const { selectedMediaItemQuery, selectedMediaItem } = useAnnotator();
    const { submitAnnotationsMutation } = useSubmitAnnotations();
    const isSaving = submitAnnotationsMutation.isLoading;

    const annotations = getOutputFromTask(annotationToolContext, annotationToolContext.selectedTask);
    const isLoading = selectedMediaItemQuery.isLoading || selectedMediaItemQuery.isFetching;

    useErrorHandler(selectedMediaItemQuery.error);

    return (
        <View backgroundColor='gray-50' gridArea='content' overflow='hidden' position='relative'>
            <TransformZoom>
                <AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />
            </TransformZoom>

            {isSaving || isLoading ? <Loading overlay /> : <></>}

            {selectedMediaItem === undefined && !selectedMediaItemQuery.isLoading ? <EmptyMainContent /> : <></>}

            <View position='absolute' top={0} right={0} padding='size-150' UNSAFE_className={classes.labelShortcuts}>
                <LabelShortcuts
                    addLabel={addLabel}
                    removeLabels={removeLabels}
                    labels={labels}
                    annotations={annotations}
                    taskDomain={selectedTask?.domain}
                    key={`${selectedTask?.id}-${selectedTask?.domain}`}
                />
            </View>
        </View>
    );
};
