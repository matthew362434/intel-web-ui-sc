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

import { Text } from '@react-spectrum/text';
import { TableCellProps } from 'react-virtualized';

import { idMatchingFormat } from '../../../../../test-utils';
import { capitalize } from '../../../../utils';

export const CasualCell = ({ rowData, cellData, dataKey }: TableCellProps): JSX.Element => {
    let id = dataKey;

    if (rowData.id) {
        id = `${rowData.id}-${dataKey}`;
    } else if (rowData.modelName) {
        id = `${idMatchingFormat(rowData.modelName)}-${dataKey}`;
    }

    if (dataKey === 'precision') {
        if (cellData && cellData.length) {
            cellData = cellData[0];
        } else {
            cellData = '-';
        }
    } else if (dataKey === 'role') {
        cellData = capitalize(cellData);
    } else if (dataKey === 'latency') {
        cellData = `${cellData} ms`;
    } else if (dataKey === 'fpsThroughput') {
        cellData = `${cellData} fps`;
    }

    return <Text id={id}>{cellData}</Text>;
};
