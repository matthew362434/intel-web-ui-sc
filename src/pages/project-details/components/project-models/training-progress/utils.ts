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

import { useEffect, useRef } from 'react';

import { useQueryClient } from 'react-query';

import QUERY_KEYS from '../../../../../core/requests/query-keys';
import { useProjectIdentifier } from '../../../../annotator/hooks/use-project-identifier';
import { useProject } from '../../../providers';

export const useIsTraining = (): boolean => {
    const { workspaceId, projectId } = useProjectIdentifier();
    const { projectStatus } = useProject();
    const isTraining = !!projectStatus?.isTraining;

    const prevIsTrainingValue = useRef<boolean>(false);
    const client = useQueryClient();

    useEffect(() => {
        if (prevIsTrainingValue && !isTraining) {
            client.invalidateQueries(QUERY_KEYS.MODELS_KEY(workspaceId, projectId)).then();
        }
        prevIsTrainingValue.current = isTraining;
    }, [isTraining, client, projectId, workspaceId]);

    return isTraining;
};
