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

import { isEqual } from 'lodash';
import { useMutation, UseMutationResult, useQuery } from 'react-query';
import { v4 as uuidv4 } from 'uuid';

import { Annotation } from '../../../../../core/annotations';
import { VideoFrame } from '../../../../../core/media';
import QUERY_KEYS from '../../../../../core/requests/query-keys';
import { useProject } from '../../../../project-details/providers/project-provider/project-provider.component';
import { useSubmitAnnotations, useTask } from '../../../providers';
import { useMergeAnnotations } from '../../../providers/prediction-provider/use-merge-annotations.hook';
import { VideoControls } from './../video-controls/video-controls.interface';

export interface UsePropagateAnnotations {
    isDisabled: boolean;
    showReplaceOrMergeDialog: boolean;
    propagateAnnotationsMutation: UseMutationResult<void, unknown, boolean, unknown>;
}

export const usePropagateAnnotations = (
    videoControls: VideoControls,
    currentVideoFrame: VideoFrame,
    videoFrames: VideoFrame[],
    replaceWithAnnotations: ReadonlyArray<Annotation>,
    getAnnotations: (videoFrame: VideoFrame) => Promise<ReadonlyArray<Annotation>>,
    saveAnnotations: (videoFrame: VideoFrame, annotations: ReadonlyArray<Annotation>) => Promise<void>
): UsePropagateAnnotations => {
    const { isTaskChainProject } = useProject();
    const { selectedTask } = useTask();

    const disableDueToTaskChain = isTaskChainProject && selectedTask !== null;

    const currentVideoFrameIndex = videoFrames.findIndex(
        ({ identifier: { frameNumber } }) => frameNumber === currentVideoFrame.identifier.frameNumber
    );
    const nextVideoFrame = videoFrames[currentVideoFrameIndex + 1];

    const annotationsInNextFrameQuery = useQuery({
        queryKey: QUERY_KEYS.MEDIA_ITEM_ANNOTATIONS(nextVideoFrame?.identifier),
        queryFn: () => getAnnotations(nextVideoFrame),
        enabled: nextVideoFrame !== undefined,
    });

    const isDisabled =
        disableDueToTaskChain ||
        replaceWithAnnotations.length === 0 ||
        currentVideoFrameIndex >= videoFrames.length ||
        !annotationsInNextFrameQuery.data;

    const showReplaceOrMergeDialog =
        annotationsInNextFrameQuery.isLoading ||
        (annotationsInNextFrameQuery.isSuccess && annotationsInNextFrameQuery.data.length !== 0);

    const mergeAnnotations = useMergeAnnotations();

    const { submitAnnotationsMutation } = useSubmitAnnotations();

    const propagateAnnotationsMutation = useMutation(async (merge: boolean) => {
        if (merge) {
            if (!annotationsInNextFrameQuery.isSuccess) {
                throw new Error('Could not retrieve annotations to merge with');
            }

            // We want to prevent overwriting the user's existing annotations, therefore all
            // annotaitons from the previous frame are given a new id if they were changed
            const annotationsWithNewIds = replaceWithAnnotations.map((annotation) => {
                const isNewAnnotation = !annotationsInNextFrameQuery.data.some(({ id }) => id === annotation.id);

                if (isNewAnnotation) {
                    return annotation;
                }

                const annotationDidNotChange = annotationsInNextFrameQuery.data.some((otherAnnotation) => {
                    return isEqual(otherAnnotation, annotation);
                });

                if (annotationDidNotChange) {
                    return annotation;
                }

                return { ...annotation, id: uuidv4() };
            });

            const mergedAnnotations = mergeAnnotations(annotationsWithNewIds, annotationsInNextFrameQuery.data);

            submitAnnotationsMutation.mutate({
                callback: async () => {
                    await saveAnnotations(nextVideoFrame, mergedAnnotations);

                    videoControls.goto(nextVideoFrame.identifier.frameNumber, false);
                },
            });
        } else {
            submitAnnotationsMutation.mutate({
                callback: async () => {
                    await saveAnnotations(nextVideoFrame, replaceWithAnnotations);

                    videoControls.goto(nextVideoFrame.identifier.frameNumber, false);
                },
            });
        }
    });

    return {
        isDisabled,
        showReplaceOrMergeDialog,
        propagateAnnotationsMutation,
    };
};
