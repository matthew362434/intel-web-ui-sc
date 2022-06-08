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

import { useEffect, useState } from 'react';

import { Button, ButtonGroup, Content, Dialog, DialogContainer, Divider, View } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

import { Label, recursivelyAddLabel, recursivelyRemoveLabels } from '../../../../../core/labels';
import { LabelSearch } from '../../../../annotator/components/labels/label-search/label-search.component';
import { LabelTreeView } from '../../../../annotator/components/labels/label-search/label-tree-view.component';
import { fetchLabelsTree } from '../../../../annotator/components/labels/utils/labels-utils';

interface UploadLabelSelectorDialogProps {
    labels: Label[];
    isActivated: boolean;
    onDismiss: () => void;
    onSkipAction: () => void;
    onPrimaryAction: (labels: ReadonlyArray<Label>) => void;
}

export const UploadLabelSelectorDialog = ({
    labels,
    isActivated,
    onDismiss,
    onSkipAction,
    onPrimaryAction,
}: UploadLabelSelectorDialogProps): JSX.Element => {
    const [selectedLabels, setSelectedLabels] = useState<ReadonlyArray<Label>>([]);

    const hasSelectedLabels = selectedLabels.length > 0;

    const handleToggleLabel = (label: Label): void => {
        if (selectedLabels.some(({ id }) => id === label.id)) {
            const newLabelTree = recursivelyRemoveLabels(selectedLabels, [label]);

            setSelectedLabels(newLabelTree);
        } else {
            const newLabelTree = recursivelyAddLabel(selectedLabels, label, labels);

            setSelectedLabels(newLabelTree);
        }
    };

    useEffect(() => {
        if (!isActivated) {
            setSelectedLabels([]);
        }
    }, [isActivated]);

    return (
        <DialogContainer onDismiss={onDismiss}>
            {isActivated && (
                <Dialog size='M' minWidth={'86rem'} minHeight={'56rem'}>
                    <Heading>Assign a label to the uploaded images</Heading>
                    <Divider />
                    <ButtonGroup>
                        <Button
                            variant='secondary'
                            onPress={() => {
                                onSkipAction();
                                onDismiss();
                            }}
                            data-testid='skip-button-id'
                            id='skip-button-id'
                        >
                            Skip
                        </Button>
                        <Button
                            variant='secondary'
                            isDisabled={!hasSelectedLabels}
                            onPress={() => {
                                if (hasSelectedLabels) onPrimaryAction(selectedLabels);

                                onDismiss();
                            }}
                            data-testid='accept-button-id'
                            id='accept-button-id'
                        >
                            Accept
                        </Button>
                    </ButtonGroup>
                    <Content UNSAFE_style={{ overflowY: 'hidden' }}>
                        <LabelSearch
                            labels={labels}
                            onClick={handleToggleLabel}
                            classificationSearch
                            size={{ searchInput: '100%', labelTree: '100%' }}
                        />

                        {hasSelectedLabels ? (
                            <View
                                backgroundColor='gray-50'
                                borderWidth='thin'
                                borderColor='gray-400'
                                marginTop='size-75'
                                id='classified-labels'
                                data-testid={'classified-labels'}
                                aria-label='Classified labels'
                            >
                                <LabelTreeView
                                    width={'100%'}
                                    labels={fetchLabelsTree(selectedLabels, 'all')}
                                    itemClickHandler={handleToggleLabel}
                                />
                            </View>
                        ) : (
                            <></>
                        )}
                    </Content>
                </Dialog>
            )}
        </DialogContainer>
    );
};
