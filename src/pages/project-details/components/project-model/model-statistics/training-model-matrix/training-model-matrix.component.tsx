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

import { Key, useRef, useState } from 'react';

import { Picker, Item, Flex } from '@adobe/react-spectrum';
import { ViewProps } from '@react-types/view';

import { ModelStatisticsBase } from '../../../../../../core/statistics/dtos/model-statistics.interface';
import { ProjectCardContent } from '../../../project-card-content';
import { TrainModelStatisticsConfusionMatrix } from '../model-statistics.interface';
import { ConfusionMatrixZoom } from './confusion-matrix-zoom';

type TrainingModelMatrixProps = TrainModelStatisticsConfusionMatrix & ModelStatisticsBase & ViewProps;

export const TrainingModelMatrix = ({
    value,
    header,
    gridColumn,
    gridRow,
}: TrainingModelMatrixProps & ViewProps): JSX.Element => {
    const { matrixData, columnHeader, rowHeader } = value;
    const [selectedConfusionMatrixKey, setSelectedConfusionMatrix] = useState<Key>(matrixData[0].key);
    const ref = useRef<HTMLDivElement>(null);
    const confusionMatrix = matrixData.filter(({ key }) => selectedConfusionMatrixKey === (key as Key))[0];
    const mergedMatrixValues = confusionMatrix.matrixValues.reduce<number[]>(
        (previous, current) => previous.concat(current),
        []
    );

    const onSelectionConfusionMatrix = (selectedKey: Key): void => {
        setSelectedConfusionMatrix(selectedKey);
    };

    const pickerComponent = (
        <Picker
            aria-label={'Select a confusion matrix'}
            items={matrixData}
            selectedKey={selectedConfusionMatrixKey}
            onSelectionChange={onSelectionConfusionMatrix}
            marginBottom={'size-125'}
        >
            {(item) => (
                <Item key={item.key} textValue={item.header}>
                    {item.header}
                </Item>
            )}
        </Picker>
    );

    const confusionMatrixData = {
        ...confusionMatrix,
        rowHeader,
        columnHeader,
    };

    return (
        <ProjectCardContent title={header} gridColumn={gridColumn} gridRow={gridRow} component={pickerComponent}>
            <div ref={ref} style={{ height: 'calc(100% - var(--spectrum-global-dimension-size-250))', minHeight: 0 }}>
                <Flex
                    justifyContent={'center'}
                    direction={'column'}
                    alignItems={'center'}
                    height={'100%'}
                    minHeight={0}
                    marginTop={'size-250'}
                >
                    <ConfusionMatrixZoom
                        {...confusionMatrixData}
                        matrixValues={mergedMatrixValues}
                        size={confusionMatrix.matrixValues.length}
                        boxRef={ref}
                    />
                </Flex>
            </div>
        </ProjectCardContent>
    );
};
