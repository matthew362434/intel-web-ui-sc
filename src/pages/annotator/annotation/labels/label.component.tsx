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

import { useNumberFormatter } from '@react-aria/i18n';

import { ChevronRightSmallLight } from '../../../../assets/icons';
import { AnnotationLabel } from '../../../../core/annotations';
import { LABEL_SOURCE } from '../../../../core/labels';
import { TruncatedText } from '../../../../shared/components/truncated-text';
import classes from './labels.module.scss';

export const DEFAULT_LABEL_WIDTH = 200;

interface LabelProps {
    id: string;
    handleEditLabels: () => void;
    label: AnnotationLabel;
    zIndex: number;
    slots?: number;
    hasChildren: boolean;
}

export const Label = ({ id, label, handleEditLabels, hasChildren, slots = 1, zIndex }: LabelProps): JSX.Element => {
    const formatter = useNumberFormatter({
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    const maxLabelWidth = Math.round(DEFAULT_LABEL_WIDTH / slots);

    return (
        <li
            key={label.id}
            id={id}
            className={classes.label}
            style={{
                backgroundColor: label.color,
                maxWidth: maxLabelWidth,
                zIndex,
            }}
            onClick={handleEditLabels}
        >
            <TruncatedText width={maxLabelWidth}>{label.name}</TruncatedText>
            {label.source.type === LABEL_SOURCE.MODEL && label.score !== undefined ? (
                <span>{formatter.format(label.score)}</span>
            ) : (
                <></>
            )}
            {hasChildren ? <ChevronRightSmallLight /> : <></>}
        </li>
    );
};
