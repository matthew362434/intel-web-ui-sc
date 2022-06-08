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

import { getBoundingBox, RegionOfInterest, roiFromImage } from '../../../core/annotations';
import { useTaskChain } from '../providers/task-chain-provider/task-chain-provider.component';

export const useContainerBoundingBox = (image: HTMLImageElement): RegionOfInterest => {
    const { inputs } = useTaskChain();
    const [inputAnnotation] = inputs.filter(({ isSelected }) => isSelected);
    const container: RegionOfInterest = inputAnnotation?.shape
        ? getBoundingBox(inputAnnotation.shape)
        : roiFromImage(image);

    return container;
};
