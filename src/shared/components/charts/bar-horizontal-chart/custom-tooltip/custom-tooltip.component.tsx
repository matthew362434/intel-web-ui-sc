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

import { Dispatch, MutableRefObject, SetStateAction, useEffect } from 'react';

import { Text } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

import { ChartData, Colors } from '../../chart.interface';
import { CustomTooltipWrapper } from '../../custom-tooltip-wrapper';

export interface CustomTooltipProps {
    payload?: {
        value: number | string;
    }[];
    active?: boolean;
    label?: string;
    prevHoveredLabel: MutableRefObject<string | null>;
    defaultColors: Colors[];
    setLabelColors: Dispatch<SetStateAction<Colors[]>>;
    data: ChartData[];
    displayMessage: (value: string) => string;
}

export const CustomTooltip = ({
    active,
    payload,
    label,
    prevHoveredLabel,
    defaultColors,
    setLabelColors,
    data,
    displayMessage,
}: CustomTooltipProps): JSX.Element | null => {
    const value =
        payload && payload.length
            ? typeof payload[0].value === 'number'
                ? Math.round(payload[0].value * 100) / 100
                : payload[0].value
            : '';
    useEffect(() => {
        if (active && label && prevHoveredLabel.current !== label) {
            const currentIndex = data.findIndex((element) => element.label === label);
            setLabelColors(() =>
                defaultColors.map((prevColor, index) => {
                    if (index !== currentIndex) {
                        return {
                            color: prevColor.fadedColor,
                            fadedColor: prevColor.color,
                        };
                    }
                    return prevColor;
                })
            );

            prevHoveredLabel.current = label;
        }
        if (!active && prevHoveredLabel.current) {
            setLabelColors(defaultColors);
            prevHoveredLabel.current = null;
        }
    }, [active, label, data, defaultColors, prevHoveredLabel, setLabelColors]);

    if (active && payload && payload.length) {
        return (
            <CustomTooltipWrapper>
                <Heading margin={0} marginBottom={'size-65'}>
                    {label}
                </Heading>
                <Text>{displayMessage(value.toString())}</Text>
            </CustomTooltipWrapper>
        );
    }
    return null;
};
