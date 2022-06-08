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
import { TableCellProps } from 'react-virtualized';

import { AcceptCircle, HelpCircleSolidIcon } from '../../../../assets/icons';
import { capitalize } from '../../../../shared/utils';
import { RegistrationStatus } from '../users-table.interface';
import classes from './registration-cell.module.scss';

type RegistrationCellProps = Pick<TableCellProps, 'cellData' | 'dataKey' | 'rowData'>;

export const RegistrationCell = ({ cellData, dataKey, rowData }: RegistrationCellProps): JSX.Element => (
    <Flex alignItems='center' gap='size-115' id={`${rowData.id}-${dataKey}`}>
        {cellData === RegistrationStatus.COMPLETED ? (
            <AcceptCircle
                data-testid='completed-registration-icon-id'
                id='completed-registration-icon-id'
                className={classes.completedRegistration}
            />
        ) : (
            <HelpCircleSolidIcon
                data-testid='pending-registration-icon-id'
                id='pending-registration-icon-id'
                className={classes.pendingRegistration}
            />
        )}
        {capitalize(cellData)}
    </Flex>
);
