// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { fireEvent, render, screen } from '../../../../../test-utils';
import { getMockedVideoFrameMediaItem } from '../../../../../test-utils/mocked-items-factory';
import { getMockedVideoControls } from '../../video-player/video-controls/test-utils';
import { VideoTimelineSlider } from './video-timeline-slider.component';

describe('VideoTimelineSlider', () => {
    const videoFrame = getMockedVideoFrameMediaItem({});
    it('navigates the video', () => {
        const sliderValue = 0;
        const setSliderValue = jest.fn();
        const videoControls = getMockedVideoControls({});

        render(
            <VideoTimelineSlider
                setSliderValue={setSliderValue}
                sliderValue={sliderValue}
                videoControls={videoControls}
                videoFrame={videoFrame}
            />
        );

        const slider = screen.getByRole('slider', { name: 'Seek in video' });
        expect(slider).toHaveValue(`${videoFrame.identifier.frameNumber}`);

        fireEvent.keyDown(slider, { key: 'Right' });
        expect(setSliderValue).toHaveBeenCalledWith(1);
        expect(videoControls.goto).toHaveBeenCalledWith(1);
    });
});
