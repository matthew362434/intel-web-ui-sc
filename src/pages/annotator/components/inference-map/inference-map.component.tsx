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

import { Image } from '@adobe/react-spectrum';

import { PredictionMap } from '../../../../core/annotations/prediction.interface';

interface InferenceMapProps {
    map: PredictionMap | undefined;
    width: number;
    height: number;
    opacity: number;
}

export const InferenceMap = ({ map, width, height, opacity }: InferenceMapProps): JSX.Element => {
    return (
        <>
            {!!map?.url.length && (
                <Image
                    alt=''
                    id='inference-map-image'
                    position='absolute'
                    width={width}
                    height={height}
                    src={map.url}
                    UNSAFE_style={{ opacity: opacity / 100 }}
                />
            )}
        </>
    );
};
