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

import { Key, lazy, Suspense, useEffect, useState } from 'react';

import { Flex, Item, TabList, TabPanels, Tabs } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';
import { useOverlayTriggerState } from '@react-stately/overlays';
import { useHistory } from 'react-router-dom';

import { MediaService } from '../../../../core/media/services/media-service.interface';
import { isAnomalyDomain } from '../../../../core/projects/domains';
import { useDeleteAllMedia } from '../../../../core/projects/hooks/use-delete-all-media.hook';
import { PATHS } from '../../../../core/services';
import { Loading, TabItem } from '../../../../shared/components';
import { capitalize } from '../../../../shared/utils';
import { useDatasetIdentifier } from '../../../annotator/hooks/use-dataset-identifier.hook';
import { MediaProvider } from '../../../media/providers';
import { useProject } from '../../providers';
import { ExportDatasetNotification } from './export-dataset-notification.component';
import { ProjectDatasetTabActions } from './project-dataset-tab-actions.component';
import classes from './project-dataset.module.scss';

const ProjectAnnotationsStatistics = lazy(
    () =>
        import(
            /* webpackChunkName: "annotationStatistics", webPackPrefetch: true */
            '../project-annotations/project-annotations-statistics.component'
        )
);

const ProjectLabels = lazy(
    () =>
        import(
            /* webpackChunkName: "labels", webPackPrefetch: true */
            '../project-labels/project-labels.component'
        )
);

const ProjectMedia = lazy(
    () => import(/* webpackChunkName: "projectMedia" */ '../project-media/project-media.component')
);

interface ProjectDatasetProps {
    mediaService: MediaService;
}

export enum DatasetChapters {
    DEFAULT = 'media',
    MEDIA = 'media',
    LABELS = 'labels',
    STATISTICS = 'statistics',
}

export const ProjectDataset = ({ mediaService }: ProjectDatasetProps): JSX.Element => {
    const history = useHistory();
    const { project, isSingleDomainProject } = useProject();
    const datasetIdentifier = useDatasetIdentifier();
    const { deleteAllMedia } = useDeleteAllMedia();

    const [activeTab, setActiveTab] = useState<Key>(DatasetChapters.MEDIA);
    const [isTabInEdition, setTabInEdition] = useState<boolean>(false);

    const isAnomalyProject = isSingleDomainProject(isAnomalyDomain);

    const exportNotificationState = useOverlayTriggerState({});

    const handleGoToAnnotator = () => {
        history.push(PATHS.getAnnotatorUrl(project.id));
    };

    const handleDeleteAllMedia = () => {
        deleteAllMedia.mutate(datasetIdentifier);
    };

    const childrenTabs: TabItem[] = [
        {
            id: `${DatasetChapters.MEDIA}-id`,
            key: DatasetChapters.MEDIA,
            name: `${capitalize(DatasetChapters.MEDIA)}`,
            children: (
                <MediaProvider mediaService={mediaService} datasetIdentifier={datasetIdentifier}>
                    <Suspense fallback={<Loading size='L' />}>
                        <ProjectMedia />
                    </Suspense>
                </MediaProvider>
            ),
        },
        {
            id: `${DatasetChapters.LABELS}-id`,
            key: DatasetChapters.LABELS,
            name: `${capitalize(DatasetChapters.LABELS)}`,
            children: (
                <Suspense fallback={<Loading size='L' />}>
                    <ProjectLabels setInEdition={setTabInEdition} isInEdition={isTabInEdition} />
                </Suspense>
            ),
        },
        {
            id: `${DatasetChapters.STATISTICS}-id`,
            key: DatasetChapters.STATISTICS,
            name: `${capitalize(DatasetChapters.STATISTICS)}`,
            children: (
                <Suspense fallback={<Loading size='L' />}>
                    <ProjectAnnotationsStatistics />
                </Suspense>
            ),
        },
    ];

    const parentTabs: TabItem[] = [
        {
            id: 'dataset-id',
            key: 'dataset',
            name: 'Dataset',
            children: (
                <View position='relative' height='100%'>
                    <ExportDatasetNotification
                        datasetIdentifier={datasetIdentifier}
                        visibilityState={exportNotificationState}
                    />

                    <Flex height='100%'>
                        <Tabs
                            isQuiet
                            items={childrenTabs}
                            selectedKey={activeTab}
                            height='100%'
                            aria-label='Dataset page sub tabs'
                            onSelectionChange={(key: Key) => {
                                history.push(PATHS.getProjectDatasetUrl(project.id, String(key)));
                            }}
                        >
                            <TabList UNSAFE_className={classes.childrenTabList}>
                                {(item: TabItem) => <Item>{item.name}</Item>}
                            </TabList>
                            <TabPanels minHeight={0} UNSAFE_style={{ overflowY: 'auto' }}>
                                {(item: TabItem) => <Item>{item.children}</Item>}
                            </TabPanels>
                        </Tabs>
                    </Flex>
                </View>
            ),
        },
    ];

    useEffect(() => {
        const { pathname } = history.location;
        const paths = pathname.split('/');
        const currentTab = paths[paths.length - 1];

        //Active button should be disabled when labels are in edition, turn off edition when switching the tab
        if (currentTab !== DatasetChapters.LABELS) {
            setTabInEdition(false);
        }
        setActiveTab(currentTab);
    }, [history.location]);

    return (
        <View UNSAFE_className={classes.componentWrapper}>
            <Tabs items={parentTabs} height='100%' minHeight={0} aria-label='Dataset page tabs'>
                <Flex justifyContent={'space-between'} width={'100%'}>
                    <TabList UNSAFE_className={classes.parentTabList}>
                        {(item: TabItem) => <Item>{item.name}</Item>}
                    </TabList>

                    <MediaProvider mediaService={mediaService} datasetIdentifier={datasetIdentifier}>
                        <ProjectDatasetTabActions
                            isInEdition={isTabInEdition}
                            isAnomalyProject={isAnomalyProject}
                            onGoToAnnotator={handleGoToAnnotator}
                            onDeleteAllMedia={handleDeleteAllMedia}
                            exportNotificationState={exportNotificationState}
                        />
                    </MediaProvider>
                </Flex>
                <TabPanels height='100%' minHeight={0}>
                    {(item: TabItem) => <Item>{item.children}</Item>}
                </TabPanels>
            </Tabs>
        </View>
    );
};

export default ProjectDataset;
