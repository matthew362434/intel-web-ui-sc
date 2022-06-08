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

import { useEffect, useMemo } from 'react';

import { Flex, View } from '@adobe/react-spectrum';
import { TableCellProps } from 'react-virtualized';

import { API_URLS } from '../../../../../core/services';
import { useModelIdentifier } from '../../../../../hooks';
import { ColumnProps, Table } from '../../../../../shared/components';
import { ProgressLoading } from '../../../../../shared/components/progress-loading';
import { CasualCell } from '../../../../../shared/components/table/components';
import { UseOptimizedModels as OptimizedModelsProps } from '../hooks/use-optimized-models';
import { DownloadCell } from './download-cell';
import { OptimizationTooltip } from './optimization/';
import { OptimizedModelHeaderRenderer } from './optimized-model-header-renderer';
import { OptimizedModelNameCell } from './optimized-model-name-cell';
import classes from './optimized-models.module.scss';
import { TrainingModelNameCell } from './training-model-name-cell';
import {
    getOptimizationTableHeight,
    NNCF_NOT_SUPPORTED_NO_MORE_MODELS,
    NNCF_NOT_SUPPORTED_NO_POT_MODEL,
    NNCF_TOOLTIP,
    NO_OPT_MODELS,
    ONLY_POT_AFTER_NNCF_TOOLTIP,
    TRAINING_TABLE_HEIGHT,
} from './utils';

export const OptimizedModels = (props: Required<OptimizedModelsProps>): JSX.Element => {
    const {
        modelDetails: { trainedModel, optimizedModels },
        isImproveSpeedOptimizationVisible,
        isPOTModel,
        areOptimizedModelsVisible,
        shouldRefetchModels,
        refetchModels,
        displayNNCFNoModels,
        displayPOTBtnNoNNCF,
        displayPOTBtnAfterNNCF,
        displayMessageIsPOTAndNNCFNotSupported,
    } = props;
    const { workspaceId, projectId, architectureId, modelId } = useModelIdentifier();

    const COLUMNS_TRAINING_MODEL: ColumnProps[] = useMemo(
        () => [
            {
                label: 'BASELINE MODEL',
                dataKey: 'modelName',
                width: 300,
                sortable: false,
                component: TrainingModelNameCell,
            },
            {
                label: 'PRECISION',
                dataKey: 'precision',
                width: 300,
                sortable: false,
                component: CasualCell,
            },
            {
                label: 'ACCURACY',
                dataKey: 'accuracy',
                width: 300,
                sortable: false,
                component: CasualCell,
            },
            {
                label: 'SIZE',
                dataKey: 'modelSize',
                width: 300,
                sortable: false,
                component: CasualCell,
            },
            {
                label: '',
                dataKey: '',
                width: 300,
                sortable: false,
                component: ({ rowData }) => {
                    return (
                        <DownloadCell
                            url={API_URLS.EXPORT_MODEL(workspaceId, projectId, architectureId, modelId)}
                            rowData={rowData}
                        />
                    );
                },
            },
        ],
        [workspaceId, projectId, architectureId, modelId]
    );

    const COLUMNS_OPTIMIZED_MODELS: ColumnProps[] = useMemo(
        () =>
            COLUMNS_TRAINING_MODEL.map((column: ColumnProps, index: number) => {
                if (index === 0) {
                    return {
                        ...column,
                        label: index === 0 ? 'OPTIMIZED MODELS' : '',
                        component: index === 0 ? OptimizedModelNameCell : column.component,
                        headerRenderer: index === 0 ? OptimizedModelHeaderRenderer : undefined,
                    };
                }
                if (index === COLUMNS_TRAINING_MODEL.length - 1) {
                    return {
                        ...column,
                        component: ({ rowData }: TableCellProps) => {
                            return rowData.modelStatus !== 'SUCCESS' ? (
                                <Flex justifyContent={'center'}>
                                    <ProgressLoading id={'progress'} />
                                </Flex>
                            ) : (
                                <DownloadCell
                                    url={API_URLS.EXPORT_OPTIMIZED_MODEL(
                                        workspaceId,
                                        projectId,
                                        architectureId,
                                        modelId,
                                        rowData.id
                                    )}
                                    rowData={rowData}
                                />
                            );
                        },
                    };
                }

                return column;
            }),
        [COLUMNS_TRAINING_MODEL, workspaceId, projectId, architectureId, modelId]
    );

    useEffect(() => {
        let refetchIntervalId: NodeJS.Timeout | null = null;

        if (shouldRefetchModels) {
            refetchIntervalId && clearInterval(refetchIntervalId);
            refetchIntervalId = null;
        } else {
            refetchIntervalId = setInterval(async () => {
                await refetchModels();
            }, 2000);
        }
        return () => {
            refetchIntervalId && clearInterval(refetchIntervalId);
        };
    }, [shouldRefetchModels, refetchModels]);

    return (
        <View marginTop={'size-400'}>
            <View>
                <Table
                    data={[trainedModel]}
                    columns={COLUMNS_TRAINING_MODEL}
                    height={TRAINING_TABLE_HEIGHT}
                    headerClassName={classes.trainingModelTableHeader}
                    rowClassName={classes.trainingModelTableRow}
                    rowHeight={55}
                />
            </View>
            <View marginTop={'size-300'}>
                <Table
                    data={areOptimizedModelsVisible ? optimizedModels : []}
                    columns={COLUMNS_OPTIMIZED_MODELS}
                    height={getOptimizationTableHeight(optimizedModels.length)}
                    headerClassName={classes.trainingModelTableHeader}
                    rowClassName={classes.trainingModelTableRow}
                    rowHeight={55}
                    headerHeight={50}
                />
            </View>
            {isImproveSpeedOptimizationVisible && (
                <View marginTop={'size-100'} marginStart={'size-350'}>
                    {displayNNCFNoModels && <OptimizationTooltip text={isPOTModel ? NNCF_TOOLTIP : NO_OPT_MODELS} />}
                    {displayPOTBtnAfterNNCF && <OptimizationTooltip text={ONLY_POT_AFTER_NNCF_TOOLTIP} />}
                    {displayPOTBtnNoNNCF && <OptimizationTooltip text={NNCF_NOT_SUPPORTED_NO_POT_MODEL} />}
                    {displayMessageIsPOTAndNNCFNotSupported && (
                        <OptimizationTooltip text={NNCF_NOT_SUPPORTED_NO_MORE_MODELS} />
                    )}
                </View>
            )}
        </View>
    );
};
