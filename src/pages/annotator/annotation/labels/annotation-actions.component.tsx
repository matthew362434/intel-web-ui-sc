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

import { ActionButton } from '@adobe/react-spectrum';
import Cross from '@spectrum-icons/ui/CrossMedium';

import { Edit } from '../../../../assets/icons';
import { Annotation } from '../../../../core/annotations';
import { isAnomalyDomain, isClassificationDomain } from '../../../../core/projects';
import { AnnotationToolContext } from '../../core';
import { useContainerBoundingBox } from '../../hooks/use-container-bondingbox.hook';
import { getGlobalAnnotations } from '../../providers/task-chain-provider/utils';
import classes from './labels.module.scss';

interface LabelActionsProps {
    annotation: Annotation;
    annotationToolContext: AnnotationToolContext;
    setEditLabels: (editLabels: boolean) => void;
}

const useIsRemovingAnnotationEnabled = (annotationToolContext: AnnotationToolContext, annotation: Annotation) => {
    const roi = useContainerBoundingBox(annotationToolContext.image);
    const task = annotationToolContext.selectedTask;

    if (task === null) {
        return true;
    }

    if (isClassificationDomain(task.domain) || isAnomalyDomain(task.domain)) {
        const globalAnnotations = getGlobalAnnotations(
            annotationToolContext.scene.annotations,
            roi,
            annotationToolContext.selectedTask
        );

        return !globalAnnotations.some(({ id }) => annotation.id === id);
    }

    return true;
};

export const AnnotationActions = ({
    annotation,
    annotationToolContext,
    setEditLabels,
}: LabelActionsProps): JSX.Element => {
    const { removeAnnotations } = annotationToolContext.scene;

    const removingAnnotationIsEnabled = useIsRemovingAnnotationEnabled(annotationToolContext, annotation);

    const onRemoveLabels = () => {
        removeAnnotations([annotation]);
    };

    const onEditLabels = () => {
        setEditLabels(true);
    };

    return (
        <li id={`edit`} className={[classes.label, classes.actionButtons].join(' ')}>
            <ActionButton
                onPress={onEditLabels}
                isQuiet
                UNSAFE_className={classes.actionButton}
                aria-label='Edit labels'
            >
                <Edit className={classes.editIcon} />
            </ActionButton>

            {removingAnnotationIsEnabled && (
                <ActionButton
                    onPress={onRemoveLabels}
                    isQuiet
                    UNSAFE_className={classes.actionButton}
                    aria-label='Remove annotation'
                >
                    <Cross />
                </ActionButton>
            )}
        </li>
    );
};
