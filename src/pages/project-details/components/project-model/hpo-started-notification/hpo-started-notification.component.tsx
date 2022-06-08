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

import { View, Flex, Text, ActionButton, Divider } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';
import { AnimatePresence, motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';

import { CloseSmall, Info } from '../../../../../assets/icons';
import { PATHS } from '../../../../../core/services';
import { ANIMATION_PARAMETERS } from '../../../../../shared/animation-parameters/animation-parameters';
import { useProjectIdentifier } from '../../../../annotator/hooks/use-project-identifier';
import classes from './hpo-started-notification.module.scss';

interface HpoStartedNotificationProps {
    handleCloseHPONotification: () => void;
    isHPONotificationOpen: boolean;
}

export const HpoStartedNotification = ({
    handleCloseHPONotification,
    isHPONotificationOpen,
}: HpoStartedNotificationProps): JSX.Element => {
    const { projectId } = useProjectIdentifier();
    const { push } = useHistory();

    const redirectToModels = (): void => {
        push(PATHS.getProjectModelsUrl(projectId));
    };

    return (
        <AnimatePresence exitBeforeEnter>
            {isHPONotificationOpen && (
                <motion.div
                    variants={ANIMATION_PARAMETERS.ANIMATE_NOTIFICATION}
                    initial={'hidden'}
                    animate={'visible'}
                    exit={'hidden'}
                >
                    <View
                        paddingX={'size-200'}
                        paddingY={'size-75'}
                        position={'absolute'}
                        bottom={'size-200'}
                        left={'20%'}
                        UNSAFE_className={classes.hpoNotification}
                        borderRadius={'small'}
                        borderWidth={'thin'}
                    >
                        <Flex alignItems={'center'} gap={'size-300'}>
                            <Flex alignItems={'center'} gap={'size-200'}>
                                <Info />
                                <Text>Optimization got started. HPO will create a separate model version.</Text>
                            </Flex>
                            <Flex alignItems={'center'}>
                                <ActionButton
                                    isQuiet
                                    onPress={redirectToModels}
                                    marginEnd={'size-200'}
                                    id={'see-progress-btn-id'}
                                >
                                    <Heading margin={0} level={4}>
                                        See progress
                                    </Heading>
                                </ActionButton>
                                <Divider
                                    orientation={'vertical'}
                                    size={'S'}
                                    UNSAFE_className={classes.hpoNotificationDivider}
                                />
                                <ActionButton isQuiet onPress={handleCloseHPONotification}>
                                    <CloseSmall />
                                </ActionButton>
                            </Flex>
                        </Flex>
                    </View>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
