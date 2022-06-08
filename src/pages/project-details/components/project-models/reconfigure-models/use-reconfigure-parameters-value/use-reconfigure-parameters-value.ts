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

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import isEqual from 'lodash/isEqual';

import { ConfigurableParametersReconfigureDTO } from '../../../../../../core/configurable-parameters/dtos';
import { useConfigParameters, useReconfigureParameters } from '../../../../../../core/configurable-parameters/hooks';
import {
    ConfigurableParametersComponents,
    ConfigurableParametersTaskChain,
} from '../../../../../../shared/components/configurable-parameters/configurable-parameters.interface';
import { useProjectIdentifier } from '../../../../../annotator/hooks/use-project-identifier';
import { getReconfigureParametersDTO, getSelectedComponent, updateSelectedParameter } from '../../utils';

interface UseReconfigureParametersValue {
    isLoading: boolean;
    setIsQueryEnabled: Dispatch<SetStateAction<boolean>>;
    configParameters: ConfigurableParametersTaskChain[] | undefined;
    updateParameter<T extends string | boolean | number>(id: string, value: T): void;
    selectedComponentId: string | undefined;
    setSelectedComponentId: Dispatch<SetStateAction<string | undefined>>;
    selectedComponent: ConfigurableParametersComponents | undefined;
    reconfigure: (closeDialog: () => void) => void;
    isReconfigureButtonDisabled: boolean;
    isReconfiguring: boolean;
}

export const useReconfigureParametersValue = (): UseReconfigureParametersValue => {
    const { workspaceId, projectId } = useProjectIdentifier();
    const [isQueryEnabled, setIsQueryEnabled] = useState<boolean>(false);
    const { isLoading, data } = useConfigParameters(workspaceId, projectId, isQueryEnabled);
    const [configParameters, setConfigParameters] = useState<ConfigurableParametersTaskChain[] | undefined>(data);
    const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>(undefined);
    const selectedComponent = useMemo(
        () => getSelectedComponent(configParameters, selectedComponentId),
        [selectedComponentId, configParameters]
    );
    const { reconfigureParameters } = useReconfigureParameters();
    const [isReconfigureButtonDisabled, setIsReconfigureButtonDisabled] = useState<boolean>(true);

    const updateParameter = useCallback(<T extends string | boolean | number>(id: string, value: T): void => {
        const ids = id.split('::');
        ids.length > 2 &&
            setConfigParameters((prevConfigParameters) => {
                if (prevConfigParameters) {
                    return updateSelectedParameter(prevConfigParameters, id, ids, value);
                }
                return prevConfigParameters;
            });
    }, []);

    const reconfigure = (closeDialog: () => void) => {
        if (configParameters) {
            const body: ConfigurableParametersReconfigureDTO = getReconfigureParametersDTO(configParameters);

            setIsReconfigureButtonDisabled(true);
            reconfigureParameters.mutate(
                { workspaceId, projectId, body },
                {
                    onSuccess: () => {
                        setConfigParameters(undefined);
                        closeDialog();
                    },
                }
            );
        }
    };

    useEffect(() => {
        if (data) {
            setConfigParameters(data);
            setSelectedComponentId(data.length ? data[0].components[0].id : undefined);
        }
    }, [data]);

    useEffect(() => {
        if (data && configParameters) {
            setIsReconfigureButtonDisabled(isEqual(data, configParameters));
        }
    }, [data, configParameters]);

    return {
        configParameters,
        isLoading,
        setIsQueryEnabled,
        updateParameter,
        selectedComponent,
        selectedComponentId,
        setSelectedComponentId,
        reconfigure,
        isReconfigureButtonDisabled,
        isReconfiguring: reconfigureParameters.isLoading,
    };
};
