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

import { Flex, View, Text } from '@adobe/react-spectrum';
import { usePress } from '@react-aria/interactions';
import { useHistory } from 'react-router-dom';

import { Accept } from '../../../../../../assets/icons';
import { PATHS } from '../../../../../../core/services';
import { useModelIdentifier } from '../../../../../../hooks';
import { formatDate } from '../../../../../../shared/utils';
import { ActiveModel } from '../../active-model';
import { ModelCardProps } from './model-card.interface';
import classes from './model-card.module.scss';
import { ModelPerformance } from './model-performance.component';
import { RecalculateAccuracy } from './recalculate-accuracy';

export const ModelCard = (props: ModelCardProps): JSX.Element => {
    const { creationDate, isActiveModel, upToDate, version, id, architectureId, performance } = props;
    const { push } = useHistory();
    const { projectId, taskName } = useModelIdentifier();
    const { pressProps } = usePress({
        onPress: () => {
            push(PATHS.getProjectModelUrl(projectId, architectureId, id, taskName));
        },
    });

    const dateFormatted = formatDate(creationDate, 'DD MMM YYYY');
    const time = formatDate(creationDate, 'hh:mm A');
    const genericId = `${architectureId}-${id}`;

    return (
        <div {...pressProps} className={classes.modelCard}>
            <View
                borderWidth={'thin'}
                borderRadius={'small'}
                backgroundColor={'gray-75'}
                borderColor={'gray-75'}
                padding={'size-100'}
                id={`model-card-${id}`}
            >
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <Flex gap={'size-300'} alignItems={'center'} UNSAFE_className={classes.modelCheckmark}>
                        <ModelPerformance performance={performance} genericId={genericId} upToDate={upToDate} />
                        {upToDate ? (
                            <Accept aria-label={'Current model'} id={`up-to-date-${genericId}-id`} />
                        ) : (
                            <RecalculateAccuracy id={genericId} />
                        )}

                        <Text id={`version-${genericId}-id`}>Version: {version}</Text>
                        {isActiveModel ? <ActiveModel /> : <></>}
                    </Flex>
                    <Flex gap={'size-150'} alignItems={'center'} marginEnd={'size-350'}>
                        <Flex direction={'column'} justifyContent={'center'} alignItems={'center'}>
                            <Text id={`creation-date-${genericId}-id`}>{dateFormatted}</Text>
                            <Text
                                id={`creation-time-${genericId}-id`}
                                UNSAFE_className={classes.modelTime}
                                marginTop={'size-85'}
                            >
                                {time}
                            </Text>
                        </Flex>
                    </Flex>
                </Flex>
            </View>
        </div>
    );
};
