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
import { createContext, ReactNode, useContext, useMemo } from 'react';

import { useWorkspaces } from '../../core/workspaces/hooks';
import { WorkspacesEntity } from '../../core/workspaces/services';
import { FeatureFlag, useFeatureFlags } from '../../hooks/use-feature-flags/use-feature-flags';
import { Loading } from '../../shared/components';
import { MissingProviderError } from '../../shared/missing-provider-error';

interface ApplicationContextProps {
    workspaceId: string;
    workspaceName: string;
    error: unknown;
    featureFlags: Record<FeatureFlag, boolean>;
}

interface ApplicationProviderProps {
    children: ReactNode;
}

const ApplicationContext = createContext<ApplicationContextProps | undefined>(undefined);

export const ApplicationProvider = ({ children }: ApplicationProviderProps): JSX.Element => {
    const { isLoading, error, data: workspacesData } = useWorkspaces();
    const featureFlags = useFeatureFlags();

    const workspace: WorkspacesEntity | undefined = useMemo(
        () => (workspacesData && workspacesData.length ? workspacesData[0] : undefined),
        [workspacesData]
    );

    if (isLoading || !workspace) {
        return <Loading />;
    }

    const value: ApplicationContextProps = {
        ...workspace,
        error,
        featureFlags,
    };

    return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};

export const useApplicationContext = (): ApplicationContextProps => {
    const context = useContext(ApplicationContext);

    if (context === undefined) {
        throw new MissingProviderError('useApplicationContext', 'ApplicationContextProvider');
    }

    return context;
};
