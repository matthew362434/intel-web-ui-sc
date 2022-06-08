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

import { ReactNode } from 'react';

import { renderHook } from '@testing-library/react-hooks';

import { createInMemoryProjectService, DOMAIN, Task } from '../../../../core/projects';
import { isClassificationDomain, isDetectionDomain } from '../../../../core/projects/domains';
import { applicationRender as render, RequiredProviders, screen } from '../../../../test-utils';
import { getMockedProject, getMockedTask } from '../../../../test-utils/mocked-items-factory';
import { ProjectProvider, useProject } from './project-provider.component';

describe('project provider', () => {
    const ScoreDisplay = (): JSX.Element => {
        const { score } = useProject();

        return <span>{score}</span>;
    };

    it('check if score is properly rounded - 0.768 should return 77', async () => {
        await render(
            <ProjectProvider projectIdentifier={{ projectId: 'test', workspaceId: 'test_workspace' }}>
                <ScoreDisplay />
            </ProjectProvider>
        );

        expect(screen.getByText('77')).toBeInTheDocument();
    });

    const wrapper = ({ children, tasks }: { children?: ReactNode; tasks: Task[] }) => {
        const projectSerivce = createInMemoryProjectService();

        projectSerivce.getProject = jest.fn(async () => {
            return getMockedProject({ id: 'test', tasks });
        });

        return (
            <RequiredProviders projectService={projectSerivce}>
                <ProjectProvider projectIdentifier={{ projectId: 'test', workspaceId: 'test_workspace' }}>
                    {children}
                </ProjectProvider>
            </RequiredProviders>
        );
    };

    describe('isTaskChainProject', () => {
        it('is not a task chain project if there is only a single task', async () => {
            const tasks = [getMockedTask({ id: 'classification', domain: DOMAIN.CLASSIFICATION })];

            const { waitFor, result } = renderHook(useProject, { wrapper, initialProps: { tasks } });

            // Wait for project to be loaded
            await waitFor(() => {
                expect(result.current.project).not.toBeUndefined();
            });

            expect(result.current.isTaskChainProject).toBe(false);
        });

        it('is a task chain project if there are multiple tasks', async () => {
            const tasks = [
                getMockedTask({ id: 'detection', domain: DOMAIN.DETECTION }),
                getMockedTask({ id: 'classification', domain: DOMAIN.CLASSIFICATION }),
            ];

            const { waitFor, result } = renderHook(useProject, { wrapper, initialProps: { tasks } });

            // Wait for project to be loaded
            await waitFor(() => {
                expect(result.current.project).not.toBeUndefined();
            });

            expect(result.current.isTaskChainProject).toBe(true);
        });
    });

    describe('isSingleDomainProject', () => {
        it('is not a single domain project if there are multiple tasks', async () => {
            const tasks = [
                getMockedTask({ id: 'detection', domain: DOMAIN.DETECTION }),
                getMockedTask({ id: 'classification', domain: DOMAIN.CLASSIFICATION }),
            ];

            const { waitFor, result } = renderHook(useProject, { wrapper, initialProps: { tasks } });

            // Wait for project to be loaded
            await waitFor(() => {
                expect(result.current.project).not.toBeUndefined();
            });

            expect(result.current.isSingleDomainProject(DOMAIN.CLASSIFICATION)).toBe(false);
            expect(result.current.isSingleDomainProject(isClassificationDomain)).toBe(false);
        });

        it('is a single domain project if there is a single task', async () => {
            const tasks = [getMockedTask({ id: 'classification', domain: DOMAIN.CLASSIFICATION })];

            const { waitFor, result } = renderHook(useProject, { wrapper, initialProps: { tasks } });

            // Wait for project to be loaded
            await waitFor(() => {
                expect(result.current.project).not.toBeUndefined();
            });

            expect(result.current.isSingleDomainProject(DOMAIN.CLASSIFICATION)).toBe(true);
            expect(result.current.isSingleDomainProject(isClassificationDomain)).toBe(true);

            expect(result.current.isSingleDomainProject(DOMAIN.DETECTION)).toBe(false);
            expect(result.current.isSingleDomainProject(isDetectionDomain)).toBe(false);
        });
    });
});
