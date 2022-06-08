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

import { Point } from '../../../../core/annotations';

interface CrosshairProps {
    location: Point | null;
    zoom: number;
    color?: string;
}

const CROSSHAIR_OPACITY = 0.9;
const DEFAULT_SIZE = 1.0;

export const Crosshair = ({ location, zoom, color = 'white' }: CrosshairProps): JSX.Element => {
    if (location === null) {
        return <g></g>;
    }

    return (
        <g>
            <rect
                y={location.y}
                width={'100%'}
                height={DEFAULT_SIZE / zoom}
                fillOpacity={CROSSHAIR_OPACITY}
                fill={color}
            />
            <rect
                x={location.x}
                width={DEFAULT_SIZE / zoom}
                height={'100%'}
                fillOpacity={CROSSHAIR_OPACITY}
                fill={color}
            />
        </g>
    );
};
