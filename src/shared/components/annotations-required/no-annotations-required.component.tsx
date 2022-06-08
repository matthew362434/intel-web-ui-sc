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

import { forwardRef } from 'react';

import { Button, Flex, Text, Tooltip, TooltipTrigger, View } from '@adobe/react-spectrum';

import classes from './annotations-required.module.scss';

interface NoAnnotationsRequiredProps {
    id?: string;
}

export const NoAnnotationsRequired = forwardRef<HTMLDivElement, NoAnnotationsRequiredProps>((props, ref) => {
    return (
        <div ref={ref}>
            <TooltipTrigger placement='bottom'>
                <Flex id={props.id} alignItems='center' marginX='size-100' gap='size-100'>
                    <Text id='annotations-required-id'>Annotations required:</Text>
                    <Button isQuiet variant='primary' UNSAFE_className={classes.tooltipButton}>
                        <View
                            backgroundColor='gray-400'
                            paddingY='size-25'
                            paddingX='size-75'
                            borderRadius='small'
                            data-testid={'training-dots'}
                        >
                            ...
                        </View>
                    </Button>
                </Flex>
                <Tooltip UNSAFE_className={classes.tooltip}>
                    <View padding='size-100'>
                        The required number of annotations for the next learning cycle is being calculated. Meanwhile,
                        keep annotating to make the model more accurate.
                    </View>
                </Tooltip>
            </TooltipTrigger>
        </div>
    );
});
