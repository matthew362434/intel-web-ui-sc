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
import { useNumberFormatter } from '@adobe/react-spectrum';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts';

import { PieCustomTooltip } from './pie-custom-tooltip.component';

export interface PieChartProps {
    data: {
        name: string | null;
        value: number;
        fill: string;
    }[];
}

export const PieChart = ({ data }: PieChartProps): JSX.Element => {
    const totalSum = data.reduce<number>((prev, curr) => prev + curr.value, 0);
    const formatter = useNumberFormatter({ notation: 'compact', compactDisplay: 'short' });
    const isNoObject = data.length > 0 && data[0].name === null;

    return (
        <ResponsiveContainer>
            <RePieChart>
                <Pie dataKey='value' data={data} cx='50%' cy='50%' innerRadius={100} paddingAngle={isNoObject ? 0 : 2}>
                    {data.map(({ name, fill }) => (
                        <Cell key={`cell-${name}`} fill={fill} stroke={fill} />
                    ))}
                </Pie>
                <text
                    x={'50%'}
                    y={'50%'}
                    textAnchor='middle'
                    fill={'#fff'}
                    fontSize={'var(--spectrum-global-dimension-font-size-900)'}
                >
                    {formatter.format(isNoObject ? 0 : totalSum)}
                </text>
                <text x={'50%'} y={'50%'} textAnchor='middle' fill={'#fff'} dy={20}>
                    Objects
                </text>
                {!isNoObject && <Tooltip content={<PieCustomTooltip total={totalSum} />} />}
            </RePieChart>
        </ResponsiveContainer>
    );
};
