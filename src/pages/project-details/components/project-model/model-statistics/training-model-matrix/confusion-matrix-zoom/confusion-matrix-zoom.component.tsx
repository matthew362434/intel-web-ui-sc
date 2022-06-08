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

import { RefObject } from 'react';

import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { useSize } from '../../../../../../../hooks';
import { ConfusionMatrix, ConfusionMatrixProps } from '../../../../../../../shared/components/charts/confusion-matrix';

interface ConfusionMatrixZoomProps extends ConfusionMatrixProps {
    boxRef: RefObject<HTMLDivElement>;
}

export const ConfusionMatrixZoom = ({ boxRef, ...rest }: ConfusionMatrixZoomProps): JSX.Element => {
    const { size } = rest;
    const fitConfusionMatrixSize = 3;
    const columnHeaderSize = 20;
    const columnNamesSize = 100;
    const rowNamesSize = 48;
    const rowHeaderSize = 18;
    const tileSize = 80;
    const tilesSize = size * tileSize;
    const confusionMatrixWidth = columnHeaderSize + columnNamesSize + size * tileSize;
    const boxSize = useSize(boxRef);
    const disablePanningAndZoom = size <= fitConfusionMatrixSize;

    const calculateTheRatio = (): number => {
        if (boxSize && !disablePanningAndZoom) {
            const boxSizeHeight = boxSize.height - rowHeaderSize - rowNamesSize;
            return Math.min(boxSize.width / confusionMatrixWidth, boxSizeHeight / tilesSize);
        }
        return 1;
    };
    const ratio = calculateTheRatio();

    return (
        <TransformWrapper panning={{ disabled: disablePanningAndZoom }} disabled={disablePanningAndZoom}>
            <TransformComponent>
                <ConfusionMatrix {...rest} ratio={ratio} />
            </TransformComponent>
        </TransformWrapper>
    );
};
