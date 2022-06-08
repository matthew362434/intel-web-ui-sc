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
import { Flex } from '@adobe/react-spectrum';
import { Text } from '@react-spectrum/text';

import { MEDIA_TYPE } from '../../../../../../core/media';

interface MediaItemTooltipMessageBaseProps {
    id: string;
    fileName: string;
    type: MEDIA_TYPE;
}

interface MediaItemTooltipMessageImageProps extends MediaItemTooltipMessageBaseProps {
    type: MEDIA_TYPE.IMAGE;
    resolution: string;
}

interface MediaItemTooltipMessageVideoProps extends MediaItemTooltipMessageBaseProps {
    type: MEDIA_TYPE.VIDEO | MEDIA_TYPE.VIDEO_FRAME;
    fps: number;
    duration: number;
}

export type MediaItemTooltipMessageProps = MediaItemTooltipMessageImageProps | MediaItemTooltipMessageVideoProps;

export const MediaItemTooltipMessage = (props: MediaItemTooltipMessageProps): JSX.Element => {
    const { fileName, id } = props;

    return props ? (
        <Flex direction={'column'}>
            <Text id={`${id}-filename-id`}>File name: {fileName}</Text>
            {props.type === MEDIA_TYPE.IMAGE && (
                <>
                    <Text id={`${id}-resolution-id`}>Resolution: {props.resolution}</Text>
                </>
            )}
            {(props.type === MEDIA_TYPE.VIDEO || props.type === MEDIA_TYPE.VIDEO_FRAME) && (
                <>
                    <Text id={`${id}-fps-id`}>FPS: {props.fps.toFixed(2)}</Text>
                    <Text id={`${id}-time-id`}>Time: {props.duration}s</Text>
                </>
            )}
        </Flex>
    ) : (
        <></>
    );
};
