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

import { Key } from 'react';

import { MenuTrigger } from '../../../../../shared/components';

export const ModelMenu = (): JSX.Element => {
    const MENU_ITEMS: string[] = ['Recalculate accuracy', 'Set as active', 'Use with new parameters', 'Delete'];
    const DISABLED_KEYS: Iterable<Key> = ['recalculate accuracy', 'set as active', 'use with new parameters', 'delete'];
    return (
        <MenuTrigger
            id={`model-action-menu`}
            items={MENU_ITEMS}
            disabledKeys={DISABLED_KEYS}
            onAction={(_key) => {
                /* TO DO */
            }}
            quiet={true}
        />
    );
};
