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

import { RefreshGear } from '../../../../../assets/icons';
import { ButtonWithTooltip } from '../../../button-with-tooltip';
import classes from './reset-button.module.scss';

interface ResetButtonProps {
    isDisabled: boolean;
    handleResetButton: () => void;
    id: string;
}

export const ResetButton = ({ isDisabled, handleResetButton, id }: ResetButtonProps): JSX.Element => {
    return (
        <ButtonWithTooltip
            id={id}
            data-testid={id}
            buttonInfo={{ type: 'action_button', button: ActionButton }}
            content={
                <RefreshGear
                    fill={
                        isDisabled ? 'var(--spectrum-global-color-gray-500)' : 'var(--spectrum-global-color-gray-800)'
                    }
                    aria-label={'reset-icon'}
                    className={classes.resetIcon}
                />
            }
            tooltipProps={{
                children: 'Resetting to default value',
            }}
            variant={'primary'}
            isDisabled={isDisabled}
            onPress={handleResetButton}
            isQuiet
            isClickable
        />
    );
};
