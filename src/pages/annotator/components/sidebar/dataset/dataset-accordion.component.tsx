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

import { Flex, Tooltip, TooltipTrigger, View } from '@adobe/react-spectrum';

import { isAnomalyDomain } from '../../../../../core/projects';
import { Accordion, CornerIndicator, RefreshButton } from '../../../../../shared/components';
import { MediaFilter } from '../../../../media/media-filter.component';
import { useDataset, useTask } from '../../../providers';
import { ActiveDatasetTooltipComponent } from './active-dataset-tooltip.component';
import { DatasetList } from './dataset-list.component';
import { AnomalyDatasetPicker, DatasetPicker } from './dataset-picker';

export const DatasetAccordion = (): JSX.Element => {
    const { selectedTask } = useTask();
    const {
        isDatasetMode,
        isInActiveMode,
        activeMediaItemsQuery,
        mediaFilterOptions,
        setMediaFilterOptions,
        isMediaFilterEmpty,
    } = useDataset();

    const isFetching = activeMediaItemsQuery.isFetching || activeMediaItemsQuery.isFetchingNextPage;
    const mediaCount = activeMediaItemsQuery?.data?.pages.flatMap(({ media }) => media).length || 0;

    const refresh = () => {
        // Remove old pages, then refetch the first page
        activeMediaItemsQuery.remove();
        activeMediaItemsQuery.refetch();
    };

    return (
        <Accordion
            padding='size-150'
            defaultOpenState
            height={'100%'}
            overflow={'auto'}
            idPrefix={'active-set'}
            header={
                <Flex justifyContent='space-between' flexGrow={1} alignItems='center'>
                    <View marginY='size-150' borderBottomColor='gray-400' borderBottomWidth='thin'>
                        {selectedTask !== null && isAnomalyDomain(selectedTask.domain) ? (
                            <AnomalyDatasetPicker selectedTask={selectedTask} />
                        ) : (
                            <DatasetPicker />
                        )}
                    </View>
                    {isInActiveMode && (
                        <Flex direction='row'>
                            <ActiveDatasetTooltipComponent count={mediaCount} />
                            <TooltipTrigger>
                                <RefreshButton
                                    id='refresh-active-set'
                                    ariaLabel='Refresh active set'
                                    onPress={refresh}
                                    isLoading={isFetching}
                                />
                                <Tooltip>Refresh active set</Tooltip>
                            </TooltipTrigger>
                        </Flex>
                    )}
                    {isDatasetMode && (
                        <Flex direction='row'>
                            <CornerIndicator isActive={!isMediaFilterEmpty}>
                                <MediaFilter
                                    filterOptions={mediaFilterOptions}
                                    onSetFilterOptions={setMediaFilterOptions}
                                />
                            </CornerIndicator>
                        </Flex>
                    )}
                </Flex>
            }
        >
            <Flex direction='column' height='100%' minHeight={0}>
                <DatasetList itemSize={110} />
            </Flex>
        </Accordion>
    );
};
