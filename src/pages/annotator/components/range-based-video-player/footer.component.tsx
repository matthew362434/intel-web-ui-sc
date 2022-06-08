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

import { Flex, View } from '@adobe/react-spectrum';

import { VideoFrame } from '../../../../core/media';
import { MediaItemMetadata } from '../../../../pages/annotator/components/footer/media-item-metadata.component';
import { ZoomLevel } from '../../../../pages/annotator/components/footer/zoom-level.component';
import { useZoom } from '../../../../pages/annotator/zoom';

export const Footer = ({ videoFrame }: { videoFrame: VideoFrame }) => {
    const {
        zoomState: { zoom },
    } = useZoom();

    return (
        <View borderColor='gray-100' borderWidth='thin' width='100%' borderTopColor='gray-50' borderTopWidth='thin'>
            <Flex justifyContent='end'>
                <MediaItemMetadata mediaItem={videoFrame} />
                <ZoomLevel zoom={zoom} />
            </Flex>
        </View>
    );
};
