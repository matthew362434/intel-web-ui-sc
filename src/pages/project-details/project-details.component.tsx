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

import { lazy, Suspense } from 'react';

import { Grid, View } from '@adobe/react-spectrum';
import { AxiosError } from 'axios';
import { useErrorHandler } from 'react-error-boundary';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import { MediaService } from '../../core/media/services/media-service.interface';
import { PATHS, ROUTER_PATHS } from '../../core/services';
import { Header, Loading } from '../../shared/components';
import { Annotator, AnnotatorLayout } from '../annotator';
import { useAnnotatorServices } from '../annotator/hooks';
import { useProjectIdentifier } from '../annotator/hooks/use-project-identifier';
import { ProjectSidebar } from './components';
import { ProjectDetailsProps } from './project-details.interface';
import { ProjectProvider, useProject } from './providers';
import { getModelsTaskChainLocation } from './utils';

const ProjectModel = lazy(
    () => import(/* webpackChunkName: "projectModel" */ './components/project-model/project-model.component')
);
const ProjectModels = lazy(
    () =>
        import(
            /* webpackChunkName: "projectModels", webPackPrefetch: true */
            './components/project-models/project-models.component'
        )
);
const ProjectDeployments = lazy(
    () =>
        import(
            './components/project-deployments/project-deployments.component'
            /* webpackChunkName: "projectDeployments" */
        )
);
const ProjectTests = lazy(
    () => import('./components/project-tests/project-tests.component' /* webpackChunkName: "projectTests" */)
);
const ProjectDataset = lazy(
    () => import('./components/project-dataset/project-dataset.component' /* webpackChunkName: "dataset" */)
);

const ProjectDetailsContent = ({
    isAnnotatorRoute,
    mediaService,
}: {
    isAnnotatorRoute: boolean;
    mediaService: MediaService;
}) => {
    const { project, projectStatus, error, isTaskChainProject } = useProject();
    const { annotationService, predictionService } = useAnnotatorServices();
    const { pathname } = useLocation();

    const status = projectStatus?.trainingDetails?.message;

    useErrorHandler((error as AxiosError)?.message ?? null);

    return (
        <>
            {!isAnnotatorRoute && (
                <>
                    <View gridArea='header'>
                        <Header grayscale />
                    </View>
                    <View backgroundColor='gray-75' gridArea='sidebar' position='relative'>
                        <ProjectSidebar project={project} status={status} isTaskChainProject={isTaskChainProject} />
                    </View>
                </>
            )}
            <View backgroundColor='gray-50' gridArea='content' overflow='hidden' position={'relative'}>
                <Switch>
                    <Route
                        exact
                        path={[
                            ROUTER_PATHS.PROJECT_DATASET_MEDIA,
                            ROUTER_PATHS.PROJECT_DATASET_STATISTICS,
                            ROUTER_PATHS.PROJECT_LABELS,
                        ]}
                        render={() => (
                            <Suspense fallback={<Loading size='L' />}>
                                <ProjectDataset mediaService={mediaService} />
                            </Suspense>
                        )}
                    />
                    <Route
                        exact
                        path={ROUTER_PATHS.ANNOTATOR}
                        render={() => (
                            <Annotator
                                mediaService={mediaService}
                                annotationService={annotationService}
                                predictionService={predictionService}
                            >
                                <AnnotatorLayout />
                            </Annotator>
                        )}
                    />
                    {isTaskChainProject && (
                        <Redirect exact from={ROUTER_PATHS.PROJECT_MODELS} to={getModelsTaskChainLocation(pathname)} />
                    )}
                    <Route
                        exact
                        path={isTaskChainProject ? ROUTER_PATHS.PROJECT_MODELS_WITH_TASK : ROUTER_PATHS.PROJECT_MODELS}
                        render={() => (
                            <Suspense fallback={<Loading size='L' />}>
                                <ProjectModels />
                            </Suspense>
                        )}
                    />
                    <Route
                        path={ROUTER_PATHS.PROJECT_TESTS}
                        render={() => (
                            <Suspense fallback={<Loading size='L' />}>
                                <ProjectTests />
                            </Suspense>
                        )}
                    />
                    <Route
                        path={isTaskChainProject ? ROUTER_PATHS.PROJECT_MODEL_WITH_TASK : ROUTER_PATHS.PROJECT_MODEL}
                        render={() => (
                            <Suspense fallback={<Loading size='L' />}>
                                <ProjectModel />
                            </Suspense>
                        )}
                    />
                    <Route
                        path={ROUTER_PATHS.PROJECT_DEPLOYMENTS}
                        render={() => (
                            <Suspense fallback={<Loading size='L' />}>
                                <ProjectDeployments />
                            </Suspense>
                        )}
                    />
                    <Redirect from={ROUTER_PATHS.PROJECT} to={ROUTER_PATHS.PROJECT_DATASET_MEDIA} />
                </Switch>
            </View>
        </>
    );
};

export const ProjectDetails = ({ mediaService }: ProjectDetailsProps): JSX.Element => {
    const { workspaceId, projectId } = useProjectIdentifier();

    const isAnnotatorRoute = useLocation().pathname === PATHS.getAnnotatorUrl(projectId);

    const GRID_AREAS = isAnnotatorRoute ? ['content'] : ['header  header', 'sidebar content'];
    const GRID_COLUMNS = isAnnotatorRoute ? ['auto'] : ['size-3400', 'auto'];
    const GRID_ROWS = isAnnotatorRoute ? ['auto'] : ['size-600', 'auto'];

    return (
        <Grid areas={GRID_AREAS} columns={GRID_COLUMNS} rows={GRID_ROWS} height='100vh' maxHeight={'100vh'}>
            <ProjectProvider projectIdentifier={{ workspaceId, projectId }}>
                <ProjectDetailsContent isAnnotatorRoute={isAnnotatorRoute} mediaService={mediaService} />
            </ProjectProvider>
        </Grid>
    );
};

export default ProjectDetails;
