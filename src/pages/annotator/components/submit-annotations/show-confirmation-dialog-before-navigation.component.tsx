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

import { useEffect, useRef } from 'react';

import { useHistory } from 'react-router-dom';

import { useSubmitAnnotations } from '../../providers/submit-annotations-provider/submit-annotations-provider.component';

export const ShowConfirmationDialogBeforeNavigation = (): JSX.Element => {
    const { confirmSaveAnnotations } = useSubmitAnnotations();
    const unblockCallback = useRef<() => void>(() => undefined);
    const nextLocation = useRef<string>('');
    const history = useHistory();

    useEffect(() => {
        // Block history until the user has manually confirmed that they want to leave
        // this page
        unblockCallback.current = history.block((location) => {
            nextLocation.current = location.pathname;

            confirmSaveAnnotations(async () => {
                unblockCallback.current();
                history.push(nextLocation.current);
            });

            return false;
        });

        return () => unblockCallback.current();
    }, [history, confirmSaveAnnotations]);

    return <></>;
};
