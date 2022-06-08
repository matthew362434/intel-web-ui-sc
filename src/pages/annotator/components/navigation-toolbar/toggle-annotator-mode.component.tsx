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

import { ButtonGroup, ToggleButton, TooltipTrigger, Tooltip } from '@adobe/react-spectrum';

import { AICPUIcon, Human } from '../../../../assets/icons';
import { ANNOTATOR_MODE } from '../../core';
import { useAnnotator } from '../../providers';

// The default Spectrum colors aren't intuitive when used in dark mode, so we switch the backgrounds
// Ideally this should be changeable in css using a separate css variable
const getBackgroundColor = (isSelected: boolean) => {
    return isSelected ? 'var(--spectrum-global-color-gray-75)' : 'var(--spectrum-global-color-gray-200)';
};

export const ToggleAnnotatorMode = (): JSX.Element => {
    const { mode, setMode } = useAnnotator();

    return (
        <ButtonGroup>
            <TooltipTrigger>
                <ToggleButton
                    id='select-annotation-mode'
                    aria-label='Select annotation mode'
                    isSelected={mode === ANNOTATOR_MODE.ANNOTATION}
                    onPress={() => setMode(ANNOTATOR_MODE.ANNOTATION)}
                    UNSAFE_style={{
                        borderBottomRightRadius: 0,
                        borderTopRightRadius: 0,
                        backgroundColor: getBackgroundColor(mode === ANNOTATOR_MODE.ANNOTATION),
                    }}
                >
                    <Human />
                </ToggleButton>
                <Tooltip>User annotation mode</Tooltip>
            </TooltipTrigger>
            <TooltipTrigger>
                <ToggleButton
                    id='select-prediction-mode'
                    aria-label='Select prediction mode'
                    isSelected={mode === ANNOTATOR_MODE.PREDICTION}
                    onPress={() => setMode(ANNOTATOR_MODE.PREDICTION)}
                    UNSAFE_style={{
                        borderBottomLeftRadius: 0,
                        borderTopLeftRadius: 0,
                        backgroundColor: getBackgroundColor(mode === ANNOTATOR_MODE.PREDICTION),
                    }}
                >
                    <AICPUIcon />
                </ToggleButton>
                <Tooltip>AI prediction mode</Tooltip>
            </TooltipTrigger>
        </ButtonGroup>
    );
};
