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
import { useState } from 'react';

import { AxiosError } from 'axios';
import { useQuery, UseQueryResult } from 'react-query';

import { NOTIFICATION_TYPE, useNotification } from '../../../notification';
import { trimAndLowerCase } from '../../../pages/create-project';
import { runWhen } from '../../../shared/utils';
import QUERY_KEYS from '../../requests/query-keys';
import { StatusProps } from '../status.interface';
import { useStatusService } from './use-status-service.hook';

const isSpaceLessThan =
    (isOpenOnce: boolean, minimum: number) =>
    ({ freeSpace }: StatusProps): boolean => {
        const hasValidFormat = /( GB$)/.test(freeSpace);
        const numCurrentSpace = Number(trimAndLowerCase(freeSpace).replace(' gb', ''));
        return isOpenOnce && hasValidFormat && numCurrentSpace < minimum;
    };

export const useStatus = (): UseQueryResult<StatusProps, AxiosError> => {
    const { addNotification } = useNotification();
    const [isOpenOnce, setIsOpenOnce] = useState(true);
    const service = useStatusService().statusService;

    return useQuery<StatusProps, AxiosError>({
        queryKey: QUERY_KEYS.STATUS_KEY(),
        queryFn: () => {
            return service.getStatus();
        },
        onSuccess: runWhen(isSpaceLessThan(isOpenOnce, 10))(({ warning }) => {
            setIsOpenOnce(false);
            addNotification(warning, NOTIFICATION_TYPE.WARNING);
        }),
        refetchInterval: 1000,
        notifyOnChangeProps: ['data', 'error'],
    });
};
