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
import { Text } from '@react-spectrum/text';
import { TableCellProps } from 'react-virtualized';

import { idMatchingFormat } from '../../../../../../test-utils';
import classes from './cell-with-subtext.module.scss';

interface CellWithSubtextProps extends TableCellProps {
    description: string;
}

export const CellWithSubtext = ({ rowData, cellData, dataKey, description }: CellWithSubtextProps): JSX.Element => {
    let id = dataKey;
    if (rowData.modelName) {
        id = `${idMatchingFormat(rowData.id)}-${dataKey}`;
    }
    return (
        <Flex direction={'column'}>
            <span id={id} className={classes.cellModelNameText} title={cellData}>
                {cellData}
            </span>
            <Text
                id={`${id}-description`}
                UNSAFE_className={classes.cellSubText}
                marginTop={'size-25'}
                marginBottom={'size-65'}
            >
                {description}
            </Text>
        </Flex>
    );
};
