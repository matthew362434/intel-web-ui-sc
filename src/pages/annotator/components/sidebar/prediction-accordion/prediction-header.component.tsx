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

import { Flex, Heading, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { UseMutationResult } from 'react-query';

import { RefreshButton } from '../../../../../shared/components';

interface PredictionHeaderProps {
    refresh: UseMutationResult<void, unknown, void>;
}

export const PredictionHeader = ({ refresh }: PredictionHeaderProps): JSX.Element => {
    return (
        <Flex justifyContent='space-between' alignItems='center' data-testid='prediction-header'>
            <Flex alignItems='center' height='100%' gap='size-100'>
                <Heading level={4}>AI prediction</Heading>
            </Flex>
            <Flex gap='size-100'>
                <TooltipTrigger>
                    <RefreshButton
                        id='refresh-prediction-results'
                        ariaLabel='Refresh predictions'
                        onPress={() => refresh.mutate()}
                        isLoading={refresh.isLoading}
                    />
                    <Tooltip>Refresh predictions</Tooltip>
                </TooltipTrigger>
            </Flex>
        </Flex>
    );
};
