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

import { View } from '@adobe/react-spectrum';
import { AnimatePresence, motion } from 'framer-motion';

import { ANIMATION_PARAMETERS } from '../../../animation-parameters/animation-parameters';
import { ConfigParameterItemProp, ConfigurableParametersParams } from '../configurable-parameters.interface';
import { CPParamItem } from '../cp-item';

interface CPParamsListProps extends ConfigParameterItemProp {
    parameters: ConfigurableParametersParams[];
}

export const CPParamsList = ({ parameters, updateParameter, isHPO }: CPParamsListProps): JSX.Element => {
    return (
        <View paddingX={'size-250'}>
            <AnimatePresence exitBeforeEnter>
                {parameters.map((parameter, index) => (
                    <motion.div
                        variants={ANIMATION_PARAMETERS.ANIMATE_LIST}
                        initial={'hidden'}
                        animate={'visible'}
                        exit={'hidden'}
                        layoutId={parameter.id}
                        custom={index}
                        key={parameter.id}
                    >
                        <CPParamItem parameter={parameter} updateParameter={updateParameter} isHPO={isHPO} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </View>
    );
};
