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

import { Key, useMemo, useState } from 'react';

import { Flex } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

import { PieChart } from '../../../../../shared/components/charts/pie-chart';
import { ProjectCardContent } from '../../project-card-content';
import { ObjectSizeDistribution } from '../project-annotations.interface';
import { ProjectGridArea } from '../project-grid-area.interface';
import { DistributionChart } from './distribution-chart';
import classes from './object-size-distribution-wrapper.module.scss';
import { ObjectsList } from './objects-list';
import { getDistributionLabels } from './utils';

interface ObjectSizeDistributionProps extends ProjectGridArea {
    objectSizeDistribution: ObjectSizeDistribution[];
}

export const ObjectSizeDistributionWrapper = ({
    gridArea,
    objectSizeDistribution,
}: ObjectSizeDistributionProps): JSX.Element => {
    const labels = useMemo(() => getDistributionLabels(objectSizeDistribution), [objectSizeDistribution]);
    const [selectedLabelKey, setSelectedLabelKey] = useState<Key>(labels[0].name);

    const [selectedObjectDistribution] = objectSizeDistribution.filter(
        ({ labelName }) => labelName === selectedLabelKey
    );
    const { objectDistributionFromAspectRatio, aspectRatioThresholdWide, aspectRatioThresholdTall } =
        selectedObjectDistribution;
    const { tall, balanced, wide } = objectDistributionFromAspectRatio;
    const pieChartData = [
        { name: 'Tall', value: tall, fill: 'var(--tall-distribution)' },
        { name: 'Wide', value: wide, fill: 'var(--wide-distribution)' },
        { name: 'Balanced', value: balanced, fill: 'var(--balanced-distribution)' },
    ];
    const objectSizes = [...pieChartData.map(({ name, fill }) => ({ name, fill })), { name: 'Near mean', fill: null }];

    return (
        <ProjectCardContent title={'Object size distribution'} gridArea={gridArea} height={'100%'}>
            <Flex
                height={'100%'}
                alignItems={'center'}
                justifyContent={'center'}
                UNSAFE_className={classes.objectDistributionWrapper}
            >
                <DistributionChart objectSizeDistribution={selectedObjectDistribution} />
                <View height={'100%'} flexBasis={'30%'}>
                    {aspectRatioThresholdWide !== null && !!aspectRatioThresholdTall !== null ? (
                        <PieChart data={pieChartData} />
                    ) : (
                        <PieChart data={[{ name: null, value: 100, fill: 'var(--spectrum-global-color-gray-300)' }]} />
                    )}
                </View>
                <ObjectsList
                    labels={labels}
                    objectSizes={objectSizes}
                    selectedLabelKey={selectedLabelKey}
                    setSelectedLabelKey={setSelectedLabelKey}
                />
            </Flex>
        </ProjectCardContent>
    );
};
