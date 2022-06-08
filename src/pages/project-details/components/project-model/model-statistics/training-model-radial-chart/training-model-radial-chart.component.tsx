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

import { RadialChart } from '../../../../../../shared/components';
import { ProjectCardContent } from '../../../project-card-content';
import { TrainingModelBarRadialChart } from '../model-statistics.interface';

export const TrainingModelRadialChart = ({ header, value }: TrainingModelBarRadialChart): JSX.Element => {
    const radialData = value.map(({ header: labelHeader, value: labelValue, color }) => ({
        label: labelHeader,
        fill: color ? color : 'var(--default-chart-color)',
        value: labelValue * 100,
    }));

    return (
        <ProjectCardContent title={header} flexBasis={'33%'}>
            <RadialChart data={radialData} legend />
        </ProjectCardContent>
    );
};
