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

import { Tag, Image, Time, Shape, ArrowBidirectional } from '../../../assets/icons';
import { SearchRuleField } from '../media-filter.interface';

interface MediaFilterFieldProps {
    value: SearchRuleField | '';
    isDisabled?: boolean;
    onSelectionChange: (key: SearchRuleField) => void;
}

const items: { key: SearchRuleField; text: string; Icon: React.FunctionComponent }[] = [
    { key: SearchRuleField.LabelId, text: 'Label', Icon: Tag },
    { key: SearchRuleField.MediaHeight, text: 'Media height', Icon: ArrowBidirectional },
    { key: SearchRuleField.MediaWidth, text: 'Media width', Icon: ArrowBidirectional },
    { key: SearchRuleField.MediaName, text: 'Media name', Icon: Shape },
    { key: SearchRuleField.AnnotationSceneState, text: 'Annotation status', Icon: Image },
    { key: SearchRuleField.MediaUploadDate, text: 'Media upload date', Icon: Time },
    { key: SearchRuleField.AnnotationCreationDate, text: 'Annotation creation date', Icon: Time },
];

export const MediaFilterField = ({ onSelectionChange, isDisabled, value }: MediaFilterFieldProps): JSX.Element => {
    return (
        <Picker
            isQuiet
            items={items}
            selectedKey={value}
            isDisabled={isDisabled}
            aria-label='media-filter-filed'
            onSelectionChange={(key) => onSelectionChange(key as SearchRuleField)}
        >
            {({ key, text, Icon }) => (
                <Item textValue={text} key={key}>
                    <Icon />
                    <Text>{text}</Text>
                </Item>
            )}
        </Picker>
    );
};
