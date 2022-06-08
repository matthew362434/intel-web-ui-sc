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

import { LabelTreeItem } from '../../../../annotator/components/labels/label-tree-view';
import { LabelsRelationType } from '../../../../create-project/components/select-project-template/utils';
import { MixedLabelsManagement } from './mixed-labels-management.component';
import { OnlyLabelsManagement } from './only-labels-management.component';

export interface ProjectLabelsManagementProps {
    isInEditMode: boolean;
    setIsDirty: (isDirty: boolean) => void;
    labelsTree: LabelTreeItem[];
    setLabelsTree: (labels: LabelTreeItem[]) => void;
    relation: LabelsRelationType;
}

export const ProjectLabelsManagement = ({
    isInEditMode,
    setIsDirty,
    labelsTree,
    setLabelsTree,
    relation,
}: ProjectLabelsManagementProps): JSX.Element => {
    if (relation === LabelsRelationType.MIXED) {
        return (
            <MixedLabelsManagement
                isInEditMode={isInEditMode}
                setIsDirty={setIsDirty}
                labelsTree={labelsTree}
                setLabelsTree={setLabelsTree}
                relation={relation}
            />
        );
    } else {
        return (
            <OnlyLabelsManagement
                isInEditMode={isInEditMode}
                setIsDirty={setIsDirty}
                labelsTree={labelsTree}
                setLabelsTree={setLabelsTree}
                relation={relation}
            />
        );
    }
};

export default ProjectLabelsManagement;
