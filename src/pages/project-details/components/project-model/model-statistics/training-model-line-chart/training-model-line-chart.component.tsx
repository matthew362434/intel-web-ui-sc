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

import { LineChart, LineChartData } from '../../../../../../shared/components';
import { ProjectCardContent } from '../../../project-card-content';
import { TrainingModelLineChartType } from '../model-statistics.interface';

export const TrainingModelLineChart = ({ header, value }: TrainingModelLineChartType): JSX.Element => {
    const { lineData, xAxisLabel, yAxisLabel } = value;
    const convertedLineData: LineChartData[] = lineData.map(({ points, header: labelHeader, color }) => ({
        name: labelHeader.toLowerCase(),
        color: color ? color : 'var(--default-chart-color)',
        points,
    }));

    return (
        <ProjectCardContent title={header}>
            <LineChart data={convertedLineData} xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} />
        </ProjectCardContent>
    );
};
