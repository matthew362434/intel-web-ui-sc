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

import { CSSProperties, ReactNode } from 'react';

import { useMutation } from 'react-query';

import { MediaItem } from '../../../../core/media';
import { DOMAIN } from '../../../../core/projects';
import { LoadingIndicator } from '../../../../shared/components';
import { useProject } from '../../../project-details/providers/project-provider/project-provider.component';
import { FindMediaItemCriteriaOutput } from '../../hooks/use-next-media-item.hook';
import { useAnnotationToolContext, usePrediction } from '../../providers';
import { PredictionButton } from '../sidebar/prediction-accordion/prediction-button.component';

interface AcceptPredictionButtonProps {
    nextMediaItem: FindMediaItemCriteriaOutput;
    selectMediaItem: (mediaItem: MediaItem) => void;
    children: ReactNode;
    styles?: CSSProperties;
}

export const AcceptPredictionButton = ({
    nextMediaItem,
    selectMediaItem,
    children,
    styles,
}: AcceptPredictionButtonProps): JSX.Element => {
    const annotationToolContext = useAnnotationToolContext();
    const { acceptPrediction, userAnnotationsExist } = usePrediction();
    const { isSingleDomainProject } = useProject();
    const isSingleClassificationProject = isSingleDomainProject(DOMAIN.CLASSIFICATION);

    const acceptPredictionMutation = useMutation(
        async (merge: boolean) => {
            // Note: due to a current race condition we need to do this before onSuccess
            if (nextMediaItem?.type === 'annotation') {
                annotationToolContext.scene.selectAnnotation(nextMediaItem.annotation.id);
            }

            acceptPrediction(merge);
        },
        {
            onSuccess: () => {
                if (nextMediaItem !== undefined && nextMediaItem.type === 'media') {
                    selectMediaItem(nextMediaItem.media);
                }
            },
        }
    );

    return (
        <PredictionButton
            id='accept-predictions'
            merge={() => acceptPredictionMutation.mutate(true)}
            replace={() => acceptPredictionMutation.mutate(false)}
            userAnnotationsExist={userAnnotationsExist}
            hideMerge={isSingleClassificationProject}
            variant='cta'
            isDisabled={acceptPredictionMutation.isLoading}
            styles={styles}
        >
            {acceptPredictionMutation.isLoading ? <LoadingIndicator size='S' marginEnd='size-100' /> : <></>}
            {children}
        </PredictionButton>
    );
};
