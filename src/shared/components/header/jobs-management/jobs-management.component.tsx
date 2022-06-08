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
import { Key, useRef } from 'react';

import { Content, Flex, Provider, Text } from '@adobe/react-spectrum';

import { Accept, Alert, Time } from '../../../../assets/icons';
import { useJobs } from '../../../../core/jobs/hooks/use-jobs.hook';
import { useApplicationContext } from '../../../../providers';
import { NumberBadge } from '../../number-badge/number-badge.component';
import { TabItem, Tabs } from '../../tabs';
import { ExportLogs } from './export-logs';
import classes from './jobs-management.module.scss';
import { Jobs } from './jobs/jobs.component';
import { returnJobsByState } from './utils';

export enum JobTabType {
    RUNNING,
    FINISHED,
    SCHEDULED,
    FAILED,
}

export const JobsManagement = (): JSX.Element => {
    const selectedTab = useRef<Key>();
    const { workspaceId } = useApplicationContext();

    const { data, isLoading } = useJobs(workspaceId);
    const { runningJobs, failedJobs, scheduledJobs, finishedJobs } = returnJobsByState(data ?? []);

    const tabs: TabItem[] = [
        {
            id: 'running-jobs-id',
            key: 'running-jobs',
            name: (
                <>
                    <Text>Running jobs</Text>
                    <NumberBadge
                        number={runningJobs?.length}
                        selected={selectedTab.current === 'running-jobs'}
                        id={'running-jobs'}
                    />
                </>
            ),
            children: <Jobs jobs={runningJobs} type={JobTabType.RUNNING} isLoading={isLoading} />,
        },
        {
            id: 'finished-jobs-id',
            key: 'finished-jobs',
            name: (
                <>
                    <Text>Finished jobs</Text>
                    <NumberBadge
                        number={finishedJobs?.length}
                        selected={selectedTab.current === 'finished-jobs'}
                        id={'finished-jobs'}
                    />
                </>
            ),
            children: (
                <Jobs
                    jobs={finishedJobs}
                    type={JobTabType.FINISHED}
                    isLoading={isLoading}
                    icon={
                        <Flex marginX={'size-100'} UNSAFE_className={classes.checkmark}>
                            <Accept />
                        </Flex>
                    }
                />
            ),
        },
        {
            id: 'scheduled-jobs-id',
            key: 'scheduled-jobs',
            name: (
                <>
                    <Text>Scheduled jobs</Text>
                    <NumberBadge
                        number={scheduledJobs?.length}
                        selected={selectedTab.current === 'scheduled-jobs'}
                        id={'scheduled-jobs'}
                    />
                </>
            ),
            children: (
                <Jobs
                    jobs={scheduledJobs}
                    type={JobTabType.SCHEDULED}
                    isLoading={isLoading}
                    icon={
                        <Flex marginX={'size-100'}>
                            <Time />
                        </Flex>
                    }
                />
            ),
        },
        {
            name: (
                <>
                    <Text>Failed jobs</Text>
                    <NumberBadge
                        number={failedJobs?.length}
                        selected={selectedTab.current === 'failed-jobs'}
                        id={'failed-jobs'}
                    />
                </>
            ),
            id: 'failed-jobs-id',
            key: 'failed-jobs',
            children: (
                <Jobs
                    jobs={failedJobs}
                    type={JobTabType.FAILED}
                    isLoading={isLoading}
                    icon={
                        <Flex marginX={'size-100'} UNSAFE_className={classes.alert}>
                            <Alert />
                        </Flex>
                    }
                />
            ),
        },
    ];

    return (
        <Provider isQuiet>
            <Content margin={'size-300'}>
                <Flex justifyContent={'end'} alignItems={'center'}>
                    <ExportLogs />
                </Flex>
                <Tabs
                    onSelectionChange={(key) => (selectedTab.current = key)}
                    isQuiet={false}
                    width={'75.2rem'}
                    height={'39.2rem'}
                    items={tabs}
                    panelOverflowY={'hidden'}
                />
            </Content>
        </Provider>
    );
};
