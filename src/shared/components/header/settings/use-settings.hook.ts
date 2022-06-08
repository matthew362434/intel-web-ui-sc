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

import { useMutation, useQuery, useQueryClient } from 'react-query';

import { Settings } from '../../../../core/projects';
import { useProjectService } from '../../../../core/projects/hooks';
import QUERY_KEYS from '../../../../core/requests/query-keys';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { useProjectIdentifier } from '../../../../pages/annotator/hooks/use-project-identifier';

export enum FEATURES {
    ANNOTATION_PANEL = 'annotation',
    COUNTING_PANEL = 'counting',
}

export interface SettingsFeature {
    title: string;
    isEnabled: boolean;
    tooltipDescription: string;
}

export type SettingsConfig = Record<FEATURES, SettingsFeature>;

/* 

Note: This configuration is just an initial implementation of the annotator settings panels.
In the future this can be extended to whichever configuration we need to accomodate more features.

*/
export const initialConfig: SettingsConfig = {
    [FEATURES.ANNOTATION_PANEL]: {
        title: 'Annotation',
        isEnabled: true,
        tooltipDescription: 'Toggle annotation list on the right sidebar',
    },
    [FEATURES.COUNTING_PANEL]: {
        title: 'Counting',
        isEnabled: false,
        tooltipDescription: 'Toggle counting list on the right sidebar',
    },
};

export interface UseSettings {
    saveConfig: (newConfig: SettingsConfig) => void;
    isSavingConfig: boolean;
    config: SettingsConfig;
}

export const useSettings = (): UseSettings => {
    const service = useProjectService().projectService;
    const { addNotification } = useNotification();
    const { workspaceId, projectId } = useProjectIdentifier();
    const queryClient = useQueryClient();

    const settingsQuery = useQuery<Settings>({
        queryKey: QUERY_KEYS.SETTINGS_KEY(workspaceId, projectId),
        queryFn: () => {
            return service.getProjectSettings(projectId);
        },
        onError: () => {
            addNotification('Failed to retrieve settings. Please, try again later.', NOTIFICATION_TYPE.ERROR);
        },
        retry: false,
        placeholderData: { settings: JSON.stringify(initialConfig) },
    });

    const settingsMutation = useMutation<void, unknown, string>({
        mutationFn: async (newConfig: string) => {
            await service.saveProjectSettings(projectId, { settings: newConfig });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries(QUERY_KEYS.SETTINGS_KEY(workspaceId, projectId));
        },
        onError: () => {
            addNotification('Failed to save settings. Please, try again later.', NOTIFICATION_TYPE.ERROR);
        },
    });

    const saveConfig = (newConfig: SettingsConfig): void => {
        settingsMutation.mutate(JSON.stringify(newConfig));
    };

    return {
        config: settingsQuery.data ? JSON.parse(settingsQuery.data.settings) : initialConfig,
        saveConfig,
        isSavingConfig: settingsMutation.isLoading,
    };
};
