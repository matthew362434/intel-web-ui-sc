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

import { render, screen } from '@testing-library/react';

import { ErrorListItem } from '../../../providers/media-upload-provider/media-upload.interface';
import { UploadStatusErrorDialog } from './upload-status-error-dialog.component';

const mockFile = (): File => ({
    lastModified: 0,
    name: 'fake-file',
    webkitRelativePath: '',
    ...new Blob(['12345'], { type: 'plain/txt' }),
});

describe('UploadStatusErrorDialog', () => {
    it('renders a general message if there are no errors', () => {
        const mockErrorItem: ErrorListItem = {
            errors: [],
            status: 0,
            statusText: 'test status text',
            uploadId: 'fake-id',
            datasetIdentifier: {
                workspaceId: '1',
                projectId: '1',
                datasetId: '1',
            },
            file: mockFile(),
        };

        render(<UploadStatusErrorDialog item={mockErrorItem} />);

        expect(screen.getByText('Something went wrong. Please try again later.')).toBeInTheDocument();
    });

    it('renders all the existing error messages if there are errors', () => {
        const mockErrorItem: ErrorListItem = {
            errors: ['error1', 'error2', 'error3'],
            status: 0,
            statusText: 'test status text',
            uploadId: 'fake-id',
            datasetIdentifier: {
                workspaceId: '1',
                projectId: '1',
                datasetId: '1',
            },
            file: mockFile(),
        };

        render(<UploadStatusErrorDialog item={mockErrorItem} />);

        expect(screen.queryByText('Something went wrong. Please try again later.')).not.toBeInTheDocument();

        mockErrorItem.errors.forEach((error) => expect(screen.getByText(error)).toBeInTheDocument());
    });

    it('renders the correct header based on item status', () => {
        const mockErrorItem: ErrorListItem = {
            errors: [],
            status: 1,
            statusText: 'test status text',
            uploadId: 'fake-id',
            datasetIdentifier: {
                workspaceId: '1',
                projectId: '1',
                datasetId: '1',
            },
            file: mockFile(),
        };

        const { rerender } = render(<UploadStatusErrorDialog item={mockErrorItem} />);

        expect(screen.getByText('Something went wrong. Please try again later.')).toBeInTheDocument();
        expect(screen.getByText(`ERROR ${mockErrorItem.status} ${mockErrorItem.statusText}`)).toBeInTheDocument();

        rerender(
            <UploadStatusErrorDialog
                item={{
                    ...mockErrorItem,
                    statusText: '',
                }}
            />
        );

        expect(screen.getByText(`ERROR ${mockErrorItem.status}`)).toBeInTheDocument();
    });
});
