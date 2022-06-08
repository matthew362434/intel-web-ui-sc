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

import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { v4 as uuidv4 } from 'uuid';

import { ANOMALY_LABEL } from '../../core/labels';
import { MediaService } from '../../core/media/services/media-service.interface';
import { DatasetIdentifier } from '../../core/projects';
import { MissingProviderError } from '../../shared/missing-provider-error';
import {
    ErrorListItem,
    ListItem,
    MediaUploadItemDTO,
    ProgressListItem,
    SuccessListItem,
    UploadMedia,
    ValidationFailReason,
} from './media-upload.interface';
import { validateMedia } from './media-upload.validator';

interface MediaUploadProviderProps {
    mediaService: MediaService;
    concurrency?: number;
    children: ReactNode;
}

export interface MediaUploadContextProps {
    readonly totalWaiting: number;
    readonly totalHandled: number;
    readonly totalProgress: number;
    readonly timeRemainingStr: string;
    readonly isUploadInProgress: boolean;
    readonly labelSelectorDialogActivated: boolean;
    readonly filesForLabelAssignment: File[];
    readonly progressList: ProgressListItem[];
    readonly successList: SuccessListItem[];
    readonly errorList: ErrorListItem[];
    readonly reloadGeneric: boolean;
    readonly reloadNormal: boolean;
    readonly reloadAnomalous: boolean;
    readonly isNormalTriggered: boolean;
    readonly isAnomalousTriggered: boolean;
    readonly isUploadStatusBarVisible: boolean;
    readonly insufficientStorage: boolean;
    setInsufficientStorage: Dispatch<SetStateAction<boolean>>;
    setReloadGeneric: Dispatch<SetStateAction<boolean>>;
    setReloadNormal: Dispatch<SetStateAction<boolean>>;
    setReloadAnomalous: Dispatch<SetStateAction<boolean>>;
    setUploadMedia: (uploadMedia: UploadMedia) => void;
    setCurrentDatasetIdentifier: (datasetIdentifier: DatasetIdentifier) => void;
    setFilesForLabelAssignment: (files: File[]) => void;
    setLabelSelectorDialogActivated: (isActivated: boolean) => void;
    retryUpload: (errorItem: ErrorListItem) => void;
    cancelPendingMediaUpload: () => void;
    reset: () => void;
}

const MediaUploadContext = createContext<MediaUploadContextProps | undefined>(undefined);

export const MediaUploadProvider = ({
    mediaService,
    concurrency = 5,
    children,
}: MediaUploadProviderProps): JSX.Element => {
    // TODO: Maybe we could leverage useReducer here
    const [uploadMedia, setUploadMedia] = useState<UploadMedia | null>(null);
    const [commonQueue, setCommonQueue] = useState<MediaUploadItemDTO[]>([]);
    const [errorList, setErrorList] = useState<ErrorListItem[]>([]);
    const [successList, setSuccessList] = useState<SuccessListItem[]>([]);
    const [processingQueue, setProcessingQueue] = useState<SuccessListItem[]>([]);

    const [networkSpeed, setNetworkSpeed] = useState<number[]>([]);

    const [progressMap, setProgressMap] = useState<Record<string, ProgressListItem>>({});
    const [operatingProcessingLength, setOperatingProcessingLength] = useState<number>(0);

    const [filesForLabelAssignment, setFilesForLabelAssignment] = useState<File[]>([]);
    const [labelSelectorDialogActivated, setLabelSelectorDialogActivated] = useState<boolean>(false);

    const [reloadGeneric, setReloadGeneric] = useState<boolean>(false);
    const [reloadNormal, setReloadNormal] = useState<boolean>(false);
    const [reloadAnomalous, setReloadAnomalous] = useState<boolean>(false);
    const [isNormalTriggered, setNormalTriggered] = useState<boolean>(false);
    const [isAnomalousTriggered, setAnomalousTriggered] = useState<boolean>(false);

    const [currentDatasetIdentifier, setCurrentDatasetIdentifier] = useState<DatasetIdentifier | null>(null);

    const [insufficientStorage, setInsufficientStorage] = useState<boolean>(false);

    dayjs.extend(duration);
    dayjs.extend(relativeTime);

    useEffect(() => {
        if (!uploadMedia) return;

        const { datasetIdentifier, files, labelIds, meta } = uploadMedia;
        const emptyProcessingSlots = concurrency - processingQueue.length;

        for (let i = 0; i < Math.min(emptyProcessingSlots, files.length); i++) {
            const file = files[i];
            pushMedia(getUploadMediaItem(datasetIdentifier, file, labelIds, meta));
        }

        const newMediaUploadItems: MediaUploadItemDTO[] = files
            .slice(emptyProcessingSlots)
            .map((file: File) => getUploadMediaItem(datasetIdentifier, file, labelIds, meta));

        setCommonQueue((queue: MediaUploadItemDTO[]) => [...queue, ...newMediaUploadItems]);
        setUploadMedia(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadMedia]);

    useEffect(() => {
        if (processingQueue.length < operatingProcessingLength) {
            if (commonQueue.length === 0) return;

            const diff = operatingProcessingLength - processingQueue.length;
            const iterations = Math.min(diff, commonQueue.length);

            for (let i = 0; i < iterations; i++) {
                const { datasetIdentifier, file, meta, uploadInfo } = commonQueue[i];
                const newMedia: MediaUploadItemDTO = { datasetIdentifier, file };

                if (meta) newMedia.meta = meta;
                if (uploadInfo) newMedia.uploadInfo = uploadInfo;

                pushMedia(newMedia);
            }

            setCommonQueue((queue: MediaUploadItemDTO[]) => queue.slice(iterations));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [operatingProcessingLength, processingQueue, commonQueue]);

    useEffect(() => {
        setOperatingProcessingLength(processingQueue.length);

        if (processingQueue.length > 0) return;

        setNetworkSpeed([]);
    }, [processingQueue]);

    const isItemOfCurrentDataset = useCallback(
        (item: ListItem): boolean => {
            return item.datasetIdentifier.projectId === currentDatasetIdentifier?.projectId;
        },
        [currentDatasetIdentifier]
    );

    const isMetaQueue = useCallback(
        (meta: string): boolean => {
            const processingMetaQueue = processingQueue.filter(
                (pqItem: SuccessListItem) => isItemOfCurrentDataset(pqItem) && pqItem.meta === meta
            );
            const commonMetaQueue = commonQueue.filter(
                (cqItem: MediaUploadItemDTO) => isItemOfCurrentDataset(cqItem) && cqItem.meta === meta
            );
            const metaQueue = [...processingMetaQueue, ...commonMetaQueue];

            return metaQueue.length > 0;
        },
        [commonQueue, isItemOfCurrentDataset, processingQueue]
    );

    useEffect(() => {
        if (isNormalTriggered && !isMetaQueue(ANOMALY_LABEL.NORMAL)) {
            setReloadNormal(true);
            setNormalTriggered(false);
        }

        if (isAnomalousTriggered && !isMetaQueue(ANOMALY_LABEL.ANOMALOUS)) {
            setReloadAnomalous(true);
            setAnomalousTriggered(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMetaQueue]);

    const queueSize = useMemo<number>((): number => {
        const processingQueueSize = processingQueue
            .map((item: SuccessListItem) => item.file.size)
            .reduce((size1: number, size2: number) => size1 + size2, 0);
        const commonQueueSize = commonQueue
            .map((item: MediaUploadItemDTO) => item.file.size)
            .reduce((size1: number, size2: number) => size1 + size2, 0);

        return processingQueueSize + commonQueueSize;
    }, [processingQueue, commonQueue]);

    const networkSpeedMedian = useMemo<number | null>((): number | null => {
        if (!networkSpeed.length) return null;

        const speedSorted = networkSpeed.sort((a: number, b: number) => {
            if (a > b) return 1;
            if (a < b) return -1;

            return 0;
        });

        if (speedSorted.length % 2 === 0) return speedSorted[speedSorted.length / 2];

        return (speedSorted[(speedSorted.length - 1) / 2] + speedSorted[(speedSorted.length + 1) / 2]) / 2;
    }, [networkSpeed]);

    const timeRemaining = useMemo<number | null>((): number | null => {
        if (!processingQueue.length || !networkSpeedMedian) return null;

        return Math.round(queueSize / networkSpeedMedian);
    }, [networkSpeedMedian, processingQueue, queueSize]);

    const getUploadMediaItem = (
        datasetIdentifier: DatasetIdentifier,
        file: File,
        labelIds?: string[],
        meta?: string
    ): MediaUploadItemDTO => {
        const uploadMediaItem: MediaUploadItemDTO = { datasetIdentifier, file };

        if (labelIds) uploadMediaItem.uploadInfo = { filename: file.name, label_ids: labelIds };

        if (meta) {
            uploadMediaItem.meta = meta;

            if (!isNormalTriggered || !isAnomalousTriggered) {
                switch (uploadMediaItem.meta) {
                    case ANOMALY_LABEL.NORMAL:
                        if (!isNormalTriggered) setNormalTriggered(true);

                        break;
                    case ANOMALY_LABEL.ANOMALOUS:
                        if (!isAnomalousTriggered) setAnomalousTriggered(true);

                        break;
                }
            }
        }

        return uploadMediaItem;
    };

    const onProgress = (uploadId: string, datasetIdentifier: DatasetIdentifier, file: File, progress: number): void => {
        setProgressMap((currentMap: Record<string, ProgressListItem>) => {
            currentMap[uploadId] = { uploadId, datasetIdentifier, file, progress };

            return { ...currentMap };
        });
    };

    const retryUpload = (errorItem: ErrorListItem): void => {
        const { file, datasetIdentifier, uploadId, uploadInfo, meta } = errorItem;

        setErrorList((list: ErrorListItem[]) => list.filter((item: ErrorListItem) => item.uploadId !== uploadId));
        pushMedia({ file, datasetIdentifier, uploadInfo, meta });
    };

    const processMedia = (uploadId: string, datasetIdentifier: DatasetIdentifier, media: MediaUploadItemDTO): void => {
        mediaService
            .uploadMedia(datasetIdentifier, uploadId, media, onProgress, setNetworkSpeed)
            .then(() => {
                setSuccessList((list: SuccessListItem[]) => [
                    ...list,
                    {
                        uploadId,
                        datasetIdentifier,
                        file: media.file,
                    },
                ]);
            })
            .catch((event) => {
                const { response } = event;

                if (response.status === 507) {
                    setInsufficientStorage(true);
                } else {
                    setErrorList((list: ErrorListItem[]) => [
                        ...list,
                        {
                            uploadId,
                            datasetIdentifier,
                            meta: media.meta,
                            uploadInfo: media.uploadInfo,
                            file: media.file,
                            errors: response?.data?.message ? [response?.data?.message] : [],
                            status: response?.status,
                            statusText: response?.statusText || null,
                        },
                    ]);
                }
            })
            .finally(() => clearProcessing(uploadId));
    };

    const pushMedia = (media: MediaUploadItemDTO): void => {
        const { datasetIdentifier, file, meta } = media;
        const uploadId = `${uuidv4()}-${Date.now()}`;

        setProcessingQueue((list: SuccessListItem[]) => [...list, { uploadId, datasetIdentifier, file, meta }]);

        setProgressMap(() => {
            const newEntry: Record<string, ProgressListItem> = {};

            newEntry[uploadId] = { uploadId, datasetIdentifier, file, progress: 0 };

            return { ...newEntry };
        });

        validateMedia(file)
            .then(() => processMedia(uploadId, datasetIdentifier, media))
            .catch((reason: ValidationFailReason) => {
                setErrorList((list: ErrorListItem[]) => [
                    ...list,
                    {
                        uploadId,
                        datasetIdentifier,
                        meta: media.meta,
                        uploadInfo: media.uploadInfo,
                        statusText: null,
                        file: reason.file,
                        status: reason.status,
                        errors: reason.errors,
                    },
                ]);

                clearProcessing(uploadId);
            });
    };

    const cancelPendingMediaUpload = (): void => setCommonQueue([]);

    const reset = (): void => {
        setSuccessList((list: SuccessListItem[]) =>
            list.filter((successListItem: SuccessListItem) => !isItemOfCurrentDataset(successListItem))
        );
        setErrorList((list: ErrorListItem[]) =>
            list.filter((errorListItem: ErrorListItem) => !isItemOfCurrentDataset(errorListItem))
        );
    };

    const clearProcessing = (uploadId: string): void => {
        setProcessingQueue((list: SuccessListItem[]) =>
            list.filter((processingQueueItem: SuccessListItem) => processingQueueItem.uploadId !== uploadId)
        );

        setProgressMap((currentMap: Record<string, ProgressListItem>) => {
            delete currentMap[uploadId];
            return { ...currentMap };
        });
    };

    const filteredSuccessList = useMemo(
        () => successList.filter((successListItem: SuccessListItem) => isItemOfCurrentDataset(successListItem)),
        [isItemOfCurrentDataset, successList]
    );

    const filteredErrorList = useMemo(
        () => errorList.filter((errorListItem: ErrorListItem) => isItemOfCurrentDataset(errorListItem)),
        [errorList, isItemOfCurrentDataset]
    );

    const totalWaiting = useMemo<number>(() => {
        const filteredProcessingQueue = processingQueue.filter((processingQueueItem: SuccessListItem) =>
            isItemOfCurrentDataset(processingQueueItem)
        );
        const filteredCommonQueue = commonQueue.filter((commonQueueItem: MediaUploadItemDTO) =>
            isItemOfCurrentDataset(commonQueueItem)
        );

        return filteredProcessingQueue.length + filteredCommonQueue.length;
    }, [processingQueue, commonQueue, isItemOfCurrentDataset]);

    const totalHandled = useMemo<number>(() => {
        return filteredSuccessList.length + filteredErrorList.length;
    }, [filteredSuccessList, filteredErrorList]);

    const totalProgress = useMemo<number>(() => {
        return Math.round((totalHandled / (totalHandled + totalWaiting)) * 100);
    }, [totalHandled, totalWaiting]);

    const progressList = useMemo<ProgressListItem[]>(() => {
        return Object.values(progressMap).filter((progressListItem: ProgressListItem) =>
            isItemOfCurrentDataset(progressListItem)
        );
    }, [isItemOfCurrentDataset, progressMap]);

    const timeRemainingStr = useMemo<string>(() => {
        if (!timeRemaining) return 'calculating...';

        return `${dayjs.duration(timeRemaining, 'milliseconds').humanize()} left`;
    }, [timeRemaining]);

    const isUploadInProgress = useMemo<boolean>((): boolean => {
        const inProcessingQueue = processingQueue.some((pqItem: SuccessListItem) => isItemOfCurrentDataset(pqItem));
        const inCommonQueue = commonQueue.some((cqItem: MediaUploadItemDTO) => isItemOfCurrentDataset(cqItem));

        return inProcessingQueue || inCommonQueue;
    }, [processingQueue, commonQueue, isItemOfCurrentDataset]);

    const isUploadStatusBarVisible = useMemo<boolean>((): boolean => {
        return isUploadInProgress || filteredSuccessList.length > 0 || filteredErrorList.length > 0;
    }, [isUploadInProgress, filteredSuccessList, filteredErrorList]);

    useEffect(() => {
        setReloadGeneric(!isUploadInProgress && filteredSuccessList.length > 0);
    }, [filteredSuccessList, isUploadInProgress]);

    useEffect(() => {
        if (insufficientStorage) cancelPendingMediaUpload();
    }, [insufficientStorage]);

    const value: MediaUploadContextProps = {
        totalWaiting,
        totalHandled,
        totalProgress,
        timeRemainingStr,
        isUploadInProgress,
        insufficientStorage,
        isUploadStatusBarVisible,
        filesForLabelAssignment,
        labelSelectorDialogActivated,
        progressList,
        successList: filteredSuccessList,
        errorList: filteredErrorList,
        reloadGeneric,
        reloadNormal,
        reloadAnomalous,
        isNormalTriggered,
        isAnomalousTriggered,
        setReloadGeneric,
        setReloadNormal,
        setReloadAnomalous,
        setUploadMedia,
        setInsufficientStorage,
        setCurrentDatasetIdentifier,
        setFilesForLabelAssignment,
        setLabelSelectorDialogActivated,
        cancelPendingMediaUpload,
        retryUpload,
        reset,
    };

    return <MediaUploadContext.Provider value={value}>{children}</MediaUploadContext.Provider>;
};

export const useMediaUpload = (datasetIdentifier?: DatasetIdentifier): MediaUploadContextProps => {
    const context = useContext(MediaUploadContext);

    useEffect(() => {
        if (datasetIdentifier) {
            context?.setCurrentDatasetIdentifier(datasetIdentifier);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datasetIdentifier]);

    if (context === undefined) {
        throw new MissingProviderError('useMediaUpload', 'MediaUploadProvider');
    }

    return context;
};
