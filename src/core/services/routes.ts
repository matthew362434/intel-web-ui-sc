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

const HOME = '/';
const PROJECTS = '/projects';
const PROJECT = `${PROJECTS}/:projectId`;
const PROJECT_DATASET = `${PROJECT}/dataset`;
const ANNOTATOR = `${PROJECT}/annotator`;
const MODELS = `${PROJECT}/models`;
const MODELS_WITH_TASK = `${MODELS}/:taskName`;
const MODEL = `${MODELS}/:architectureId/:modelId`;
const MODEL_WITH_TASK = `${MODELS_WITH_TASK}/:architectureId/:modelId`;
const REGISTRATION_ROUTE_PREFIX = '/registration';

const ROUTER_PATHS = {
    HOME,
    LANDING_PAGE: HOME,
    PROFILE_PAGE: '/profile',
    ABOUT_PAGE: '/about',
    TEAM: '/team',
    LOGS: '/logs',
    ANNOTATOR,
    PROJECTS,
    PROJECT,
    PROJECT_DATASET,
    PROJECT_DATASET_MEDIA: `${PROJECT_DATASET}/media`,
    PROJECT_LABELS: `${PROJECT_DATASET}/labels`,
    PROJECT_DATASET_STATISTICS: `${PROJECT_DATASET}/statistics`,
    PROJECT_MODELS: MODELS,
    PROJECT_MODELS_WITH_TASK: MODELS_WITH_TASK,
    PROJECT_MODEL: MODEL,
    PROJECT_MODEL_WITH_TASK: MODEL_WITH_TASK,
    PROJECT_TESTS: `${PROJECT}/tests`,
    PROJECT_DEPLOYMENTS: `${PROJECT}/deployments`,
    SIGN_OUT: '/oauth2/sign_out',
    SIGN_OUT_PAGE: '/sign_out_page',
    REGISTER: `${REGISTRATION_ROUTE_PREFIX}/sign-up`,
    FORGOT_PASSWORD: `${REGISTRATION_ROUTE_PREFIX}/forgot-password`,
    RESET_PASSWORD: `${REGISTRATION_ROUTE_PREFIX}/reset-password`,
};

const getAnnotatorUrl = (projectId: string): string => encodeURI(`${PROJECTS}/${projectId}/annotator`);
const getProjectUrl = (projectId: string): string => encodeURI(`${PROJECTS}/${projectId}`);
const getProjectDatasetUrl = (projectId: string, chapterKey: string): string =>
    encodeURI(`${PROJECTS}/${projectId}/dataset/${chapterKey}`);
const getProjectModelsUrl = (projectId: string, taskName?: string): string =>
    encodeURI(`${PROJECTS}/${projectId}/models${taskName ? `/${taskName}` : ''}`);
const getProjectModelUrl = (projectId: string, architectureId: string, modelId: string, taskName?: string): string =>
    encodeURI(`${getProjectModelsUrl(projectId, taskName)}/${architectureId}/${modelId}`);

const getProjectTestsUrl = (projectId: string): string => encodeURI(`${PROJECTS}/${projectId}/tests`);
const getProjectDeploymentsUrl = (projectId: string): string => encodeURI(`${PROJECTS}/${projectId}/deployments`);
const getProjectLabelsUrl = (projectId: string): string => encodeURI(`${PROJECTS}/${projectId}/labels`);

const PATHS = {
    getAnnotatorUrl,
    getProjectUrl,
    getProjectDatasetUrl,
    getProjectModelsUrl,
    getProjectModelUrl,
    getProjectTestsUrl,
    getProjectDeploymentsUrl,
    getProjectLabelsUrl,
};

export { ROUTER_PATHS, PATHS };
