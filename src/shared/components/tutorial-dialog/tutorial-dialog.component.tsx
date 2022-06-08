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

import { CSSProperties } from 'react';

import { View, Text, ButtonGroup, Button } from '@adobe/react-spectrum';

import classes from './tutorial-dialog.module.scss';

interface TutorialDialogProps {
    description: string;
    onPressLearnMore: () => void;
    onPressDismiss: () => void;
    styles?: CSSProperties;
}

export const TutorialDialog = ({
    description,
    onPressDismiss,
    onPressLearnMore,
    styles,
}: TutorialDialogProps): JSX.Element => {
    return (
        <View UNSAFE_className={classes.dialogWrapper} UNSAFE_style={styles}>
            <Text UNSAFE_className={classes.dialogDescription}>{description}</Text>
            <ButtonGroup UNSAFE_className={classes.dialogButtonGroup}>
                <Button
                    UNSAFE_className={classes.dialogButtonQuiet}
                    variant='primary'
                    isQuiet
                    onPress={onPressLearnMore}
                    id='learn-more-button-id'
                >
                    Learn more
                </Button>
                <Button
                    UNSAFE_className={classes.dialogButton}
                    variant='primary'
                    onPress={onPressDismiss}
                    id='dismiss-button-id'
                >
                    Dismiss
                </Button>
            </ButtonGroup>
        </View>
    );
};
