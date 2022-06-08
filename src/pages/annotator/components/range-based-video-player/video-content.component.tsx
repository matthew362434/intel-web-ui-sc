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
import { MutableRefObject, useEffect, useRef } from 'react';

import { Flex, View } from '@adobe/react-spectrum';

import { VideoFrame } from '../../../../core/media';
import { TransformZoom } from './transform-zoom.component';

const useSetFrameNumberWhilePlayingVideo = (
    video: MutableRefObject<HTMLVideoElement | undefined>,
    setFrameNumber: (frameNumber: number) => void,
    fps: number
) => {
    const animationFrameId = useRef<number>();

    useEffect(() => {
        if (!video.current) {
            return;
        }

        let requestFrame = requestAnimationFrame;
        let cancelFrame = cancelAnimationFrame;
        if (HTMLVideoElement.prototype !== undefined && 'requestVideoFrameCallback' in HTMLVideoElement.prototype) {
            // https://web.dev/requestvideoframecallback-rvfc/
            const vid = video.current as HTMLVideoElement & {
                requestVideoFrameCallback: typeof requestAnimationFrame;
                cancelVideoFrameCallback: typeof cancelAnimationFrame;
            };
            requestFrame = vid.requestVideoFrameCallback.bind(vid);
            cancelFrame = vid.cancelVideoFrameCallback.bind(vid);
        }

        const updateCanvas = (_time: number, metadata?: { mediaTime: number }) => {
            const mediaTime = metadata !== undefined && 'mediaTime' in metadata ? metadata?.mediaTime : null;
            const time = mediaTime ?? video.current?.currentTime ?? 0;
            const frameNumber = Math.round(fps * time);

            setFrameNumber(frameNumber);
            animationFrameId.current = requestFrame(updateCanvas);
        };

        animationFrameId.current = requestFrame(updateCanvas);

        return () => {
            if (animationFrameId.current) {
                cancelFrame(animationFrameId.current);
            }
        };
    }, [fps, setFrameNumber, video]);
};

interface VideoContentProps {
    mediaItem: VideoFrame;
    video: MutableRefObject<HTMLVideoElement | undefined>;
    setIsPlaying: (isPlaying: boolean) => void;
    setFrameNumber: (number: number) => void;
}

export const VideoContent = ({ mediaItem, setIsPlaying, video, setFrameNumber }: VideoContentProps) => {
    const fps = mediaItem.metadata.fps;

    useSetFrameNumberWhilePlayingVideo(video, setFrameNumber, fps);

    return (
        <Flex gap='size-100'>
            <View backgroundColor='gray-50' maxHeight='400px' width='100%' marginBottom='size-100'>
                <TransformZoom mediaItem={mediaItem}>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error
                        ref={video}
                        width={mediaItem.metadata.width}
                        height={mediaItem.metadata.height}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        // Fix for Tainted canvases
                        crossOrigin='anonymous'
                        controlsList='noremoteplayback'
                    >
                        <source src={mediaItem.src} type='video/mp4' />
                    </video>
                </TransformZoom>
            </View>
        </Flex>
    );
};
