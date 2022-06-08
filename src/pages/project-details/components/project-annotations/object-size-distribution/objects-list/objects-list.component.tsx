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
import { Dispatch, Key, SetStateAction } from 'react';

import { View, Picker, Flex, Text, Item, ActionButton } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

import { ButtonWithTooltip } from '../../../../../../shared/components';
import { capitalize } from '../../../../../../shared/utils';
import { NEAR_MEAN_TOOLTIP_MSG } from '../utils';
import classes from './objects-list.module.scss';

export interface DistributionLabels {
    id: string;
    name: string;
    color: string;
}

interface ObjectsListProps {
    labels: DistributionLabels[];
    objectSizes: { name: string; fill: string | null }[];
    selectedLabelKey: Key;
    setSelectedLabelKey: Dispatch<SetStateAction<Key>>;
}

export const ObjectsList = ({
    labels,
    objectSizes,
    selectedLabelKey,
    setSelectedLabelKey,
}: ObjectsListProps): JSX.Element => {
    const handleLabelChange = (label: Key): void => {
        setSelectedLabelKey(label);
    };

    return (
        <View alignSelf={'start'} height={'100%'}>
            <Flex direction={'column'} justifyContent={'space-around'} height={'100%'}>
                <Flex alignItems={'center'}>
                    <Text>Class: </Text>
                    <Picker
                        aria-labelledby={'Object class'}
                        items={labels}
                        selectedKey={selectedLabelKey}
                        onSelectionChange={handleLabelChange}
                        UNSAFE_className={classes.pickerLabels}
                    >
                        {(item) => <Item key={item.name}>{capitalize(item.name)}</Item>}
                    </Picker>
                </Flex>
                <View>
                    <Heading marginBottom={'size-50'}>Object size</Heading>
                    {objectSizes.map(({ name, fill }) =>
                        fill ? (
                            <Flex alignItems={'center'} columnGap={'size-75'} marginTop={'size-50'} key={name}>
                                <View UNSAFE_className={classes.objectSize} UNSAFE_style={{ backgroundColor: fill }} />
                                {name}
                            </Flex>
                        ) : (
                            <ButtonWithTooltip
                                buttonInfo={{ type: 'action_button', button: ActionButton }}
                                buttonClasses={classes.objectSizeNearMean}
                                variant={'cta'}
                                content={
                                    <Flex alignItems={'center'} columnGap={'size-75'} marginTop={'size-50'}>
                                        <View
                                            UNSAFE_className={classes.objectSizeDashed}
                                            UNSAFE_style={{ backgroundColor: 'transparent' }}
                                        />
                                        {name}
                                    </Flex>
                                }
                                tooltipProps={{
                                    children: NEAR_MEAN_TOOLTIP_MSG,
                                }}
                                key={name}
                                isQuiet
                            />
                        )
                    )}
                </View>
            </Flex>
        </View>
    );
};
