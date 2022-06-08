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

import { useEffect, useState } from 'react';

import { Divider, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { ActionButton } from '@react-spectrum/button';
import { Flex } from '@react-spectrum/layout';
import { useTransformContext } from 'react-zoom-pan-pinch';

import { FitScreen } from '../../../../assets/icons';
import { TOGGLE_VISIBILITY_COLOR_MODE, ToggleVisibilityButton } from '../../annotation';
import { AnnotationToolContext } from '../../core';
import { getOutputFromTask } from '../../providers/task-chain-provider/utils';
import { HotKeysButton } from './hot-keys-button';
import classes from './primaryToolBar.module.scss';

interface ActionButtonsProps {
    annotationToolContext: AnnotationToolContext;
}

export const ActionButtons = ({ annotationToolContext }: ActionButtonsProps): JSX.Element => {
    const { resetTransform } = useTransformContext();

    const setHiddenAnnotations = annotationToolContext.scene.setHiddenAnnotations;
    const annotations = getOutputFromTask(annotationToolContext, annotationToolContext.selectedTask);
    const allAnnotationsHidden = !annotations.find((annotation) => !annotation.isHidden);
    const mode = annotationToolContext.mode;

    const toggleVisibility = (isHidden: boolean) => {
        setHiddenAnnotations((annotation) => {
            if (annotations.some(({ id }) => id === annotation.id)) {
                return isHidden;
            }

            return annotation.isHidden;
        });
    };

    const handleFitImageToScreen = () => {
        resetTransform();
    };

    const [allHidden, setAllHidden] = useState<boolean>(allAnnotationsHidden);

    useEffect(() => {
        setAllHidden(!annotations.some(({ isHidden }) => !isHidden));
    }, [annotations]);

    useEffect(() => {
        setAllHidden(allAnnotationsHidden);
    }, [allAnnotationsHidden]);

    const toggleVisibilityAnnotations = () => {
        setAllHidden(!allHidden);
        toggleVisibility(!allHidden);
    };

    return (
        <Flex direction='column' gap='size-100' alignItems='center' justify-content='center'>
            <TooltipTrigger placement='right'>
                <ActionButton
                    id='fit-image-to-screen-button'
                    aria-label='Fit image to screen'
                    onPress={handleFitImageToScreen}
                    UNSAFE_className={classes.primaryToolBarBtn}
                >
                    <FitScreen />
                </ActionButton>
                <Tooltip>Fit image to screen</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger placement='right'>
                <ToggleVisibilityButton
                    id={'all-annotations'}
                    onPress={toggleVisibilityAnnotations}
                    isHidden={allHidden}
                    mode={mode}
                    colorMode={TOGGLE_VISIBILITY_COLOR_MODE.NEVER_GRAYED_OUT}
                />
                <Tooltip>Hide annotations</Tooltip>
            </TooltipTrigger>
            <Divider size={'S'} marginY='size-100' UNSAFE_className={classes.primaryToolBarDivider} />
            <HotKeysButton />
        </Flex>
    );
};
