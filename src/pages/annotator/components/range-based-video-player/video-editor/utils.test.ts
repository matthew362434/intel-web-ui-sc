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

import { getMockedLabel } from '../../../../../test-utils/mocked-items-factory';
import { createNewRange, joinRanges } from './utils';

const LABELS = [
    getMockedLabel({ id: 'normal', name: 'Normal', color: 'var(--brand-moss)' }),
    getMockedLabel({ id: 'anomalous', name: 'Anomalous', color: 'var(--brand-coral-cobalt)' }),
    getMockedLabel({ id: 'extra-label', name: 'Extra label', color: 'var(--brand-moss)' }),
];

const [normal, anomaly, other] = LABELS;

it.each([
    // Scenario with only 1 existing range
    {
        existingRanges: [{ start: 0, end: 100, labels: [normal] }],
        newRange: { start: 50, end: 100, labels: [anomaly] },
        expectedRanges: [
            { start: 0, end: 49, labels: [normal] },
            { start: 50, end: 100, labels: [anomaly] },
        ],
    },
    {
        existingRanges: [{ start: 0, end: 100, labels: [normal] }],
        newRange: { start: 0, end: 50, labels: [anomaly] },
        expectedRanges: [
            { start: 0, end: 50, labels: [anomaly] },
            { start: 51, end: 100, labels: [normal] },
        ],
    },
    {
        existingRanges: [{ start: 0, end: 100, labels: [normal] }],
        newRange: { start: 25, end: 75, labels: [anomaly] },
        expectedRanges: [
            { start: 0, end: 24, labels: [normal] },
            { start: 25, end: 75, labels: [anomaly] },
            { start: 76, end: 100, labels: [normal] },
        ],
    },
    // Scenario with multiple existing ranges
    {
        existingRanges: [
            { start: 0, end: 10, labels: [normal] },
            { start: 11, end: 80, labels: [anomaly] },
            { start: 81, end: 100, labels: [normal] },
        ],
        newRange: { start: 25, end: 75, labels: [other] },
        expectedRanges: [
            { start: 0, end: 10, labels: [normal] },
            { start: 11, end: 24, labels: [anomaly] },
            { start: 25, end: 75, labels: [other] },
            { start: 76, end: 80, labels: [anomaly] },
            { start: 81, end: 100, labels: [normal] },
        ],
    },
    {
        existingRanges: [
            { start: 0, end: 10, labels: [normal] },
            { start: 11, end: 80, labels: [anomaly] },
            { start: 81, end: 100, labels: [normal] },
        ],
        newRange: { start: 25, end: 85, labels: [other] },
        expectedRanges: [
            { start: 0, end: 10, labels: [normal] },
            { start: 11, end: 24, labels: [anomaly] },
            { start: 25, end: 85, labels: [LABELS[2]] },
            { start: 86, end: 100, labels: [normal] },
        ],
    },
    // Joins ranges if they have the same label and start/end point
    {
        existingRanges: [
            { start: 0, end: 24, labels: [normal] },
            { start: 25, end: 75, labels: [anomaly] },
            { start: 76, end: 100, labels: [normal] },
        ],
        newRange: { start: 25, end: 75, labels: [normal] },
        expectedRanges: [{ start: 0, end: 100, labels: [normal] }],
    },
    // Check that ranges with overlap are removed if their start / end are equal to the new range
    {
        existingRanges: [
            { start: 0, end: 24, labels: [normal] },
            { start: 25, end: 75, labels: [anomaly] },
            { start: 76, end: 100, labels: [normal] },
        ],
        newRange: { start: 20, end: 75, labels: [normal] },
        expectedRanges: [{ start: 0, end: 100, labels: [normal] }],
    },
    {
        existingRanges: [
            { start: 0, end: 24, labels: [normal] },
            { start: 25, end: 75, labels: [anomaly] },
            { start: 76, end: 100, labels: [normal] },
        ],
        newRange: { start: 25, end: 80, labels: [normal] },
        expectedRanges: [{ start: 0, end: 100, labels: [normal] }],
    },
    // Adding a range
    {
        existingRanges: [],
        newRange: { start: 25, end: 80, labels: [normal] },
        expectedRanges: [{ start: 25, end: 80, labels: [normal] }],
    },
])('createNewRange', ({ existingRanges, newRange, expectedRanges }) => {
    expect(createNewRange(existingRanges, newRange)).toEqual(expectedRanges);
});

it.each([
    {
        ranges: [{ start: 0, end: 100, labels: [normal] }],
        expectedRanges: [{ start: 0, end: 100, labels: [normal] }],
    },
    {
        ranges: [
            { start: 0, end: 50, labels: [normal] },
            { start: 51, end: 100, labels: [normal] },
        ],
        expectedRanges: [{ start: 0, end: 100, labels: [normal] }],
    },
    {
        ranges: [
            { start: 0, end: 50, labels: [normal] },
            { start: 51, end: 75, labels: [normal] },
            { start: 76, end: 100, labels: [anomaly] },
        ],
        expectedRanges: [
            { start: 0, end: 75, labels: [normal] },
            { start: 76, end: 100, labels: [anomaly] },
        ],
    },
    {
        ranges: [
            { start: 0, end: 24, labels: [normal] },
            { start: 25, end: 75, labels: [anomaly] },
            { start: 76, end: 100, labels: [anomaly] },
        ],
        expectedRanges: [
            { start: 0, end: 24, labels: [normal] },
            { start: 25, end: 100, labels: [anomaly] },
        ],
    },
    // Edge case that is not supported: the original ranges have an overlap,
    // so the resulting ranges will have an overlap as well
    {
        ranges: [
            { start: 0, end: 50, labels: [normal] },
            { start: 25, end: 75, labels: [anomaly] },
            { start: 76, end: 100, labels: [anomaly] },
        ],
        expectedRanges: [
            { start: 0, end: 50, labels: [normal] },
            { start: 25, end: 100, labels: [anomaly] },
        ],
    },
])('joinRanges', ({ ranges, expectedRanges }) => {
    expect(ranges.reduce(joinRanges, [])).toEqual(expectedRanges);
});
