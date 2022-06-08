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

import { View } from '@adobe/react-spectrum';
import sortBy from 'lodash/sortBy';

import { DOMAIN } from '../../../../../core/projects';
import { SplitPaneWrapper } from '../../../../../shared/components/splitpane-wrapper/splitpane-wrapper.component';
import { AnnotationListThumbnailGrid } from '../../../annotation/annotation-list/annotation-list-thumbnail-grid/annotation-list-thumbnail-grid.component';
import { PredictionList } from '../../../annotation/prediction-list/prediction-list.component';
import { usePrediction, useTask } from '../../../providers';
import { useTaskChain } from '../../../providers/task-chain-provider/task-chain-provider.component';
import { useTaskChainOutput } from '../../../providers/task-chain-provider/use-task-chain-output.hook';
import { ToolAnnotationContextProps } from '../../../tools/tools.interface';
import { EmptyPredictions } from './empty-predictions.component';
import { PredictionHeader } from './prediction-header.component';
import { SetPredictionScoreThreshold } from './set-prediction-score-threshold.component';

export const PredictionAccordion = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { hoverAnnotation, hideAnnotation, showAnnotation, selectAnnotation, unselectAnnotation } =
        annotationToolContext.scene;
    const { scoreThreshold, setScoreThreshold, isRejected, rejectAnnotation, acceptAnnotation, refresh } =
        usePrediction();

    const { isTaskChainDomainSelected, selectedTask } = useTask();

    const isTaskChainSelectedSegmentation = isTaskChainDomainSelected(DOMAIN.SEGMENTATION);
    const isTaskChainSelectedClassification = isTaskChainDomainSelected(DOMAIN.CLASSIFICATION);

    const { inputs: inputAnnotations } = useTaskChain();
    const outputAnnotations = useTaskChainOutput(annotationToolContext);
    const annotations = sortBy(outputAnnotations, ({ zIndex }) => -zIndex);

    const hasNoPredictions = !annotations.length;
    const withPane = isTaskChainSelectedSegmentation && !!inputAnnotations.length;

    // Disable the threshold if we're on 'All tasks' mode or on a task-chain classification task
    const isPredictionScoreThresholdDisabled = isTaskChainSelectedClassification || !selectedTask;

    const scoreThresholdTooltipDescription = isTaskChainSelectedClassification
        ? 'Filter per score is not applicable in a task-chain project while on a classification task'
        : 'Filter per score is not applicable in "All tasks" mode, you can filter per score only in single task mode';

    const scoreThresholdTooltip = {
        enabled: isPredictionScoreThresholdDisabled,
        description: scoreThresholdTooltipDescription,
    };

    const handleSelectAnnotation = (annotationId: string) => (isSelected: boolean) => {
        if (isSelected) {
            selectAnnotation(annotationId);
        } else {
            unselectAnnotation(annotationId);
        }
    };

    /*
        This HTML layout requires some explanation:
        - If we're on a Classification Task, we will show:
            - View with an Header + PredictionList
        - If we're on a Detection Task, we will show:
            - a View with an Header + Score Threshold + Prediction List
        - If we're on a Segmentation Task, we will show:
            - a View with a Header + SpliPane containing ThumbnailGrid + Score threshold + PredictionList


        The outer grid (auto auto 1fr) handles the layout without the split pane wrapper
        The inner grid (.5f 3fr 1fr) will take care of the second pane for when we do have a split pane wrapper
        
    */

    return (
        <View
            padding='size-150'
            height={'100%'}
            data-testid='prediction-accordion'
            overflow={'hidden'}
            UNSAFE_style={!withPane ? { display: 'grid', gridTemplateRows: 'auto auto 1fr' } : {}}
        >
            <PredictionHeader refresh={refresh} />

            {hasNoPredictions ? (
                <EmptyPredictions />
            ) : (
                <SplitPaneWrapper
                    withPane={withPane}
                    options={{
                        pane2Style: {
                            display: 'grid',
                            gridTemplateRows: '.5fr 3fr 1fr',
                        },
                    }}
                >
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
                        <SetPredictionScoreThreshold
                            scoreThreshold={scoreThreshold}
                            setScoreThreshold={setScoreThreshold}
                            isDisabled={isPredictionScoreThresholdDisabled}
                            tooltip={scoreThresholdTooltip}
                        />
                        <PredictionList
                            annotationToolContext={annotationToolContext}
                            annotations={annotations}
                            isRejected={isRejected}
                            rejectAnnotation={rejectAnnotation}
                            acceptAnnotation={acceptAnnotation}
                            hoverAnnotation={hoverAnnotation}
                            hideAnnotation={hideAnnotation}
                            showAnnotation={showAnnotation}
                        />
                    </>
                </SplitPaneWrapper>
            )}
        </View>
    );
};
