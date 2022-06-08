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

import { useMemo } from 'react';

import { Flex } from '@adobe/react-spectrum';
import { Footer as FooterView, View } from '@react-spectrum/view';

import { useProject } from '../../../project-details/providers/project-provider/project-provider.component';
import { useAnnotator } from '../../providers';
import { useTask } from '../../providers/task-provider/task-provider.component';
import { MediaItemMetadata } from './media-item-metadata.component';
import { ProjectName } from './project-name.component';
import { TrainingProgress } from './training-progress/training-progress.component';
import { ZoomLevel } from './zoom-level.component';

interface FooterProps {
    zoom: number;
}

export const Footer = ({ zoom }: FooterProps): JSX.Element => {
    const { project, projectStatus } = useProject();
    const { selectedMediaItem } = useAnnotator();
    const { selectedTask } = useTask();

    const isTaskChainProject = project.domains.length > 1;

    const trainingStatus = useMemo(() => {
        const training = projectStatus?.isTraining ? projectStatus?.trainingDetails : undefined;
        const status = projectStatus?.trainingDetails?.message;
        const tasks = projectStatus?.tasks || [];

        // If we're on a single task project or on a chain task project with 'all tasks' selected
        // We use the general 'training' status, or else we use the status for the specific task
        const generalStatus = { message: status || '', progress: '', ...training };

        if (selectedTask) {
            const currentTaskTrainingProgress = tasks.find((task) => task.id === selectedTask.id);

            if (currentTaskTrainingProgress) {
                const { message, progress, time_remaining } = currentTaskTrainingProgress.status;

                return {
                    message: message || '',
                    progress: progress >= 0 ? `${progress}%` : '',
                    timeRemaining: time_remaining > 1 ? time_remaining.toString() : undefined,
                };
            }
        }

        return generalStatus;
    }, [projectStatus?.isTraining, projectStatus?.tasks, projectStatus?.trainingDetails, selectedTask]);

    return (
        <FooterView gridArea='footer'>
            <View backgroundColor='gray-100' height='100%' borderStartColor='gray-50' borderStartWidth='thin'>
                <Flex justifyContent={'space-between'} height={'100%'}>
                    <TrainingProgress training={trainingStatus} />
                    <Flex height='100%' alignItems='center'>
                        {isTaskChainProject ? <ProjectName name={project.name} /> : <></>}
                        {selectedMediaItem !== undefined ? <MediaItemMetadata mediaItem={selectedMediaItem} /> : <></>}
                        <ZoomLevel zoom={zoom} />
                    </Flex>
                </Flex>
            </View>
        </FooterView>
    );
};
