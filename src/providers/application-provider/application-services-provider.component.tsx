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

import { createContext, ReactNode, useContext, useMemo } from 'react';

import {
    AnnotationService,
    createApiAnnotationService,
    createApiPredictionService,
    createInMemoryAnnotationService,
    createInmemoryPredictionService,
    PredictionService,
} from '../../core/annotations';
import { createApiMediaService, createInMemoryMediaService } from '../../core/media/services';
import { MediaService } from '../../core/media/services/media-service.interface';
import { createApiProjectService, createInMemoryProjectService, ProjectService } from '../../core/projects';
import { createApiUserService, createInMemoryUserRegistrationService, UserService } from '../../core/user/services';
import { createApiDatasetImportService } from '../../pages/landing-page/components/landing-page-workspace/components/dataset-import/api-dataset-import-service';
import { DatasetImportService } from '../../pages/landing-page/components/landing-page-workspace/components/dataset-import/dataset-import.interface';
import { createInMemoryDatasetImportService } from '../../pages/landing-page/components/landing-page-workspace/components/dataset-import/dataset-import.memory.service';
import { MissingProviderError } from '../../shared/missing-provider-error';

export interface ApplicationServicesContextProps {
    annotationService: AnnotationService;
    predictionService: PredictionService;
    mediaService: MediaService;
    projectService: ProjectService;
    userService: UserService;
    useInMemoryEnvironment: boolean;
    datasetImportService: DatasetImportService;
}

interface ApplicationServicesProviderProps extends Partial<ApplicationServicesContextProps> {
    children: ReactNode;
    useInMemoryEnvironment: boolean;
}

const ApplicationServiceContext = createContext<ApplicationServicesContextProps | undefined>(undefined);

// The ApplicationServicesProvider (should) hosts all services we use in our application
// this allows us to have one place where we can configure the app to use real apis,
// or to use an inmemory service instead.
// Additionally, we may use this in our tests to overwrite a service's behavior, for example:
//
// render(
//     <ApplicationServicesProvider mediaService={myCustomMediaService}>
//         <YourComponentUsingMediaService />
//     </ApplicationServicesProvider>
// )
export const ApplicationServicesProvider = ({
    children,
    useInMemoryEnvironment = false,
    ...mockedServices
}: ApplicationServicesProviderProps): JSX.Element => {
    const services = useMemo((): ApplicationServicesContextProps => {
        if (useInMemoryEnvironment) {
            return {
                projectService: createInMemoryProjectService(),
                annotationService: createInMemoryAnnotationService(),
                predictionService: createInmemoryPredictionService(),
                mediaService: createInMemoryMediaService(),
                userService: createInMemoryUserRegistrationService(),
                useInMemoryEnvironment,
                datasetImportService: createInMemoryDatasetImportService(),
            };
        }

        return {
            projectService: createApiProjectService(),
            annotationService: createApiAnnotationService(),
            predictionService: createApiPredictionService(),
            mediaService: createApiMediaService(),
            userService: createApiUserService(),
            useInMemoryEnvironment,
            datasetImportService: createApiDatasetImportService(),
        };
    }, [useInMemoryEnvironment]);

    // We overwrite any services that were explicitly passed in to the ApplicationServiceProvider
    // this allows us to overwrite the services' behavior in our tests
    const value = { ...services, ...mockedServices };

    return <ApplicationServiceContext.Provider value={value}>{children}</ApplicationServiceContext.Provider>;
};

export const useApplicationServices = (): ApplicationServicesContextProps => {
    const context = useContext(ApplicationServiceContext);

    if (context === undefined) {
        throw new MissingProviderError('useApplicationServices', 'ApplicationServiceProvider');
    }

    return context;
};
