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

import { fireEvent, render, screen } from '@testing-library/react';

import { SvgToolCanvas } from './svg-tool-canvas.component';

describe('SvgToolCanvas', () => {
    it('has the size of the image', () => {
        const image = new Image();
        image.width = 100;
        image.height = 200;

        const { container } = render(<SvgToolCanvas image={image} />);

        const rect = container.querySelector('rect');

        expect(rect).toHaveAttribute('width', '100');
        expect(rect).toHaveAttribute('height', '200');
    });

    it('ignores down pointer events if the user ctrl left clicked', () => {
        const image = new Image();
        const onPointerDown = jest.fn();

        render(<SvgToolCanvas image={image} onPointerDown={onPointerDown} />);

        const editor = screen.getByRole('editor');

        fireEvent.pointerDown(editor, {
            button: 0,
            buttons: 1,
            ctrlKey: true,
        });
        expect(onPointerDown).not.toHaveBeenCalled();
    });

    it('ignores down pointer events if the user used the middle mouse wheel to click', () => {
        const image = new Image();
        const onPointerDown = jest.fn();

        render(<SvgToolCanvas image={image} onPointerDown={onPointerDown} />);

        const editor = screen.getByRole('editor');

        fireEvent.pointerDown(editor, {
            button: 1,
            buttons: 4,
        });
        expect(onPointerDown).not.toHaveBeenCalled();
    });
});
