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

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { View } from '@adobe/react-spectrum';

import { Label } from '../../../../core/labels';
import { MediaSearchOptions } from '../../../../core/media/services/media-service.interface';
import { HierarchicalLabelView } from '../../../annotator/components/labels/hierarchical-label-view/hierarchical-label-view.component';
import { LabelSearch } from '../../../annotator/components/labels/label-search/label-search.component';
import { useProject } from '../../providers';

interface ProjectMediaFilterLabelsProps {
    setMediaSearchOptions: Dispatch<SetStateAction<Partial<MediaSearchOptions>>>;
}

export const ProjectMediaFilterLabels = ({ setMediaSearchOptions }: ProjectMediaFilterLabelsProps): JSX.Element => {
    const [selection, setSelection] = useState<Label[]>([]);
    const { project } = useProject();
    const { labels } = project;

    const onClick = (label: Label) => {
        setSelection((prevSelection: Label[]) => {
            if (prevSelection.some((selectionLabel: Label) => selectionLabel.id === label.id)) {
                return prevSelection;
            }
            const result = labels.find((resultLabel: Label) => resultLabel.id === label.id);

            if (result === undefined) {
                return prevSelection;
            }

            return [...prevSelection, result];
        });
    };

    useEffect(() => {
        setMediaSearchOptions((mediaSearchOptions) => ({
            ...mediaSearchOptions,
            labels: selection.map((selectedLabel: Label) => selectedLabel.id),
        }));
    }, [selection, setMediaSearchOptions]);

    return (
        <View position='relative'>
            <LabelSearch textAriaLabel='Select label' labels={labels} shouldFocusTextInput={false} onClick={onClick} />
            <View marginTop='size-100' aria-label='Selected labels'>
                {selection.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label='Selected labels'>
                        {selection.map((label: Label) => (
                            <li key={label.id}>
                                <HierarchicalLabelView
                                    label={label}
                                    labels={labels}
                                    resetHandler={() => {
                                        setSelection((newSelection: Label[]) => [
                                            ...newSelection.filter(
                                                (selectionLabel: Label) => selectionLabel.id !== label.id
                                            ),
                                        ]);
                                    }}
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <></>
                )}
            </View>
        </View>
    );
};
