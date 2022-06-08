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

import { TrainingDetails } from '../../../../../core/projects/project-status.interface';
import { getById, providersRender as render, screen } from '../../../../../test-utils';
import { TrainingProgress } from './training-progress.component';

describe('training progress', () => {
    it('check if all training details are on the screen, formatted timeRemaining', () => {
        const training: TrainingDetails = {
            message: 'This is test message',
            timeRemaining: '01:08:67',
            progress: '68%',
        };

        render(<TrainingProgress training={training} />);

        expect(screen.getByText('01:08:67')).toBeInTheDocument();
        expect(screen.getByText('This is test message')).toBeInTheDocument();
        expect(screen.getByText('68%')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '68');
    });

    describe('timeRemaining gets formatted', () => {
        it('time with hours, minutes and seconds', () => {
            const training: TrainingDetails = {
                message: 'This is test message',
                timeRemaining: '4550.775821447372',
                progress: '100%',
            };

            const { container } = render(<TrainingProgress training={training} />);
            const progress = getById(container, 'training-progress-percentage');

            expect(progress).toHaveTextContent('100%');
            expect(screen.getByText('01:15:50')).toBeInTheDocument();
        });

        it('time with no hours, minutes and seconds', () => {
            const training: TrainingDetails = {
                message: 'This is test message',
                timeRemaining: '120',
                progress: '19.213123%',
            };

            const { container } = render(<TrainingProgress training={training} />);
            const progress = getById(container, 'training-progress-percentage');

            expect(progress).toHaveTextContent('19%');
            expect(screen.getByText('00:02:00')).toBeInTheDocument();
        });

        it('time with only seconds', () => {
            const training: TrainingDetails = {
                message: 'This is test message',
                timeRemaining: '8',
                progress: '100%',
            };

            render(<TrainingProgress training={training} />);

            expect(screen.getByText('00:00:08')).toBeInTheDocument();
        });
    });

    it('check training details when timeRemaining is undefined', () => {
        const training: TrainingDetails = {
            message: 'This is test message',
            progress: '68%',
        };
        const { container } = render(<TrainingProgress training={training} />);

        const timeRemaining = getById(container, 'training-progress-time-remaining');
        const message = getById(container, 'training-progress-message');
        const progress = getById(container, 'training-progress-percentage');

        expect(timeRemaining).not.toBeInTheDocument();
        expect(message).toHaveTextContent('This is test message');
        expect(progress).toHaveTextContent('68%');
        expect(screen.queryByAltText('time remaining')).not.toBeInTheDocument();
    });

    it('check training details when progress is empty', () => {
        const training: TrainingDetails = {
            message: 'Some message',
            progress: '',
        };
        const { container } = render(<TrainingProgress training={training} />);

        const timeRemaining = getById(container, 'training-progress-time-remaining');
        const message = getById(container, 'training-progress-message');

        expect(timeRemaining).not.toBeInTheDocument();
        expect(message).toHaveTextContent('Some message');
        expect(screen.queryByAltText('time remaining')).not.toBeInTheDocument();
    });
});
