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

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import { Flex, View, Text } from '@adobe/react-spectrum';
import { DOMRefValue } from '@react-types/shared';
import { useCountUp } from 'react-countup';

import { useEventListener } from '../../../../../hooks';
import { RadialChart } from '../../../../../shared/components';
import { ProjectCardContent } from '../../project-card-content';
import { ProjectGridArea } from '../project-grid-area.interface';
import classes from './project-annotations-assistant.module.scss';

interface ProjectAnnotationsAssistantInterface extends ProjectGridArea {
    score: number;
}

export const ProjectAnnotationsAssistant = ({ score, gridArea }: ProjectAnnotationsAssistantInterface): JSX.Element => {
    const chartContainerRef = useRef<DOMRefValue<HTMLElement> | null>(null);
    const [xTextPos, setXTextPos] = useState<number>(-1);
    const [yTextPos, setYTextPos] = useState<number>(-1);
    const { countUp } = useCountUp({ end: score });

    const changeXYPos = useCallback((): void => {
        if (chartContainerRef.current?.UNSAFE_getDOMNode()) {
            const { height, width } = chartContainerRef.current.UNSAFE_getDOMNode().getBoundingClientRect();
            setXTextPos(width / 2);
            setYTextPos(height / 2);
        }
    }, []);

    useEventListener('resize', changeXYPos);
    useLayoutEffect(() => {
        changeXYPos();
    }, [changeXYPos, chartContainerRef.current?.UNSAFE_getDOMNode]);

    return (
        <ProjectCardContent title='AI assistant score' gridArea={gridArea}>
            <Flex
                direction={'column'}
                flexBasis={'100%'}
                height={'100%'}
                alignItems={'center'}
                justifyContent={'space-between'}
            >
                <View height={'100%'} width={'100%'} ref={chartContainerRef} id='assistant-radial-chart-id'>
                    <RadialChart
                        data={[{ label: 'annotation_accuracy', value: score, fill: 'var(--brand-moss)' }]}
                        circleSize={300}
                        innerRadius={130}
                    >
                        <text
                            x={xTextPos}
                            y={yTextPos - 10}
                            className={classes.projectAnnotationsAssistantRadialChartText}
                            textAnchor='middle'
                            dominantBaseline='middle'
                            fill='#fff'
                            id='assistant-radial-chart-accuracy-count-id'
                        >
                            {`${countUp}%`}
                        </text>
                        <text
                            x={xTextPos}
                            y={yTextPos + 20}
                            textAnchor='middle'
                            dominantBaseline='middle'
                            fill='#fff'
                            id='assistant-radial-chart-accuracy-id'
                        >
                            Accuracy
                        </text>
                    </RadialChart>
                </View>
                <Text alignSelf={'flex-start'} marginBottom={'size-200'} id='assistant-active-model-id'>
                    Active model
                </Text>
            </Flex>
        </ProjectCardContent>
    );
};
