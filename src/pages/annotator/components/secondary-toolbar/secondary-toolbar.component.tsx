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

import { ButtonGroup, Divider, Flex, Tooltip, TooltipTrigger, View } from '@adobe/react-spectrum';

import { getAnnotationStateForTask } from '../../../../core/annotations';
import { MEDIA_ANNOTATION_STATUS } from '../../../../core/media';
import { DOMAIN } from '../../../../core/projects';
import { useProject } from '../../../project-details/providers';
import { ANNOTATOR_MODE } from '../../core';
import { useAnnotator, useDataset, usePrediction, useSubmitAnnotations } from '../../providers';
import { useSelectMediaItemWithSaveConfirmation } from '../../providers/submit-annotations-provider/use-select-media-item-with-save-confirmation.hook';
import { shouldSaveAnnotations } from '../../providers/submit-annotations-provider/utils';
import { ToolAnnotationContextProps } from '../../tools/tools.interface';
import useActiveTool from '../../tools/use-active-tool';
import { PredictionButton } from '../sidebar/prediction-accordion/prediction-button.component';
import { NextMediaItemButton } from './next-media-item-button.component';
import { PredictionSecondaryToolbar } from './prediction-secondary-toolbar.component';
import { PreviousMediaItemButton } from './previous-media-item-button.component';
import { SubmitButton } from './submit-button.component';

export const SecondaryToolbar = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const activeTool = useActiveTool(annotationToolContext);
    const { submitAnnotationsMutation } = useSubmitAnnotations();
    const { selectedMediaItem, setSelectedMediaItem, mode } = useAnnotator();
    const { editPrediction, userAnnotationsExist } = usePrediction();

    const selectWithSavingConfirmation = useSelectMediaItemWithSaveConfirmation();

    const { isInActiveMode } = useDataset();
    const { isSingleDomainProject } = useProject();

    const isSingleClassificationProject = isSingleDomainProject(DOMAIN.CLASSIFICATION);
    const hasLabelsToRevisit =
        getAnnotationStateForTask(selectedMediaItem?.annotationStatePerTask) === MEDIA_ANNOTATION_STATUS.TO_REVISIT;

    const submit = submitAnnotationsMutation;

    const shouldSave =
        shouldSaveAnnotations(selectedMediaItem, annotationToolContext.scene.annotations) || hasLabelsToRevisit;
    const isPredictionMode = mode === ANNOTATOR_MODE.PREDICTION;
    const hasNoPredictions = !annotationToolContext.scene.annotations.length;

    return (
        <View
            backgroundColor='gray-100'
            height='size-600'
            paddingX='size-100'
            gridArea='secondaryToolbar'
            id={'annotator-subheader'}
        >
            <Flex
                height='100%'
                alignItems='center'
                justifyContent='space-between'
                UNSAFE_style={{ whiteSpace: 'nowrap' }}
            >
                {annotationToolContext.mode === ANNOTATOR_MODE.ANNOTATION && activeTool !== undefined ? (
                    <activeTool.SecondaryToolbar annotationToolContext={annotationToolContext} />
                ) : (
                    <PredictionSecondaryToolbar annotationToolContext={annotationToolContext} />
                )}
                <ButtonGroup marginStart='auto'>
                    <Divider
                        size='S'
                        orientation='vertical'
                        UNSAFE_style={{ backgroundColor: 'var(--spectrum-global-color-gray-50)' }}
                    />
                    <TooltipTrigger delay={200}>
                        <PreviousMediaItemButton
                            selectMediaItem={selectWithSavingConfirmation}
                            selectedMediaItem={selectedMediaItem}
                        />
                        <Tooltip>Go to the previous image from {isInActiveMode ? 'Active set' : 'Dataset'}</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger delay={200}>
                        <NextMediaItemButton
                            selectMediaItem={selectWithSavingConfirmation}
                            selectedMediaItem={selectedMediaItem}
                        />
                        <Tooltip>Go to the next image from {isInActiveMode ? 'Active set' : 'Dataset'}</Tooltip>
                    </TooltipTrigger>

                    {isPredictionMode ? (
                        <TooltipTrigger delay={200} placement='bottom'>
                            <PredictionButton
                                id='edit-predictions'
                                merge={() => editPrediction(true)}
                                replace={() => editPrediction(false)}
                                userAnnotationsExist={userAnnotationsExist}
                                hideMerge={isSingleClassificationProject}
                                variant='secondary'
                                styles={{ marginLeft: 'var(--spectrum-global-dimension-size-25)' }}
                                isDisabled={hasNoPredictions}
                            >
                                Edit
                            </PredictionButton>
                            <Tooltip>Edit exports accepted annotation into the annotation mode.</Tooltip>
                        </TooltipTrigger>
                    ) : null}
                    {/* TODO: switch between Submit and Accept button */}
                    <TooltipTrigger delay={200} placement='bottom'>
                        <SubmitButton
                            selectMediaItem={setSelectedMediaItem}
                            selectedMediaItem={selectedMediaItem}
                            submit={submit}
                            canSubmit={shouldSave}
                            styles={{ marginLeft: 'var(--spectrum-global-dimension-size-175)' }}
                        />
                        <Tooltip>
                            Submit and go to the next unannotated image from {isInActiveMode ? 'Active set' : 'Dataset'}
                        </Tooltip>
                    </TooltipTrigger>
                </ButtonGroup>
            </Flex>
        </View>
    );
};
