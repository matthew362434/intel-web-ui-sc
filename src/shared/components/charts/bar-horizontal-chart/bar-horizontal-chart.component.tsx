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

import { MutableRefObject, useEffect, useRef, useState } from 'react';

import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar, Cell, Tooltip } from 'recharts';

import { ChartProps, Colors } from '../chart.interface';
import classes from './bar-horizontal-chart.module.scss';
import { CustomTooltip } from './custom-tooltip';

interface BarHorizontalChartProps extends ChartProps {
    barSize?: number;
    xPadding?: {
        right?: number;
        left?: number;
    };
    yPadding?: {
        top?: number;
        bottom?: number;
    };
    colors?: Colors[];
}

export const BarHorizontalChart = ({
    data,
    barSize = 20,
    yPadding,
    xPadding,
    colors,
}: BarHorizontalChartProps): JSX.Element => {
    const [labelColors, setLabelColors] = useState<Colors[]>(colors || []);
    const prevHoveredLabel = useRef<string | null>(null);

    const yAxisFormatter = (label: string | number | undefined): string => {
        if (typeof label === 'string') {
            return label.length > 11 ? `${label.slice(0, 10)}...` : label;
        }
        return `${label}`;
    };

    const displayMessage = (value: string) => `Value: ${value}`;

    useEffect(() => {
        colors && setLabelColors(colors);
    }, [colors]);

    return (
        <ResponsiveContainer>
            <BarChart data={data} layout='vertical' barSize={barSize} className={classes.barChart}>
                <CartesianGrid horizontal={false} className={classes.barChartCartesianStroke} />
                <XAxis
                    type='number'
                    dataKey='value'
                    axisLine={false}
                    tickLine={false}
                    padding={xPadding}
                    id='bar-horizontal-chart-xaxis-id'
                />
                <YAxis
                    type='category'
                    dataKey='label'
                    axisLine={false}
                    tickLine={false}
                    padding={yPadding}
                    width={100}
                    tickFormatter={yAxisFormatter}
                    id='bar-horizontal-chart-yaxis-id'
                />
                <Tooltip
                    content={
                        <CustomTooltip
                            prevHoveredLabel={prevHoveredLabel as MutableRefObject<string>}
                            defaultColors={colors || []}
                            setLabelColors={setLabelColors}
                            data={data}
                            displayMessage={displayMessage}
                        />
                    }
                />

                <Bar dataKey='value'>
                    {data?.length ? (
                        data.map(({ label }, index) => (
                            <Cell
                                key={label}
                                fill={labelColors.length && labelColors[index] ? labelColors[index].color : '#8BAE46'}
                                id={`${label}-id`}
                            />
                        ))
                    ) : (
                        <></>
                    )}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
