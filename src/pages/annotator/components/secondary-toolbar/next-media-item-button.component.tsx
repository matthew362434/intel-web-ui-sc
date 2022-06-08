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
import maxBy from 'lodash/maxBy';

import { ChevronRight } from '../../../../assets/icons';
import { Annotation } from '../../../../core/annotations';
import { MediaItem } from '../../../../core/media';
import { FindMediaItemCriteria, useNextMediaItem, findIndex } from '../../hooks/use-next-media-item.hook';
import { useAnnotationToolContext } from '../../providers';

const findNextCriteria: FindMediaItemCriteria = (selectedMediaItem, mediaItems) => {
    const idx = findIndex(selectedMediaItem, mediaItems);

    if (idx + 1 < mediaItems.length) {
        return { type: 'media', media: mediaItems[idx + 1] };
    }

    return undefined;
};

const findNextAnnotationCriteria = (selectedInput: Annotation | undefined, inputs: Annotation[]) => {
    const inputsAfterSelectedInput = inputs.filter(({ id, zIndex }) => {
        if (selectedInput === undefined) {
            return true;
        }

        return id !== selectedInput.id && selectedInput.zIndex > zIndex;
    });

    return maxBy(inputsAfterSelectedInput, ({ zIndex }) => zIndex);
};

interface NextMediaItemButtonProps {
    selectMediaItem: (mediaItem: MediaItem) => void;
    selectedMediaItem: MediaItem | undefined;
}
export const NextMediaItemButton = ({ selectMediaItem, selectedMediaItem }: NextMediaItemButtonProps): JSX.Element => {
    // Use context to select annotation
    const annotationToolContext = useAnnotationToolContext();
    const nextMediaItem = useNextMediaItem(selectedMediaItem, findNextCriteria, findNextAnnotationCriteria);

    const selectNextActiveMediaItem = () => {
        if (nextMediaItem === undefined) {
            return;
        }

        if (nextMediaItem.type === 'annotation') {
            annotationToolContext.scene.selectAnnotation(nextMediaItem.annotation.id);
            return;
        }

        if (nextMediaItem.type !== 'media') {
            return;
        }

        selectMediaItem(nextMediaItem.media);
    };

    return (
        <ActionButton
            id='secondary-toolbar-next'
            isQuiet
            aria-label='Next media item'
            onPress={selectNextActiveMediaItem}
            isDisabled={nextMediaItem === undefined}
        >
            <ChevronRight />
        </ActionButton>
    );
};
