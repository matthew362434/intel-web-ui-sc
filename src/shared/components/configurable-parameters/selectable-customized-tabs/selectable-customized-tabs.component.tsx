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

import { Flex, Item, StatusLight, TabList, TabPanels } from '@adobe/react-spectrum';
import { Tabs } from '@react-spectrum/tabs';

import { TabItem, TabsProps } from '../../tabs';
import classes from './selectable-customized-tabs.module.scss';

interface SelectableCustomizedTabsProps extends TabsProps {
    isHPO?: boolean;
}

const SelectableCustomizedTabs = (props: SelectableCustomizedTabsProps): JSX.Element => {
    const { isHPO, ...rest } = props;

    return (
        <Tabs {...rest} UNSAFE_className={classes.customizedTabs}>
            <TabList minWidth={'24rem'}>
                {(item: TabItem) => (
                    <Item key={item.key} textValue={item.key}>
                        <Flex
                            justifyContent={'space-between'}
                            alignItems={'center'}
                            gap={'size-50'}
                            id={item.id}
                            data-testid={item.id}
                            width={'100%'}
                        >
                            <>{item.name}</>
                            {isHPO && item.isLearningParametersTab && (
                                <StatusLight
                                    data-testid={'hpo-status-id'}
                                    id={'hpo-status-id'}
                                    variant={'info'}
                                    UNSAFE_className={classes.hpoOnTab}
                                >
                                    HPO
                                </StatusLight>
                            )}
                        </Flex>
                    </Item>
                )}
            </TabList>
            <TabPanels minHeight={0} position={'relative'} UNSAFE_style={{ overflowY: 'auto' }}>
                {(item: TabItem) => <Item key={item.key}>{item.children}</Item>}
            </TabPanels>
        </Tabs>
    );
};

export default SelectableCustomizedTabs;
