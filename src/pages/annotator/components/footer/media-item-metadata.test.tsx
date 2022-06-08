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

import { render, screen } from '@testing-library/react';

import { MEDIA_TYPE } from '../../../../core/media';
import {
    getMockedImageMediaItem,
    getMockedVideoFrameMediaItem,
    getMockedVideoMediaItem,
} from '../../../../test-utils/mocked-items-factory';
import { MediaItemMetadata } from './media-item-metadata.component';

describe('Media item metadata', () => {
    it("shows the media item's image size and name", () => {
        const name = 'test_name';
        const mediaItem = getMockedImageMediaItem({ metadata: { width: 200, height: 300 }, name });

        render(<MediaItemMetadata mediaItem={mediaItem} />);

        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText('(200px x 300px)')).toBeInTheDocument();
    });

    describe('video metadata', () => {
        const duration = 33 * 3600 + 51 * 60 + 7;
        const frames = duration * 60;
        const fps = frames / duration;
        const metadata = { width: 200, height: 300, fps, frames, duration, frameStride: 60 };

        it("shows a videos's fps and name", () => {
            const name = 'test_video_name';
            const mediaItem = getMockedVideoMediaItem({ metadata, name });
            render(<MediaItemMetadata mediaItem={mediaItem} />);

            expect(screen.getByText(name)).toBeInTheDocument();
            expect(screen.getByText('(200px x 300px)')).toBeInTheDocument();
            expect(screen.getByText('60 fps')).toBeInTheDocument();
        });

        it('formats the time of a video frame', () => {
            const mediaItem = getMockedVideoFrameMediaItem({
                metadata,
                identifier: {
                    type: MEDIA_TYPE.VIDEO_FRAME,
                    videoId: 'test-video',
                    frameNumber: fps + fps * 13 * 60 + fps * 3 * 3600,
                },
            });
            render(<MediaItemMetadata mediaItem={mediaItem} />);

            expect(screen.getByText('03:13:01 / 33:51:07')).toBeInTheDocument();
        });

        it('floors time when formating the time of a video frame', () => {
            const mediaItem = getMockedVideoFrameMediaItem({
                metadata,
                identifier: {
                    type: MEDIA_TYPE.VIDEO_FRAME,
                    videoId: 'test-video',
                    frameNumber: 59.95 * fps,
                },
            });
            render(<MediaItemMetadata mediaItem={mediaItem} />);

            expect(screen.getByText('00:00:59 / 33:51:07')).toBeInTheDocument();
        });
    });
});
