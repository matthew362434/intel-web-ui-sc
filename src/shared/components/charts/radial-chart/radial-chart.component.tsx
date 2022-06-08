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

import { ResponsiveContainer, RadialBarChart, PolarAngleAxis, RadialBar, Legend } from 'recharts';

import { ChartData } from '../chart.interface';

interface RadialData extends ChartData {
    fill?: string;
}

interface RadialChartProps {
    circleSize?: number;
    innerRadius?: number;
    children?: ReactNode;
    data: RadialData[];
    legend?: boolean;
}

export const RadialChart = ({
    data,
    children,
    circleSize = 100,
    innerRadius = 80,
    legend,
}: RadialChartProps): JSX.Element => {
    return (
        <ResponsiveContainer>
            <RadialBarChart
                width={circleSize}
                height={circleSize}
                innerRadius={innerRadius}
                data={data}
                startAngle={90}
                endAngle={-270}
            >
                <PolarAngleAxis type='number' domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                    dataKey='value'
                    name={'label'}
                    background={{ fill: 'var(--spectrum-global-color-gray-300)' }}
                />
                {legend && (
                    <Legend
                        align={'left'}
                        iconType={'square'}
                        payload={data.map((item: RadialData) => ({
                            id: item.label,
                            type: 'square',
                            value: `${item.label} ${item.value / 100}`,
                            color: item.fill,
                        }))}
                    />
                )}

                {children}
            </RadialBarChart>
        </ResponsiveContainer>
    );
};
