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
import { Flex } from '@adobe/react-spectrum';
import chunk from 'lodash/chunk';

import { TrainingModelInfoType } from '../model-statistics.interface';
import { TrainingModelInfoItem } from './training-model-info-item';

interface TrainingModelInfoProps {
    trainingInfo: TrainingModelInfoType[];
}

export const TrainingModelInfo = ({ trainingInfo }: TrainingModelInfoProps): JSX.Element => {
    const trainingInfoGrouped: TrainingModelInfoType[][] = chunk(trainingInfo, 2);

    return (
        <>
            {trainingInfoGrouped.map((trainingData, index) => {
                if (trainingData.length === 1) {
                    return (
                        <TrainingModelInfoItem
                            key={`model-info-item-${index}`}
                            value={trainingData[0].value}
                            header={trainingData[0].header}
                        />
                    );
                }

                return (
                    <Flex direction={'column'} rowGap={'size-200'} key={`model-info-item-${index}`}>
                        <TrainingModelInfoItem
                            height={'50%'}
                            value={trainingData[0].value}
                            header={trainingData[0].header}
                        />
                        <TrainingModelInfoItem
                            height={'50%'}
                            value={trainingData[1].value}
                            header={trainingData[1].header}
                        />
                    </Flex>
                );
            })}
        </>
    );
};
