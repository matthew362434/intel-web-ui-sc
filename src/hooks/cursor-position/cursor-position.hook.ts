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

import { useState } from 'react';

import { MouseEvents } from '../../shared/mouse-events';
import { useEventListener } from '../event-listener/event-listener.hook';

export interface CursorPosition {
    x: number;
    y: number;
}

export const useCursorPosition = (): CursorPosition => {
    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });

    const updatePosition = (event: MouseEvent) => {
        const { clientX, clientY } = event;

        setPosition({ x: clientX, y: clientY });
    };

    useEventListener(MouseEvents.MouseMove, updatePosition);
    useEventListener(MouseEvents.MouseEnter, updatePosition);

    return position;
};
