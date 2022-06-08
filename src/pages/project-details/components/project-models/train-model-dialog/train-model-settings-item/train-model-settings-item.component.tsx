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
import { ActionButton, Checkbox, Flex } from '@adobe/react-spectrum';

import { InfoOutline } from '../../../../../../assets/icons';
import { ButtonWithTooltip } from '../../../../../../shared/components';
import { idMatchingFormat } from '../../../../../../test-utils';
import classes from './train-model-settings-item.module.scss';

interface TrainModelSettingsItemProps {
    text: string;
    tooltip: string;
    isSelected: boolean;
    handleIsSelected: (isSelected: boolean) => void;
}

export const TrainModelSettingsItem = (props: TrainModelSettingsItemProps): JSX.Element => {
    const { text, tooltip, isSelected, handleIsSelected } = props;

    return (
        <Flex alignItems={'center'} marginTop={'size-200'} marginStart={'size-150'}>
            <Checkbox isSelected={isSelected} onChange={handleIsSelected} UNSAFE_className={classes.trainModelCheckbox}>
                {text}
            </Checkbox>
            <ButtonWithTooltip
                id={`${idMatchingFormat(text)}-tooltip-id`}
                data-testid={`${idMatchingFormat(text)}-tooltip-id`}
                buttonInfo={{ type: 'action_button', button: ActionButton }}
                content={<InfoOutline />}
                tooltipProps={{
                    children: tooltip,
                }}
                variant={'primary'}
                isQuiet
            />
        </Flex>
    );
};
