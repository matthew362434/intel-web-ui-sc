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

import { View, Flex } from '@adobe/react-spectrum';

import { ObjectsPerLabelInterface } from '../../../../../core/statistics/dtos';
import { ChartData, Colors, BarHorizontalChart } from '../../../../../shared/components';
import { ProjectCardContent } from '../../project-card-content';
import { ProjectGridArea } from '../project-grid-area.interface';
import { getColors } from './utils';

interface ProjectAnnotationsObjectsProps extends ProjectGridArea {
    objectsPerLabel: ObjectsPerLabelInterface[];
}

export const ProjectAnnotationsObjects = ({
    objectsPerLabel,
    gridArea,
}: ProjectAnnotationsObjectsProps): JSX.Element => {
    const data: ChartData[] = objectsPerLabel.map(({ label, value }) => ({
        label,
        value,
    }));

    const colors: Colors[] = getColors(objectsPerLabel);

    return (
        <ProjectCardContent title='Number of objects per label' gridArea={gridArea}>
            <Flex height={'100%'} justifyContent={'center'} alignItems={'center'}>
                <View width={'90%'} height={'90%'} id='objects-bar-horizontal-chart-id'>
                    <BarHorizontalChart
                        data={data}
                        colors={colors}
                        barSize={30}
                        xPadding={{ right: 15, left: 10 }}
                        yPadding={{ bottom: 10 }}
                    />
                </View>
            </Flex>
        </ProjectCardContent>
    );
};
