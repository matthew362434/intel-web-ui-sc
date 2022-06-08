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
import { getById, providersRender as render, screen } from '../../../../../../../test-utils';
import { Status } from './status.component';

describe('server status', () => {
    it('show proper values when tile is more than zero', () => {
        render(
            <Status
                status={{ progress: '64%', timeRemaining: '01:28', message: 'test training message' }}
                jobId={'job-id'}
            />
        );

        expect(screen.getByText('test training message')).toBeInTheDocument();
        expect(screen.getByText('64%')).toBeInTheDocument();
        expect(screen.getByText('01:28 left')).toBeInTheDocument();
        expect(screen.getByText(' left', { exact: false })).toBeInTheDocument();
    });

    it('show proper values when time is less than zero', () => {
        render(
            <Status
                status={{ progress: '0%', timeRemaining: undefined, message: 'test training message' }}
                jobId={'job-id'}
            />
        );

        expect(screen.getByText('test training message')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.queryByText(' left', { exact: false })).not.toBeInTheDocument();
    });

    it('render Loading Indicator when progress is smaller than zero', () => {
        const jobId = 'job-id';
        const { container } = render(
            <Status
                status={{ progress: '-1%', timeRemaining: '01:28', message: 'test training message' }}
                jobId={jobId}
            />
        );
        expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
        expect(getById(container, `job-progress-${jobId}-id`)).not.toHaveTextContent('-1%');
    });
});
