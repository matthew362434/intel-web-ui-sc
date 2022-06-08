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

import { createContext, useContext, useState, ReactNode } from 'react';

import { Annotation, AnnotationService, PredictionService } from '../../../../core/annotations';
import { VideoFrame } from '../../../../core/media';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { useProject } from '../../../project-details/providers/';
import { useAnnotationScene, useDataset } from '../../providers';
import {
    useAvailableVideoFrames,
    useSelectVideoFrame,
    useVideoControls,
    UsePropagateAnnotations,
    usePropagateAnnotations,
    UseVideoEditor,
    useVideoEditor,
} from './hooks';
import { useStep } from './hooks/use-step.hook';
import { VideoControls } from './video-controls/video-controls.interface';

interface VideoPlayerContextProps {
    videoFrames: VideoFrame[];
    videoFrame: VideoFrame;
    videoControls: VideoControls;
    isInActiveMode: boolean;
    setIsInActiveMode: (isInActiveMode: boolean) => void;
    step: number;
    setStep: (step: number) => void;
    propagateAnnotations: UsePropagateAnnotations;
    videoEditor: UseVideoEditor;
}
const VideoPlayerContext = createContext<VideoPlayerContextProps | undefined>(undefined);

interface VideoPlayerProviderProps {
    children: ReactNode;
    videoFrame: VideoFrame;
    selectVideoFrame: (videoFrame: VideoFrame, showConfirmation?: boolean) => Promise<void>;
    annotationService: AnnotationService;
    predictionService: PredictionService;
}

export const VideoPlayerProvider = ({
    children,
    videoFrame,
    selectVideoFrame,
    annotationService,
    predictionService,
}: VideoPlayerProviderProps): JSX.Element => {
    const { isInActiveMode: datasetIsInActiveMode } = useDataset();
    const [isInActiveMode, setIsInActiveMode] = useState(datasetIsInActiveMode);
    const [step, setStep] = useStep(videoFrame);

    const videoFrames = useAvailableVideoFrames(videoFrame, step, isInActiveMode);
    const selectFrame = useSelectVideoFrame(videoFrames, selectVideoFrame);

    // If the currently selected video frame is not part of the available video frames,
    // we will try to select the closest video frame
    // This allows us to easily switch between dataset and active dataset
    const videoControls = useVideoControls(
        selectFrame,
        videoFrame,
        videoFrames,
        step,
        annotationService,
        isInActiveMode
    );

    const { project } = useProject();
    const { datasetIdentifier } = useDataset();
    const { annotations } = useAnnotationScene();

    const { optimisticallyUpdateAnnotationStatus } = useDataset();

    const getAnnotations = async (mediaItem: VideoFrame) => {
        return await annotationService.getAnnotations(datasetIdentifier, project.labels, mediaItem);
    };

    const saveAnnotations = async (mediaItem: VideoFrame, newAnnotations: ReadonlyArray<Annotation>) => {
        await annotationService.saveAnnotations(datasetIdentifier, mediaItem, newAnnotations);

        optimisticallyUpdateAnnotationStatus(mediaItem, newAnnotations);
    };

    const propagateAnnotations = usePropagateAnnotations(
        videoControls,
        videoFrame,
        videoFrames,
        annotations,
        getAnnotations,
        saveAnnotations
    );

    const videoEditor = useVideoEditor(annotationService, predictionService, datasetIdentifier, videoFrame);

    const value = {
        videoFrames,
        videoFrame,
        videoControls,
        isInActiveMode,
        setIsInActiveMode,
        step,
        setStep,
        propagateAnnotations,
        videoEditor,
    };

    return <VideoPlayerContext.Provider value={value}>{children}</VideoPlayerContext.Provider>;
};

export const useVideoPlayer = (): VideoPlayerContextProps => {
    const context = useContext(VideoPlayerContext);

    if (context === undefined) {
        throw new MissingProviderError('useVideoPlayer', 'VideoPlayerProvider');
    }

    return context;
};

export const useVideoPlayerContext = (): VideoPlayerContextProps | undefined => {
    return useContext(VideoPlayerContext);
};
