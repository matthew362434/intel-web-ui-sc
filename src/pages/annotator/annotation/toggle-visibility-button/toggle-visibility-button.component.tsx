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

import { Visible, Invisible } from '../../../../assets/icons';
import primaryBtnClasses from '../../components/primary-toolbar/primaryToolBar.module.scss';
import { ANNOTATOR_MODE } from '../../core';
import classes from '../prediction-list/list-item.module.scss';

export enum TOGGLE_VISIBILITY_COLOR_MODE {
    ALWAYS_GRAYED_OUT,
    NEVER_GRAYED_OUT,
    STANDARD,
}

interface ToggleVisibilityButtonProps {
    id: string;
    onPress: () => void;
    isHidden: boolean;
    isDisabled?: boolean;
    colorMode?: TOGGLE_VISIBILITY_COLOR_MODE;
    mode?: ANNOTATOR_MODE;
}

export const ToggleVisibilityButton = ({
    id,
    onPress,
    isHidden,
    mode = ANNOTATOR_MODE.ANNOTATION,
    isDisabled = false,
    colorMode = TOGGLE_VISIBILITY_COLOR_MODE.STANDARD,
}: ToggleVisibilityButtonProps): JSX.Element => {
    const ariaLabel = mode === ANNOTATOR_MODE.ANNOTATION ? 'annotations' : 'predictions';

    return (
        <ActionButton
            isQuiet
            onPress={onPress}
            id={`annotation-${id}-toggle-visibility`}
            aria-label={isHidden ? `show ${ariaLabel}` : `hide ${ariaLabel}`}
            aria-pressed={isHidden}
            isDisabled={isDisabled}
            UNSAFE_className={primaryBtnClasses.primaryToolBarBtn}
        >
            {isHidden ? (
                <Invisible
                    id={`annotation-${id}-visibility-off-icon`}
                    className={colorMode === TOGGLE_VISIBILITY_COLOR_MODE.NEVER_GRAYED_OUT ? '' : classes.hiddenColor}
                />
            ) : (
                <Visible
                    id={`annotation-${id}-visibility-on-icon`}
                    className={colorMode === TOGGLE_VISIBILITY_COLOR_MODE.ALWAYS_GRAYED_OUT ? classes.hiddenColor : ''}
                />
            )}
        </ActionButton>
    );
};
