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

import { Text, Button, ButtonGroup, Dialog, Content, Divider } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

interface ReplaceOrMergeUserAnnotationsDialogProps {
    merge: () => void;
    replace: () => void;
    close: () => void;
    hideMerge: boolean;
}

export const ReplaceOrMergeUserAnnotationsDialog = ({
    merge,
    replace,
    close,
    hideMerge,
}: ReplaceOrMergeUserAnnotationsDialogProps): JSX.Element => {
    const onMerge = () => {
        close();
        merge();
    };
    const onReplace = () => {
        close();
        replace();
    };

    return (
        <Dialog>
            <Heading>Replace {hideMerge ? '' : 'or merge '}annotations?</Heading>
            <Divider />
            <Content>
                {hideMerge ? (
                    <Text>
                        Do you want to replace your annotations with these accepted ones given by AI prediction?
                    </Text>
                ) : (
                    <Text>
                        Do you want to replace your annotations with these accepted ones given by AI prediction or merge
                        them as new ones?
                    </Text>
                )}
            </Content>
            <ButtonGroup>
                <Button variant='primary' onPress={close} id='cancel-predictions'>
                    Cancel
                </Button>
                {hideMerge ? (
                    <></>
                ) : (
                    <Button variant='primary' onPress={onMerge} id='merge-predictions'>
                        Merge
                    </Button>
                )}
                <Button variant='primary' onPress={onReplace} id='replace-predictions'>
                    Replace
                </Button>
            </ButtonGroup>
        </Dialog>
    );
};
