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

import { useCallback, useState } from 'react';

import { ResponsiveContainer, LineChart as LineChartRe, XAxis, YAxis, Line, Legend, Tooltip } from 'recharts';

import { CustomTooltip } from './custom-tooltip';
import { LineChartProps } from './line-chart.interface';
import classes from './line-chart.module.scss';

const MARGIN_THRESHOLD = 20;
const CHARACTER_WIDTH = 5;
const ADDITIONAL_MARGIN = 10;

export const LineChart = ({ data, xAxisLabel, yAxisLabel }: LineChartProps): JSX.Element => {
    const [margin, setMargin] = useState<number>(0);

    // eslint-disable-next-line
    const tickFormatter = useCallback((value: any) => {
        if (typeof value === 'number') {
            return value > 1 ? parseFloat(value.toFixed(2)) : parseFloat(value.toFixed(5));
        }
        return value;
    }, []);

    // eslint-disable-next-line
    const yTickFormatter = (value: any) => {
        const formattedValue = tickFormatter(value);
        if (typeof formattedValue === 'number') {
            const calcMargin = formattedValue.toString().length * CHARACTER_WIDTH + ADDITIONAL_MARGIN;
            setMargin((prevMargin) => (prevMargin < calcMargin ? calcMargin : prevMargin));
            return formattedValue;
        }
        return formattedValue;
    };

    return (
        <ResponsiveContainer>
            <LineChartRe
                className={classes.lineChartAxis}
                margin={{
                    top: 10,
                    left: margin - MARGIN_THRESHOLD,
                    right: 10,
                    bottom: 5,
                }}
            >
                <XAxis
                    dataKey={'x'}
                    axisLine={true}
                    className={classes.lineChartAxis}
                    allowDuplicatedCategory={false}
                    padding={{ right: 20 }}
                    tickMargin={5}
                    height={55}
                    interval={'preserveStartEnd'}
                    minTickGap={15}
                    tickFormatter={tickFormatter}
                    label={{ value: xAxisLabel, dy: 20 }}
                />
                <YAxis
                    dataKey={'y'}
                    tickLine={false}
                    tickFormatter={yTickFormatter}
                    label={{ value: yAxisLabel, angle: -90, dx: -margin }}
                />
                <Legend iconType={'square'} align={'left'} />
                {data.map(({ points, name, color }) => (
                    <Line
                        dataKey={'y'}
                        data={points}
                        key={name}
                        name={name}
                        stroke={color}
                        activeDot={true}
                        dot={false}
                    />
                ))}
                <Tooltip
                    content={<CustomTooltip xLabel={xAxisLabel} yLabel={yAxisLabel} formatter={tickFormatter} />}
                />
            </LineChartRe>
        </ResponsiveContainer>
    );
};
