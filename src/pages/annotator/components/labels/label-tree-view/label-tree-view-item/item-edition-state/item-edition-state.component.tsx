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
import { Flex, Text, View } from '@adobe/react-spectrum';

import { COLOR_MODE } from '../../../../../../../assets/icons/color-mode.enum';
import { ColorThumb } from '../../../../../../../shared/components/color-thumb/color-thumb.component';
import { LabelItemEditionState } from '../../label-tree-view.interface';

interface ItemEditionStateProps {
    state: LabelItemEditionState;
    idSuffix: string;
}

export const ItemEditionState = ({ state, idSuffix }: ItemEditionStateProps): JSX.Element => {
    let color;
    if (state === LabelItemEditionState.IDLE) {
        return <></>;
    }

    switch (state) {
        case LabelItemEditionState.NEW:
            color = COLOR_MODE.POSITIVE;
            break;
        case LabelItemEditionState.REMOVED:
            color = COLOR_MODE.NEGATIVE;
            break;
        default:
            color = COLOR_MODE.WARNING;
    }

    return (
        <View
            borderRadius={'large'}
            UNSAFE_style={{ height: 'fit-content' }}
            backgroundColor={'gray-200'}
            paddingX={'size-75'}
            paddingEnd={'size-125'}
        >
            <Flex width={'100%'} gap={'size-75'} justifyContent={'space-between'} alignItems={'center'}>
                <ColorThumb size={8} color={color} id={`label-state-${state}-${idSuffix}`} borderRadius={'large'} />
                <Text UNSAFE_style={{ fontSize: '11px' }}>{state}</Text>
            </Flex>
        </View>
    );
};
