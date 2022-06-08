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

import { useEffect } from 'react';

import { View } from '@adobe/react-spectrum';

import { DOMAIN, TaskMetadata } from '../../../../../core/projects';
import {
    getLabelsWithAddedChild,
    getLabelsWithUpdatedItem,
    getNextColor,
    LabelItemEditionState,
    LabelItemType,
    LabelTreeItem,
    LabelTreeLabel,
    MixedModeTreeView,
} from '../../../../annotator/components/labels/label-tree-view';
import { isYupValidationError } from '../../../../profile-page/utils';
import { getFlattenedLabels } from '../../../../project-details/components/project-labels/utils';
import { getHEXFormat } from '../../distinct-colors';
import { LabelsRelationType } from '../../select-project-template/utils';
import { labelsListSchema } from '../../utils';
import { LABEL_TREE_TYPE } from '../label-tree-type.enum';
import { NewLabelTreeGroup } from './new-label-tree-item/new-label-tree-group.component';
import { NewLabelTreeLabel } from './new-label-tree-item/new-label-tree-label.component';

export const MIN_NUMBER_OF_LABELS_FOR_CLASSIFICATION = 2;

interface LabelsManagementProps {
    setLabels: (labels: LabelTreeItem[]) => void;
    setValidity: (valid: boolean) => void;
    type: LABEL_TREE_TYPE;
    taskMetadata: TaskMetadata;
    next: (() => void) | undefined;
    projectLabels: LabelTreeItem[];
}

export const TaskLabelsManagement = ({
    setValidity,
    type,
    setLabels,
    next,
    taskMetadata,
    projectLabels,
}: LabelsManagementProps): JSX.Element => {
    const { labels, relation, domain } = taskMetadata;

    const singleLabel: LabelTreeLabel | undefined =
        type === LABEL_TREE_TYPE.SINGLE && labels.length === 1 ? (labels[0] as LabelTreeLabel) : undefined;
    const defaultName = singleLabel ? singleLabel.name : '';
    const defaultColor = singleLabel ? getHEXFormat(singleLabel.color) : getNextColor(labels);

    const addChild = (parentId: string, groupName: string, childType: LabelItemType) => {
        setLabels(getLabelsWithAddedChild(labels, undefined, parentId, groupName, childType));
    };

    const addLabel = (label: LabelTreeItem, shouldGoNext = false) => {
        const newLabel = { ...label, state: LabelItemEditionState.NEW };
        const newLabels: LabelTreeItem[] = type === LABEL_TREE_TYPE.SINGLE ? [newLabel] : [...labels, newLabel];

        setLabels(newLabels);

        if (type === LABEL_TREE_TYPE.SINGLE) {
            shouldGoNext && next && next();
        }
    };

    const saveHandler = (editedLabel?: LabelTreeItem, previousId?: string) => {
        const updated = getLabelsWithUpdatedItem(labels, previousId, editedLabel, true);

        setLabels(updated);
    };

    // To check if we have at least one label
    useEffect(() => {
        try {
            const validated = labelsListSchema.validateSync({ labels: labels }, { abortEarly: false });

            setLabels(validated.labels || []);
            setValidity(true);
        } catch (e) {
            if (isYupValidationError(e)) {
                setValidity(false);
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [labels]);

    // To check if we have at least two labels on classification projects
    useEffect(() => {
        const isClassificationDomain = domain === DOMAIN.CLASSIFICATION;

        // Get all flattened labels (no groups) and all root labels (no parent)
        const taskLabels = getFlattenedLabels(labels);
        const labelRoots = taskLabels.filter((label): boolean => {
            if (label.parentLabelId === null) {
                return true;
            }

            return !taskLabels.some(({ id }) => label.parentLabelId === id);
        });

        if (labelRoots.length < MIN_NUMBER_OF_LABELS_FOR_CLASSIFICATION && isClassificationDomain) {
            setValidity(false);
        } else {
            setValidity(true);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [labels, taskMetadata]);

    return (
        <>
            {relation === LabelsRelationType.MIXED ? (
                <NewLabelTreeGroup labels={labels} save={addLabel} />
            ) : (
                <NewLabelTreeLabel
                    type={type}
                    addLabel={addLabel}
                    labels={labels}
                    color={defaultColor}
                    name={defaultName}
                    withLabel
                    relation={relation}
                    projectLabels={projectLabels}
                    key={relation}
                />
            )}

            {type === LABEL_TREE_TYPE.SINGLE ? (
                <></>
            ) : (
                <View
                    backgroundColor={'gray-50'}
                    height={'size-4600'}
                    padding={'size-300'}
                    overflow={'auto'}
                    id={'label-tree-view-container'}
                >
                    <MixedModeTreeView
                        setTaskLabels={setLabels}
                        labels={labels}
                        isEditable={type !== LABEL_TREE_TYPE.NOT_EDITABLE}
                        light
                        addChild={addChild}
                        projectLabels={labels}
                        save={saveHandler}
                        isMixedRelation={relation === LabelsRelationType.MIXED}
                        newTree
                    />
                </View>
            )}
        </>
    );
};
