// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import dayjs from 'dayjs';

import { ArchitectureModels } from '../../../pages/project-details/components';
import { OptimizedModel, TrainedModel } from '../../../pages/project-details/components/project-model/optimized-model';
import { ModelCardProps } from '../../../pages/project-details/components/project-models/model-container/model-card';
import { ModelDTO, ModelsDTO } from '../dtos';
import { getModelsEntity } from './utils';

export const mockedModelsYoloDTO: ModelDTO[] = [
    {
        id: '3',
        name: 'YoloV4',
        size: 120000,
        score: 0.9,
        performance: { score: 0.9 },
        active_model: false,
        score_up_to_date: false,
        creation_date: dayjs().subtract(1, 'day').toString(),
    },
    {
        id: '4',
        name: 'YoloV4',
        size: 140000,
        score: 0.95,
        performance: { score: 0.95 },
        active_model: false,
        score_up_to_date: true,
        creation_date: dayjs().toString(),
    },
];

export const mockedModelsATSSDTO: ModelDTO[] = [
    {
        id: '1',
        name: 'ATSS',
        score: 0.24,
        performance: { score: 0.24 },
        size: 220000,
        active_model: false,
        score_up_to_date: false,
        creation_date: dayjs().subtract(1, 'd').toString(),
    },
    {
        id: '2',
        name: 'ATSS',
        score: 0.71,
        performance: { score: 0.71 },
        size: 230000,
        active_model: true,
        score_up_to_date: true,
        creation_date: dayjs().toString(),
    },
];

export const mockedModelsYolo: ModelCardProps[] = [
    {
        id: '3',
        architectureId: '1',
        architectureName: 'YoloV4',
        accuracy: 90,
        performance: { type: 'default_performance', score: 90 },
        version: 3,
        isActiveModel: false,
        upToDate: true,
        creationDate: dayjs().toString(),
    },
    {
        id: '1',
        architectureId: '1',
        architectureName: 'YoloV6',
        accuracy: 70,
        performance: { type: 'default_performance', score: 70 },
        version: 1,
        isActiveModel: false,
        upToDate: false,
        creationDate: dayjs().toString(),
    },
];

export const mockedModelsATSS: ModelCardProps[] = [
    {
        id: '3',
        architectureId: '2',
        architectureName: 'ATSS',
        accuracy: 90,
        performance: { type: 'default_performance', score: 90 },
        version: 2,
        isActiveModel: false,
        upToDate: true,
        creationDate: dayjs().toString(),
    },
    {
        id: '2',
        architectureId: '2',
        architectureName: 'ATSS',
        accuracy: 85,
        performance: { type: 'default_performance', score: 85 },
        version: 2,
        isActiveModel: false,
        upToDate: false,
        creationDate: dayjs().toString(),
    },
];

export const mockedArchitectureModelsDTO: ModelsDTO[] = [
    {
        id: 'model-group-1-id',
        name: 'YoloV4',
        model_template_id: 'Custom_Object_Detection_Gen3_SSD',
        task_id: '1234',
        models: mockedModelsYoloDTO,
    },
    {
        id: 'model-group-2-id',
        name: 'ATSS',
        model_template_id: 'Custom_Semantic_Segmentation_Lite-HRNet-18_OCR',
        task_id: '1235',
        models: mockedModelsATSSDTO,
    },
];

export const mockedArchitectureModels: ArchitectureModels[] = getModelsEntity(mockedArchitectureModelsDTO);

export const mockedTrainedModel: TrainedModel = {
    modelName: 'YoloV4 pytorch',
    modelSize: '23222',
    fpsThroughput: 40,
    latency: 25,
    precision: ['FP32'],
    accuracy: `${0.484 * 100}%`,
    targetDevice: 'GPU',
    targetDeviceType: 'Intel(R) Core(TM) i9-10980XE CPU @ 3.00GHz',
    accuracyUpToDate: true,
    architecture: 'U-net',
    previousRevisionId: '1',
    previousTrainedRevisionId: '12',
    version: 1,
    id: '2',
    creationDate: dayjs().toString(),
    optimizationCapabilities: {
        isNNCFSupported: false,
        isFilterPruningEnabled: false,
        isFilterPruningSupported: false,
    },
};

export const mockedOptimizedModels: OptimizedModel[] = [
    {
        id: '1',
        modelSize: '23200',
        creationDate: dayjs().toString(),
        optimizationType: 'MO',
        previousTrainedRevisionId: '1',
        previousRevisionId: '2',
        optimizationObjectives: {},
        optimizationMethods: [],
        modelName: 'YoloV4 pytorch',
        fpsThroughput: 100,
        latency: 25,
        precision: ['FP16'],
        accuracy: `${0.484 * 100}%`,
        targetDevice: 'GPU',
        targetDeviceType: 'Intel(R) Core(TM) i9-10980XE CPU @ 3.00GHz',
        modelStatus: 'SUCCESS',
    },
    {
        id: '2',
        modelSize: '2321321',
        creationDate: dayjs().toString(),
        optimizationType: 'MO',
        previousTrainedRevisionId: '3',
        previousRevisionId: '4',
        optimizationObjectives: {},
        optimizationMethods: [],
        modelName: 'YoloV4 pytorch',
        fpsThroughput: 200,
        latency: 5,
        precision: ['INT8'],
        accuracy: `${0.344 * 100}%`,
        targetDevice: 'CPU',
        targetDeviceType: 'Intel(R) Core(TM) i9-10980XE CPU @ 3.00GHz',
        modelStatus: 'SUCCESS',
    },
];
