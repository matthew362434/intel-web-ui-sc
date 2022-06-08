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

import SplitPane, { SplitPaneProps } from 'react-split-pane';

interface SplitPaneWrapperProps {
    children: ReactNode;
    withPane: boolean;
    options?: SplitPaneProps;
}

export const SplitPaneWrapper = ({ children, withPane, options }: SplitPaneWrapperProps): JSX.Element => {
    if (withPane) {
        return (
            <SplitPane
                split='horizontal'
                style={{ position: 'relative', minHeight: 0 }}
                paneStyle={{
                    minHeight: 'var(--spectrum-global-dimension-size-1700)',
                    maxHeight: 'var(--spectrum-global-dimension-size-6000)',
                }}
                defaultSize={Number(localStorage.getItem('annotationListPanePosition'))}
                onChange={(size) => localStorage.setItem('annotationListPanePosition', size.toString())}
                resizerStyle={{
                    color: 'var(--spectrum-global-color-gray-50)',
                    minHeight: 'var(--spectrum-alias-border-size-thin)',
                    height: 'var(--spectrum-alias-border-size-thin)',
                    borderTop: 'var(--spectrum-alias-border-size-thin) solid',
                    borderBottom: 'var(--spectrum-alias-border-size-thin) solid',
                    marginTop: 'var(--spectrum-global-dimension-size-150)',
                    marginBottom: 'var(--spectrum-global-dimension-size-75)',
                    cursor: 'row-resize',
                }}
                {...options}
            >
                {children}
            </SplitPane>
        );
    }

    return <>{children}</>;
};
