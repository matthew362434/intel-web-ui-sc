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
import { View } from '@react-spectrum/view';
import {
    CartesianGrid,
    ReferenceArea,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis,
    Label,
} from 'recharts';

import { ObjectSizeDistribution } from '../../project-annotations.interface';
import { DistributionEllipse } from './distribution-ellipse';
import { DistributionTriangle } from './distribution-triangle.component';
import { calculateHorizontalTrianglePoints, calculateVerticalTrianglePoints, getScatterPoints } from './utils';

interface DistributionChartProps {
    objectSizeDistribution: ObjectSizeDistribution;
}

export const DistributionChart = ({ objectSizeDistribution }: DistributionChartProps): JSX.Element => {
    const { sizeDistribution, clusterWidthHeight, clusterCenter, aspectRatioThresholdWide, aspectRatioThresholdTall } =
        objectSizeDistribution;
    const [rx, ry] = clusterWidthHeight;
    const [cx, cy] = clusterCenter;
    const { pointsWithinVerticalTriangle, pointsWithinHorizontalTriangle, restPoints } = getScatterPoints(
        sizeDistribution,
        aspectRatioThresholdTall ?? 0,
        aspectRatioThresholdWide ?? 0
    );
    const maxXValue = Math.max(...sizeDistribution.map(([xValue]) => xValue));
    const maxYValue = Math.max(...sizeDistribution.map(([_, yValue]) => yValue));

    const areAnnotations = aspectRatioThresholdWide !== null && aspectRatioThresholdTall !== null;

    return (
        <View height={'100%'} width={'100%'} flex={1}>
            <ResponsiveContainer>
                <ScatterChart
                    margin={{
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 20,
                    }}
                >
                    <XAxis
                        dataKey='x'
                        type='number'
                        domain={[0, areAnnotations ? 'dataMax' : 100]}
                        stroke={'var(--spectrum-global-color-gray-800)'}
                    >
                        <Label
                            value={'Width'}
                            position={'centerBottom'}
                            dy={30}
                            fill={'var(--spectrum-global-color-gray-800)'}
                            style={{ letterSpacing: 'size-50' }}
                        />
                    </XAxis>
                    <YAxis
                        dataKey='y'
                        type='number'
                        domain={[0, areAnnotations ? 'dataMax' : 100]}
                        stroke={'var(--spectrum-global-color-gray-800)'}
                    >
                        <Label
                            value={'Height'}
                            position={'centerBottom'}
                            dx={-30}
                            angle={-90}
                            fill={'var(--spectrum-global-color-gray-800)'}
                            style={{ letterSpacing: 'size-50' }}
                        />
                    </YAxis>
                    <CartesianGrid stroke={'#484A50'} />
                    <Scatter data={pointsWithinVerticalTriangle} fill='var(--wide-distribution)' />
                    <Scatter data={pointsWithinHorizontalTriangle} fill='var(--tall-distribution)' />
                    <Scatter data={restPoints} fill='#82ca9d' />
                    {aspectRatioThresholdWide !== null && aspectRatioThresholdTall !== null && (
                        <ReferenceArea
                            shape={(props) => (
                                <DistributionEllipse
                                    {...props}
                                    cx={cx}
                                    cy={cy}
                                    rx={rx}
                                    ry={ry}
                                    maxXValue={maxXValue}
                                    maxYValue={maxYValue}
                                />
                            )}
                        />
                    )}
                    {aspectRatioThresholdWide !== null && aspectRatioThresholdTall !== null && (
                        <ReferenceArea
                            shape={(props) => (
                                <DistributionTriangle
                                    {...props}
                                    points={calculateVerticalTrianglePoints(
                                        props,
                                        maxXValue,
                                        maxYValue,
                                        aspectRatioThresholdTall
                                    )}
                                    fill={'#86B3CA'}
                                />
                            )}
                        />
                    )}
                    {aspectRatioThresholdWide !== null && aspectRatioThresholdTall !== null && (
                        <ReferenceArea
                            shape={(props) => (
                                <DistributionTriangle
                                    {...props}
                                    points={calculateHorizontalTrianglePoints(
                                        props,
                                        maxXValue,
                                        maxYValue,
                                        aspectRatioThresholdWide
                                    )}
                                    fill={'#CC94DA'}
                                />
                            )}
                        />
                    )}
                </ScatterChart>
            </ResponsiveContainer>
        </View>
    );
};
