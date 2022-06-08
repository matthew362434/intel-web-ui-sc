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
import { AlertDialog, Text } from '@adobe/react-spectrum';

import { LabelTreeLabel } from '../../../../annotator/components/labels/label-tree-view';

interface RevisitAlertDialogProps {
    flattenNewLabels: LabelTreeLabel[];
    save: (shouldRevisit: boolean) => void;
}

export const RevisitAlertDialog = ({ flattenNewLabels, save }: RevisitAlertDialogProps): JSX.Element => {
    const changedLabelsNames = flattenNewLabels.map(({ name }) => `"${name}"`).join(', ');

    const promptText = `There might be media with objects that match labels ${changedLabelsNames}. 
    Please assign "revisit" status to differentiate these media and allow to make adjustments.`;

    return (
        <AlertDialog
            title='Assign revisit status?'
            variant='warning'
            primaryActionLabel='Assign'
            secondaryActionLabel="Don't assign"
            cancelLabel='Cancel'
            onPrimaryAction={() => save(true)}
            onSecondaryAction={() => save(false)}
        >
            <Text>{promptText}</Text>
        </AlertDialog>
    );
};
