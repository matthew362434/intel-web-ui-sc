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

import { ConfigurableParametersComponents, ConfigurableParametersMany } from '../../configurable-parameters.interface';
import classes from '../../selectable-customized-tabs/selectable-customized-tabs.module.scss';

export interface SelectableTabProps extends Pick<ConfigurableParametersMany, 'setSelectedComponentId'> {
    isSelected: boolean;
    component: ConfigurableParametersComponents;
}

export const SelectableTab = ({ component, isSelected, setSelectedComponentId }: SelectableTabProps): JSX.Element => {
    const { pressProps } = usePress({ onPress: () => setSelectedComponentId(component.id) });
    return (
        <div {...pressProps} className={[classes.tabItem, isSelected ? classes.tabItemSelected : ''].join(' ')}>
            {component.header}
        </div>
    );
};
