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

import { Key, useState } from 'react';

import { Grid, View } from '@adobe/react-spectrum';

import { DOMAIN, Task } from '../../../../core/projects';
import { useDatasetStatistics } from '../../../../core/statistics/hooks';
import { Loading } from '../../../../shared/components';
import { TasksList } from '../../../../shared/components/tasks-list';
import { useDatasetIdentifier } from '../../../annotator/hooks/use-dataset-identifier.hook';
import { useProject } from '../../providers';
import { ObjectSizeDistributionWrapper } from './object-size-distribution';
import { ProjectAnnotationsAssistant } from './project-annotations-assistant';
import { ProjectAnnotationsImages } from './project-annotations-images';
import { ProjectAnnotationsMedia } from './project-annotations-media';
import { ProjectAnnotationsObjects } from './project-annotations-objects';
import { ProjectAnnotationsVideos } from './project-annotations-videos';

export const ProjectAnnotationsStatistics = (): JSX.Element => {
    const { workspaceId, projectId, datasetId } = useDatasetIdentifier();
    const {
        isTaskChainProject,
        project: { tasks },
    } = useProject();
    const items = tasks.filter(({ domain }: Task) => domain !== DOMAIN.CROP);
    const [selectedTask, setSelectedTask] = useState<Key>(items[0].domain);
    const taskId = items.find(({ domain }: Task) => domain === selectedTask)?.id || '';
    const { data: statisticsData, isLoading } = useDatasetStatistics({
        workspaceId,
        projectId,
        datasetId,
        taskId,
    });

    const GRID_AREAS_NO_TC = [
        'media images videos',
        'assistant objects objects',
        'objects-distribution objects-distribution objects-distribution',
    ];
    const GRID_AREAS_TC = ['task_list . .', ...GRID_AREAS_NO_TC];
    const GRID_COLUMNS = ['1fr', '1fr', '1fr'];
    const GRID_ROWS_NO_TC = ['17rem', '55rem', '50rem'];
    const GRID_ROWS_TC = ['auto', ...GRID_ROWS_NO_TC];

    return (
        <View id='project-annotations-statistics-id' height='100%'>
            {isLoading ? (
                <Loading />
            ) : statisticsData ? (
                <>
                    <Grid
                        areas={isTaskChainProject ? GRID_AREAS_TC : GRID_AREAS_NO_TC}
                        columns={GRID_COLUMNS}
                        rows={isTaskChainProject ? GRID_ROWS_TC : GRID_ROWS_NO_TC}
                        gap='size-100'
                        UNSAFE_style={{ height: 'inherit' }}
                    >
                        {isTaskChainProject && (
                            <View gridArea={'task_list'}>
                                <TasksList
                                    selectedTask={selectedTask}
                                    setSelectedTask={setSelectedTask}
                                    marginBottom={'size-100'}
                                    items={items}
                                />
                            </View>
                        )}
                        <ProjectAnnotationsMedia
                            gridArea='media'
                            images={statisticsData.images}
                            videos={statisticsData.videos}
                        />
                        <ProjectAnnotationsImages
                            gridArea='images'
                            annotatedImages={statisticsData.annotatedImages}
                            images={statisticsData.images}
                        />
                        <ProjectAnnotationsVideos
                            gridArea='videos'
                            annotatedFrames={statisticsData.annotatedFrames}
                            annotatedVideos={statisticsData.annotatedVideos}
                        />
                        <ProjectAnnotationsAssistant
                            key={statisticsData.score}
                            score={statisticsData.score}
                            gridArea='assistant'
                        />
                        <ProjectAnnotationsObjects
                            objectsPerLabel={statisticsData.objectsPerLabel}
                            gridArea='objects'
                        />
                        {/* key - rerender completely ObjectSizeDistributionWrapper component once it gets new value */}
                        {/* project has at least one label so we can be sure that it always exists */}
                        <ObjectSizeDistributionWrapper
                            gridArea={'objects-distribution'}
                            objectSizeDistribution={statisticsData.objectSizeDistributionPerLabel}
                            key={statisticsData.objectSizeDistributionPerLabel[0].labelId as unknown as Key}
                        />
                    </Grid>
                </>
            ) : (
                <></>
            )}
        </View>
    );
};

export default ProjectAnnotationsStatistics;
