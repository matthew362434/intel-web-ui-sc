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

import { Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { SpectrumTooltipProps, TooltipTriggerProps } from '@react-types/tooltip';

import classes from './element-with-tooltip.module.scss';

export interface ElementWithTooltipProps {
    content: ReactNode;
    tooltipProps: SpectrumTooltipProps;
    tooltipTriggerProps?: TooltipTriggerProps;
}

export const ElementWithTooltip = ({
    tooltipProps,
    tooltipTriggerProps,
    content,
}: ElementWithTooltipProps): JSX.Element => {
    return (
        <TooltipTrigger placement={tooltipProps.placement} delay={0} isDisabled={tooltipTriggerProps?.isDisabled}>
            <>{content}</>
            {tooltipProps.children ? (
                <Tooltip UNSAFE_className={classes.tooltip} {...tooltipProps} variant={'info'} />
            ) : (
                <></>
            )}
        </TooltipTrigger>
    );
};
