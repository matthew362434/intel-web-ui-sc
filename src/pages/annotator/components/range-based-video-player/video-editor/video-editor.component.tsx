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
import { useEffect, useState } from 'react';

import { Flex, Grid, View } from '@adobe/react-spectrum';

import { LabeledVideoRange } from '../../../../../core/annotations/labeled-video-range.interface';
import { Label } from '../../../../../core/labels';
import { VideoFrame } from '../../../../../core/media';
import classes from '../../../../../pages/annotator/components/video-player/video-annotator//video-annotator.module.scss';
import { VideoControls } from '../../../../../pages/annotator/components/video-player/video-controls/video-controls.interface';
import { ClassificationRanges } from './classification-ranges.component';
import { CreateRange } from './create-range.component';
import { createNewRange } from './utils';
import { VideoNavigation } from './video-navigation.component';
import { VideoTimelineSlider } from './video-timeline-slider.component';

const Labels = () => {
    return (
        <View backgroundColor='gray-100' width='size-2000' gridArea='labels' height='100%'>
            <Flex direction='column' gap='size-100' justifyContent='end' height='100%'>
                <div aria-label='Label groups' id='video-annotator-label-groups'>
                    <View
                        backgroundColor='gray-200'
                        paddingX='size-50'
                        height='size-225'
                        UNSAFE_className={classes.groupedLabels}
                    >
                        <View>Normal vs. Anomaly</View>
                    </View>
                </div>
            </Flex>
        </View>
    );
};

interface VideoEditorProps {
    videoFrame: VideoFrame;
    videoControls: VideoControls;
    labels: Label[];
    ranges: LabeledVideoRange[];
    setRanges: (ranges: LabeledVideoRange[]) => void;
}
export const VideoEditor = ({ videoFrame, videoControls, ranges, setRanges, labels }: VideoEditorProps) => {
    const [sliderValue, setSliderValue] = useState(videoFrame.identifier.frameNumber);
    useEffect(() => {
        setSliderValue(videoFrame.identifier.frameNumber);
    }, [videoFrame.identifier.frameNumber]);

    const frames = videoFrame.metadata.frames;
    const [newRange, setNewRange] = useState<null | [number, number]>(null);

    const handleSelectLabelForRange = (label: Label, range?: LabeledVideoRange) => {
        if (range !== undefined) {
            setRanges(createNewRange(ranges, { start: range.start, end: range.end, labels: [label] }));
            setNewRange(null);
            return;
        }

        if (newRange === null) {
            return;
        }

        setRanges(createNewRange(ranges, { start: newRange[0], end: newRange[1], labels: [label] }));
        setNewRange(null);
    };

    return (
        <View paddingX='size-200' marginBottom='size-200'>
            <Grid
                areas={['frameskip controls', 'frameskip timeline', 'labels timeline']}
                columns={['size-2000', 'auto']}
                rows={['size-500', 'auto', 'auto']}
            >
                <Labels />

                <VideoNavigation videoFrame={videoFrame} videoControls={videoControls} />

                <Flex direction='column' gridArea='timeline'>
                    <View width='100%'>
                        <VideoTimelineSlider
                            sliderValue={sliderValue}
                            setSliderValue={setSliderValue}
                            videoFrame={videoFrame}
                            videoControls={videoControls}
                        />
                    </View>

                    <View backgroundColor='gray-200' height='size-225' position='relative' marginTop='8px'>
                        <ClassificationRanges
                            // We want to force the ranges slider to rerender so that the useSliderState hook resets
                            // whenever we change the amount of ranges
                            key={ranges.length}
                            ranges={ranges}
                            frames={frames}
                            setRanges={setRanges}
                            videoControls={videoControls}
                            isDisabled={newRange !== null}
                            labels={labels}
                            onSelectLabelForRange={handleSelectLabelForRange}
                        />
                        <CreateRange
                            videoControls={videoControls}
                            minValue={0}
                            maxValue={frames}
                            range={newRange}
                            setRange={setNewRange}
                            videoTimelineValue={sliderValue}
                            labels={labels}
                            onSelectLabelForRange={handleSelectLabelForRange}
                        />
                    </View>
                </Flex>
            </Grid>
        </View>
    );
};
