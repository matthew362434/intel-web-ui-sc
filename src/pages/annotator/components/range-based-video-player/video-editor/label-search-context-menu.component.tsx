// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import isFunction from 'lodash/isFunction';

import { LabeledVideoRange } from '../../../../../core/annotations/';
import { Label } from '../../../../../core/labels';
import { ContextMenu } from '../../../../../shared/components/context-menu';
import { LabelSearch } from '../../labels/label-search/label-search.component';

export const getAriaLabel = (range?: LabeledVideoRange) => {
    if (range === undefined) {
        return 'Add range';
    }

    return `Right click to change label from ${range.start} to ${range.end}`;
};

const LabelSearchContextMenu = ({
    onClose,
    onClick,
    labels,
}: {
    onClose?: () => void;
    onClick: (label: Label) => void;
    labels: Label[];
}) => {
    const handleClick = (label: Label) => {
        onClick(label);

        if (isFunction(onClose)) {
            onClose();
        }
    };

    return <LabelSearch labels={labels} onClick={handleClick} isOpen={true} suffix={() => <></>} />;
};

interface SelectLabelForRangeProps {
    range?: LabeledVideoRange;
    labels: Label[];
    onSelectLabelForRange: (label: Label, range?: LabeledVideoRange) => void;
}
export const SelectLabelForRange = ({ range, labels, onSelectLabelForRange }: SelectLabelForRangeProps) => {
    const matcher = (element: HTMLElement): boolean => {
        const label = getAriaLabel(range);

        return Boolean(element.getAttribute('aria-label')?.includes(label));
    };
    const roi = { height: 0, width: 0 };
    const handleClick = (label: Label) => onSelectLabelForRange(label, range);

    return (
        <ContextMenu roi={roi} matcher={matcher} percentageToFlip={0} zIndex={1}>
            <LabelSearchContextMenu onClick={handleClick} labels={labels} />
        </ContextMenu>
    );
};
