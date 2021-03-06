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

import { usePress } from '@react-aria/interactions';
import { View } from '@react-spectrum/view';

import { Label } from '../../../../../core/labels';
import { LabelTag } from '../label-tag/label-tag.component';
import classes from './selectable-label-tag.module.scss';

interface SelectableLabelTagProps {
    label: Label;
    value: string;
    selectedOption: string;
    handleOptionChange: (selectedOption: string) => void;
}

export const SelectableLabelTag = (props: SelectableLabelTagProps): JSX.Element => {
    const { selectedOption, value, label, handleOptionChange } = props;
    const isSelectedOption = selectedOption === value;

    const { pressProps } = usePress({
        onPress: () => {
            handleOptionChange(value);
        },
    });

    return (
        <div {...pressProps}>
            <View
                id={label.id}
                borderRadius={'regular'}
                borderColor={'gray-400'}
                borderWidth={isSelectedOption ? 'thick' : 'thin'}
                paddingX={'size-65'}
                paddingY={'size-25'}
                UNSAFE_className={isSelectedOption ? classes.selected : undefined}
            >
                <LabelTag label={label} />
            </View>
        </div>
    );
};
