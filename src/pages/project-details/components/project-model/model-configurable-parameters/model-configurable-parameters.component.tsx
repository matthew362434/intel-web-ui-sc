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

import { View } from '@adobe/react-spectrum';

import { useModelConfigParameters } from '../../../../../core/configurable-parameters/hooks';
import { useModelIdentifier } from '../../../../../hooks';
import { Loading, ConfigurableParameters, ConfigurableParametersType } from '../../../../../shared/components';

interface ModelConfigurableParametersProps {
    taskId: string;
}

export const ModelConfigurableParameters = ({ taskId }: ModelConfigurableParametersProps): JSX.Element => {
    const { workspaceId, projectId, modelId } = useModelIdentifier();
    const { isLoading, data } = useModelConfigParameters(workspaceId, projectId, taskId, modelId);

    return isLoading ? (
        <Loading />
    ) : data ? (
        <View marginTop={'size-250'} height={'100%'}>
            <ConfigurableParameters
                type={ConfigurableParametersType.READ_ONLY_SINGLE_PARAMETERS}
                configParametersData={data}
            />
        </View>
    ) : (
        <></>
    );
};
