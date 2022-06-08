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

import { View } from '@react-spectrum/view';

import { ConfigurableParametersMany } from '../../configurable-parameters.interface';
import { CPGroupsList } from '../../cp-groups-list';
import { CPParamsList } from '../../cp-list';

type SelectableTabContentProps = Pick<ConfigurableParametersMany, 'selectedComponent' | 'updateParameter'>;

export const SelectableTabContent = ({
    selectedComponent,
    updateParameter,
}: SelectableTabContentProps): JSX.Element => {
    return (
        <View UNSAFE_style={{ overflowY: 'auto' }} width={'70%'}>
            {selectedComponent?.parameters && (
                <CPParamsList
                    isHPO={false}
                    parameters={selectedComponent.parameters}
                    updateParameter={updateParameter}
                />
            )}
            {selectedComponent?.groups && (
                <CPGroupsList
                    isHPO={false}
                    groups={selectedComponent.groups}
                    updateParameter={updateParameter}
                    isPadding
                />
            )}
        </View>
    );
};
