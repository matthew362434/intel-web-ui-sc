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

import { Flex, Grid, minmax, Text, View } from '@adobe/react-spectrum';
import { Divider } from '@react-spectrum/divider';

import { useStatus } from '../../../../core/jobs/hooks/use-status.hook';
import { isAnomalyDomain, isClassificationDomain } from '../../../../core/projects';
import { AnnotationsRequired, JobsManagementOption } from '../../../../shared/components';
import { Settings } from '../../../../shared/components/header/settings/settings.component';
import { UseSettings } from '../../../../shared/components/header/settings/use-settings.hook';
import { useProject } from '../../../project-details/providers';
import { ANNOTATOR_MODE } from '../../core';
import { useRequiredAnnotations } from '../../hooks/use-required-annotations.hook';
import { useAnnotationToolContext, useAnnotator, useTask } from '../../providers';
import { DefaultLabelCombobox } from './default-label-combobox.component';
import { NavigationBreadcrumbs } from './navigation-breadcrumbs.component';
import classes from './navigation-toolbar.module.scss';
import { ProjectPerformance } from './project-performance.component';
import { ToggleAnnotatorMode } from './toggle-annotator-mode.component';

export const NavigationToolbar = ({ settings }: { settings: UseSettings }): JSX.Element => {
    const { project, isTaskTraining, isSingleDomainProject } = useProject();
    const { mode } = useAnnotator();
    const { data: status, error } = useStatus();
    const { activeDomains, setDefaultLabel, defaultLabel, selectedTask } = useTask();
    const annotationToolContext = useAnnotationToolContext();
    const requiredAnnotations = useRequiredAnnotations();

    const hideRequiredAnnotations = isSingleDomainProject(isAnomalyDomain);

    // We need to show the training information per task
    const isTraining = isTaskTraining(selectedTask);

    const hideDefaultLabelCombobox =
        mode === ANNOTATOR_MODE.PREDICTION ||
        activeDomains.filter(isClassificationDomain).length === activeDomains.length;

    const isTaskChainProject = project.domains.length > 1;

    return (
        <View backgroundColor='gray-200' gridArea='navigationToolbar' padding='size-100' id={'annotator-header'}>
            <Grid columns={['3fr', 'auto']}>
                <Grid columns={[minmax('min-content', '200px'), '1fr', minmax('min-content', '200px')]}>
                    <View>
                        {hideDefaultLabelCombobox ? (
                            <></>
                        ) : (
                            <DefaultLabelCombobox
                                defaultLabel={defaultLabel}
                                setDefaultLabel={setDefaultLabel}
                                annotationToolContext={annotationToolContext}
                            />
                        )}
                    </View>

                    {!isTaskChainProject ? (
                        <Text UNSAFE_className={classes.projectName}>
                            {project.name} @ {project.domains[0]}
                        </Text>
                    ) : (
                        <NavigationBreadcrumbs />
                    )}

                    <View paddingEnd='size-100' UNSAFE_className={classes.toggleMode}>
                        <ToggleAnnotatorMode />
                    </View>
                </Grid>

                <View UNSAFE_className={classes.annotations}>
                    <Flex justifyContent='space-between' alignItems='center' height='100%' gap='size-100'>
                        <Divider orientation='vertical' size='S' UNSAFE_className={classes.divider} />

                        {requiredAnnotations && !hideRequiredAnnotations ? (
                            <>
                                <AnnotationsRequired
                                    requiredAnnotations={requiredAnnotations}
                                    selectedTask={selectedTask}
                                    isTraining={isTraining}
                                    id={'navigation-toolbar-required-annotations'}
                                />
                                <Divider orientation='vertical' size='S' UNSAFE_className={classes.divider} />
                            </>
                        ) : (
                            <View flexGrow={1} />
                        )}

                        <ProjectPerformance
                            performance={project.performance}
                            isTaskChainProject={isTaskChainProject}
                            projectId={project.id}
                        />
                        <JobsManagementOption runningJobs={status?.runningJobs} error={error} />
                        <Settings settings={settings} />
                    </Flex>
                </View>
            </Grid>
        </View>
    );
};
