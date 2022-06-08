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
import { View } from '@adobe/react-spectrum';
import { usePress } from '@react-aria/interactions';

import { SupportedHPORatios } from '../../../use-training-state-value';

export interface HPORatioItemProps {
    hpoTimeRatio: SupportedHPORatios;
    selectedHPOTimeRatio: SupportedHPORatios;
    handleHPOTimeRatio: (value: SupportedHPORatios) => void;
}

export const HPORatioItem = ({
    handleHPOTimeRatio,
    selectedHPOTimeRatio,
    hpoTimeRatio,
}: HPORatioItemProps): JSX.Element => {
    const { pressProps } = usePress({ onPress: () => handleHPOTimeRatio(hpoTimeRatio) });
    const isSelected: boolean = selectedHPOTimeRatio === hpoTimeRatio;

    return (
        <View marginTop={'size-200'}>
            <div {...pressProps} style={{ cursor: 'pointer' }}>
                <View
                    paddingX={'size-200'}
                    paddingY={'size-75'}
                    backgroundColor={isSelected ? 'gray-50' : 'gray-200'}
                    borderColor={'gray-400'}
                    borderWidth={'thin'}
                    borderRadius={'small'}
                    id={`${hpoTimeRatio}-training-time-id`}
                    data-testid={`${hpoTimeRatio}-training-time-id`}
                >
                    {hpoTimeRatio}x Training Time
                </View>
            </div>
        </View>
    );
};
