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

import { Flex, Grid } from '@adobe/react-spectrum';
import { StatusCodes } from 'http-status-codes';
import { useParams } from 'react-router-dom';

import { ModelIdentifier } from '../../../../../core/models/dtos';
import { useModelStatistics } from '../../../../../core/statistics/hooks';
import { useApplicationContext } from '../../../../../providers';
import { Loading } from '../../../../../shared/components';
import { ModelStatisticsNotFound } from './model-statistics-not-found';
import { TrainingModelInfoType } from './model-statistics.interface';
import classes from './model-statistics.module.scss';
import { TrainingModelBarChart } from './training-model-bar-chart';
import { TrainingModelInfo } from './training-model-info';
import { TrainingModelLineChart } from './training-model-line-chart';
import { TrainingModelMatrix } from './training-model-matrix';
import { TrainingModelRadialChart } from './training-model-radial-chart';

export const ModelStatistics = (): JSX.Element => {
    const { workspaceId } = useApplicationContext();
    const { projectId, architectureId, modelId } = useParams<ModelIdentifier>();
    const {
        isLoading,
        data: modelStatisticsData,
        error,
    } = useModelStatistics(workspaceId, projectId, architectureId, modelId);
    const modelTextTypeData =
        modelStatisticsData && (modelStatisticsData.filter((mock) => mock.type === 'text') as TrainingModelInfoType[]);

    if (error?.response?.status === StatusCodes.NOT_FOUND) {
        return <ModelStatisticsNotFound />;
    }

    return isLoading && !modelStatisticsData ? (
        <Loading />
    ) : modelStatisticsData ? (
        <Flex direction={'column'} minHeight={0} height={'100%'}>
            <Grid marginTop={'size-250'} autoRows={'45rem'} gap={'size-200'} UNSAFE_className={classes.gridStatistics}>
                {modelStatisticsData.length && modelTextTypeData ? (
                    <TrainingModelInfo trainingInfo={modelTextTypeData} />
                ) : (
                    <></>
                )}
                {modelStatisticsData
                    .filter(({ type }) => type !== 'text')
                    .map((modelStatistics) => {
                        switch (modelStatistics.type) {
                            case 'line':
                                return <TrainingModelLineChart {...modelStatistics} />;
                            case 'bar':
                                return <TrainingModelBarChart {...modelStatistics} />;
                            case 'radial_bar':
                                return <TrainingModelRadialChart {...modelStatistics} />;
                            case 'matrix':
                                return <TrainingModelMatrix gridColumn={'1 / 3'} {...modelStatistics} />;
                            default:
                                return <></>;
                        }
                    })}
            </Grid>
        </Flex>
    ) : (
        <></>
    );
};
