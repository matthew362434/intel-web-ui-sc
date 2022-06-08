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

import { useRef } from 'react';

import { Flex, View } from '@adobe/react-spectrum';
import { useToggleButton } from '@react-aria/button';
import { useToggleState } from '@react-stately/toggle';
import { ToggleProps } from '@react-types/checkbox';
//TODO: there's no double chevron in icon set
import ChevronDoubleLeft from '@spectrum-icons/workflow/ChevronDoubleLeft';
import ChevronDoubleRight from '@spectrum-icons/workflow/ChevronDoubleRight';

import classes from './toggle-sidebar.module.scss';

export const ToggleSidebarButton = (props: ToggleProps): JSX.Element => {
    const ref = useRef<HTMLButtonElement>(null);
    const state = useToggleState(props);
    const { buttonProps } = useToggleButton(props, state, ref);

    return (
        <button
            {...buttonProps}
            className={classes.toggleSidebarButton}
            ref={ref}
            id={'annotations-pane-sidebar-toggle-button'}
        >
            <View backgroundColor='gray-100' paddingY='size-50' paddingX='size-150'>
                <Flex height='100%' justifyContent='end'>
                    {props.isSelected ? <ChevronDoubleRight size='XS' /> : <ChevronDoubleLeft size='XS' />}
                </Flex>
            </View>
        </button>
    );
};
