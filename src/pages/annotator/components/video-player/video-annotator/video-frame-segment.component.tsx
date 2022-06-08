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

import { View, Flex } from '@adobe/react-spectrum';
import { Dictionary } from 'lodash';

import { Label } from '../../../../../core/labels';
import classes from './video-annotator.module.scss';

const ActiveFrameOverlay = (): JSX.Element => {
    return (
        <View
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor='static-white'
            position='absolute'
            UNSAFE_className={classes.activeFrameOverlay}
        />
    );
};

interface LabelSegmentProps {
    label?: Label;
    striped: boolean;
    isEmpty: boolean;
}
const LabelSegment = ({ label, striped, isEmpty }: LabelSegmentProps): JSX.Element => {
    if (isEmpty) {
        return <View width='100%' height='size-100' backgroundColor='gray-200' />;
    }

    const backgroundColor =
        label !== undefined ? label.color : striped ? 'var(--spectrum-global-color-gray-400)' : undefined;

    return (
        <View
            width='100%'
            height='size-100'
            UNSAFE_className={`${classes.labelMarker} ${striped ? classes.stripedBackground : ''}`}
            UNSAFE_style={{ backgroundColor }}
        />
    );
};

interface VideoFrameSegmentProps {
    isActive: boolean;
    labelsByGroup: Dictionary<Label[]>;
    onClick: () => void;
    annotatedLabels: Set<string>;
    predictedLabels: Set<string>;
    isEmpty: boolean;
}

export const VideoFrameSegment = ({
    isActive,
    labelsByGroup,
    onClick,
    annotatedLabels,
    predictedLabels,
    isEmpty,
}: VideoFrameSegmentProps): JSX.Element => {
    return (
        <div onClick={onClick} className={classes.videoFrameSegment}>
            {isActive ? <ActiveFrameOverlay /> : <></>}

            <Flex direction='column' gap='size-100' marginTop='size-100'>
                {Object.keys(labelsByGroup).map((groupName) => {
                    const labels = labelsByGroup[groupName];
                    const annotatedLabel = labels.find((label) => annotatedLabels.has(label.id));
                    const predictedLabel = labels.find((label) => predictedLabels.has(label.id));

                    const style = isEmpty ? { backgroundColor: 'var(--spectrum-global-color-gray-200)' } : {};

                    return (
                        <Flex
                            key={groupName}
                            marginEnd={isEmpty ? undefined : 'size-10'}
                            gap='size-10'
                            height='size-225'
                            direction='column'
                            UNSAFE_style={style}
                        >
                            <LabelSegment label={annotatedLabel} striped={false} isEmpty={isEmpty} />
                            <LabelSegment label={predictedLabel} striped={true} isEmpty={isEmpty} />
                        </Flex>
                    );
                })}
            </Flex>
        </div>
    );
};
