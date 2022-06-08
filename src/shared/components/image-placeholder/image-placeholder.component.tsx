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

import ContentLoader from 'react-content-loader';

interface ImagePlaceholderProps {
    width?: number | string;
    height?: number | string;
    foregroundColor?: string;
    backgroundColor?: string;
}

export const ImagePlaceholder = ({
    width = '100%',
    height = '100%',
    foregroundColor = 'var(--spectrum-global-color-gray-75)',
    backgroundColor = 'var(--spectrum-global-color-gray-50)',
}: ImagePlaceholderProps): JSX.Element => {
    // Viewbox does not like percentages, it needs to be a flat value.
    const viewBoxWidth = width.toString().replace('%', ''),
        viewBoxHeight = height.toString().replace('%', '');

    return (
        <ContentLoader
            speed={2}
            width={width}
            height={height}
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            style={{ width, height }}
        >
            <rect x='0' y='0' rx='0' ry='0' width={viewBoxWidth} height={viewBoxHeight} />
        </ContentLoader>
    );
};
