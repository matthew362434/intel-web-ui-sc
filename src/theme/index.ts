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

import { defaultTheme } from '@adobe/react-spectrum';
import { Theme } from '@react-types/provider';

import dark from './sonoma-creek-dark.module.css';
import light from './sonoma-creek-light.module.css';
import global from './sonoma-creek.module.css';
const theme: Theme = {
    ...defaultTheme,
    dark,
    light,
    global: {
        ...defaultTheme.global,
        ...global,
    },
};

export default theme;
