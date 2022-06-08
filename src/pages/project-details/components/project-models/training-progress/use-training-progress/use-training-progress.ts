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

import { useJobs } from '../../../../../../core/jobs/hooks/use-jobs.hook';
import { JobState, JobType, RunningJobProps } from '../../../../../../core/jobs/job.interface';
import QUERY_KEYS from '../../../../../../core/requests/query-keys';
import { isRunningJob } from '../../../../../../shared/components/header/jobs-management/utils';
import { useProjectIdentifier } from '../../../../../annotator/hooks/use-project-identifier';
import { ArchitectureModels } from '../../project-models.interface';
import { useIsTraining } from '../utils';

interface UseTrainingProgressDetails {
    showTrainingProgress: true;
    trainingDetails: RunningJobProps;
    modelVersion: string;
}

interface UseTrainingProgressNoDetails {
    showTrainingProgress: false;
}

type UseTrainingProgress = UseTrainingProgressDetails | UseTrainingProgressNoDetails;

export const useTrainingProgress = (models: ArchitectureModels[]): UseTrainingProgress => {
    const { workspaceId, projectId } = useProjectIdentifier();
    const isTraining = useIsTraining();
    const { data } = useJobs(workspaceId, JobState.RUNNING, JobType.TRAIN, projectId, {
        enabled: isTraining,
        refetchIntervalInBackground: true,
        queryKey: QUERY_KEYS.JOBS_KEY(workspaceId, true),
    });
    const modelVersion = useRef<string | null>(null);

    const trainingDetails: RunningJobProps | undefined =
        data && data.length && isRunningJob(data[0]) ? data[0] : undefined;

    useEffect(() => {
        if (trainingDetails) {
            if (!modelVersion.current) {
                const [modelsBelongToGivenArchitecture] = models.filter(
                    ({ architectureName }) => architectureName === trainingDetails.taskMetadata.architecture
                );
                if (modelsBelongToGivenArchitecture) {
                    modelVersion.current = String(modelsBelongToGivenArchitecture.modelVersions.length + 1);
                } else {
                    modelVersion.current = '1';
                }
            }
        }

        if (!isTraining) {
            modelVersion.current = null;
        }
    }, [models, trainingDetails, isTraining]);

    if (isTraining && trainingDetails && modelVersion.current) {
        return {
            showTrainingProgress: true,
            modelVersion: modelVersion.current,
            trainingDetails,
        };
    }

    return {
        showTrainingProgress: false,
    };
};
