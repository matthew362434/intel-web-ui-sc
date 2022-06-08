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

import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { providersRender as render } from '../../../../../test-utils';
import { getMockedVideoFrameMediaItem } from '../../../../../test-utils/mocked-items-factory';
import { getMockedVideoControls } from '../video-controls/test-utils';
import { FrameNumberField } from './frame-number-field.component';

describe('Frame number field', () => {
    const videoControls = getMockedVideoControls({});

    it('Changes the selected video frame', () => {
        const videoFrame = getMockedVideoFrameMediaItem({});
        render(<FrameNumberField videoControls={videoControls} videoFrame={videoFrame} />);

        const numberField = screen.getByRole('textbox');
        userEvent.clear(numberField);
        userEvent.type(numberField, '60');
        fireEvent.focusOut(numberField);

        expect(videoControls.goto).toHaveBeenCalledWith(60);
    });
});
