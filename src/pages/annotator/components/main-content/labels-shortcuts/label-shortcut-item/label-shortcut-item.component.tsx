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
import { Tooltip, TooltipTrigger } from '@adobe/react-spectrum';

import { Label } from '../../../../../../core/labels';
import { SizedTruncatedText } from '../../../../../../shared/components/truncated-text';
import { LabelColorThumb } from '../../../labels/label-color-thumb/label-color-thumb.component';
import { LabelShortcutButton } from './label-shortcut-button.component';

interface LabelShortcutItemProps {
    label: Label;
    clickHandler: (label: Label) => void;
}

export const LabelShortcutItem = ({ label, clickHandler }: LabelShortcutItemProps): JSX.Element => {
    return (
        <TooltipTrigger delay={200} placement='bottom'>
            <LabelShortcutButton id={`label-${label.id}`} onPress={() => clickHandler(label)}>
                <SizedTruncatedText
                    size={'M'}
                    isQuiet
                    prefix={
                        <LabelColorThumb
                            label={label}
                            id={`${label.id}-color-thumb-label-item`}
                            marginEnd={'size-50'}
                        />
                    }
                >
                    {label.name}
                </SizedTruncatedText>
            </LabelShortcutButton>
            <Tooltip>{`${label.name} ${label.hotkey ? `(${label.hotkey.toUpperCase()})` : ''}`}</Tooltip>
        </TooltipTrigger>
    );
};
