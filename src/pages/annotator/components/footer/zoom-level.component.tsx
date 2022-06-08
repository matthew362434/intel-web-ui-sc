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

import { View, Tooltip, TooltipTrigger, useNumberFormatter, ActionButton } from '@adobe/react-spectrum';

import classes from './footer.module.scss';

interface ZoomLevelProps {
    zoom: number;
}

export const ZoomLevel = ({ zoom }: ZoomLevelProps): JSX.Element => {
    const formatter = useNumberFormatter({
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });

    return (
        <View paddingX={'size-200'}>
            <TooltipTrigger delay={0}>
                <ActionButton isQuiet aria-label='Zoom level' UNSAFE_className={classes.tooltipButton}>
                    <span
                        className={classes.text}
                        data-testid='zoom-level'
                        aria-label={'Zoom level'}
                        id='footer-zoom-display'
                        data-value={zoom}
                    >
                        {formatter.format(zoom)}
                    </span>
                </ActionButton>
                <Tooltip>Zoom level</Tooltip>
            </TooltipTrigger>
        </View>
    );
};
