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

import { Flex, Text } from '@adobe/react-spectrum';
import { DimensionValue } from '@react-types/shared/src/dna';
import { Responsive } from '@react-types/shared/src/style';

import { formatDate } from '../../../../../../../shared/utils';
import { ProjectCardContent } from '../../../../project-card-content';
import classes from './training-model-info-item.module.scss';

interface TrainingDateProps {
    value: string;
    header: string;
    height?: Responsive<DimensionValue>;
}

const isDateField = (value: string): boolean => {
    return formatDate(value, 'DD MMM YYYY') !== 'Invalid Date' && formatDate(value, 'YYYY') > '2000';
};

export const TrainingModelInfoItem = ({ value, header, height }: TrainingDateProps): JSX.Element => {
    return (
        <ProjectCardContent title={header} height={height}>
            <Flex direction={'column'} gap={'size-65'} alignItems={'center'} justifyContent={'center'} height={'100%'}>
                {isDateField(value) ? (
                    <>
                        <Text UNSAFE_className={classes.trainingDateDay}>{formatDate(value, 'DD MMM YYYY')}</Text>
                        <Text UNSAFE_className={classes.trainingDateHour}>{formatDate(value, 'HH:mm:ss')}</Text>
                    </>
                ) : (
                    <Text UNSAFE_className={classes.trainingDateDay}>{value}</Text>
                )}
            </Flex>
        </ProjectCardContent>
    );
};
