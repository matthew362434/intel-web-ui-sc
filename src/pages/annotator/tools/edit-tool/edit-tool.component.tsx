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

import { getOutputFromTask } from '../../providers/task-chain-provider/utils';
import { ToolAnnotationContextProps } from '../tools.interface';
import classes from './../../annotator-canvas.module.scss';
import { EditAnnotationTool } from './edit-annotation-tool.component';

interface EditToolProps extends ToolAnnotationContextProps {
    disableTranslation?: boolean;
    disablePoints?: boolean;
    canvasRef?: RefObject<SVGSVGElement>;
}

export const EditTool = ({
    annotationToolContext,
    disableTranslation = false,
    disablePoints = false,
    canvasRef,
}: EditToolProps): JSX.Element => {
    // TODO: only get annotations from the current task
    const annotations = getOutputFromTask(annotationToolContext, annotationToolContext.selectedTask).filter(
        ({ isSelected, isHidden, isLocked }) => isSelected && !isHidden && !isLocked
    );

    return (
        <div aria-label='edit-annotations' className={classes.disabledLayer}>
            {annotations.map((annotation) => {
                return (
                    <EditAnnotationTool
                        key={annotation.id}
                        annotation={annotation}
                        annotationToolContext={annotationToolContext}
                        disablePoints={disablePoints}
                        disableTranslation={disableTranslation}
                        canvasRef={canvasRef}
                    />
                );
            })}
        </div>
    );
};
