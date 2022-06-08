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

import { View, Slider, Tooltip, ActionButton, TooltipTrigger } from '@adobe/react-spectrum';

import classes from './prediction-accordion.module.scss';

interface SetPredictionScoreThresholdProps {
    scoreThreshold: number;
    setScoreThreshold: (threshold: number) => void;
    isDisabled: boolean;
    tooltip: { enabled: boolean; description: string };
}

export const SetPredictionScoreThreshold = ({
    scoreThreshold,
    setScoreThreshold,
    isDisabled,
    tooltip,
}: SetPredictionScoreThresholdProps): JSX.Element => {
    return (
        <View
            width='100%'
            paddingY='size-200'
            borderBottomColor='gray-50'
            borderBottomWidth='thin'
            data-testid='score-threshold-slider'
        >
            <TooltipTrigger delay={0} isDisabled={!tooltip.enabled}>
                <ActionButton isQuiet UNSAFE_className={classes.thresholdTooltipButton}>
                    <Slider
                        id='prediction-threshold'
                        label='Filter by score'
                        labelPosition='top'
                        value={scoreThreshold}
                        onChange={setScoreThreshold}
                        width='100%'
                        isFilled
                        minValue={0}
                        maxValue={100}
                        showValueLabel={false}
                        isDisabled={isDisabled}
                    />
                </ActionButton>
                <Tooltip>{tooltip.description}</Tooltip>
            </TooltipTrigger>
        </View>
    );
};
