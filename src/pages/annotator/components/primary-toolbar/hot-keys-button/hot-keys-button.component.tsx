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
import { ActionButton, DialogTrigger, View, Content } from '@adobe/react-spectrum';

import { Hotkeys } from '../../../../../assets/icons';
import { TabItem, Tabs } from '../../../../../shared/components';
import classes from '../primaryToolBar.module.scss';
import { HotKeysList } from './hot-keys-list';

export const HotKeysButton = (): JSX.Element => {
    const ITEMS: TabItem[] = [
        {
            id: 'hotkeys',
            key: 'hotkeys',
            name: 'Hotkeys',
            children: <HotKeysList />,
        },
    ];

    const DISABLED_ITEMS = ['label-shortcuts'];

    return (
        <DialogTrigger type={'popover'} mobileType={'modal'} placement={'right'} hideArrow>
            <ActionButton
                id='hotkeys-button-id'
                aria-label='Show dialog with hotkeys'
                UNSAFE_className={classes.primaryToolBarBtn}
            >
                <Hotkeys />
            </ActionButton>
            <Content>
                <View padding={'size-200'} minWidth={'60rem'} height={'40rem'}>
                    <Tabs
                        aria-label={'Hotkeys'}
                        items={ITEMS}
                        isQuiet={false}
                        disabledKeys={DISABLED_ITEMS}
                        height={'100%'}
                        panelOverflowY={'hidden'}
                    />
                </View>
            </Content>
        </DialogTrigger>
    );
};
