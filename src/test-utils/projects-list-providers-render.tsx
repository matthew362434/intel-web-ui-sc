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

import { FunctionComponent, ReactElement } from 'react';

import { RenderResult } from '@testing-library/react';

import {
    ProjectsListProvider,
    useProjectsList,
} from '../pages/landing-page/components/landing-page-workspace/components';
import { applicationRender } from './application-provider-render';

const Loader: FunctionComponent = ({ children }) => {
    const { isLoading } = useProjectsList();

    return (
        <div>
            {isLoading ? (
                <div role='alert' aria-label='Loading...'>
                    Loading...
                </div>
            ) : (
                <></>
            )}
            {children}
        </div>
    );
};
const customRender = async (ui: ReactElement): Promise<RenderResult> => {
    const renderResult = await applicationRender(
        <ProjectsListProvider>
            <Loader>{ui}</Loader>
        </ProjectsListProvider>
    );

    return renderResult;
};

// override render method
export { customRender as workspaceRender };
