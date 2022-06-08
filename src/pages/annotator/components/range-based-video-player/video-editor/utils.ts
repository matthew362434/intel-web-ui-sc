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
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';

import { LabeledVideoRange } from '../../../../../core/annotations/';

export const joinRanges = (ranges: LabeledVideoRange[], range: LabeledVideoRange, idx: number) => {
    const lastRange = last(ranges);

    if (
        lastRange !== undefined &&
        idx > 0 &&
        lastRange.end + 1 === range.start &&
        isEqual(
            lastRange.labels.map(({ id }) => id),
            range.labels.map(({ id }) => id)
        )
    ) {
        lastRange.end = range.end;
        return ranges;
    }

    return [...ranges, range];
};

const partitionRanges = (ranges: LabeledVideoRange[], range: LabeledVideoRange) => {
    const rangesBeforeRange = ranges.filter(({ start, end }) => {
        return start < range.start && end < range.start;
    });

    const rangesAfterRange = ranges.filter(({ start, end }) => {
        return start > range.end && end > range.end;
    });

    const rangesWithOverlap = ranges.filter(({ start, end }) => {
        if (start < range.start && end < range.start) {
            return false;
        }
        if (start > range.end && end > range.end) {
            return false;
        }

        return true;
    });

    return { rangesBeforeRange, rangesAfterRange, rangesWithOverlap };
};

export const createNewRange = (oldRanges: LabeledVideoRange[], range: LabeledVideoRange): LabeledVideoRange[] => {
    const { rangesBeforeRange, rangesWithOverlap, rangesAfterRange } = partitionRanges(oldRanges, range);

    // Change the end and start points of the ranges at the edges of the overlap
    const firstRange: LabeledVideoRange = { ...rangesWithOverlap[0], end: range.start - 1 };
    const lastRange = { ...rangesWithOverlap[rangesWithOverlap.length - 1], start: range.end + 1 };

    // Remove edges if they end up with a nonzero width
    const rangesInOverlap = [firstRange, range, lastRange].filter(({ start, end }) => end > start);

    return [...rangesBeforeRange, ...rangesInOverlap, ...rangesAfterRange].reduce(joinRanges, []);
};
