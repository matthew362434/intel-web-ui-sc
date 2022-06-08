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

import { Divider, Flex, Switch, View } from '@adobe/react-spectrum';
import { AnimatePresence, motion } from 'framer-motion';

import { ANIMATION_PARAMETERS } from '../../../../../../../shared/animation-parameters/animation-parameters';
import { HPOProps, SupportedHPORatios } from '../../use-training-state-value';
import { HPOTimeRatiosList } from './hpo-time-ratios-list';
import { hpoTitle } from './utils';

export const TrainHPO = ({ isHPO, selectedHPOTimeRatio, setHPO }: Omit<HPOProps, 'isHPOSupported'>): JSX.Element => {
    const handleIsHPO = (value: boolean): void => {
        setHPO((prev) => ({ ...prev, isHPO: value }));
    };

    const handleHPOTimeRatio = (value: SupportedHPORatios): void => {
        setHPO((prev) => ({ ...prev, selectedHPOTimeRatio: value }));
    };

    return (
        <View marginX={'size-250'}>
            <View padding={'size-250'} backgroundColor={'gray-75'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <Switch
                        isSelected={isHPO}
                        onChange={handleIsHPO}
                        isEmphasized
                        data-testid={'hpo-toggle-btn-id'}
                        id={'hpo-toggle-btn-id'}
                    >
                        {hpoTitle}
                    </Switch>
                </Flex>
                {isHPO && (
                    <AnimatePresence exitBeforeEnter>
                        <motion.div
                            variants={ANIMATION_PARAMETERS.ANIMATE_ELEMENT_WITH_JUMP}
                            initial={'hidden'}
                            animate={'visible'}
                            exit={'exit'}
                        >
                            <HPOTimeRatiosList
                                selectedHPOTimeRatio={selectedHPOTimeRatio}
                                handleHPOTimeRatio={handleHPOTimeRatio}
                            />
                        </motion.div>
                    </AnimatePresence>
                )}
            </View>
            <Divider size={'S'} marginY={'size-200'} />
        </View>
    );
};
