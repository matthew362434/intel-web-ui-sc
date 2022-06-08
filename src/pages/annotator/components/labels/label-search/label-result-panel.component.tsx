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

import { Flex, Text } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

import { Label } from '../../../../../core/labels';
import { LabelTreeItem } from '../label-tree-view';
import { LabelTreeItemSuffix } from './label-tree-view-item.component';
import { LabelTreeView } from './label-tree-view.component';

interface LabelResultPanelProps {
    size?: number | string;
    isOpen?: boolean;
    isHidden?: boolean;
    treeViewHeight?: number;
    labelsTree: LabelTreeItem[];
    suffix?: LabelTreeItemSuffix;
    onSelected: (label: Label) => void;
}

export const LabelResultPanel = ({
    suffix,
    onSelected,
    size = 400,
    labelsTree,
    treeViewHeight,
    isOpen = false,
    isHidden = false,
}: LabelResultPanelProps): JSX.Element => {
    return (
        <View
            zIndex={10}
            minWidth='100%'
            aria-label='test'
            isHidden={isHidden}
            marginTop={'size-75'}
            borderColor='gray-400'
            backgroundColor='gray-50'
            height={treeViewHeight ?? 'auto'}
            borderWidth={isOpen ? undefined : 'thin'}
            position={isOpen ? 'relative' : 'absolute'}
            maxHeight={treeViewHeight ? '100%' : 'size-2400'}
            overflow={'auto'}
        >
            {labelsTree.length === 0 && (
                <Flex alignItems='center' justifyContent='center' marginTop='size-100' marginBottom='size-100'>
                    <Text>No Results</Text>
                </Flex>
            )}
            {labelsTree.length !== 0 && (
                <LabelTreeView labels={labelsTree} itemClickHandler={onSelected} width={size} suffix={suffix} />
            )}
        </View>
    );
};
