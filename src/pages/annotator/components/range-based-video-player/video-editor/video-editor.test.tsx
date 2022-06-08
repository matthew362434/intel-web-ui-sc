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

import { LabeledVideoRange } from '../../../../../core/annotations/';
import { fireEvent, providersRender as render, screen } from '../../../../../test-utils';
import { getMockedLabel, getMockedVideoFrameMediaItem } from '../../../../../test-utils/mocked-items-factory';
import UndoRedoProvider from '../../../tools/undo-redo/undo-redo-provider.component';
import useUndoRedoState from '../../../tools/undo-redo/use-undo-redo-state';
import { getMockedVideoControls } from '../../video-player/video-controls/test-utils';
import { VideoEditor } from './video-editor.component';

const labels = [
    getMockedLabel({ id: 'normal', name: 'Normal', color: 'var(--brand-moss)' }),
    getMockedLabel({ id: 'anomalous', name: 'Anomalous', color: 'var(--brand-coral-cobalt)' }),
];

describe('VideoEditor', () => {
    const videoControls = getMockedVideoControls({});
    const videoFrame = getMockedVideoFrameMediaItem({});

    const App = () => {
        const [ranges, setRanges, undoRedoState] = useUndoRedoState<LabeledVideoRange[]>([
            { start: 0, end: videoFrame.metadata.frames, labels: [labels[0]] },
        ]);

        return (
            <UndoRedoProvider state={undoRedoState}>
                <VideoEditor
                    videoFrame={videoFrame}
                    videoControls={videoControls}
                    labels={labels}
                    ranges={ranges}
                    setRanges={setRanges}
                />
            </UndoRedoProvider>
        );
    };

    it('renders', () => {
        render(<App />);

        const minimum = screen.getByRole('slider', { name: /Minimum/i });
        const maximum = screen.getByRole('slider', { name: /Maximum/i });

        fireEvent.change(maximum, { target: { value: 200 } });
        fireEvent.change(minimum, { target: { value: 100 } });

        fireEvent.contextMenu(screen.getByLabelText(/Add range/i));

        expect(screen.getAllByRole('listitem')).toHaveLength(labels.length);
        fireEvent.click(screen.getByText(labels[1].name));

        expect(screen.getAllByLabelText(/Right click to/)).toHaveLength(3);

        fireEvent.click(screen.getByRole('button', { name: /Undo/i }));
        expect(screen.getAllByLabelText(/Right click to/)).toHaveLength(1);

        fireEvent.click(screen.getByRole('button', { name: /Redo/i }));
        expect(screen.getAllByLabelText(/Right click to/)).toHaveLength(3);

        fireEvent.contextMenu(screen.getByLabelText(/Right click to change label from 100 to 200/i));

        expect(screen.getAllByRole('listitem')).toHaveLength(labels.length);
        fireEvent.click(screen.getByText(labels[0].name));

        expect(screen.getAllByLabelText(/Right click to/)).toHaveLength(1);
    });
});
