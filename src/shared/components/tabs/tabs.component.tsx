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

import { Tabs as SpectrumTabs, TabList, TabPanels, Item, Flex } from '@adobe/react-spectrum';

import { TabItem, TabsProps } from './tabs.interface';
import classes from './tabs.module.scss';

export const Tabs = (props: TabsProps): JSX.Element => {
    const { tabPanelsClassName, ...rest } = props;
    const panelOverflowY = props.panelOverflowY ?? 'auto';

    return (
        <SpectrumTabs {...rest}>
            <TabList>
                {(item: TabItem) => (
                    <Item key={item.key} textValue={item.key}>
                        <Flex direction={'row'} alignItems={'center'} gap={'size-50'} id={item.id}>
                            <>{item.name}</>
                        </Flex>
                    </Item>
                )}
            </TabList>
            <TabPanels
                UNSAFE_className={[classes.tabPanels, tabPanelsClassName ?? ''].join(' ')}
                UNSAFE_style={{ overflowY: panelOverflowY }}
            >
                {(item: TabItem) => <Item key={item.key}>{item.children}</Item>}
            </TabPanels>
        </SpectrumTabs>
    );
};
