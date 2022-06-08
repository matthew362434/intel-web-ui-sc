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

import { CSSProperties, useEffect } from 'react';

import { Button } from '@adobe/react-spectrum';
import maxBy from 'lodash/maxBy';

import { Annotation, getAnnotationStateForTask } from '../../../../core/annotations';
import { MediaItem, MEDIA_ANNOTATION_STATUS } from '../../../../core/media';
import { LoadingIndicator } from '../../../../shared/components';
import { ANNOTATOR_MODE } from '../../core';
import { FindMediaItemCriteria, useNextMediaItem, findIndex } from '../../hooks/use-next-media-item.hook';
import { useAnnotationToolContext, useAnnotator, useDataset } from '../../providers';
import { UseSubmitAnnotationsMutationResult } from '../../providers/submit-annotations-provider/submit-annotations.interface';
import { TaskChainInput } from '../../providers/task-chain-provider/task-chain.interface';
import { AcceptPredictionButton } from './accept-prediction-button.component';

interface SubmitButtonProps {
    selectMediaItem: (mediaItem: MediaItem) => void;
    selectedMediaItem: MediaItem | undefined;
    submit: UseSubmitAnnotationsMutationResult;
    canSubmit: boolean;
    styles?: CSSProperties;
}

const findActiveCriteria: FindMediaItemCriteria = (selectedMediaItem, mediaItems) => {
    const idx = findIndex(selectedMediaItem, mediaItems);

    const next = mediaItems.find(({ annotationStatePerTask }, currentItemIndex) => {
        const annotationState = getAnnotationStateForTask(annotationStatePerTask);

        return (
            (annotationState === MEDIA_ANNOTATION_STATUS.NONE ||
                annotationState === MEDIA_ANNOTATION_STATUS.TO_REVISIT) &&
            currentItemIndex > idx
        );
    });

    if (next !== undefined) {
        return { type: 'media', media: next };
    }

    // If there are now more unannotated media items after this,
    // start over from the start of the list
    const mediaItem = mediaItems.find(({ annotationStatePerTask }, currentItemIndex) => {
        const annotationState = getAnnotationStateForTask(annotationStatePerTask);

        return (
            (annotationState === MEDIA_ANNOTATION_STATUS.NONE ||
                annotationState === MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED ||
                annotationState === MEDIA_ANNOTATION_STATUS.TO_REVISIT) &&
            currentItemIndex !== idx
        );
    });

    if (mediaItem !== undefined) {
        return { type: 'media', media: mediaItem };
    }

    return undefined;
};

const findNextAnnotationCriteria = (selectedInput: Annotation | undefined, inputs: TaskChainInput[]) => {
    const inputsAfterSelectedInput = inputs.filter(({ id, zIndex }) => {
        if (selectedInput === undefined) {
            return true;
        }

        return id !== selectedInput.id && selectedInput.zIndex > zIndex;
    });

    return maxBy(inputsAfterSelectedInput, ({ zIndex }) => zIndex);
};

export const SubmitButton = ({
    selectMediaItem,
    selectedMediaItem,
    canSubmit,
    submit,
    styles,
}: SubmitButtonProps): JSX.Element => {
    const annotationToolContext = useAnnotationToolContext();
    const { mode } = useAnnotator();
    const { mediaItemsQuery } = useDataset();

    const nextMediaItem = useNextMediaItem(selectedMediaItem, findActiveCriteria, findNextAnnotationCriteria);

    useEffect(() => {
        if (nextMediaItem === undefined && !mediaItemsQuery.isFetchingNextPage && mediaItemsQuery.hasNextPage) {
            mediaItemsQuery.fetchNextPage();
        }
    }, [nextMediaItem, mediaItemsQuery]);

    if (mode === ANNOTATOR_MODE.PREDICTION) {
        return (
            <AcceptPredictionButton nextMediaItem={nextMediaItem} selectMediaItem={selectMediaItem} styles={styles}>
                Accept {nextMediaItem !== undefined ? '»' : ''}
            </AcceptPredictionButton>
        );
    }

    const onPress = () => {
        if (nextMediaItem === undefined) {
            submit.mutate({});

            return;
        }

        if (nextMediaItem.type === 'media') {
            const callback = async () => {
                selectMediaItem(nextMediaItem.media);
            };

            submit.mutate({ callback });
        }

        if (nextMediaItem.type === 'annotation') {
            annotationToolContext.scene.selectAnnotation(nextMediaItem.annotation.id);

            // Selecting annotation with onSuccess resulted in a race condition
            submit.mutate({});
        }
    };

    const isDisabled = (nextMediaItem === undefined && !canSubmit) || submit.isLoading;

    return (
        <Button
            variant='cta'
            id='secondary-toolbar-submit'
            onPress={onPress}
            isDisabled={isDisabled}
            UNSAFE_style={styles}
        >
            {submit.isLoading ? <LoadingIndicator size='S' marginEnd='size-100' /> : <></>}
            Submit {nextMediaItem !== undefined ? '»' : ''}
        </Button>
    );
};
