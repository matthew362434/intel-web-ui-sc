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

import { ReactElement } from 'react';

import { screen, RenderResult, waitForElementToBeRemoved } from '@testing-library/react';

import { ApplicationProvider } from '../providers';
import { providersRender } from './required-providers-render';

const customRender = async (ui: ReactElement): Promise<RenderResult> => {
    const applicationProvider = <ApplicationProvider>{ui}</ApplicationProvider>;
    const render = providersRender(applicationProvider);

    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    return { ...render };
};

export { customRender as applicationRender };
