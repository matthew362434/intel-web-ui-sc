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

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { Button, DialogContainer, Flex } from '@adobe/react-spectrum';

import { isAnomalyDomain, ProjectProps } from '../../../../core/projects';
import { useProject } from '../../../../core/projects/hooks';
import { useEditProjectLabel } from '../../../../core/projects/hooks/use-edit-project-label.hook';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { ButtonWithTooltip, Loading } from '../../../../shared/components';
import { getUserDefinedLabels } from '../../../../shared/utils';
import {
    LabelItemEditionState,
    LabelTreeGroup,
    LabelTreeItem,
    LabelTreeLabel,
} from '../../../annotator/components/labels/label-tree-view';
import { fetchLabelsTree, fetchLabelsTreeWithGroups } from '../../../annotator/components/labels/utils';
import { useDatasetIdentifier } from '../../../annotator/hooks/use-dataset-identifier.hook';
import { LabelsRelationType } from '../../../create-project/components/select-project-template/utils';
import { ProjectLabelsManagement } from './project-labels-management/project-labels-management.component';
import { RevisitAlertDialog } from './revisit-alert-dialog/revisit-alert-dialog.component';
import {
    getFlattenedGroups,
    getFlattenedLabels,
    getLabelPayload,
    getLabelsWithState,
    getNewLabelPayload,
    getDeletedLabelPayload,
    getRelation,
} from './utils';

interface ProjectLabelsProps {
    isInEdition: boolean;
    setInEdition: Dispatch<SetStateAction<boolean>>;
}

export const ProjectLabels = ({ isInEdition, setInEdition }: ProjectLabelsProps): JSX.Element => {
    const { editLabels } = useEditProjectLabel();
    const datasetIdentifier = useDatasetIdentifier();
    const { workspaceId, projectId } = datasetIdentifier;
    const { data, refetch } = useProject(workspaceId, projectId);

    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [labelsTree, setLabelsTree] = useState<LabelTreeItem[]>([]);
    const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

    const { addNotification } = useNotification();

    const untouchedLabelsTree = useRef<LabelTreeItem[]>();

    const notEditable = data?.domains.length === 1 && isAnomalyDomain(data?.domains[0]);
    const labels = !!data ? getUserDefinedLabels(data.tasks) : [];
    const relation = !!data ? getRelation(labels, data.domains) : LabelsRelationType.MIXED;

    const getLabelsTree = (): LabelTreeItem[] => {
        if (relation === LabelsRelationType.MIXED) {
            return fetchLabelsTreeWithGroups(labels, 'all', null, null);
        } else return fetchLabelsTree(labels, 'all');
    };

    useEffect(() => {
        const currentLabelsTree = getLabelsTree();

        setLabelsTree(
            currentLabelsTree.map((label: LabelTreeItem): LabelTreeItem => {
                return { ...label, open: true };
            })
        );

        untouchedLabelsTree.current = currentLabelsTree.map((label: LabelTreeItem): LabelTreeItem => {
            return { ...label, open: true };
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const editToggle = () => {
        setInEdition(!isInEdition);
        if (isInEdition) {
            setIsDirty(false);
            cancel();
        }
    };

    const cancel = () => {
        untouchedLabelsTree.current && setLabelsTree(untouchedLabelsTree.current);
    };

    const saveHandler = () => {
        const flattenedLabels = getFlattenedLabels(labelsTree);
        const flattenedNewLabels = getLabelsWithState(flattenedLabels, [LabelItemEditionState.NEW]);
        const flattenedGroups = getFlattenedGroups(labelsTree);

        if (!!flattenedNewLabels.length) {
            setDialogOpen(true);
        } else {
            data && save(flattenedLabels, flattenedGroups, data);
        }
    };

    const save = (
        flattenedLabels: LabelTreeLabel[],
        flattenedGroups: LabelTreeGroup[],
        project: ProjectProps,
        shouldRevisit = true
    ) => {
        const hasNewLabels = flattenedLabels.some(({ state }) => state === LabelItemEditionState.NEW);

        const labelsPayloads = flattenedLabels.map((label) => {
            const { state } = label;

            if (state === LabelItemEditionState.NEW) {
                return getNewLabelPayload(label, flattenedGroups, flattenedLabels, shouldRevisit);
            }

            if (state === LabelItemEditionState.REMOVED) {
                return getDeletedLabelPayload(label);
            } else {
                return getLabelPayload(label);
            }
        });

        editLabels.mutate(
            {
                datasetIdentifier,
                project,
                labels: labelsPayloads,
            },
            {
                onSettled: async () => {
                    await refetch();
                },
                onSuccess: () => {
                    const message = `${hasNewLabels ? 'New labels have been added. ' : ''}${
                        shouldRevisit ? 'All affected images are assigned the Revisit status.' : ''
                    }`;

                    addNotification(message, NOTIFICATION_TYPE.INFO);
                },
            }
        );

        setIsDirty(false);
        setInEdition(false);
    };

    const revisitHandler = (shouldRevisit: boolean) =>
        data && save(getFlattenedLabels(labelsTree), getFlattenedGroups(labelsTree), data, shouldRevisit);

    // TODO: totally hacky style but labels will be moved outside of dataset in the future
    return (
        <>
            <Flex
                gap={'size-100'}
                justifyContent={'end'}
                UNSAFE_style={{ position: 'absolute', top: '.8rem', right: 0 }}
            >
                <ButtonWithTooltip
                    onPress={editToggle}
                    isDisabled={notEditable}
                    buttonInfo={{
                        type: 'button',
                        button: Button,
                    }}
                    content={isInEdition ? 'Cancel editing' : 'Edit labels'}
                    tooltipProps={{
                        children: `${isInEdition ? 'Turn off edit mode' : 'Turn on edit mode'}`,
                    }}
                    variant={'primary'}
                    isClickable
                />
                {isInEdition && isDirty && (
                    <>
                        <ButtonWithTooltip
                            onPress={saveHandler}
                            buttonInfo={{ type: 'button', button: Button }}
                            content={'Save'}
                            tooltipProps={{
                                children: 'Save changes in project labels',
                            }}
                            isClickable
                            variant={'cta'}
                        />
                        <DialogContainer onDismiss={() => setDialogOpen(false)}>
                            {isDialogOpen && (
                                <RevisitAlertDialog
                                    flattenNewLabels={getLabelsWithState(getFlattenedLabels(labelsTree), [
                                        LabelItemEditionState.NEW,
                                    ])}
                                    save={revisitHandler}
                                />
                            )}
                        </DialogContainer>
                    </>
                )}
            </Flex>

            {editLabels.isLoading ? (
                <Loading />
            ) : !!data ? (
                <ProjectLabelsManagement
                    isInEditMode={isInEdition}
                    setIsDirty={setIsDirty}
                    key={`project-labels-${isInEdition}`}
                    labelsTree={labelsTree}
                    setLabelsTree={setLabelsTree}
                    relation={relation}
                />
            ) : (
                <></>
            )}
        </>
    );
};

export default ProjectLabels;
