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
import ProgressBar from '@ramonak/react-progress-bar';
import { View } from '@react-spectrum/view';

import { HourglassIcon } from '../../../../../assets/icons';
import { TrainingDetails } from '../../../../../core/projects/project-status.interface';
import { getFormattedToHourMinSec, removeProgressDecimals } from '../utils';
import classes from './training-progress.module.scss';

interface TrainingProgressProps {
    training: TrainingDetails;
}

export const TrainingProgress = ({ training }: TrainingProgressProps): JSX.Element => {
    const { message, progress, timeRemaining } = training;

    return (
        <View height={'100%'} id={'training-progress'}>
            <Flex
                width='size-3000'
                height='size-300'
                position='absolute'
                alignItems='center'
                justifyContent='space-around'
                UNSAFE_className={classes.container}
            >
                <Text
                    marginEnd={6}
                    id={'training-progress-message'}
                    UNSAFE_className={`${classes.text} ${classes.progress}`}
                >
                    {message}
                </Text>
                <Text id={'training-progress-percentage'} UNSAFE_className={classes.text}>
                    {removeProgressDecimals(progress)}
                </Text>
                <Flex>
                    {timeRemaining ? (
                        <>
                            <HourglassIcon aria-label={'time remaining'} />
                            <Text UNSAFE_className={classes.text} id={'training-progress-time-remaining'}>
                                {getFormattedToHourMinSec(timeRemaining)}
                            </Text>
                        </>
                    ) : (
                        <></>
                    )}
                </Flex>
            </Flex>

            <ProgressBar
                completed={progress.replace('%', '') || 0}
                borderRadius={'0'}
                width='var(--spectrum-global-dimension-size-3400)'
                height='100%'
                isLabelVisible={false}
                baseBgColor='var(--spectrum-global-color-gray-200)'
                bgColor='var(--energy-blue-darker)'
            />
        </View>
    );
};
