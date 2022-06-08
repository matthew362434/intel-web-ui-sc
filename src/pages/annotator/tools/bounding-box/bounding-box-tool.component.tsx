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

import { Rect } from '../../../../core/annotations';
import { rectToRotatedRect } from '../../../../core/annotations/rotated-rect-math';
import { DOMAIN } from '../../../../core/projects';
import { DrawingBox } from '../drawing-box';
import { ToolAnnotationContextProps } from '../tools.interface';
import { drawingStyles } from '../utils';

export const BoundingBoxTool = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const { scene, image, zoomState, defaultLabel, activeDomains } = annotationToolContext;
    const onComplete = (shapes: Rect[]) => {
        if (activeDomains.includes(DOMAIN.DETECTION_ROTATED_BOUNDING_BOX)) {
            scene.addShapes(shapes.map(rectToRotatedRect));
        } else {
            scene.addShapes(shapes);
        }
    };
    const zoom = zoomState.zoom;

    const styles = drawingStyles(defaultLabel);

    return <DrawingBox onComplete={onComplete} image={image} zoom={zoom} styles={styles} />;
};
