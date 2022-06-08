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

import { fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import range from 'lodash/range';
import { act } from 'react-dom/test-utils';

import { MEDIA_TYPE } from '../../../../../core/media';
import { providersRender as render } from '../../../../../test-utils';
import { getMockedVideoFrameMediaItem } from '../../../../../test-utils/mocked-items-factory';
import { ProjectProvider } from '../../../../project-details/providers';
import { VideoPlayerSlider as Slider } from './slider.component';

describe('Video slider', () => {
    const selectFrame = jest.fn();
    const videoFrame = getMockedVideoFrameMediaItem({});
    const step = videoFrame.metadata.frameStride;
    const videoFrames = range(0, videoFrame.metadata.frames + 1, step).map((frameNumber) => {
        return { ...videoFrame, identifier: { ...videoFrame.identifier, frameNumber } };
    });

    const sliderWidth = 1000;

    const projectRender = async (component: ReactNode) => {
        render(
            <ProjectProvider projectIdentifier={{ projectId: 'project-id', workspaceId: 'workspace-id' }}>
                {component}
            </ProjectProvider>
        );
        await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    };

    beforeEach(() => {
        Element.prototype.getBoundingClientRect = jest.fn(() => {
            return {
                width: sliderWidth,
                height: 20,
                x: 0,
                y: 0,
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                DOMRect: null,
                toJSON: () => null,
            };
        });
    });

    it('Selects a video frame when changing the slider value', async () => {
        await projectRender(
            <Slider
                isInActiveMode={false}
                videoFrames={videoFrames}
                mediaItem={videoFrame}
                selectFrame={selectFrame}
                step={step}
                minValue={0}
                maxValue={videoFrames[videoFrames.length - 1].identifier.frameNumber}
            />
        );

        const slider = screen.getByRole('slider');
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('min', '0');
        expect(slider).toHaveAttribute('max', `${videoFrame.metadata.frames}`);
        expect(slider).toHaveValue(`${videoFrame.identifier.frameNumber}`);

        fireEvent.keyDown(slider, { key: 'Right' });
        expect(selectFrame).toHaveBeenCalledWith(step);
    });

    it('Renders a frame in the middle', async () => {
        const middleVideoFrame = getMockedVideoFrameMediaItem({
            identifier: {
                type: MEDIA_TYPE.VIDEO_FRAME,
                videoId: 'video',
                frameNumber: 200,
            },
        });
        await projectRender(
            <Slider
                isInActiveMode={false}
                videoFrames={videoFrames}
                mediaItem={middleVideoFrame}
                selectFrame={selectFrame}
                step={step}
                minValue={0}
                maxValue={videoFrames[videoFrames.length - 1].identifier.frameNumber}
            />
        );

        const slider = screen.getByRole('slider');
        expect(slider).toBeInTheDocument();
        expect(slider).toHaveAttribute('min', '0');
        expect(slider).toHaveAttribute('max', `${middleVideoFrame.metadata.frames}`);
        expect(slider).toHaveValue(`${middleVideoFrame.identifier.frameNumber}`);

        jest.useFakeTimers();
        userEvent.hover(slider, { clientX: sliderWidth / 10 });
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        screen.getByRole('img', { name: `Thumbnail for frame ${middleVideoFrame.metadata.frames / 10}` });

        userEvent.unhover(slider);
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('shows ticks', async () => {
        await projectRender(
            <Slider
                isInActiveMode={false}
                videoFrames={videoFrames}
                mediaItem={videoFrame}
                selectFrame={selectFrame}
                step={step}
                showTicks
                minValue={0}
                maxValue={videoFrames[videoFrames.length - 1].identifier.frameNumber}
            />
        );

        expect(screen.getByText(`${videoFrames[0].identifier.frameNumber}f`)).toBeInTheDocument();
        expect(screen.getByText(`${videoFrames[videoFrames.length - 1].identifier.frameNumber}f`)).toBeInTheDocument();
    });
});
