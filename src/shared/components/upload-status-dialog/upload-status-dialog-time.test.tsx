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

import {
    MediaUploadContextProps,
    useMediaUpload,
} from '../../../providers/media-upload-provider/media-upload-provider.component';
import { UploadStatusDialogTime } from './upload-status-dialog-time.component';

jest.mock('../../../providers/media-upload-provider/media-upload-provider.component', () => ({
    useMediaUpload: jest.fn(),
}));

describe('UploadStatusDialogTime', () => {
    it('renders the remaining time correctly', () => {
        jest.mocked(useMediaUpload).mockImplementation(
            () =>
                ({
                    timeRemainingStr: '42',
                } as MediaUploadContextProps)
        );

        render(<UploadStatusDialogTime />);

        expect(screen.getByText('42')).toBeInTheDocument();
    });
});
