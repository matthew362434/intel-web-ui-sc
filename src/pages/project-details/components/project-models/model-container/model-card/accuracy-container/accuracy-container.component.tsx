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

import { ReactNode } from 'react';

import { ActionButton, Flex, Tooltip, TooltipTrigger, View } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

import classes from './accuracy-container.module.scss';
import { AccuracyMeter } from './accuracy-meter.component';

interface AccuracyContainerProps {
    tooltip?: ReactNode;
    value: number | null;
    disabled?: boolean;
    size?: 'S' | 'L';
    id?: string;
    heading: string;
    showValueLabel?: boolean;
}

const AccuracyContainer = ({
    tooltip = <></>,
    disabled = false,
    value,
    size = 'L',
    id,
    heading,
    showValueLabel = true,
}: AccuracyContainerProps): JSX.Element => {
    return (
        <Flex direction={'column'} justifyContent={'center'} alignItems={'center'}>
            <TooltipTrigger delay={0}>
                <ActionButton isQuiet margin='0' aria-labelledby={`accuracy-${id}-id`}>
                    {value === null ? (
                        <View
                            backgroundColor='gray-400'
                            paddingY='size-75'
                            paddingX='size-300'
                            UNSAFE_style={{ fontWeight: 'bold' }}
                        >
                            N/A
                        </View>
                    ) : (
                        <AccuracyMeter
                            value={value}
                            disabled={disabled}
                            id={id}
                            showValueLabel={showValueLabel}
                            size={size}
                            ariaLabel={heading}
                        />
                    )}
                </ActionButton>

                <Tooltip>{tooltip}</Tooltip>
            </TooltipTrigger>

            <Heading
                marginY='size-50'
                UNSAFE_className={[classes.accuracyText, disabled ? classes.accuracyTextOutdated : ''].join(' ')}
                id={`accuracy-${id}-id`}
            >
                {heading}
            </Heading>
        </Flex>
    );
};

export default AccuracyContainer;
