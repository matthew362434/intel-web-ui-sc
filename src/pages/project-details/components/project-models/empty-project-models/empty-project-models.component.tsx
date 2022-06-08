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
import { Flex, Text } from '@adobe/react-spectrum';

import { EmptyModels } from '../../../../../assets/images';
import classes from './empty-project-models.module.scss';

export const EmptyProjectModels = (): JSX.Element => {
    return (
        <Flex justifyContent={'center'} alignItems={'center'} height={'100%'}>
            <Flex direction={'column'} alignItems={'center'}>
                <EmptyModels />
                <Text marginTop={'size-150'} UNSAFE_className={classes.noTrainedModelsText}>
                    No trained models
                </Text>
                <Text>Upload media and annotate to train new model</Text>
            </Flex>
        </Flex>
    );
};
