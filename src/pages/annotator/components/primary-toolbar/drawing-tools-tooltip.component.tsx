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

import { Divider, Text, IllustratedMessage, Heading, View } from '@adobe/react-spectrum';

import { openNewTab } from '../../../../shared/utils';
import { ToolTooltipProps } from '../../tools/tools.interface';
import classes from './primaryToolBar.module.scss';

// Tooltip/react-spectrum has a bug with Button/react-spectrum
// due to how this component handles the button iteractions.
// There fore we use a native button with spectrum classes instead of Spectrum's Button
export const DrawingToolsTooltip = ({ title, description, url, img }: ToolTooltipProps): JSX.Element => (
    <IllustratedMessage>
        <img className={classes.drawingToolsTooltipsImg} src={img} alt={title} />
        <View UNSAFE_className={classes.drawingToolsTooltipsContent}>
            <Heading UNSAFE_className={classes.drawingToolsTooltipsTitle}>{title}</Heading>
            <Text UNSAFE_className={classes.drawingToolsTooltipsDescription}>{description}</Text>
            <Divider size='S' marginTop={'size-200'} marginBottom={'size-200'} />
            <button
                className={`spectrum-Button_e2d99e spectrum-Button--primary_e2d99e ${classes.drawingToolsTooltipsLink}`}
                onClick={() => {
                    openNewTab(url);
                }}
            >
                Learn more
            </button>
        </View>
    </IllustratedMessage>
);
