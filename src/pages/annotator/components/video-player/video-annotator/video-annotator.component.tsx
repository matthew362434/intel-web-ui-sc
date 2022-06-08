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

import { useMemo } from 'react';

import { Grid } from '@adobe/react-spectrum';
import groupBy from 'lodash/groupBy';

import { isGlobal } from '../../../../../core/labels';
import { VideoFrame } from '../../../../../core/media';
import { isAnomalyDomain, ProjectProps } from '../../../../../core/projects';
import { filterOutExclusiveLabel } from '../../../../../shared/utils';
import { useProject } from '../../../../project-details/providers/project-provider/project-provider.component';
import { FrameSkipInput } from './frame-skip-input.component';
import { GroupedLabels } from './grouped-labels.component';
import { VideoTimeline } from './video-timeline.component';

interface VideoAnnotatorProps {
    videoFrame: VideoFrame;
    step: number;
    setStep: (step: number) => void;
    selectFrame: (frameNumber: number) => void;
    project: ProjectProps;
    isInActiveMode: boolean;
}

export const VideoAnnotator = ({
    videoFrame,
    step,
    setStep,
    selectFrame,
    project,
    isInActiveMode,
}: VideoAnnotatorProps): JSX.Element => {
    const { isSingleDomainProject } = useProject();
    const isAnomalyProject = isSingleDomainProject(isAnomalyDomain);

    const labelsByGroup = useMemo(() => {
        const labels = isAnomalyProject ? project.labels : filterOutExclusiveLabel(project.labels);

        return groupBy(labels, (label) => {
            if (isGlobal(label)) {
                return isAnomalyProject ? 'Normal vs. Anomaly' : label.group;
            }

            return label.id;
        });
    }, [project, isAnomalyProject]);

    return (
        <Grid
            areas={['frameskip timeline', 'labels timeline']}
            columns={['size-2000', 'auto']}
            rows={['size-500', 'auto']}
        >
            <VideoTimeline
                labelsByGroup={labelsByGroup}
                selectFrame={selectFrame}
                step={step}
                videoFrame={videoFrame}
            />
            <FrameSkipInput step={step} setStep={setStep} videoFrame={videoFrame} isDisabled={isInActiveMode} />
            <GroupedLabels labelsByGroup={labelsByGroup} />
        </Grid>
    );
};
