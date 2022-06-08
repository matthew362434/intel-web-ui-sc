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
import { ActionButton } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

import { AcceptSmall, Remove, Revisit } from '../../../assets/icons';
import { isImage, isVideo, isVideoFrame, MEDIA_ANNOTATION_STATUS, MediaItem } from '../../../core/media';
import { useProject } from '../../../pages/project-details/providers';
import { ButtonWithTooltip } from '../button-with-tooltip';
import classes from './annotation-indicator.module.scss';
import {
    ANNOTATED_IMAGE_TOOLTIP,
    ANNOTATED_IMAGE_TOOLTIP_TC,
    ANNOTATED_VIDEO_TOOLTIP,
    ANNOTATED_VIDEO_TOOLTIP_TC,
    PARTIALLY_ANNOTATED_IMAGE_TOOLTIP_TC,
    PARTIALLY_ANNOTATED_VIDEO_TOOLTIP,
    PARTIALLY_ANNOTATED_VIDEO_TOOLTIP_TC,
    TO_REVISIT_IMAGE_TOOLTIP,
    TO_REVISIT_IMAGE_TOOLTIP_TC,
} from './utils';

interface AnnotationIndicatorProps {
    mediaItem: MediaItem;
    state?: MEDIA_ANNOTATION_STATUS;
}

export const AnnotationIndicator = ({ mediaItem, state }: AnnotationIndicatorProps): JSX.Element => {
    const { isTaskChainProject } = useProject();

    if (!state || state === MEDIA_ANNOTATION_STATUS.NONE) return <></>;

    let partiallyAnnotatedTooltip = '';
    let annotatedTooltip = '';
    let revisitTooltip = '';

    if (isVideoFrame(mediaItem) || isVideo(mediaItem)) {
        if (isTaskChainProject) {
            partiallyAnnotatedTooltip = PARTIALLY_ANNOTATED_VIDEO_TOOLTIP_TC;
            annotatedTooltip = ANNOTATED_VIDEO_TOOLTIP_TC;
        } else {
            partiallyAnnotatedTooltip = PARTIALLY_ANNOTATED_VIDEO_TOOLTIP;
            annotatedTooltip = ANNOTATED_VIDEO_TOOLTIP;
        }
    } else if (isImage(mediaItem)) {
        if (isTaskChainProject) {
            annotatedTooltip = ANNOTATED_IMAGE_TOOLTIP_TC;
            revisitTooltip = TO_REVISIT_IMAGE_TOOLTIP_TC;
            partiallyAnnotatedTooltip = PARTIALLY_ANNOTATED_IMAGE_TOOLTIP_TC;
        } else {
            annotatedTooltip = ANNOTATED_IMAGE_TOOLTIP;
            revisitTooltip = TO_REVISIT_IMAGE_TOOLTIP;
            partiallyAnnotatedTooltip = PARTIALLY_ANNOTATED_VIDEO_TOOLTIP;
        }
    }

    return (
        <View
            position='absolute'
            right={'size-50'}
            bottom={'size-50'}
            backgroundColor='gray-100'
            borderRadius='large'
            zIndex={10}
        >
            {state === MEDIA_ANNOTATION_STATUS.PARTIALLY_ANNOTATED && (
                <ButtonWithTooltip
                    buttonInfo={{ type: 'action_button', button: ActionButton }}
                    content={<Remove id={`${mediaItem.name}-remove-id`} />}
                    tooltipProps={{ children: partiallyAnnotatedTooltip }}
                    buttonClasses={classes.annotationIndicator}
                    isQuiet
                />
            )}
            {state === MEDIA_ANNOTATION_STATUS.ANNOTATED && (
                <ButtonWithTooltip
                    buttonInfo={{ type: 'action_button', button: ActionButton }}
                    content={<AcceptSmall id={`${mediaItem.name}-checkmark-id`} />}
                    tooltipProps={{ children: annotatedTooltip }}
                    buttonClasses={classes.annotationIndicator}
                    isQuiet
                />
            )}
            {state === MEDIA_ANNOTATION_STATUS.TO_REVISIT && (
                <ButtonWithTooltip
                    buttonInfo={{ type: 'action_button', button: ActionButton }}
                    content={<Revisit id={`${mediaItem.name}-revisit-id`} />}
                    tooltipProps={{ children: revisitTooltip }}
                    buttonClasses={classes.annotationIndicator}
                    isQuiet
                />
            )}
        </View>
    );
};
