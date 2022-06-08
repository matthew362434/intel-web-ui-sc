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

import { ReactNode } from 'react';

import { ActionButton } from '@adobe/react-spectrum';

import { InfoOutline } from '../../../assets/icons';
import { ButtonWithTooltip } from '../button-with-tooltip';

interface InfoTooltipProps {
    id?: string;
    tooltipText: ReactNode;
    buttonClasses?: string;
}

export const InfoTooltip = ({ tooltipText, id, buttonClasses }: InfoTooltipProps): JSX.Element => {
    return (
        <ButtonWithTooltip
            id={id}
            buttonClasses={buttonClasses}
            data-testid={id}
            buttonInfo={{ type: 'action_button', button: ActionButton }}
            variant={'cta'}
            content={<InfoOutline />}
            tooltipProps={{ children: tooltipText }}
            isQuiet
        />
    );
};
