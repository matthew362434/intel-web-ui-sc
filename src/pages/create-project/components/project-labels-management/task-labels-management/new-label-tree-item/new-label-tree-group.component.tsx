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
import { Flex } from '@adobe/react-spectrum';

import { Folder } from '../../../../../../assets/icons';
import {
    GroupEditionMode,
    LabelTreeGroup,
    LabelTreeItem,
} from '../../../../../annotator/components/labels/label-tree-view';

interface NewLabelTreeGroupProps {
    labels: LabelTreeItem[];
    save: (editedGroup: LabelTreeGroup) => void;
}

export const NewLabelTreeGroup = ({ labels, save }: NewLabelTreeGroupProps): JSX.Element => {
    const saveHandler = (editedGroup?: LabelTreeGroup) => {
        editedGroup && save(editedGroup);
    };

    return (
        <Flex gap={'size-100'} alignItems={'center'} marginStart={'size-100'}>
            <Flex marginBottom={'size-300'}>
                <Folder width={'16px'} height={'16px'} />
            </Flex>
            <GroupEditionMode projectGroups={labels} save={saveHandler} newGroup />
        </Flex>
    );
};
