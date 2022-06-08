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

import { Flex, Text, Link, TooltipTrigger, Tooltip, useNumberFormatter } from '@adobe/react-spectrum';
import { Link as RouterLink } from 'react-router-dom';

import { Performance } from '../../../../core/projects';
import { PATHS } from '../../../../core/services';
import { AccuracyMeter } from '../../../project-details/components/project-models/model-container/model-card/accuracy-container/accuracy-meter.component';

interface TooltipContentProps {
    performance: Performance;
    isTaskChainProject: boolean;
}
const TooltipContent = ({ performance, isTaskChainProject }: TooltipContentProps) => {
    const formatter = useNumberFormatter({
        style: 'percent',
        maximumFractionDigits: 0,
    });

    if (performance.type === 'anomaly_performance') {
        return (
            <Text>
                Classification score: {formatter.format(performance.globalScore)}
                <br />
                Localization score: {performance.localScore !== null ? formatter.format(performance.localScore) : 'N/A'}
            </Text>
        );
    }

    if (isTaskChainProject) {
        return (
            <Text>
                The project score for a task-chain project is the average of the performance of the latest model for
                each task. Click here to go to the models page.
            </Text>
        );
    }

    return <Text>Latest project score</Text>;
};

interface ProjectPerformanceProps {
    performance: Performance;
    isTaskChainProject: boolean;
    projectId: string;
}
export const ProjectPerformance = ({ performance, isTaskChainProject, projectId }: ProjectPerformanceProps) => {
    return (
        <TooltipTrigger>
            <Link UNSAFE_style={{ textDecoration: 'none' }}>
                <RouterLink to={PATHS.getProjectModelsUrl(projectId)}>
                    <Flex direction='column' gap='size-100' height='100%'>
                        {performance.type === 'default_performance' ? (
                            <AccuracyMeter
                                value={Math.round(performance.score * 100)}
                                size={'S'}
                                showValueLabel={true}
                                id={'navigation-toolbar-accuracy'}
                                ariaLabel='Project score'
                            />
                        ) : (
                            <>
                                <AccuracyMeter
                                    value={Math.round(performance.globalScore * 100)}
                                    size={'S'}
                                    showValueLabel={false}
                                    id={'navigation-toolbar-accuracy-global'}
                                    ariaLabel='Image score'
                                />
                                <AccuracyMeter
                                    value={Math.round((performance.localScore ?? 0) * 100)}
                                    size={'S'}
                                    showValueLabel={false}
                                    id={'navigation-toolbar-accuracy-local'}
                                    ariaLabel='Object score'
                                />
                            </>
                        )}
                    </Flex>
                </RouterLink>
            </Link>
            <Tooltip>
                <TooltipContent performance={performance} isTaskChainProject={isTaskChainProject} />
            </Tooltip>
        </TooltipTrigger>
    );
};
