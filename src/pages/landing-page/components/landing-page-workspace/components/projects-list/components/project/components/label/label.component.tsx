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
import { Flex, View } from '@adobe/react-spectrum';

import { Label as LabelInterface } from '../../../../../../../../../../core/labels';
import { SizedTruncatedText } from '../../../../../../../../../../shared/components/truncated-text';
import { LabelColorThumb } from '../../../../../../../../../annotator/components/labels/label-color-thumb/label-color-thumb.component';

export const Label = ({ id, label }: { id: string; label: LabelInterface }): JSX.Element => {
    return (
        <Flex direction={'row'} alignItems={'center'}>
            <View marginX={'size-100'}>
                <LabelColorThumb id={`${id}-color-thumb`} label={label} />
            </View>
            <Flex>
                <SizedTruncatedText size={'M'} id={id}>
                    {label.name}
                </SizedTruncatedText>
            </Flex>
        </Flex>
    );
};
