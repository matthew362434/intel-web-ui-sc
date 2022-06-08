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

import { Fragment } from 'react';

import { Flex } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

import { useTreeItemMenu } from '../../../../../../../../hooks/tree-item-menu/tree-item-menu.hook';
import { ICONS_SIZE_IN_REM, LABEL_ITEM_MENU_PLACEHOLDER_WIDTH } from '../../../utils';

interface LabelPresentationModeMenuProps {
    isHovered: boolean;
    setEditMode: () => void;
    deleteLabel?: () => void;
    addLabel?: () => void;
    addGroup?: () => void;
}

export const LabelPresentationModeMenu = ({
    isHovered,
    setEditMode,
    deleteLabel,
    addLabel,
    addGroup,
}: LabelPresentationModeMenuProps): JSX.Element => {
    const menu = useTreeItemMenu(setEditMode, addLabel, addGroup, deleteLabel);

    return (
        <>
            {isHovered ? (
                <Flex minWidth={`${LABEL_ITEM_MENU_PLACEHOLDER_WIDTH}rem`}>
                    {menu.map((item: JSX.Element, index) => (
                        <Fragment key={`label-presentation-${index}`}>{item}</Fragment>
                    ))}
                </Flex>
            ) : (
                <View minWidth={`${LABEL_ITEM_MENU_PLACEHOLDER_WIDTH}rem`} minHeight={`${ICONS_SIZE_IN_REM}rem`} />
            )}
        </>
    );
};
