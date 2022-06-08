// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { Key, useRef } from 'react';

import { ActionButton, Flex, Heading, Item, Menu, MenuTrigger, Text, View } from '@adobe/react-spectrum';
import { usePress } from '@react-aria/interactions';
import { FocusableRefValue } from '@react-types/shared';
import dayjs from 'dayjs';

import { ChevronDownSmallLight } from '../../../../../assets/icons';
import { formatDate } from '../../../../../shared/utils';
import { ArchitectureModels } from '../../project-models';
import { ActiveModel } from '../../project-models/active-model';
import { ModelCardProps } from '../../project-models/model-container/model-card';
import classes from '../project-model.module.scss';

interface ModelBreadcrumbProps {
    handleSelectModel: (key: Key) => void;
    selectedModel: ModelCardProps;
    modelGroup: ArchitectureModels;
    name: string;
}

export const ModelBreadcrumb = ({
    selectedModel,
    handleSelectModel,
    modelGroup,
    name,
}: ModelBreadcrumbProps): JSX.Element => {
    const expandButtonRef = useRef<FocusableRefValue<HTMLButtonElement>>(null);
    const handleOpenSelectionMenu = (): void => {
        expandButtonRef.current?.UNSAFE_getDOMNode().click();
    };

    const { pressProps } = usePress({
        onPress: handleOpenSelectionMenu,
    });

    return (
        <Flex gap={'size-250'} UNSAFE_style={{ flex: '0 1 40px' }} alignItems={'center'}>
            <Heading margin={0} id={'algorithm-name-id'} UNSAFE_className={classes.projectModelTitle}>
                {name}
            </Heading>
            <View>-</View>
            <div {...pressProps} style={{ cursor: 'pointer' }}>
                <Flex alignItems={'center'} gap={'size-150'}>
                    <View>
                        <Text id={`version-${selectedModel.version}-id`}>{`Version ${
                            selectedModel.version
                        } (${formatDate(selectedModel.creationDate ?? dayjs().toString(), 'DD MMM YY')})`}</Text>
                    </View>
                    {selectedModel.isActiveModel && <ActiveModel />}
                    <MenuTrigger>
                        <ActionButton
                            isQuiet
                            UNSAFE_className={classes.projectModelDropDownVersionBtn}
                            id={'expand-version-id'}
                            ref={expandButtonRef}
                        >
                            <ChevronDownSmallLight />
                        </ActionButton>

                        <Menu onAction={handleSelectModel}>
                            {modelGroup.modelVersions.map(({ version, creationDate }) => (
                                <Item key={version} textValue={`Version: ${version}`}>
                                    {`Version: ${version} (${formatDate(creationDate, 'DD MMM YY')})`}
                                </Item>
                            ))}
                        </Menu>
                    </MenuTrigger>
                </Flex>
            </div>
        </Flex>
    );
};
