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

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import prettyBytes from 'pretty-bytes';
import { PreviousUpload, Upload } from 'tus-js-client';

import { API_URLS } from '../../../../../../core/services';
import { NOTIFICATION_TYPE, useNotification } from '../../../../../../notification';
import { useApplicationContext } from '../../../../../../providers';
import { LOCAL_STORAGE_KEYS } from '../../../../../../shared/local-storage-keys';
import { MissingProviderError } from '../../../../../../shared/missing-provider-error';
import { useProjectsList } from '../projects-list';
import {
    DatasetImportUploadItem,
    DatasetImportWarning,
    DatasetImportWarningDTO,
    DATASET_IMPORT_STATUS_STEP_MAPPING,
    DATASET_IMPORT_UPLOAD_STATUSES,
    DATASET_IMPORT_UPLOAD_STEPS,
} from './dataset-import.interface';
import { useDatasetImportQueries } from './use-dataset-import-queries';

export interface DatasetImportContextProps {
    uploads: Record<string, DatasetImportUploadItem>;
    isModalOpened: boolean;
    prepareDataset: (fileId: string, uploadId: string | null) => void;
    patchUpload: (uploadId: string, data: Partial<DatasetImportUploadItem>) => void;
    removeUpload: (uploadId: string) => void;
    addUpload: (file: File) => string;
    createProject: (uploadItem: DatasetImportUploadItem) => void;
    isReadyForProjectCreation: (uploadId: string) => boolean;
    getActiveUpload: () => DatasetImportUploadItem | undefined;
    deletingUpload: DatasetImportUploadItem | undefined;
    setModalOpened: Dispatch<SetStateAction<boolean>>;
    setActiveUploadId: Dispatch<SetStateAction<string | undefined>>;
    setDeletingUpload: Dispatch<SetStateAction<DatasetImportUploadItem | undefined>>;
}

interface DatasetImportProviderProps {
    children: ReactNode;
}

export const DatasetImportContext = createContext<DatasetImportContextProps | undefined>(undefined);

//It needs DndProvider and HTML5Backend to work
export const DatasetImportProvider = ({ children }: DatasetImportProviderProps): JSX.Element => {
    const { workspaceId } = useApplicationContext();
    const { addNotification } = useNotification();
    const { reloadProjects } = useProjectsList();
    const { create, prepare } = useDatasetImportQueries();

    const [isModalOpened, setModalOpened] = useState<boolean>(false);
    const [uploads, setUploads] = useState<Record<string, DatasetImportUploadItem>>({});
    const [activeUploadId, setActiveUploadId] = useState<string | undefined>(undefined);
    const [deletingUpload, setDeletingUpload] = useState<DatasetImportUploadItem | undefined>(undefined);

    dayjs.extend(duration);
    dayjs.extend(relativeTime);

    useEffect(() => {
        setUploads(getUploads());

        for (const [key, value] of Object.entries(getUploads())) {
            switch (value.status) {
                case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING:
                    patchUpload(key, { status: DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_INTERRUPTED });
                    break;
                case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING:
                    prepareDataset(key, value.uploadId);
                    break;
                case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION:
                    createProject(value);
                    break;
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isModalOpened) {
            setUploadsStatus();
            setTimeout(() => setActiveUploadId(undefined), 100);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpened]);

    const addUpload = (file: File): string => {
        const { name, type, size, lastModified } = file;
        const fileId = `${name}-${type}-${size}-${lastModified}`;

        putUpload({
            fileId,
            name,
            uploadId: null,
            startAt: Date.now(),
            fileSize: prettyBytes(file.size),
            progress: 0,
            startFromBytes: 0,
            timeRemaining: null,
            bytesRemaining: null,
            invertLabels: false,
            labelToTasks: {},
            labelsToSelect: [],
            warnings: [],
            status: DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING,
            activeStep: DATASET_IMPORT_UPLOAD_STEPS.DATASET,
            openedSteps: [DATASET_IMPORT_UPLOAD_STEPS.DATASET],
            completedSteps: [],
            projectName: '',
            taskType: '',
            labels: [],
        });

        const upload = new Upload(file, {
            endpoint: API_URLS.DATASET_IMPORT_TUS(workspaceId),
            chunkSize: 1024 * 1024 * 100,
            retryDelays: [0, 1000, 3000, 5000],
            removeFingerprintOnSuccess: true,
            onError: () => {
                patchUpload(fileId, { status: DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_ERROR });

                // Custom error message here because the error message for this exception provides no help for the user
                // e.g "tus: failed to resume upload, caused by [object ProgressEvent], originated from request
                // (method: HEAD, url:
                // api/v1.0/workspaces/625542d40726ce23a87d15cb/datasets/uploads/resumable/625fa79b8199535c171914cd
                // response code: n/a, response text: n/a, request id: n/a)"
                addNotification(
                    'Failed to resume upload. Please make sure the file you are trying to upload is valid',
                    NOTIFICATION_TYPE.ERROR
                );
            },
            onProgress: (bytesUploaded: number, bytesTotal: number) => {
                onUploadProgress(fileId, bytesUploaded, bytesTotal);
            },
            onSuccess: () => {
                const uploadUrlParts = upload.url?.split('/');
                const uploadId = uploadUrlParts ? uploadUrlParts[uploadUrlParts.length - 1] : null;

                prepareDataset(fileId, uploadId);
            },
        });

        upload.findPreviousUploads().then((previousUploads: PreviousUpload[]) => {
            if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);

            upload.start();
        });

        return fileId;
    };

    const createProject = (uploadItem: DatasetImportUploadItem): void => {
        const { projectName, taskType, invertLabels, labels, labelsToSelect, uploadId, fileId } = uploadItem;

        if (!fileId || !uploadId || !projectName || !taskType) return;

        patchUpload(fileId, { status: DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION });

        let projectLabels = labels;

        if (invertLabels) {
            projectLabels = labelsToSelect.filter((label: string) => !labels.includes(label));
        }

        create.mutate(
            { workspaceId, projectData: { uploadId, projectName, taskType, labels: projectLabels } },
            {
                onSuccess: () => {
                    removeUpload(fileId);
                    reloadProjects();
                },
                onError: (error: Error) => {
                    patchUpload(fileId, { status: DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION_ERROR });
                    addNotification(error.message, NOTIFICATION_TYPE.ERROR);
                },
            }
        );
    };

    const prepareDataset = (fileId: string, uploadId: string | null): void => {
        if (!uploadId) {
            addNotification(`Upload ${uploadId} not found`, NOTIFICATION_TYPE.ERROR);

            return;
        }

        patchUpload(fileId, { timeRemaining: null, status: DATASET_IMPORT_UPLOAD_STATUSES.PREPARING });

        prepare.mutate(
            { workspaceId, uploadId },
            {
                onSuccess: (response) => {
                    const { warnings, labelToTasks } = response;
                    const warningsList: DatasetImportWarning[] = warnings.map((warning: DatasetImportWarningDTO) => {
                        const { type, name, description, affected_images, resolve_strategy } = warning;

                        return {
                            type,
                            name,
                            description,
                            affectedImages: affected_images,
                            resolveStrategy: resolve_strategy,
                        };
                    });

                    patchUpload(fileId, {
                        uploadId,
                        labelToTasks,
                        warnings: warningsList,
                        status: !warningsList.length
                            ? DATASET_IMPORT_UPLOAD_STATUSES.TASK_TYPE_SELECTION
                            : DATASET_IMPORT_UPLOAD_STATUSES.WARNINGS,
                        activeStep: !warningsList.length
                            ? DATASET_IMPORT_UPLOAD_STEPS.DOMAIN
                            : DATASET_IMPORT_UPLOAD_STEPS.DATASET,
                        completedSteps: !warningsList.length ? [DATASET_IMPORT_UPLOAD_STEPS.DATASET] : [],
                        openedSteps: !warningsList.length
                            ? [DATASET_IMPORT_UPLOAD_STEPS.DATASET, DATASET_IMPORT_UPLOAD_STEPS.DOMAIN]
                            : [DATASET_IMPORT_UPLOAD_STEPS.DATASET],
                    });
                },
                onError: (error: Error) => {
                    patchUpload(fileId, { status: DATASET_IMPORT_UPLOAD_STATUSES.PREPARING_ERROR });
                    addNotification(error.message, NOTIFICATION_TYPE.ERROR);
                },
            }
        );
    };

    const onUploadProgress = (fileId: string, bytesUploaded: number, bytesTotal: number): void => {
        const { startFromBytes, startAt } = getUpload(fileId);

        patchUpload(fileId, {
            progress: Math.floor((bytesUploaded / bytesTotal) * 100),
            startFromBytes: startFromBytes > 0 ? startFromBytes : bytesUploaded,
            bytesRemaining: getBytesRemaining(bytesTotal - bytesUploaded),
            timeRemaining: getTimeRemaining(startAt, bytesUploaded - startFromBytes, bytesTotal - bytesUploaded),
        });
    };

    const getBytesRemaining = (bytesRemaining: number): string =>
        bytesRemaining ? `${prettyBytes(bytesRemaining)} left` : '';

    const getTimeRemaining = (timeStarted: number, bytesUploaded: number, bytesRemaining: number): string => {
        const timeElapsed = Date.now() - timeStarted;
        const uploadSpeed = bytesUploaded / timeElapsed;
        const timeRemaining = Math.floor(bytesRemaining / uploadSpeed);

        if (timeRemaining === undefined) return 'Calculating...';

        return !!timeRemaining && timeRemaining !== Infinity
            ? `${dayjs.duration(timeRemaining, 'milliseconds').humanize()} left`
            : '';
    };

    const getUploads = (): Record<string, DatasetImportUploadItem> => {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.UPLOADS) ?? '{}');
    };

    const getUpload = (uploadId: string): DatasetImportUploadItem => {
        const uploadItems = getUploads();

        return uploadItems[uploadId];
    };

    const putUpload = (uploadItem: DatasetImportUploadItem) => {
        localStorage.setItem(
            LOCAL_STORAGE_KEYS.UPLOADS,
            JSON.stringify({ ...getUploads(), [uploadItem.fileId]: uploadItem })
        );

        setUploads(getUploads());
    };

    const patchUpload = (uploadId: string, data: Partial<DatasetImportUploadItem>): void => {
        const uploadItem = getUpload(uploadId);
        const patchedItem = { ...uploadItem, ...data, fileId: uploadItem.fileId };

        putUpload(patchedItem);
    };

    const removeUpload = (uploadId: string) => {
        const uploadItems = getUploads();

        delete uploadItems[uploadId];

        localStorage.setItem(LOCAL_STORAGE_KEYS.UPLOADS, JSON.stringify(uploadItems));

        setUploads(uploadItems);
        setModalOpened(false);
    };

    const getActiveUpload = (): DatasetImportUploadItem | undefined =>
        activeUploadId ? getUpload(activeUploadId) : undefined;

    const isReadyForProjectCreation = (uploadId: string): boolean => {
        const { projectName, taskType, invertLabels, labels, labelsToSelect } = getUpload(uploadId);
        let projectLabels = labels;

        if (invertLabels) {
            projectLabels = labelsToSelect.filter((label: string) => !projectLabels.includes(label));
        }

        return !!projectName && !!taskType && !!projectLabels.length;
    };

    const setUploadsStatus = useCallback((): void => {
        for (const [uploadId, upload] of Object.entries(uploads)) {
            const { projectName, taskType, status, openedSteps, activeStep } = upload;

            switch (status) {
                case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING:
                case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING:
                case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION:
                case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_INTERRUPTED:
                case DATASET_IMPORT_UPLOAD_STATUSES.IMPORTING_ERROR:
                case DATASET_IMPORT_UPLOAD_STATUSES.PREPARING_ERROR:
                case DATASET_IMPORT_UPLOAD_STATUSES.PROJECT_CREATION_ERROR:
                    return;
                default:
                    if (
                        status === DATASET_IMPORT_UPLOAD_STATUSES.WARNINGS &&
                        activeStep === DATASET_IMPORT_UPLOAD_STEPS.DATASET
                    ) {
                        return;
                    }

                    if (isReadyForProjectCreation(uploadId)) {
                        patchUpload(uploadId, { status: DATASET_IMPORT_UPLOAD_STATUSES.READY });
                    } else {
                        let statusCandidate = DATASET_IMPORT_UPLOAD_STATUSES.LABELS_SELECTION;

                        if (!projectName || !taskType) {
                            statusCandidate = DATASET_IMPORT_UPLOAD_STATUSES.TASK_TYPE_SELECTION;
                        }

                        const uploadStatuses = Object.values(DATASET_IMPORT_UPLOAD_STATUSES);
                        const statusCandidateIdx = uploadStatuses.findIndex(
                            (uploadStatus: string) => statusCandidate === uploadStatus
                        );

                        const actualStatus = openedSteps.includes(DATASET_IMPORT_STATUS_STEP_MAPPING[statusCandidate])
                            ? statusCandidate
                            : uploadStatuses[statusCandidateIdx - 1];

                        patchUpload(uploadId, { status: actualStatus });
                    }
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploads]);

    return (
        <DatasetImportContext.Provider
            value={{
                uploads,
                isModalOpened,
                prepareDataset,
                patchUpload,
                removeUpload,
                addUpload,
                createProject,
                setModalOpened,
                getActiveUpload,
                deletingUpload,
                setActiveUploadId,
                setDeletingUpload,
                isReadyForProjectCreation,
            }}
        >
            {children}
        </DatasetImportContext.Provider>
    );
};

export const useDatasetImport = (): DatasetImportContextProps => {
    const context = useContext(DatasetImportContext);

    if (context === undefined) {
        throw new MissingProviderError('useDatasetImport', 'DatasetImportProvider');
    }

    return context;
};
