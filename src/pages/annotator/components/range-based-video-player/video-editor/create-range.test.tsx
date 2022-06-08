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
import { getMockedLabel, getMockedVideoFrameMediaItem } from '../../../../../test-utils/mocked-items-factory';
import { getMockedVideoControls } from '../../video-player/video-controls/test-utils';
import { CreateRange } from './create-range.component';

describe('CreateRange', () => {
    const videoFrame = getMockedVideoFrameMediaItem({});

    const labels = [
        getMockedLabel({ id: 'normal', name: 'Normal', color: 'var(--brand-moss)' }),
        getMockedLabel({ id: 'anomalous', name: 'Anomalous', color: 'var(--brand-coral-cobalt)' }),
    ];

    it('follows the active video frame', () => {
        const videoControls = getMockedVideoControls({});
        const onSelectLabelForRange = jest.fn();
        const setRange = jest.fn();
        const range = null;
        const videoTimelineValue = 10;

        render(
            <CreateRange
                labels={labels}
                maxValue={videoFrame.metadata.frames}
                minValue={0}
                onSelectLabelForRange={onSelectLabelForRange}
                range={range}
                setRange={setRange}
                videoTimelineValue={videoTimelineValue}
                videoControls={videoControls}
            />
        );

        const left = screen.getByRole('slider', { name: /minimum/i });
        const right = screen.getByRole('slider', { name: /maximum/i });
        expect(left).toHaveValue(`${videoTimelineValue}`);
        expect(right).toHaveValue(`${videoTimelineValue}`);

        fireEvent.keyDown(right, { key: 'Right' });
        expect(setRange).toHaveBeenCalledWith([10, 11]);
        expect(videoControls.goto).toHaveBeenCalledWith(11);

        fireEvent.keyDown(left, { key: 'Left' });
        expect(setRange).toHaveBeenCalledWith([9, 10]);
        expect(videoControls.goto).toHaveBeenCalledWith(9);
    });

    it('Selects a label for a range', () => {
        const videoControls = getMockedVideoControls({});
        const onSelectLabelForRange = jest.fn();
        const setRange = jest.fn();
        const range: [number, number] = [10, 100];
        const videoTimelineValue = 10;

        render(
            <CreateRange
                labels={labels}
                maxValue={videoFrame.metadata.frames}
                minValue={0}
                onSelectLabelForRange={onSelectLabelForRange}
                range={range}
                setRange={setRange}
                videoTimelineValue={videoTimelineValue}
                videoControls={videoControls}
            />
        );

        const left = screen.getByRole('slider', { name: /minimum/i });
        const right = screen.getByRole('slider', { name: /maximum/i });
        expect(left).toHaveValue(`${range[0]}`);
        expect(right).toHaveValue(`${range[1]}`);

        fireEvent.contextMenu(screen.getByLabelText(/Add range/i));

        expect(screen.getAllByRole('listitem')).toHaveLength(labels.length);

        fireEvent.click(screen.getByText(labels[0].name));
        expect(onSelectLabelForRange).toHaveBeenCalledWith(expect.objectContaining(labels[0]), undefined);
    });
});
