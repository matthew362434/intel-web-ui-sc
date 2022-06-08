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

import { ActionButton, Flex, View } from '@adobe/react-spectrum';

import { Invisible } from '../../../../../assets/icons';
import { ANNOTATOR_MODE } from '../../../core';
import { ToggleLockButton } from '../../toggle-lock-button';
import { ToggleVisibilityButton, TOGGLE_VISIBILITY_COLOR_MODE } from '../../toggle-visibility-button';

interface AnnotationListItemActionsProps {
    isHovered: boolean;
    isLocked: boolean;
    textColor: string;
    annotationId: string;
    isHidden: boolean;
    mode: ANNOTATOR_MODE;
    changeLock: (lock: boolean, annotationId: string) => void;
    changeVisibility: (visible: boolean, annotationId: string) => void;
}

const notVisibleButtonPlaceholder = (): JSX.Element => <View width={'3.2rem'} />;

export const AnnotationListItemActions = ({
    isHovered,
    isLocked,
    isHidden,
    textColor,
    mode,
    annotationId,
    changeLock,
    changeVisibility,
}: AnnotationListItemActionsProps): JSX.Element => {
    const colorMode = isHidden ? TOGGLE_VISIBILITY_COLOR_MODE.ALWAYS_GRAYED_OUT : undefined;

    return (
        <Flex alignItems={'center'}>
            {(isHovered || isLocked) && (
                <ToggleLockButton
                    id={annotationId}
                    onPress={() => changeLock(isLocked, annotationId)}
                    isLocked={isLocked}
                    colorMode={colorMode}
                />
            )}
            {isHovered ? (
                <ToggleVisibilityButton
                    id={annotationId}
                    onPress={() => changeVisibility(isHidden, annotationId)}
                    isHidden={isHidden}
                    colorMode={colorMode}
                    mode={mode}
                />
            ) : isHidden ? (
                <ActionButton
                    id={`annotation-list-item-${annotationId}-visibility-off`}
                    isQuiet
                    onPress={() => changeVisibility(true, annotationId)}
                >
                    <Invisible className={textColor} />
                </ActionButton>
            ) : (
                notVisibleButtonPlaceholder()
            )}
        </Flex>
    );
};
