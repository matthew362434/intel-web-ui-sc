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

import { Grid, repeat, Flex } from '@adobe/react-spectrum';
import { Text } from '@react-spectrum/text';

import { convertColorToFadedColor, HexKeysType } from '../utils';
import { ConfusionMatrixProps } from './confusion-matrix.interface';
import classes from './confusion-matrix.module.scss';

export const ConfusionMatrix = ({
    columnHeader,
    rowHeader,
    columnNames,
    rowNames,
    matrixValues,
    size,
    ratio = 1,
}: ConfusionMatrixProps): JSX.Element => {
    const basicColor = '#0095CA';
    const darkColor = '#242528';

    const getColor = (value: number): string => {
        const roundedValue = Math.round(value * 100);
        const darkColorThreshold = 10;
        return roundedValue >= darkColorThreshold
            ? convertColorToFadedColor(basicColor, Math.round(value * 100) as HexKeysType)
            : darkColor;
    };

    return (
        <Grid
            columns={['size-250', 'size-1250', repeat(size, `${8 * ratio}rem`)]}
            rows={[repeat(size, `${8 * ratio}rem`), 'size-600', 'size-225']}
        >
            <Flex justifyContent={'center'} alignItems={'center'} gridRow={`1 / ${size + 1}`} id={`${columnHeader}-id`}>
                <Text
                    minWidth={'size-1700'}
                    UNSAFE_className={[classes.confusionMatrixColumnHeader, classes.confusionMatrixHeaders].join(' ')}
                >
                    {columnHeader}
                </Text>
            </Flex>
            {columnNames.map((columnName: string, index: number) => (
                <Flex
                    gridColumn={'2 / 3'}
                    gridRow={`${1 + index} / ${2 + index}`}
                    alignItems={'center'}
                    justifyContent={'center'}
                    key={columnName}
                >
                    <span title={columnName} className={classes.confusionMatrixHeaders}>
                        {columnName}
                    </span>
                </Flex>
            ))}
            {matrixValues.map((value, index) => (
                <Flex
                    alignItems={'center'}
                    justifyContent={'center'}
                    key={`${columnNames[index % columnNames.length]}-${value}-${index}`}
                    UNSAFE_style={{
                        backgroundColor: getColor(value),
                    }}
                >
                    <Text>{value.toFixed(1)}</Text>
                </Flex>
            ))}
            {rowNames.map((rowName: string, index: number) => (
                <Flex
                    alignItems={'center'}
                    justifyContent={'center'}
                    gridColumn={`${3 + index} / ${4 + index}`}
                    key={rowName}
                >
                    <span title={rowName} className={classes.confusionMatrixHeaders}>
                        {rowName}
                    </span>
                </Flex>
            ))}
            <Flex
                gridColumn={`3 / ${size + 3}`}
                gridRow={`${size + 2}`}
                alignItems={'center'}
                justifyContent={'center'}
                id={`${rowHeader}-id`}
                UNSAFE_className={classes.confusionMatrixHeaders}
            >
                <Text minWidth={'size-1700'} UNSAFE_className={classes.confusionMatrixHeaders}>
                    {rowHeader}
                </Text>
            </Flex>
        </Grid>
    );
};
