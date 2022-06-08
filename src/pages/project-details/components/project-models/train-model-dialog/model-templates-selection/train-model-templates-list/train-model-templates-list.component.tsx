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

import { Flex, View } from '@adobe/react-spectrum';

import { SliderAnimation } from '../../../../../../../shared/components';
import { TrainModelTemplate } from '../train-model-template';
import { TrainModelTemplatesProps } from './train-model-templates-list.interface';
import classes from './train-model-templates-list.module.scss';

export const TrainModelTemplatesList = ({
    templates,
    animationDirection,
    selectedDomain,
    ...rest
}: TrainModelTemplatesProps): JSX.Element => {
    return (
        <View id={'model-templates-list-id'}>
            <View
                backgroundColor={'gray-50'}
                borderRadius={'regular'}
                padding={'size-300'}
                UNSAFE_className={classes.modelTemplatesBox}
            >
                <SliderAnimation animationDirection={animationDirection} key={selectedDomain}>
                    <Flex alignItems={'center'} gap={'size-250'}>
                        {templates.map((template) => (
                            <TrainModelTemplate key={template.text} template={template} {...rest} />
                        ))}
                    </Flex>
                </SliderAnimation>
            </View>
        </View>
    );
};
