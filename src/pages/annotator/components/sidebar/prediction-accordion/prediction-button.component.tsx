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

import { CSSProperties, FunctionComponent } from 'react';

import { Button, DialogTrigger } from '@adobe/react-spectrum';

import { ReplaceOrMergeUserAnnotationsDialog } from './replace-or-merge-user-annotations-dialog.component';

interface PredictionButtonProps {
    id: string;
    variant: 'primary' | 'secondary' | 'cta';
    merge: () => void;
    replace: () => void;
    userAnnotationsExist: boolean;
    hideMerge: boolean;
    isDisabled: boolean;
    styles?: CSSProperties;
}
export const PredictionButton: FunctionComponent<PredictionButtonProps> = ({
    children,
    id,
    merge,
    replace,
    variant,
    userAnnotationsExist,
    hideMerge,
    isDisabled,
    styles,
}): JSX.Element => {
    if (userAnnotationsExist) {
        return (
            <DialogTrigger>
                <Button
                    id={id}
                    variant={variant}
                    isDisabled={isDisabled}
                    UNSAFE_style={{ paddingTop: 'var(--spectrum-global-dimension-size-50)', ...styles }}
                >
                    {children}
                </Button>

                {(close): JSX.Element => (
                    <ReplaceOrMergeUserAnnotationsDialog
                        close={close}
                        merge={merge}
                        replace={replace}
                        hideMerge={hideMerge}
                    />
                )}
            </DialogTrigger>
        );
    }

    return (
        <Button
            id={id}
            variant={variant}
            onPress={replace}
            UNSAFE_style={{ paddingTop: 'var(--spectrum-global-dimension-size-50)', ...styles }}
        >
            {children}
        </Button>
    );
};
