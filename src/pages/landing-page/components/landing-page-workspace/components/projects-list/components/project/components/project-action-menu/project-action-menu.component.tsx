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

import { useDeleteProject } from '../../../../../../../../../../core/projects/hooks';
import { useApplicationContext } from '../../../../../../../../../../providers';
import { MenuTriggerPopup } from '../../../../../../../../../../shared/components';

interface ActionMenuProps {
    projectId: string;
    projectName: string;
}

export const ProjectActionMenu = ({ projectId, projectName }: ActionMenuProps): JSX.Element => {
    const { workspaceId } = useApplicationContext();
    const { deleteProject } = useDeleteProject();

    const DELETE = 'Delete';
    const items = [DELETE];

    const doDelete = () => {
        deleteProject.mutate({ workspaceId, projectId });
    };

    const getDeleteDialogQuestion = (providedProjectName: string) =>
        `Are you sure you want to delete project ${providedProjectName}?`;

    return (
        <MenuTriggerPopup
            menuTriggerId={`project-action-menu-${projectId}`}
            question={getDeleteDialogQuestion(projectName)}
            onPrimaryAction={doDelete}
            items={items}
        />
    );
};
