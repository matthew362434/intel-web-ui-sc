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

import { DimensionValue } from '@react-types/shared/src/dna';
import { Responsive } from '@react-types/shared/src/style';

import { Label } from '../../../core/labels';
import { MediaDropBox } from './media-drop-box.component';

interface MediaDropProps {
    dropBoxIcon?: string;
    dropBoxIconSize?: Responsive<DimensionValue>;
    dropBoxPendingText?: string;
    dropBoxInProgressText?: string;
    dropBoxHoverText?: string;
    anomalyLabel?: Label;
    showUploadButton?: boolean;
    isVisible?: boolean;
    onDrop: (files: File[]) => void;
}

export const MediaDrop = ({
    dropBoxIcon,
    dropBoxIconSize,
    dropBoxPendingText,
    dropBoxInProgressText,
    dropBoxHoverText,
    anomalyLabel,
    showUploadButton,
    isVisible,
    onDrop,
}: MediaDropProps): JSX.Element => {
    return (
        <MediaDropBox
            dropBoxIcon={dropBoxIcon}
            dropBoxIconSize={dropBoxIconSize}
            dropBoxPendingText={dropBoxPendingText}
            dropBoxInProgressText={dropBoxInProgressText}
            dropBoxHoverText={dropBoxHoverText}
            anomalyLabel={anomalyLabel}
            showUploadButton={showUploadButton}
            isVisible={isVisible}
            onDrop={onDrop}
        />
    );
};
