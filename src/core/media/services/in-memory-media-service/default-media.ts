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

import { MEDIA_TYPE } from '../../base-media.interface';
import { MEDIA_ANNOTATION_STATUS } from '../../base.interface';
import { MediaItem } from '../../media.interface';
import Antelope from './../../../../assets/antelope.png';
import Thumb1 from './../../../../assets/thumb-1.png';
import Thumb2 from './../../../../assets/thumb-2.png';
import Thumb3 from './../../../../assets/thumb-3.png';
import Thumb4 from './../../../../assets/thumb-4.png';
import Thumb5 from './../../../../assets/thumb-5.png';
import Thumb6 from './../../../../assets/thumb-6.png';
import { Image } from './../../image.interface';

// NOTE: this was copied from  '../../../../test-utils', importing it from
// the test utils file suddenly breaks all tests using the in memory service
const getMockedImageMediaItem = (mediaItem: Partial<Image>): Image => {
    return {
        identifier: { type: MEDIA_TYPE.IMAGE, imageId: 'test-image' },
        name: 'Test image',
        status: MEDIA_ANNOTATION_STATUS.NONE,
        src: '',
        thumbnailSrc: '',
        metadata: { width: 100, height: 100 },
        ...mediaItem,
        annotationStatePerTask: [],
    };
};

export const DEFAULT_IN_MEMORY_MEDIA: MediaItem[] = [
    getMockedImageMediaItem({
        identifier: { type: MEDIA_TYPE.IMAGE, imageId: '1' },
        thumbnailSrc: Thumb1,
        src: Thumb1,
        name: 'Antelope 1',
    }),
    getMockedImageMediaItem({
        identifier: { type: MEDIA_TYPE.IMAGE, imageId: '2' },
        thumbnailSrc: Thumb2,
        src: Thumb2,
        name: 'Antelope 2',
        status: MEDIA_ANNOTATION_STATUS.ANNOTATED,
    }),
    getMockedImageMediaItem({
        identifier: { type: MEDIA_TYPE.IMAGE, imageId: '3' },
        thumbnailSrc: Thumb3,
        src: Antelope,
        name: 'Antelope 3',
        status: MEDIA_ANNOTATION_STATUS.ANNOTATED,
    }),
    getMockedImageMediaItem({
        identifier: { type: MEDIA_TYPE.IMAGE, imageId: '4' },
        thumbnailSrc: Thumb4,
        src: Thumb4,
        name: 'Antelope 4',
    }),
    getMockedImageMediaItem({
        identifier: { type: MEDIA_TYPE.IMAGE, imageId: '5' },
        thumbnailSrc: Thumb5,
        src: Thumb5,
        name: 'Antelope 5',
    }),
    getMockedImageMediaItem({
        identifier: { type: MEDIA_TYPE.IMAGE, imageId: '6' },
        thumbnailSrc: Thumb6,
        src: Thumb6,
        name: 'Antelope 6',
        status: MEDIA_ANNOTATION_STATUS.ANNOTATED,
    }),
];
