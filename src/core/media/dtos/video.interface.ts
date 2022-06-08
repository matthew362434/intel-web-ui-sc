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

import { BaseMediaDTO } from './base.interface';
import { ImageMediaInformationDTO } from './image.interface';

interface VideoMediaInformationDTO extends ImageMediaInformationDTO {
    duration: number;
    frame_count: number;
    frame_stride: number;
}

export interface VideoMediaDTO extends BaseMediaDTO {
    type: 'video';
    media_information: VideoMediaInformationDTO;
}

interface VideoFrameMediaInformationDTO extends VideoMediaInformationDTO {
    video_id: string;
}

export interface VideoFrameMediaDTO extends BaseMediaDTO {
    type: 'video_frame';
    media_information: VideoFrameMediaInformationDTO;
}
