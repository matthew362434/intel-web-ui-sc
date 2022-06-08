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

import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useCursorPosition } from './cursor-position.hook';

describe('useCursorPosition', () => {
    it('should update the cursor position onMouseMove', () => {
        const { result } = renderHook(() => useCursorPosition());

        expect(result.current).toEqual({ x: 0, y: 0 });

        fireEvent.mouseMove(window, { clientX: 40, clientY: 80 });

        expect(result.current).toEqual({ x: 40, y: 80 });
    });

    it('should update the cursor position onMouseEnter', () => {
        const { result } = renderHook(() => useCursorPosition());

        expect(result.current).toEqual({ x: 0, y: 0 });

        fireEvent.mouseEnter(window, { clientX: 20, clientY: 40 });

        expect(result.current).toEqual({ x: 20, y: 40 });
    });
});
