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

import { CaretRightIcon } from '../../../../../assets/icons';
import { Annotation } from '../../../../../core/annotations';
import { Label } from '../../../../../core/labels';
import { TruncatedText } from '../../../../../shared/components/truncated-text';
import { DEFAULT_LABEL_WIDTH } from '../../labels/label.component';
import classes from '../annotation-list-item/annotation-list-item.module.scss';

interface AnnotationLabelListProps {
    annotation: Annotation;
    labels: readonly Label[];
}

export const AnnotationLabelList = ({ labels, annotation }: AnnotationLabelListProps): JSX.Element => {
    return (
        <>
            {!labels.length && <span>Select label</span>}

            <ul id={`${annotation.id}-labels`} className={classes.labelList}>
                {labels.map((label, labelIndex) => {
                    const hasChildren = labels.some(({ group }) => label.id === group);
                    const maxLabelWidth = Math.round(DEFAULT_LABEL_WIDTH / labels.length);

                    return (
                        <li
                            key={label.id}
                            id={`${annotation.id}-labels-${label.id}`}
                            className={classes.labelList}
                            style={{ maxWidth: maxLabelWidth }}
                        >
                            <TruncatedText width={maxLabelWidth}>{label.name}</TruncatedText>
                            {hasChildren ? <CaretRightIcon /> : <></>}
                            {!hasChildren && labelIndex < labels.length - 1 ? ', ' : <></>}
                        </li>
                    );
                })}
            </ul>
        </>
    );
};
