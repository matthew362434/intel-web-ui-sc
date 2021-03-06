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

import { TooltipTrigger, ActionButton, Divider, Text, Tooltip } from '@adobe/react-spectrum';

import { InfoOutline } from '../../../../../assets/icons';
import classes from './dataset-accordion.module.scss';

interface ActiveDatasetTooltipProps {
    count: number;
}

export const ActiveDatasetTooltipComponent = ({ count }: ActiveDatasetTooltipProps): JSX.Element => (
    <TooltipTrigger crossOffset={-50} placement={'bottom'}>
        <ActionButton isQuiet aria-label='Dataset help' UNSAFE_className={classes.datasetTooltipButton}>
            <InfoOutline />
        </ActionButton>
        <Tooltip UNSAFE_className={classes.datasetToolsTooltip}>
            <Text>{count} images in the Active set</Text>
            <Divider size='S' marginY={5} />
            <Text>
                Active set is set by default in Sonoma Creek and displays media items in an order that is best for
                creating a well-balanced and fully functional model.
            </Text>
        </Tooltip>
    </TooltipTrigger>
);
