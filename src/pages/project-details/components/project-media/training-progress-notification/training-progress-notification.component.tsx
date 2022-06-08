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
import { ActionButton, Flex, Text } from '@adobe/react-spectrum';
import { useHistory } from 'react-router-dom';

import { Info } from '../../../../../assets/icons';
import { PATHS } from '../../../../../core/services';
import { useProjectIdentifier } from '../../../../annotator/hooks/use-project-identifier';
import { CustomNotificationProps, CustomNotificationWrapper } from '../custom-notification-wrapper';
import classes from '../training-notification/training-notification.module.scss';

export const TrainingProgressNotification = ({ offset, dispatch }: CustomNotificationProps): JSX.Element => {
    const { projectId } = useProjectIdentifier();
    const history = useHistory();

    return (
        <CustomNotificationWrapper offset={offset} dispatch={dispatch} width={'30%'}>
            <Flex alignItems={'center'} flex={1} justifyContent={'space-between'}>
                <Flex gap='size-100' alignItems={'center'}>
                    <Info />
                    <Text>Training has started</Text>
                </Flex>
                <Flex gap='size-100' alignItems='center'>
                    <ActionButton isQuiet onPress={() => history.push(PATHS.getProjectModelsUrl(projectId))}>
                        <Text UNSAFE_className={classes.trainingNotificationButton}>Progress</Text>
                    </ActionButton>
                </Flex>
            </Flex>
        </CustomNotificationWrapper>
    );
};
