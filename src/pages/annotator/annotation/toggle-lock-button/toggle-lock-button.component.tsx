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

import { Lock, Unlock } from '../../../../assets/icons';
import primaryBtnClasses from '../../components/primary-toolbar/primaryToolBar.module.scss';
import classes from '../annotation-list/annotation-list-item/annotation-list-item.module.scss';
import { TOGGLE_VISIBILITY_COLOR_MODE } from '../toggle-visibility-button';

interface ToggleLockButtonProps {
    id: string;
    onPress: () => void;
    isLocked: boolean;
    isDisabled?: boolean;
    colorMode?: TOGGLE_VISIBILITY_COLOR_MODE;
}

export const ToggleLockButton = ({
    id,
    onPress,
    isLocked,
    isDisabled = false,
    colorMode = TOGGLE_VISIBILITY_COLOR_MODE.STANDARD,
}: ToggleLockButtonProps): JSX.Element => {
    const style = colorMode === TOGGLE_VISIBILITY_COLOR_MODE.ALWAYS_GRAYED_OUT ? classes.hiddenAnnotation : '';
    return (
        <ActionButton
            isQuiet
            onPress={onPress}
            id={`annotation-${id}-toggle-lock`}
            aria-label={isLocked ? 'unlock annotation' : 'lock annotation'}
            isDisabled={isDisabled}
            UNSAFE_className={primaryBtnClasses.primaryToolBarBtn}
        >
            {isLocked ? (
                <Lock id={`annotation-${id}-lock-closed-icon`} className={style} />
            ) : (
                <Unlock id={`annotation-${id}-lock-open-icon`} className={style} />
            )}
        </ActionButton>
    );
};
