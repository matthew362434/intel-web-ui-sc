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

import { lazy, Suspense } from 'react';

import { Grid, View, Flex, Tabs, TabList, Item } from '@adobe/react-spectrum';
import { Redirect, Route, Switch } from 'react-router-dom';

import { ROUTER_PATHS } from '../../core/services';
import { useApplicationContext } from '../../providers';
import { Header, Loading } from '../../shared/components';
import { ErrorBoundary } from '../errors/error-boundary.component';
import { TeamManagementProvider } from '../team-management';
import { LandingWorkspace as Workspace, LandingPageSidebar as Sidebar } from './components';
import { ProjectsListProvider } from './components/landing-page-workspace/components';
import { DatasetImportProvider } from './components/landing-page-workspace/components/dataset-import/dataset-import.provider.component';

const AboutPage = lazy(() => import('../about-page/about-page.component' /* webpackChunkName: "about" */));

const ProfilePage = lazy(() => import('../profile-page/profile-page.component' /* webpackChunkName: "profile" */));

const TeamManagement = lazy(
    () => import('../team-management/team-management.component' /* webpackChunkName: "team" */)
);

export const LandingPage = (): JSX.Element => {
    const GRID_AREAS = ['header  header', 'sidebar content'];
    const GRID_COLUMNS = ['size-3400', 'auto'];
    const GRID_ROWS = ['size-900', 'auto'];

    const { workspaceName } = useApplicationContext();

    const selectedWorkspace = {
        title: workspaceName,
    };

    const workspaceTab = (
        <Tabs aria-label='workspaces'>
            <TabList>
                <Item aria-label={'selected-workspace'} key='selected-workspace' textValue={selectedWorkspace.title}>
                    {selectedWorkspace.title}
                </Item>
            </TabList>
        </Tabs>
    );

    return (
        <Grid areas={GRID_AREAS} columns={GRID_COLUMNS} rows={GRID_ROWS} height='100vh' maxHeight={'100vh'}>
            <View gridArea='header'>
                <Header />
            </View>
            <View backgroundColor='gray-50' gridArea='sidebar'>
                <Sidebar />
            </View>
            <View backgroundColor='gray-50' gridArea='content' paddingTop={'size-400'} overflow='hidden'>
                <Flex direction={'column'} maxHeight={'100%'} height={'100%'} position={'relative'}>
                    <Switch>
                        <Route
                            exact
                            path={ROUTER_PATHS.LANDING_PAGE}
                            render={() => (
                                <ErrorBoundary>
                                    <ProjectsListProvider>
                                        <DatasetImportProvider>
                                            <Flex
                                                maxHeight={'100%'}
                                                height={'100%'}
                                                marginX={'size-800'}
                                                direction={'column'}
                                            >
                                                {workspaceTab}
                                                <Workspace title={selectedWorkspace.title} />
                                            </Flex>
                                        </DatasetImportProvider>
                                    </ProjectsListProvider>
                                </ErrorBoundary>
                            )}
                        />
                        <Route
                            exact
                            path={ROUTER_PATHS.PROFILE_PAGE}
                            render={() => (
                                <Suspense fallback={<Loading size='L' />}>
                                    <ProfilePage />
                                </Suspense>
                            )}
                        />
                        <Route
                            exact
                            path={ROUTER_PATHS.ABOUT_PAGE}
                            render={() => (
                                <Suspense fallback={<Loading size='L' />}>
                                    <AboutPage />
                                </Suspense>
                            )}
                        />
                        <Route
                            path={ROUTER_PATHS.TEAM}
                            render={() => (
                                <TeamManagementProvider>
                                    <Suspense fallback={<Loading size='L' />}>
                                        <TeamManagement />
                                    </Suspense>
                                </TeamManagementProvider>
                            )}
                        />
                        <Redirect to={ROUTER_PATHS.LANDING_PAGE} />
                    </Switch>
                </Flex>
            </View>
        </Grid>
    );
};

export default LandingPage;
