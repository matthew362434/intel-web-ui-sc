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

import { useState } from 'react';

import { LabeledVideoRange } from '../../../../../core/annotations/labeled-video-range.interface';
import { fireEvent, render, screen } from '../../../../../test-utils';
import { getMockedLabel, getMockedVideoFrameMediaItem } from '../../../../../test-utils/mocked-items-factory';
import { getMockedVideoControls } from '../../video-player/video-controls/test-utils';
import { ClassificationRanges } from './classification-ranges.component';

describe('ClassificationRanges', () => {
    const videoFrame = getMockedVideoFrameMediaItem({});
    const frames = videoFrame.metadata.frames;

    const labels = [
        getMockedLabel({ id: 'normal', name: 'Normal', color: 'var(--brand-moss)' }),
        getMockedLabel({ id: 'anomalous', name: 'Anomalous', color: 'var(--brand-coral-cobalt)' }),
        getMockedLabel({ id: 'other', name: 'Other', color: 'var(--brand-moss)' }),
    ];

    const [normal, anomalous, other] = labels;

    it('puts a slider thumb at the endpoint of a range', () => {
        const ranges: LabeledVideoRange[] = [
            { start: 0, end: 100, labels: [normal] },
            { start: 101, end: frames, labels: [anomalous] },
        ];
        const setRanges = jest.fn();
        const videoControls = getMockedVideoControls({});

        render(
            <ClassificationRanges
                frames={frames}
                ranges={ranges}
                setRanges={setRanges}
                videoControls={videoControls}
                labels={labels}
                onSelectLabelForRange={jest.fn()}
            />
        );

        expect(screen.getByRole('slider')).toHaveValue('100');
    });

    it('adds a slider thumb for each edge between two ranges', () => {
        const ranges: LabeledVideoRange[] = [
            { start: 0, end: 100, labels: [normal] },
            { start: 101, end: 200, labels: [anomalous] },
            { start: 201, end: 300, labels: [normal] },
            { start: 301, end: 400, labels: [anomalous] },
            { start: 401, end: frames, labels: [normal] },
        ];
        const setRanges = jest.fn();
        const videoControls = getMockedVideoControls({});

        render(
            <ClassificationRanges
                frames={frames}
                ranges={ranges}
                setRanges={setRanges}
                videoControls={videoControls}
                labels={labels}
                onSelectLabelForRange={jest.fn()}
            />
        );

        expect(screen.getAllByRole('slider')).toHaveLength(ranges.length - 1);
    });

    it('removes a range if it has zero width', () => {
        const ranges: LabeledVideoRange[] = [
            { start: 0, end: 100, labels: [normal] },
            { start: 101, end: 101, labels: [anomalous] },
            { start: 102, end: 300, labels: [other] },
            { start: 301, end: 400, labels: [anomalous] },
            { start: 401, end: frames, labels: [normal] },
        ];
        const setRanges = jest.fn();
        const videoControls = getMockedVideoControls({});

        render(
            <ClassificationRanges
                frames={frames}
                ranges={ranges}
                setRanges={setRanges}
                videoControls={videoControls}
                labels={labels}
                onSelectLabelForRange={jest.fn()}
            />
        );

        const sliders = screen.getAllByRole('slider');
        expect(sliders).toHaveLength(ranges.length - 1);

        fireEvent.keyDown(sliders[0], { key: 'Right' });

        expect(setRanges).toHaveBeenCalledWith([
            { start: 0, end: 101, labels: [normal] },
            { start: 102, end: 300, labels: [other] },
            { start: 301, end: 400, labels: [anomalous] },
            { start: 401, end: frames, labels: [normal] },
        ]);

        // The video should have moved to the focused frame
        expect(videoControls.goto).toHaveBeenCalledWith(101);
    });

    it('allows a range to have a 1 width', () => {
        const ranges: LabeledVideoRange[] = [
            { start: 0, end: 100, labels: [normal] },
            { start: 101, end: 102, labels: [anomalous] },
            { start: 103, end: 300, labels: [normal] },
            { start: 301, end: 400, labels: [anomalous] },
            { start: 401, end: frames, labels: [normal] },
        ];
        const setRanges = jest.fn();
        const videoControls = getMockedVideoControls({});

        render(
            <ClassificationRanges
                frames={frames}
                ranges={ranges}
                setRanges={setRanges}
                videoControls={videoControls}
                labels={labels}
                onSelectLabelForRange={jest.fn()}
            />
        );

        const sliders = screen.getAllByRole('slider');
        expect(sliders).toHaveLength(ranges.length - 1);

        fireEvent.keyDown(sliders[0], { key: 'Right' });

        expect(setRanges).toHaveBeenCalledWith([
            { start: 0, end: 101, labels: [normal] },
            { start: 102, end: 102, labels: [anomalous] },
            { start: 103, end: 300, labels: [normal] },
            { start: 301, end: 400, labels: [anomalous] },
            { start: 401, end: frames, labels: [normal] },
        ]);

        // The video should have moved to the focused frame
        expect(videoControls.goto).toHaveBeenCalledWith(101);
    });

    it('joins two ranges when they intersect with the same labels', () => {
        const ranges: LabeledVideoRange[] = [
            { start: 0, end: 100, labels: [normal] },
            { start: 101, end: 101, labels: [anomalous] },
            { start: 102, end: 300, labels: [normal] },
            { start: 301, end: 400, labels: [anomalous] },
            { start: 401, end: frames, labels: [normal] },
        ];
        const setRanges = jest.fn();
        const videoControls = getMockedVideoControls({});

        render(
            <ClassificationRanges
                frames={frames}
                ranges={ranges}
                setRanges={setRanges}
                videoControls={videoControls}
                labels={labels}
                onSelectLabelForRange={jest.fn()}
            />
        );

        const sliders = screen.getAllByRole('slider');
        expect(sliders).toHaveLength(ranges.length - 1);

        fireEvent.keyDown(sliders[0], { key: 'Right' });

        expect(setRanges).toHaveBeenCalledWith([
            { start: 0, end: 300, labels: [normal] },
            { start: 301, end: 400, labels: [anomalous] },
            { start: 401, end: frames, labels: [normal] },
        ]);

        // The video should have moved to the focused frame
        expect(videoControls.goto).toHaveBeenCalledWith(101);
    });

    it('refreshes when the ranges change', () => {
        const expectedRanges = [
            { start: 0, end: 50, labels: [normal] },
            { start: 51, end: frames, labels: [anomalous] },
        ];

        const AppWithRangeState = () => {
            const [ranges, setRanges] = useState([
                { start: 0, end: 100, labels: [normal] },
                { start: 101, end: frames, labels: [anomalous] },
            ]);

            const videoControls = getMockedVideoControls({});

            return (
                <div>
                    <ClassificationRanges
                        frames={frames}
                        ranges={ranges}
                        setRanges={jest.fn()}
                        videoControls={videoControls}
                        labels={labels}
                        onSelectLabelForRange={jest.fn()}
                    />
                    <button onClick={() => setRanges(expectedRanges)}>Reset state</button>
                </div>
            );
        };

        render(<AppWithRangeState />);

        expect(screen.getByRole('slider')).toHaveValue('100');

        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('slider')).toHaveValue('50');
    });

    it('allows to change a label on an existing range', () => {
        const ranges: LabeledVideoRange[] = [
            { start: 0, end: 100, labels: [normal] },
            { start: 101, end: 400, labels: [anomalous] },
            { start: 401, end: frames, labels: [normal] },
        ];
        const setRanges = jest.fn();
        const videoControls = getMockedVideoControls({});

        const onSelectLabelForRange = jest.fn();

        render(
            <ClassificationRanges
                frames={frames}
                ranges={ranges}
                setRanges={setRanges}
                videoControls={videoControls}
                labels={labels}
                onSelectLabelForRange={onSelectLabelForRange}
            />
        );

        fireEvent.contextMenu(screen.getByLabelText(/Right click to change label from 101 to 400/i));

        expect(screen.getAllByRole('listitem')).toHaveLength(labels.length);

        fireEvent.click(screen.getByText(labels[0].name));
        expect(onSelectLabelForRange).toHaveBeenCalledWith(expect.objectContaining(labels[0]), ranges[1]);
    });

    it('does not allow to change a label on an existing range when it is disabled', () => {
        const ranges: LabeledVideoRange[] = [
            { start: 0, end: 100, labels: [normal] },
            { start: 101, end: 400, labels: [anomalous] },
            { start: 401, end: frames, labels: [normal] },
        ];
        const setRanges = jest.fn();
        const videoControls = getMockedVideoControls({});

        const onSelectLabelForRange = jest.fn();

        render(
            <ClassificationRanges
                frames={frames}
                ranges={ranges}
                setRanges={setRanges}
                videoControls={videoControls}
                labels={labels}
                onSelectLabelForRange={onSelectLabelForRange}
                isDisabled={true}
            />
        );

        fireEvent.contextMenu(screen.getByLabelText(/Right click to change label from 101 to 400/i));

        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    });
});
