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

import { Item, Picker, Text } from '@adobe/react-spectrum';

import { idMatchingFormat } from '../../../../../../test-utils';
import { useDataset } from '../../../../providers/dataset-provider/dataset-provider.component';

enum DatasetKey {
    ACTIVE = 'active',
    DATASET = 'dataset',
}

export const DatasetPicker = (): JSX.Element => {
    const { isInActiveMode, setIsInActiveMode, setIsDatasetMode } = useDataset();

    const items = [
        { key: DatasetKey.ACTIVE, text: 'Active set' },
        { key: DatasetKey.DATASET, text: 'Data set' },
    ];

    return (
        <Picker
            id={'selected-annotation-dataset-id'}
            aria-label='Choose annotation dataset'
            UNSAFE_style={{ fontWeight: 'bold' }}
            isQuiet
            items={items}
            selectedKey={isInActiveMode ? DatasetKey.ACTIVE : DatasetKey.DATASET}
            onSelectionChange={(selected) => {
                setIsInActiveMode(selected === DatasetKey.ACTIVE);
                setIsDatasetMode(selected === DatasetKey.DATASET);
            }}
        >
            {(item) => (
                <Item key={item.key} textValue={item.text}>
                    <Text id={`${idMatchingFormat(item.key)}-id`}>{item.text}</Text>
                </Item>
            )}
        </Picker>
    );
};
