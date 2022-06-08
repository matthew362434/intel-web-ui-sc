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

import { ReactNode, useEffect } from 'react';

import { AnnotationService, PredictionService } from '../../core/annotations';
import { MediaService } from '../../core/media/services/media-service.interface';
import { isAnomalyDomain } from '../../core/projects/domains';
import { useWorker } from '../../hooks/use-worker/use-worker.hook';
import { ErrorBoundary } from '../errors/error-boundary.component';
import { MediaProvider } from '../media/providers';
import { useProject } from '../project-details/providers';
import { ShowConfirmationDialogBeforeNavigation } from './components/submit-annotations/show-confirmation-dialog-before-navigation.component';
import { useDatasetIdentifier } from './hooks/use-dataset-identifier.hook';
import { AnnotationToolProvider, AnnotatorProvider } from './providers';
import { DatasetProvider } from './providers/dataset-provider/dataset-provider.component';
import { SelectedMediaItemProvider } from './providers/selected-media-item-provider/selected-media-item-provider.component';
import { TaskProvider } from './providers/task-provider/task-provider.component';
import { SyncZoomState, SyncZoomTarget, ZoomProvider } from './zoom';

interface AnnotatorProps {
    children: ReactNode;
    mediaService: MediaService;
    annotationService: AnnotationService;
    predictionService: PredictionService;
}

export const Annotator = ({
    mediaService,
    annotationService,
    predictionService,
    children,
}: AnnotatorProps): JSX.Element => {
    const datasetIdentifier = useDatasetIdentifier();
    const { terminateWorkers } = useWorker();
    const { isSingleDomainProject } = useProject();
    const isActiveMode = !isSingleDomainProject(isAnomalyDomain);

    useEffect(() => {
        return () => {
            terminateWorkers();
        };
    }, [terminateWorkers]);

    return (
        <MediaProvider mediaService={mediaService} datasetIdentifier={datasetIdentifier}>
            <ZoomProvider>
                <TaskProvider>
                    <DatasetProvider
                        datasetIdentifier={datasetIdentifier}
                        mediaService={mediaService}
                        isActiveMode={isActiveMode}
                    >
                        <SelectedMediaItemProvider
                            annotationService={annotationService}
                            predictionService={predictionService}
                        >
                            <SyncZoomState />
                            <SyncZoomTarget />
                            <ErrorBoundary>
                                <AnnotatorProvider
                                    annotationService={annotationService}
                                    predictionService={predictionService}
                                >
                                    <AnnotationToolProvider>
                                        <ShowConfirmationDialogBeforeNavigation />
                                        {children}
                                    </AnnotationToolProvider>
                                </AnnotatorProvider>
                            </ErrorBoundary>
                        </SelectedMediaItemProvider>
                    </DatasetProvider>
                </TaskProvider>
            </ZoomProvider>
        </MediaProvider>
    );
};
