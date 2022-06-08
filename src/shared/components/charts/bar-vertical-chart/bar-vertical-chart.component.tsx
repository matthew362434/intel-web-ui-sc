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
import { ComponentProps, useEffect, useRef, useState } from 'react';

import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, Cell, CartesianGrid } from 'recharts';

import classes from '../bar-horizontal-chart/bar-horizontal-chart.module.scss';
import { CustomTooltip } from '../bar-horizontal-chart/custom-tooltip';
import { ChartProps, Colors } from '../chart.interface';

type BarChartVerticalProps = {
    colors?: Colors[];
    xAxisHeight?: number;
    textAnchor?: 'start' | 'middle' | 'end';
};

type BarVerticalChartProps = ChartProps & ComponentProps<typeof BarChart> & BarChartVerticalProps;

export const BarVerticalChart = ({
    barSize,
    data,
    colors,
    xAxisHeight = 30,
    textAnchor,
}: BarVerticalChartProps): JSX.Element => {
    const [labelColors, setLabelColors] = useState<Colors[]>(colors || []);
    const prevHoveredLabel = useRef<string | null>(null);

    const xAxisFormatter = (label: string | number | undefined): string => {
        if (typeof label === 'string') {
            const maxCharacters = 9;
            return label.length > maxCharacters ? `${label.slice(0, maxCharacters)}...` : label;
        }
        return `${label}`;
    };
    const displayMessage = (value: string) => `Value: ${value}`;

    useEffect(() => {
        colors && setLabelColors(colors);
    }, [colors]);

    return (
        <ResponsiveContainer>
            <BarChart data={data} barSize={barSize} className={classes.barChart}>
                <CartesianGrid vertical={false} className={classes.barChartCartesianStroke} />
                <XAxis
                    type='category'
                    padding={{ right: 5, left: 10 }}
                    tickLine={false}
                    dataKey='label'
                    angle={-90}
                    height={xAxisHeight}
                    tickFormatter={xAxisFormatter}
                    textAnchor={textAnchor}
                />
                <YAxis type='number' axisLine={false} padding={{ bottom: 1 }} />
                <Tooltip
                    content={
                        <CustomTooltip
                            prevHoveredLabel={prevHoveredLabel}
                            defaultColors={colors || []}
                            setLabelColors={setLabelColors}
                            data={data}
                            displayMessage={displayMessage}
                        />
                    }
                />
                <Bar dataKey='value'>
                    {data.map(({ label }, index: number) => (
                        <Cell
                            key={label}
                            id={`${label}-id`}
                            fill={labelColors?.length ? labelColors[index].color : '#8BAE46'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
