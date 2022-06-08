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
import { Flex, Text } from '@adobe/react-spectrum';

import { HPORatioItem, HPORatioItemProps } from '../hpo-ratio-item';
import { hpoDescription, hpoQuestion, SUPPORTED_HPO_RATIOS } from '../utils';

type HPOTimeRatiosListProps = Omit<HPORatioItemProps, 'hpoTimeRatio'>;

export const HPOTimeRatiosList = ({
    selectedHPOTimeRatio,
    handleHPOTimeRatio,
}: HPOTimeRatiosListProps): JSX.Element => {
    return (
        <>
            <Flex direction={'column'} gap={'size-250'} marginTop={'size-250'}>
                <Text data-testid={'hpo-description-id'} id={'hpo-description-id'}>
                    {hpoDescription}
                </Text>
                <Text data-testid={'hpo-question-id'} id={'hpo-question-id'}>
                    {hpoQuestion}
                </Text>
            </Flex>
            <Flex alignItems={'center'} gap={'size-100'}>
                {SUPPORTED_HPO_RATIOS.map((ratio) => (
                    <HPORatioItem
                        key={ratio}
                        hpoTimeRatio={ratio}
                        selectedHPOTimeRatio={selectedHPOTimeRatio}
                        handleHPOTimeRatio={handleHPOTimeRatio}
                    />
                ))}
            </Flex>
        </>
    );
};
