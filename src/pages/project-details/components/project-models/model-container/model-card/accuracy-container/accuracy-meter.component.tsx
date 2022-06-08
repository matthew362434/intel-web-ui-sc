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

import { CSSProperties } from 'react';

import { Meter } from '@adobe/react-spectrum';

import classes from './accuracy-container.module.scss';

const LOW_SCORE = 40;
const HIGH_SCORE = 80;

interface AccuracyMeterProps {
    value: number;
    disabled?: boolean;
    size?: 'S' | 'L';
    id?: string;
    showValueLabel?: boolean;
    ariaLabel: string;
}
export const AccuracyMeter = ({
    disabled = false,
    value,
    size = 'L',
    id,
    showValueLabel = true,
    ariaLabel,
}: AccuracyMeterProps) => {
    const meterColor =
        value < LOW_SCORE
            ? 'var(--brand-coral-cobalt)'
            : value < HIGH_SCORE
            ? 'var(--brand-daisy)'
            : 'var(--brand-moss)';
    const variant = value < LOW_SCORE ? 'critical' : value < HIGH_SCORE ? 'warning' : 'positive';

    return (
        <Meter
            variant={variant}
            id={`accuracy-progress-${id}-id`}
            value={value}
            showValueLabel={showValueLabel}
            data-testid={`accuracy-progress-${id}-id`}
            UNSAFE_className={[
                classes.accuracyProgressBar,
                disabled ? classes.accuracyProgressBarOutdated : '',
                size === 'S' ? classes.accuracyProgressBarSmall : classes.accuracyProgressBarLarge,
            ].join(' ')}
            UNSAFE_style={
                {
                    '--meter-color': meterColor,
                } as CSSProperties
            }
            width={size === 'L' ? 'size-675' : 'size-300'}
            aria-label={ariaLabel}
        />
    );
};
