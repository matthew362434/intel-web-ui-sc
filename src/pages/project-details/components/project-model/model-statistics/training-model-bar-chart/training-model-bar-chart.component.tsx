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

import { Colors, convertColorToFadedColor, BarVerticalChart } from '../../../../../../shared/components';
import { ProjectCardContent } from '../../../project-card-content';
import { TrainingModelBarRadialChart } from '../model-statistics.interface';

const TrainingModelBarChart = ({ header, value }: TrainingModelBarRadialChart): JSX.Element => {
    const colors: Colors[] = [];
    const barData = value.map(({ value: labelValue, header: labelHeader, color }) => {
        const barColor = color ? color : '#8BAE46';
        colors.push({ color: barColor, fadedColor: convertColorToFadedColor(barColor, 50) });
        return {
            label: labelHeader,
            value: labelValue,
        };
    });
    return (
        <ProjectCardContent title={header}>
            <BarVerticalChart data={barData} barSize={20} colors={colors} xAxisHeight={75} textAnchor={'end'} />
        </ProjectCardContent>
    );
};

export default TrainingModelBarChart;
