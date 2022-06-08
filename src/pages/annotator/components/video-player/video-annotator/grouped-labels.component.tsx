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

import { View, Flex } from '@adobe/react-spectrum';
import { Dictionary } from 'lodash';

import { Label } from '../../../../../core/labels';
import classes from './video-annotator.module.scss';

interface GroupedLabelsProps {
    labelsByGroup: Dictionary<Label[]>;
}

export const GroupedLabels = ({ labelsByGroup }: GroupedLabelsProps): JSX.Element => {
    return (
        <View
            backgroundColor='gray-100'
            width='size-2000'
            gridArea='labels'
            height='100%'
            position='sticky'
            left={0}
            top={0}
        >
            <div aria-label='Label groups' id='video-annotator-label-groups'>
                <Flex direction='column' gap='size-100'>
                    {Object.keys(labelsByGroup).map((group) => {
                        const labels = labelsByGroup[group];
                        const name = labels.length === 1 ? labels[0].name : group;

                        return (
                            <View
                                backgroundColor='gray-200'
                                key={`label-${group}`}
                                paddingX='size-50'
                                height='size-225'
                                UNSAFE_className={classes.groupedLabels}
                            >
                                <View>{name}</View>
                            </View>
                        );
                    })}
                </Flex>
            </div>
        </View>
    );
};
