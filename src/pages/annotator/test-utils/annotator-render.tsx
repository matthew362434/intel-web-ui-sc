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

import { ReactElement, ReactNode } from 'react';

import { RenderOptions, RenderResult } from '@testing-library/react';

import {
    AnnotationService,
    createInMemoryAnnotationService,
    createInmemoryPredictionService,
    PredictionService,
} from '../../../core/annotations';
import { createInMemoryMediaService } from '../../../core/media/services';
import { MediaService } from '../../../core/media/services/media-service.interface';
import { DatasetIdentifier, ProjectIdentifier } from '../../../core/projects';
import { ApplicationProvider } from '../../../providers';
import { ApplicationServicesContextProps } from '../../../providers/application-provider/application-services-provider.component';
import { providersRender } from '../../../test-utils';
import { ProjectProvider } from '../../project-details/providers';
import { AnnotatorProvider, DatasetProvider, TaskProvider } from '../providers';
import { SelectedMediaItemProvider } from '../providers/selected-media-item-provider/selected-media-item-provider.component';

interface AnnotatorProvidersProps {
    children?: ReactNode;
    datasetIdentifier: DatasetIdentifier;
    annotationService: AnnotationService;
    predictionService: PredictionService;
    mediaService: MediaService;
}

export const AnnotatorProviders = ({
    children,
    datasetIdentifier,
    annotationService,
    predictionService,
    mediaService,
}: AnnotatorProvidersProps): JSX.Element => {
    return (
        <ProjectProvider projectIdentifier={datasetIdentifier}>
            <TaskProvider>
                <DatasetProvider datasetIdentifier={datasetIdentifier} mediaService={mediaService}>
                    <SelectedMediaItemProvider
                        annotationService={annotationService}
                        predictionService={predictionService}
                    >
                        <AnnotatorProvider annotationService={annotationService} predictionService={predictionService}>
                            {children}
                        </AnnotatorProvider>
                    </SelectedMediaItemProvider>
                </DatasetProvider>
            </TaskProvider>
        </ProjectProvider>
    );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {
    projectIdentifier?: ProjectIdentifier;
    datasetIdentifier?: DatasetIdentifier;
    services?: Partial<ApplicationServicesContextProps>;
}

const customRender = (
    ui: ReactElement,
    options: CustomRenderOptions = {
        projectIdentifier: { workspaceId: 'test-workspace', projectId: '1' },
        services: {
            annotationService: createInMemoryAnnotationService(),
            predictionService: createInmemoryPredictionService(),
            mediaService: createInMemoryMediaService(),
        },
    }
): RenderResult => {
    const projectIdentifier = options.projectIdentifier ?? { workspaceId: 'test-workspace', projectId: '1' };
    const datasetIdentifier = options.datasetIdentifier ?? { ...projectIdentifier, datasetId: 'test' };

    const wrappedByAnnotatorProviders = (
        <ApplicationProvider>
            <AnnotatorProviders
                datasetIdentifier={datasetIdentifier}
                annotationService={options.services?.annotationService ?? createInMemoryAnnotationService()}
                predictionService={options.services?.predictionService ?? createInmemoryPredictionService()}
                mediaService={options.services?.mediaService ?? createInMemoryMediaService()}
            >
                {ui}
            </AnnotatorProviders>
        </ApplicationProvider>
    );

    return providersRender(wrappedByAnnotatorProviders, options);
};

// override render method
export { customRender as annotatorRender };
