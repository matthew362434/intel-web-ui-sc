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
import { useMemo } from 'react';

import { useApplicationServices } from '../../../providers/application-provider/application-services-provider.component';
import {
    createApiWorkspacesService,
    createInMemoryApiWorkspacesService,
    CreateApiWorkspacesService,
} from '../services';

interface UseWorkspacesService {
    workspacesService: CreateApiWorkspacesService;
}

export const useWorkspacesService = (): UseWorkspacesService => {
    const { useInMemoryEnvironment } = useApplicationServices();

    return useMemo(() => {
        if (useInMemoryEnvironment || process.env.REACT_APP_VALIDATION_COMPONENT_TESTS === 'true') {
            return { workspacesService: createInMemoryApiWorkspacesService() };
        }

        return { workspacesService: createApiWorkspacesService() };
    }, [useInMemoryEnvironment]);
};
