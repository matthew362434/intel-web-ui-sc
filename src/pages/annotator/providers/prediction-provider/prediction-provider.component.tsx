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

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';

import { useMutation, UseMutationResult } from 'react-query';

import { Annotation } from '../../../../core/annotations';
import { PredictionMap } from '../../../../core/annotations/prediction.interface';
import { DOMAIN } from '../../../../core/projects';
import { isClassificationDomain } from '../../../../core/projects/domains';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { useProject } from '../../../project-details/providers';
import { AnnotationScene, ANNOTATOR_MODE } from '../../core';
import { useAnnotator, useTask } from '../../providers';
import { useTaskChain } from '../task-chain-provider/task-chain-provider.component';
import { TaskChainInput } from '../task-chain-provider/task-chain.interface';
import { getSceneInputs } from '../task-chain-provider/use-scene-inputs.hook';
import { useTaskChainOutput } from '../task-chain-provider/use-task-chain-output.hook';
import { getPreviousTask } from '../task-chain-provider/utils';
import { useMergeAnnotations } from './use-merge-annotations.hook';
import { usePredictionFilter } from './utils';

const INFERENCE_MAP_DEFAULT_OPACITY = 50;

export interface PredictionContextProps {
    maps: PredictionMap[];
    userAnnotationsExist: boolean;
    scoreThreshold: number;
    isInferenceMapVisible: boolean;
    inferenceMapOpacity: number;
    selectedInferenceMap: PredictionMap | undefined;
    setScoreThreshold: (threshold: number) => void;
    acceptPrediction: (merge: boolean) => void;
    editPrediction: (merge: boolean) => void;
    acceptAnnotation: (annotionId: string) => void;
    rejectAnnotation: (annotionId: string) => void;
    isRejected: (annotionId: string) => boolean;
    refresh: UseMutationResult<void, unknown, void, unknown>;
    setInferenceMapVisible: Dispatch<SetStateAction<boolean>>;
    setInferenceMapOpacity: Dispatch<SetStateAction<number>>;
    setSelectedInferenceMap: Dispatch<SetStateAction<PredictionMap | undefined>>;
}

const PredictionContext = createContext<PredictionContextProps | undefined>(undefined);

// TODO: this should be changed so that it is based on task chain:
// - If there are no inputs, then check if there exists any user annotations
// - If there are inputs, check if the selected prediction input exists in user space
// and check if it has annotations
const useUserAnnotationsExists = (
    userAnnotationScene: AnnotationScene,
    userInputs: ReadonlyArray<TaskChainInput>,
    selectedInputs: ReadonlyArray<TaskChainInput>
) => {
    const { isSingleDomainProject } = useProject();

    if (userInputs.length === 0) {
        const userAnnotations = userAnnotationScene.annotations;

        // For classification projects we add an empty annotation when loading a media item,
        // since this is not a user provided annotation we should ignore it
        const isSingleClassificationProject = isSingleDomainProject(DOMAIN.CLASSIFICATION);

        const userAnnotationsExist = isSingleClassificationProject
            ? userAnnotations.some(({ labels: classificationLabels }) => classificationLabels.length > 0)
            : userAnnotations.length > 0;

        return userAnnotationsExist;
    }

    // Determine if the input have any output
    const relevantUserInputs = userInputs.filter(({ id }) => {
        return selectedInputs.some((input) => input.id === id);
    });

    return relevantUserInputs.flatMap(({ outputs }) => outputs).length > 0;
};

const useApplyPredictions = (
    userAnnotationScene: AnnotationScene,
    predictionAnnotationScene: AnnotationScene,
    isRejected: (annotationId: string) => boolean
) => {
    const { selectedTask, tasks } = useTask();
    const { inputs: userInputs } = useMemo(
        () => getSceneInputs(userAnnotationScene, tasks, selectedTask),
        [userAnnotationScene, tasks, selectedTask]
    );
    const { inputs } = useTaskChain();
    const selectedInputs = inputs.filter(({ isSelected }) => isSelected);

    const userAnnotationsExist = useUserAnnotationsExists(userAnnotationScene, userInputs, selectedInputs);
    const annotations = useTaskChainOutput({ tasks, selectedTask });

    const replaceAnnotations = (
        predictionAnnotations: ReadonlyArray<Annotation>,
        userAnnotations: ReadonlyArray<Annotation>
    ) => {
        // HACK: Temporary hack to fix predictions for classification projects
        if (tasks.length === 1 && selectedTask !== null && isClassificationDomain(selectedTask.domain)) {
            // In case of single classification projects we always want to replace the "artificial" annotation we make
            // when loading a new media item
            return [...predictionAnnotations];
        }

        // When the user is not in a task chain, or the first task in a task chain,
        // we replace all of its existing annotations as no input is selected
        if (inputs.length === 0) {
            return [...predictionAnnotations];
        }

        // replace the user's annotations, filtered by the output of the current input
        const userOutputsForTheseInputs = selectedInputs.flatMap((input) => {
            const userInput = userInputs.find(({ id }) => id === input.id);

            if (userInput === undefined) {
                return [];
            }

            return userInput.outputs;
        });

        // Remove all user's annotations that belong to this input
        const filteredUserAnnotations = userAnnotations.filter((annotation) => {
            return !userOutputsForTheseInputs.some(({ id }) => id === annotation.id);
        });

        // Always include the selected inputs into the merged annotations,
        // we don't want their associated outputs to be stored into the annotation scene
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const missingInputAnnotations = selectedInputs.map(({ outputs, ...annotation }) => annotation);

        // For detection -> classification tasks we need to merge the predition annotations with the user's annotations
        // as the prediction annotations from classification replace the labels on the detection annotations
        return mergeAnnotations(predictionAnnotations, [...filteredUserAnnotations, ...missingInputAnnotations]);
    };

    const mergeAnnotations = useMergeAnnotations();

    const previousTask = getPreviousTask({ tasks }, selectedTask);
    const applyPredictions = (merge: boolean) => {
        // Only merge annotations that are not rejected (either manually or via the score filter),
        // and that are in the currently selected input's outputs
        const acceptedAnnotations = annotations.filter((annotation) => {
            if (isRejected(annotation.id)) {
                return false;
            }

            if (previousTask === undefined) {
                return true;
            }

            return selectedInputs.some(({ outputs }) => {
                return outputs.some(({ id }) => id === annotation.id);
            });
        });

        const userAnnotations = userAnnotationScene.annotations;

        if (merge) {
            // Always include the selected inputs into the merged annotations,
            // we don't want their associated outputs to be stored into the annotation scene
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const missingInputAnnotations = selectedInputs.map(({ outputs, ...annotation }) => annotation);

            return mergeAnnotations(acceptedAnnotations, [...userAnnotations, ...missingInputAnnotations]);
        }

        return replaceAnnotations(acceptedAnnotations, userAnnotations);
    };

    return {
        userAnnotationsExist,
        applyPredictions,
    };
};

interface PredictionProviderProps {
    saveAnnotations: (annotations: ReadonlyArray<Annotation>) => Promise<void>;
    children: ReactNode;
    maps: PredictionMap[];
    refreshPredictions: () => Promise<void>;
    initialPredictionAnnotations: ReadonlyArray<Annotation>;
    userAnnotationScene: AnnotationScene;
    predictionAnnotationScene: AnnotationScene;
}

export const PredictionProvider = ({
    children,
    initialPredictionAnnotations,
    userAnnotationScene,
    predictionAnnotationScene,
    saveAnnotations,
    maps,
    refreshPredictions,
}: PredictionProviderProps): JSX.Element => {
    const { setMode } = useAnnotator();

    const [isInferenceMapVisible, setInferenceMapVisible] = useState<boolean>(false);
    const [inferenceMapOpacity, setInferenceMapOpacity] = useState<number>(INFERENCE_MAP_DEFAULT_OPACITY);
    const [selectedInferenceMap, setSelectedInferenceMap] = useState<PredictionMap | undefined>(undefined);

    useEffect(() => {
        setSelectedInferenceMap(!!maps?.length ? maps[0] : undefined);
        setInferenceMapOpacity(INFERENCE_MAP_DEFAULT_OPACITY);
        setInferenceMapVisible(false);
    }, [maps]);

    const [rejectedAnnotations, acceptAnnotation, rejectAnnotation, scoreThreshold, setScoreThreshold] =
        usePredictionFilter(initialPredictionAnnotations, predictionAnnotationScene);

    const isRejected = (annotationId: string) => {
        return rejectedAnnotations.includes(annotationId);
    };

    const { applyPredictions, userAnnotationsExist } = useApplyPredictions(
        userAnnotationScene,
        predictionAnnotationScene,
        isRejected
    );

    const acceptPrediction = async (merge = false) => {
        const newAnnotations = applyPredictions(merge);

        userAnnotationScene.replaceAnnotations(newAnnotations);

        await saveAnnotations(newAnnotations);
    };

    const editPrediction = async (merge = false) => {
        const newAnnotations = applyPredictions(merge);

        // NOTE: edit should select the current input
        userAnnotationScene.replaceAnnotations(newAnnotations);

        setMode(ANNOTATOR_MODE.ANNOTATION);
    };

    const refresh = useMutation({
        mutationFn: refreshPredictions,
    });

    return (
        <PredictionContext.Provider
            value={{
                maps,
                userAnnotationsExist,
                scoreThreshold,
                isInferenceMapVisible,
                selectedInferenceMap,
                inferenceMapOpacity,
                setInferenceMapVisible,
                setSelectedInferenceMap,
                setInferenceMapOpacity,
                setScoreThreshold,
                acceptAnnotation,
                rejectAnnotation,
                refresh,
                isRejected,
                editPrediction,
                acceptPrediction,
            }}
        >
            {children}
        </PredictionContext.Provider>
    );
};

export const usePrediction = (): PredictionContextProps => {
    const context = useContext(PredictionContext);

    if (context === undefined) {
        throw new MissingProviderError('usePrediction', 'PredictionProvider');
    }

    return context;
};
