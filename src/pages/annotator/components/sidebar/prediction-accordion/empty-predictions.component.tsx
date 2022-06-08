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
import { Text, View } from '@adobe/react-spectrum';

import { InfoOutline } from '../../../../../assets/icons';
import { ANNOTATOR_MODE } from '../../../core';
import { useAnnotator } from '../../../providers';
import classes from './prediction-accordion.module.scss';

export const EmptyPredictions = (): JSX.Element => {
    const { setMode } = useAnnotator();

    return (
        <View
            UNSAFE_className={classes.descriptionWrapper}
            borderTopColor='gray-50'
            borderTopWidth='thin'
            paddingY='size-400'
            paddingX='size-150'
            data-testid='empty-prediction-list'
        >
            <InfoOutline />
            <Text UNSAFE_className={classes.description}>
                Prediction not yet available. Continue with{' '}
                <span className={classes.link} onClick={() => setMode(ANNOTATOR_MODE.ANNOTATION)}>
                    manual annotating
                </span>
                .
            </Text>
        </View>
    );
};
