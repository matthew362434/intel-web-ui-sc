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

import { ActionButton } from '@adobe/react-spectrum';

import { Back } from '../../../../assets/icons';

interface BackHomeButtonProps {
    onPress: () => void;
}

export const BackHomeButton = ({ onPress }: BackHomeButtonProps): JSX.Element => {
    return (
        <ActionButton id='go-back-button' data-testid='go-back-button' isQuiet onPress={onPress}>
            <Back />
        </ActionButton>
    );
};
