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
import { ActionButton, Flex, Text } from '@adobe/react-spectrum';

import { Close } from '../../../../../../assets/icons';
import { HotkeyEditionField } from '../../../../../annotator/components/labels/label-tree-view/label-tree-view-item/label-edition-mode/hotkey-edition-field/hotkey-edition-field.component';
import { LinkButton } from '../new-label-tree-item/link-button/link-button.component';
import classes from './hotkey-name-field.module.scss';

interface HotkeyNameFieldProps {
    text: string;
    info?: string;
    value?: string;
    onChange: (value: string) => void;
}

interface HotkeyDisplayFieldProps {
    value: string;
    onChange: (value: string) => void;
}

const HotkeyDisplayField = ({ value, onChange }: HotkeyDisplayFieldProps): JSX.Element => {
    return (
        <Flex gap={'size-100'} alignItems={'center'} UNSAFE_style={{ fontSize: '11px' }}>
            <Flex direction={'column'} alignItems={'center'} justifyContent={'center'}>
                <Text>Keyboard</Text>
                <Text>shortcut</Text>
            </Flex>
            <Flex UNSAFE_className={classes.actionGroup}>
                <HotkeyEditionField width='size-1100' value={value} onChange={onChange} aria-label={'edited hotkey'} />
                <ActionButton
                    UNSAFE_style={{ backgroundColor: 'var(--spectrum-global-color-gray-100)' }}
                    onPress={() => onChange('')}
                >
                    <Close />
                </ActionButton>
            </Flex>
        </Flex>
    );
};

export const HotkeyNameField = ({ value, onChange, text, info }: HotkeyNameFieldProps): JSX.Element => {
    if (!value)
        return (
            <LinkButton text={text} info={info} width={'25%'}>
                <HotkeyDisplayField value={value as string} onChange={onChange} />
            </LinkButton>
        );
    else return <HotkeyDisplayField value={value} onChange={onChange} />;
};
