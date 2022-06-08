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

import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Button, ButtonGroup } from '@adobe/react-spectrum';
import { capitalize } from 'lodash';

import {
    DatasetImportDialogButton,
    DatasetImportUploadItem,
    DATASET_IMPORT_DIALOG_BUTTON_NAME,
    DATASET_IMPORT_UPLOAD_STATUSES,
    DATASET_IMPORT_UPLOAD_STEPS,
} from '../dataset-import.interface';

interface DatasetImportDialogButtonsProps {
    uploadItem?: DatasetImportUploadItem;
    isReady: (uploadId: string) => boolean;
    patchUpload: (uploadId: string, data: Partial<DatasetImportUploadItem>) => void;
    createProject: (uploadItem: DatasetImportUploadItem) => void;
    setDeletingUpload: Dispatch<SetStateAction<DatasetImportUploadItem | undefined>>;
    onDialogDismiss: () => void;
}

export const DatasetImportDialogButtons = ({
    uploadItem,
    isReady,
    patchUpload,
    createProject,
    setDeletingUpload,
    onDialogDismiss,
}: DatasetImportDialogButtonsProps): JSX.Element => {
    const getPreviousStep = (step: string): DATASET_IMPORT_UPLOAD_STEPS => {
        const uploadSteps = Object.values(DATASET_IMPORT_UPLOAD_STEPS);
        const stepIdx = uploadSteps.findIndex((uploadStep: string) => step === uploadStep);

        if (stepIdx < 0) return step as DATASET_IMPORT_UPLOAD_STEPS;

        return uploadSteps[stepIdx - 1];
    };

    const getNextStep = (activeStep: string): string => {
        const uploadSteps = Object.values(DATASET_IMPORT_UPLOAD_STEPS);
        const stepIdx = uploadSteps.findIndex((step: string) => activeStep === step);

        if (stepIdx < 0 || stepIdx === uploadSteps.length) return activeStep;

        return uploadSteps[stepIdx + 1];
    };

    const defaultState: Record<DATASET_IMPORT_DIALOG_BUTTON_NAME, DatasetImportDialogButton> = {
        [DATASET_IMPORT_DIALOG_BUTTON_NAME.CANCEL]: {
            id: DATASET_IMPORT_DIALOG_BUTTON_NAME.CANCEL,
            name: capitalize(DATASET_IMPORT_DIALOG_BUTTON_NAME.CANCEL),
            variant: 'primary',
            hidden:
                !!uploadItem &&
                uploadItem.status !== DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING &&
                uploadItem?.status !== DATASET_IMPORT_UPLOAD_STATUSES.PREPARING,
            disabled:
                !!uploadItem &&
                uploadItem.status !== DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING &&
                uploadItem?.status !== DATASET_IMPORT_UPLOAD_STATUSES.PREPARING,
            action: onDialogDismiss,
        },
        [DATASET_IMPORT_DIALOG_BUTTON_NAME.DELETE]: {
            id: DATASET_IMPORT_DIALOG_BUTTON_NAME.DELETE,
            name: capitalize(DATASET_IMPORT_DIALOG_BUTTON_NAME.DELETE),
            variant: 'negative',
            hidden:
                !uploadItem ||
                uploadItem.status === DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING ||
                uploadItem.status === DATASET_IMPORT_UPLOAD_STATUSES.PREPARING,
            disabled:
                !uploadItem ||
                uploadItem.status === DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING ||
                uploadItem.status === DATASET_IMPORT_UPLOAD_STATUSES.PREPARING,
            action: () => {
                if (!uploadItem) return;

                setDeletingUpload(uploadItem);
            },
        },
        [DATASET_IMPORT_DIALOG_BUTTON_NAME.HIDE]: {
            id: DATASET_IMPORT_DIALOG_BUTTON_NAME.HIDE,
            name: capitalize(DATASET_IMPORT_DIALOG_BUTTON_NAME.HIDE),
            hidden: false,
            disabled: true,
            variant: 'primary',
            action: onDialogDismiss,
        },
        [DATASET_IMPORT_DIALOG_BUTTON_NAME.BACK]: {
            id: DATASET_IMPORT_DIALOG_BUTTON_NAME.BACK,
            name: capitalize(DATASET_IMPORT_DIALOG_BUTTON_NAME.BACK),
            hidden: true,
            disabled: true,
            variant: 'primary',
            action: () => {
                if (!uploadItem) return;

                patchUpload(uploadItem.fileId, {
                    activeStep: getPreviousStep(uploadItem.activeStep),
                });
            },
        },
        [DATASET_IMPORT_DIALOG_BUTTON_NAME.NEXT]: {
            id: DATASET_IMPORT_DIALOG_BUTTON_NAME.NEXT,
            name: capitalize(DATASET_IMPORT_DIALOG_BUTTON_NAME.NEXT),
            hidden: false,
            disabled: true,
            variant: 'primary',
            action: () => {
                if (!uploadItem) return;

                const nextStep = getNextStep(uploadItem.activeStep) as DATASET_IMPORT_UPLOAD_STEPS;

                patchUpload(uploadItem.fileId, {
                    activeStep: nextStep,
                    openedSteps: Array.from(new Set([...uploadItem.openedSteps, nextStep])),
                    completedSteps: Array.from(new Set([...uploadItem.completedSteps, uploadItem.activeStep])),
                });
            },
        },
        [DATASET_IMPORT_DIALOG_BUTTON_NAME.CREATE]: {
            id: DATASET_IMPORT_DIALOG_BUTTON_NAME.CREATE,
            name: capitalize(DATASET_IMPORT_DIALOG_BUTTON_NAME.CREATE),
            hidden:
                !uploadItem ||
                (!isReady(uploadItem.fileId) && uploadItem.activeStep !== DATASET_IMPORT_UPLOAD_STEPS.LABELS),
            disabled: !uploadItem || !isReady(uploadItem.fileId),
            variant: 'cta',
            action: () => {
                if (!uploadItem) return;

                createProject(uploadItem);
                onDialogDismiss();
            },
        },
    };

    const [state, setState] =
        useState<Record<DATASET_IMPORT_DIALOG_BUTTON_NAME, DatasetImportDialogButton>>(defaultState);

    useEffect(() => {
        if (!uploadItem) return;
        switch (uploadItem.activeStep) {
            case DATASET_IMPORT_UPLOAD_STEPS.DATASET:
                setState({
                    ...defaultState,
                    hide: { ...defaultState.hide, disabled: false },
                    next: { ...defaultState.next, disabled: !uploadItem.uploadId },
                });
                break;
            case DATASET_IMPORT_UPLOAD_STEPS.DOMAIN:
                setState({
                    ...defaultState,
                    hide: { ...defaultState.hide, disabled: false },
                    back: { ...defaultState.back, hidden: false, disabled: false },
                    next: {
                        ...defaultState.next,
                        disabled: !uploadItem.projectName?.trim().length || !uploadItem.taskType?.trim().length,
                    },
                });
                break;
            case DATASET_IMPORT_UPLOAD_STEPS.LABELS:
                setState({
                    ...defaultState,
                    hide: { ...defaultState.hide, disabled: false },
                    back: { ...defaultState.back, hidden: false, disabled: false },
                    next: { ...defaultState.next, hidden: true, disabled: true },
                });
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadItem]);

    return (
        <ButtonGroup>
            {Object.keys(state).map((key: string) => (
                <Button
                    key={state[key as DATASET_IMPORT_DIALOG_BUTTON_NAME].id}
                    variant={state[key as DATASET_IMPORT_DIALOG_BUTTON_NAME].variant}
                    isHidden={state[key as DATASET_IMPORT_DIALOG_BUTTON_NAME].hidden}
                    isDisabled={state[key as DATASET_IMPORT_DIALOG_BUTTON_NAME].disabled}
                    onPress={state[key as DATASET_IMPORT_DIALOG_BUTTON_NAME].action}
                >
                    {state[key as DATASET_IMPORT_DIALOG_BUTTON_NAME].name}
                </Button>
            ))}
        </ButtonGroup>
    );
};
