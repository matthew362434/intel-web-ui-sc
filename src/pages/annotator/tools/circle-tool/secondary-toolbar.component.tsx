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

import { Flex, Slider } from '@adobe/react-spectrum';
import { Divider } from '@react-spectrum/divider';
import { Text } from '@react-spectrum/text';

import { ToolSettings, ToolType } from '../../core';
import { ToolAnnotationContextProps } from '../tools.interface';

export const SecondaryToolbar = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { getToolSettings, updateToolSettings, image } = annotationToolContext;
    const { size } = getToolSettings(ToolType.CircleTool) as ToolSettings[ToolType.CircleTool];

    const setSize = (value: number) => {
        updateToolSettings(ToolType.CircleTool, { size: value });
    };

    const maxValue = Math.sqrt(Math.pow(image.width, 2) + Math.pow(image.height, 2)) / 2;

    return (
        <Flex direction='row' alignItems='center' justifyContent='center' gap='size-200'>
            <Text>Circle Tool</Text>
            <Divider orientation='vertical' size='S' />
            <Slider
                label='Circle radius'
                value={size}
                onChange={setSize}
                minValue={0}
                maxValue={maxValue}
                labelPosition='side'
                showValueLabel={false}
            />
        </Flex>
    );
};
