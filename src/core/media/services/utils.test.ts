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

import { MEDIA_ANNOTATION_STATUS } from '../base.interface';
import { MediaItemDTO } from '../dtos/media.interface';
import { getMediaItemFromDTO } from './utils';

describe('getMediaItemFromDTO', () => {
    it('gets a media item from a video frame dto', () => {
        const mediaDTO: MediaItemDTO = {
            id: '30',
            media_information: {
                display_url:
                    '/api/v1.0/workspaces/623b014a948d4113fc31e06c/projects/62471025948d4113fc31f253/datasets/62471025948d4113fc31f252/media/videos/62471039948d4113fc31f25f/frames/30/display/full',
                duration: 10,
                frame_stride: 30,
                frame_count: 300,
                height: 720,
                width: 1280,
                video_id: '62471039948d4113fc31f25f',
            },
            name: 'Trailcam footage of a Pine Marten and wild Fallow Deer (1)_f30',
            thumbnail:
                '/api/v1.0/workspaces/623b014a948d4113fc31e06c/projects/62471025948d4113fc31f253/datasets/62471025948d4113fc31f252/media/videos/62471039948d4113fc31f25f/frames/30/display/thumb',
            type: 'video_frame',
            upload_time: '2022-04-01T14:46:17.244000+00:00',
            annotation_state_per_task: [],
            state: MEDIA_ANNOTATION_STATUS.NONE,
        };

        const datasetIdentifier = {
            workspaceId: '623b014a948d4113fc31e06c',
            projectId: '62471025948d4113fc31f253',
            datasetId: '62471025948d4113fc31f252',
        };
        const mediaItem = getMediaItemFromDTO(datasetIdentifier, mediaDTO);

        expect(mediaItem).toEqual({
            identifier: {
                frameNumber: 30,
                type: 'video_frame',
                videoId: '62471039948d4113fc31f25f',
            },
            annotationStatePerTask: [],
            metadata: {
                duration: 10,
                fps: 30,
                frameStride: 30,
                frames: 300,
                height: 720,
                width: 1280,
            },
            name: 'Trailcam footage of a Pine Marten and wild Fallow Deer (1)_f30',
            src: '/api/v1.0/workspaces/623b014a948d4113fc31e06c/projects/62471025948d4113fc31f253/datasets/62471025948d4113fc31f252/media/videos/62471039948d4113fc31f25f/frames/30/display/full',
            status: MEDIA_ANNOTATION_STATUS.NONE,
            thumbnailSrc:
                '/api/v1.0/workspaces/623b014a948d4113fc31e06c/projects/62471025948d4113fc31f253/datasets/62471025948d4113fc31f252/media/videos/62471039948d4113fc31f25f/frames/30/display/thumb',
        });
    });
});
