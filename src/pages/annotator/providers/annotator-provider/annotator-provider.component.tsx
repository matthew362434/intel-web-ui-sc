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

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { UseQueryResult } from 'react-query';

import { Annotation, AnnotationService, PredictionService } from '../../../../core/annotations';
import { PredictionMap } from '../../../../core/annotations/prediction.interface';
import { isVideoFrame, MediaItem, SelectedMediaItem, VideoFrame } from '../../../../core/media';
import { Task } from '../../../../core/projects';
import { usePrevious } from '../../../../hooks/use-previous/use-previous.hook';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { UseSettings, useSettings } from '../../../../shared/components/header/settings/use-settings.hook';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { useProject } from '../../../project-details/providers';
import { VideoPlayerProvider } from '../../components/video-player/video-player-provider.component';
import { ANNOTATOR_MODE, ToolType } from '../../core';
import { useHotkeysConfiguration } from '../../hooks/use-hotkeys-configuration.hook';
import UndoRedoProvider from '../../tools/undo-redo/undo-redo-provider.component';
import { AnnotationSceneContext } from '../annotation-scene-provider/annotation-scene-provider.component';
import { useAnnotationSceneState } from '../annotation-scene-provider/use-annotation-scene-state.hook';
import { useDataset } from '../dataset-provider/dataset-provider.component';
import { PredictionProvider } from '../prediction-provider/prediction-provider.component';
import { useRefreshPredictions } from '../prediction-provider/use-refresh-predictions.hook';
import { useSelectedMediaItem } from '../selected-media-item-provider/selected-media-item-provider.component';
import { SubmitAnnotationsProvider } from '../submit-annotations-provider/submit-annotations-provider.component';
import { useSelectMediaItemWithSaveConfirmation } from '../submit-annotations-provider/use-select-media-item-with-save-confirmation.hook';
import { TaskChainProvider } from '../task-chain-provider/task-chain-provider.component';
import { useTask } from '../task-provider/task-provider.component';
import { defaultToolForProject, HotKeys, useAnnotatorMode } from './utils';

export interface AnnotatorContextProps {
    mode: ANNOTATOR_MODE;
    setMode: (mode: ANNOTATOR_MODE) => void;
    selectedMediaItem?: SelectedMediaItem;
    setSelectedMediaItem: (media: MediaItem) => void;
    selectedMediaItemQuery: UseQueryResult<SelectedMediaItem>;
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void;
    hotKeys: HotKeys;
    settings: UseSettings;
}

export const useActiveTool = (mode: ANNOTATOR_MODE) => {
    const { activeDomains } = useTask();

    const [activeTool, setActiveTool] = useState(defaultToolForProject(activeDomains));

    useEffect(() => {
        if (mode === ANNOTATOR_MODE.PREDICTION) {
            setActiveTool(ToolType.SelectTool);
        } else {
            setActiveTool(defaultToolForProject(activeDomains));
        }
    }, [mode, activeDomains]);

    return [activeTool, setActiveTool] as const;
};

const useSaveAutomaticallyWhenUserSwitchesTaskInAnnotationMode = (
    saveAnnotations: (annotations: ReadonlyArray<Annotation>) => Promise<void>,
    annotations: ReadonlyArray<Annotation>,
    containsChanges: boolean
) => {
    const { selectedTask } = useTask();
    const previousSelectedTask = usePrevious(selectedTask);
    const { optimisticallyUpdateAnnotationStatus } = useDataset();
    const { selectedMediaItemQuery, selectedMediaItem } = useSelectedMediaItem();
    const previousMediaItemIdentifier = usePrevious(selectedMediaItem?.identifier);
    const { addNotification } = useNotification();

    useEffect(() => {
        if (previousSelectedTask === undefined || previousSelectedTask === selectedTask) {
            return;
        }

        if (selectedMediaItem === undefined) {
            return;
        }

        // We don't want to overwrite annotations of another media item
        if (previousMediaItemIdentifier !== selectedMediaItem.identifier) {
            return;
        }

        // NOTE: this silently saves the annotations, if we receive any errors we ignore them
        if (containsChanges) {
            // NOTE: to fix a race condition we do this optimistic update before saving,
            // even if saving fails.
            // This solves an issue where switching between tasks leads to unexpected behavior
            // (like showing the pverious annotations as an input)
            optimisticallyUpdateAnnotationStatus(selectedMediaItem, annotations);
            selectedMediaItemQuery.remove();

            const taskToTitle = (task: Task | null) => (task === null ? 'All Tasks' : task.title);

            saveAnnotations(annotations).catch(() => {
                addNotification(
                    `Could not save annotations when switching from '${taskToTitle(
                        previousSelectedTask
                    )}' to '${taskToTitle(selectedTask)}'. Please make sure that all objects have labels.`,
                    NOTIFICATION_TYPE.INFO
                );
            });
        }
    }, [
        previousSelectedTask,
        selectedTask,
        saveAnnotations,
        annotations,
        containsChanges,
        selectedMediaItem,
        previousMediaItemIdentifier,
        optimisticallyUpdateAnnotationStatus,
        selectedMediaItemQuery,
        addNotification,
    ]);
};

const AnnotatorContext = createContext<AnnotatorContextProps | undefined>(undefined);

interface AnnotatorProviderProps {
    children: ReactNode;
    annotationService: AnnotationService;
    predictionService: PredictionService;
}

const EMPTY_ANNOTATIONS: ReadonlyArray<Annotation> = [];
const EMPTY_MAPS: PredictionMap[] = [];

export const AnnotatorProvider = ({
    annotationService,
    predictionService,
    children,
}: AnnotatorProviderProps): JSX.Element => {
    const { project } = useProject();
    const { datasetIdentifier, optimisticallyUpdateAnnotationStatus } = useDataset();
    const { tasks, selectedTask, defaultLabel } = useTask();
    const settings = useSettings();

    const { selectedMediaItem, setSelectedMediaItem, selectedMediaItemQuery } = useSelectedMediaItem();

    const hotKeys = useHotkeysConfiguration();

    const saveAnnotations = async (annotations: ReadonlyArray<Annotation>) => {
        if (selectedMediaItem !== undefined) {
            const { annotation_state_per_task: annotationStates } = await annotationService.saveAnnotations(
                datasetIdentifier,
                selectedMediaItem,
                annotations
            );

            optimisticallyUpdateAnnotationStatus(selectedMediaItem, annotations, annotationStates);
        }
    };

    const labels = project.labels;
    const refreshPredictions = useRefreshPredictions();

    const { undoRedoActions: userUndoRedoActions, ...userAnnotationScene } = useAnnotationSceneState(
        selectedMediaItem?.annotations || EMPTY_ANNOTATIONS,
        labels
    );

    const initialPredictionAnnotations = selectedMediaItem?.predictions?.annotations || EMPTY_ANNOTATIONS;
    const { undoRedoActions: predictionUndoRedoActions, ...predictionScene } = useAnnotationSceneState(
        initialPredictionAnnotations,
        labels
    );

    const [mode, setMode] = useAnnotatorMode(selectedMediaItem, userAnnotationScene);
    const [activeTool, setActiveTool] = useActiveTool(mode);

    // Save when the user is in annotation mode and switches tasks
    useSaveAutomaticallyWhenUserSwitchesTaskInAnnotationMode(
        saveAnnotations,
        userAnnotationScene.annotations,
        userUndoRedoActions.canUndo
    );

    const scene = mode === ANNOTATOR_MODE.ANNOTATION ? userAnnotationScene : predictionScene;
    const undoRedoActions = mode === ANNOTATOR_MODE.ANNOTATION ? userUndoRedoActions : predictionUndoRedoActions;

    return (
        <AnnotatorContext.Provider
            value={{
                mode,
                setMode,
                selectedMediaItem,
                setSelectedMediaItem,
                selectedMediaItemQuery,
                activeTool,
                setActiveTool,
                hotKeys,
                settings,
            }}
        >
            <AnnotationSceneContext.Provider value={scene}>
                <UndoRedoProvider state={undoRedoActions}>
                    <SubmitAnnotationsProvider
                        annotations={userAnnotationScene.annotations}
                        saveAnnotations={saveAnnotations}
                        currentMediaItem={selectedMediaItem}
                    >
                        <MediaItemProvider
                            selectedMediaItem={selectedMediaItem}
                            annotationService={annotationService}
                            predictionService={predictionService}
                        >
                            <TaskChainProvider tasks={tasks} selectedTask={selectedTask} defaultLabel={defaultLabel}>
                                <PredictionProvider
                                    initialPredictionAnnotations={initialPredictionAnnotations}
                                    userAnnotationScene={userAnnotationScene}
                                    predictionAnnotationScene={predictionScene}
                                    saveAnnotations={saveAnnotations}
                                    maps={selectedMediaItem?.predictions?.maps || EMPTY_MAPS}
                                    refreshPredictions={refreshPredictions}
                                >
                                    {children}
                                </PredictionProvider>
                            </TaskChainProvider>
                        </MediaItemProvider>
                    </SubmitAnnotationsProvider>
                </UndoRedoProvider>
            </AnnotationSceneContext.Provider>
        </AnnotatorContext.Provider>
    );
};

const MediaItemProvider = ({
    children,
    selectedMediaItem,
    annotationService,
    predictionService,
}: {
    selectedMediaItem: undefined | SelectedMediaItem;
    children: ReactNode;
    annotationService: AnnotationService;
    predictionService: PredictionService;
}): JSX.Element => {
    const selectWithSavingConfirmation = useSelectMediaItemWithSaveConfirmation();
    const { setSelectedMediaItem } = useAnnotator();

    if (selectedMediaItem !== undefined && isVideoFrame(selectedMediaItem)) {
        const selectVideoFrame = async (videoFrame: VideoFrame, showConfirmation = true) => {
            if (showConfirmation) {
                await selectWithSavingConfirmation(videoFrame);
            } else {
                setSelectedMediaItem(videoFrame);
            }
        };
        return (
            <VideoPlayerProvider
                videoFrame={selectedMediaItem}
                selectVideoFrame={selectVideoFrame}
                annotationService={annotationService}
                predictionService={predictionService}
            >
                {children}
            </VideoPlayerProvider>
        );
    }

    return <>{children}</>;
};

export const useAnnotator = (): AnnotatorContextProps => {
    const context = useContext(AnnotatorContext);

    if (context === undefined) {
        throw new MissingProviderError('useAnnotator', 'AnnotatorProvider');
    }

    return context;
};
