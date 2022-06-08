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

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

import { useHistory } from 'react-router-dom';

type UseHistoryBlockType = () => boolean;

export const useHistoryBlock = (
    condition: UseHistoryBlockType
): [boolean, Dispatch<SetStateAction<boolean>>, () => void] => {
    const [open, setOpen] = useState<boolean>(false);
    const unblockCallback = useRef<() => void>(() => undefined);
    const nextLocation = useRef<string>('');
    const history = useHistory();

    const onUnsavedAction = useCallback(() => {
        unblockCallback.current();
        history.push(nextLocation.current);
    }, [history, nextLocation]);

    useEffect(() => {
        unblockCallback.current = history.block((location) => {
            if (condition()) {
                setOpen(true);

                nextLocation.current = location.pathname;

                return false;
            }
        });

        return () => unblockCallback.current();
    }, [history, condition, setOpen]);

    return [open, setOpen, onUnsavedAction];
};
