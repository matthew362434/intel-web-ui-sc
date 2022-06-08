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

import { providersRender as render, screen } from '../../../../test-utils';
import { getMockedVideoFrameMediaItem } from '../../../../test-utils/mocked-items-factory';
import { ZoomProvider } from '../../zoom';
import { Footer } from './footer.component';
import { TransformZoom } from './transform-zoom.component';

describe('Footer', () => {
    it('Shows video metadata', async () => {
        const videoFrame = getMockedVideoFrameMediaItem({ name: 'Bunny.mp3' });
        render(
            <ZoomProvider>
                <TransformZoom mediaItem={videoFrame} />
                <Footer videoFrame={videoFrame} />
            </ZoomProvider>
        );

        expect(screen.getByRole('button', { name: 'Zoom level' })).toHaveTextContent('100.0%');
        expect(screen.getByText(videoFrame.name)).toBeInTheDocument();
    });
});
