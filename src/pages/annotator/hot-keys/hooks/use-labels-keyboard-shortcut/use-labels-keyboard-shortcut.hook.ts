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
import { useMemo } from 'react';

import { useHotkeys } from 'react-hotkeys-hook';

import { Label } from '../../../../../core/labels';
import { NOTIFICATION_TYPE, useNotification } from '../../../../../notification';
import { ctrlCommandBinding } from '../../../../create-project';
import { useAnnotationScene, useAnnotationToolContext } from '../../../providers';
import { getOutputFromTask } from '../../../providers/task-chain-provider/utils';

interface UseLabelsKeyboardShortcut {
    label: Label;
}

export const useLabelsKeyboardShortcut = ({ label }: UseLabelsKeyboardShortcut): void => {
    const { addLabel } = useAnnotationScene();
    const annotationToolContext = useAnnotationToolContext();
    const annotations = getOutputFromTask(annotationToolContext, annotationToolContext.selectedTask).filter(
        ({ isSelected }) => isSelected
    );
    const { tool } = useAnnotationToolContext();
    const { addNotification } = useNotification();
    const labelHotkey = ctrlCommandBinding(label.hotkey);

    const areSelectedAnyAnnotations = useMemo(() => annotations.some(({ isSelected }) => isSelected), [annotations]);

    useHotkeys(
        labelHotkey,
        (event) => {
            event.preventDefault();

            if (areSelectedAnyAnnotations) {
                const annotationIds = annotations.reduce<string[]>((prev, current) => {
                    if (current.isSelected) {
                        return [...prev, current.id];
                    }

                    return prev;
                }, []);

                addLabel(label, annotationIds);
            } else {
                addNotification(
                    'Please select a shape first then press the desired label shortcut.',
                    NOTIFICATION_TYPE.DEFAULT,
                    {
                        duration: 2500,
                    }
                );
            }
        },
        {},
        [tool, annotations]
    );
};
