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

import {
    TrainingModelStatistic,
    TrainModelStatisticsConfusionMatrixValue,
} from '../../../pages/project-details/components/project-model/model-statistics';
import { idMatchingFormat } from '../../../test-utils';
import { API_URLS } from '../../services';
import AXIOS from '../../services/axios-instance';
import { ModelStatisticsDTO } from '../dtos/model-statistics.interface';

export interface ApiModelStatisticsServiceInterface {
    getModelStatistics: (
        workspaceId: string,
        projectId: string,
        architectureId: string,
        modelId: string
    ) => Promise<TrainingModelStatistic[]>;
}

export const createApiModelStatisticsService = (): ApiModelStatisticsServiceInterface => {
    return {
        getModelStatistics: async (
            workspaceId: string,
            projectId: string,
            architectureId: string,
            modelId: string
        ): Promise<TrainingModelStatistic[]> => {
            const { data } = await AXIOS.get<ModelStatisticsDTO[]>(
                API_URLS.MODEL_STATISTICS(workspaceId, projectId, architectureId, modelId)
            );

            return data
                .filter(({ header }) => !header.toLocaleLowerCase().includes('model architecture'))
                .map((objStatistic) => {
                    if (objStatistic.type === 'matrix') {
                        const { header, value, key, type } = objStatistic;
                        const { row_header, column_header, matrix_data } = value;
                        const convertedValue: TrainModelStatisticsConfusionMatrixValue = {
                            rowHeader: row_header,
                            columnHeader: column_header,
                            matrixData: matrix_data.map(({ row_names, column_names, matrix_values, ...rest }) => ({
                                ...rest,
                                columnNames: column_names,
                                rowNames: row_names,
                                matrixValues: matrix_values,
                            })),
                        };

                        return {
                            type,
                            key: idMatchingFormat(key),
                            header,
                            value: convertedValue,
                        };
                    } else if (objStatistic.type === 'line') {
                        const {
                            value: { line_data, x_axis_label, y_axis_label },
                            ...rest
                        } = objStatistic;
                        return {
                            ...rest,
                            value: {
                                lineData: line_data,
                                xAxisLabel: x_axis_label,
                                yAxisLabel: y_axis_label,
                            },
                        };
                    }
                    return {
                        ...objStatistic,
                        key: idMatchingFormat(objStatistic.key),
                    };
                });
        },
    };
};
