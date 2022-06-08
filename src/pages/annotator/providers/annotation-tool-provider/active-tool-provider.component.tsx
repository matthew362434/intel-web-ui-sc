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

import { ReactNode } from 'react';

import { ToolAnnotationContextProps } from '../../tools/tools.interface';
import useActiveTool from '../../tools/use-active-tool';

interface ActiveToolProviderProps extends ToolAnnotationContextProps {
    children: ReactNode;
}

export const ActiveToolProvider = ({ children, annotationToolContext }: ActiveToolProviderProps): JSX.Element => {
    const tool = useActiveTool(annotationToolContext);

    const StateProvider = tool?.StateProvider;

    return StateProvider ? <StateProvider>{children}</StateProvider> : <>{children}</>;
};
