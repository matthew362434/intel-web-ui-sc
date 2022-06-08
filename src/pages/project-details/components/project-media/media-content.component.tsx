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

import { useEffect, useMemo } from 'react';

import { Divider, Flex, Grid, IllustratedMessage, Link, Text, View } from '@adobe/react-spectrum';
import { DimensionValue } from '@react-types/shared/src/dna';
import { Responsive } from '@react-types/shared/src/style';
import NotFound from '@spectrum-icons/illustrations/NotFound';
import sum from 'lodash/sum';
import { VirtuosoGrid } from 'react-virtuoso';

import { SortDown, SortUp } from '../../../../assets/icons';
import { ANOMALY_LABEL, Label } from '../../../../core/labels';
import { isVideo, MediaItem } from '../../../../core/media';
import { DOMAIN } from '../../../../core/projects';
import { isAnomalyDomain } from '../../../../core/projects/domains';
import { MediaUploadContextProps } from '../../../../providers/media-upload-provider/media-upload-provider.component';
import { UploadMedia } from '../../../../providers/media-upload-provider/media-upload.interface';
import { defineMediaType, MEDIA_TYPE } from '../../../../providers/media-upload-provider/media-upload.validator';
import { MediaDrop } from '../../../../shared/components';
import { ImagePlaceholder } from '../../../../shared/components/image-placeholder';
import { useDatasetIdentifier } from '../../../annotator/hooks/use-dataset-identifier.hook';
import { useMedia } from '../../../media/providers/media-provider.component';
import { useProject } from '../../providers';
import { DeletionStatusBar } from './deletion-status-bar.component';
import { GridMediaItem } from './grid-media-item.component';
import { LoadingOverlay } from './loading-overlay.component';
import { ProjectMediaControlPanel } from './project-media-control-panel.component';
import classes from './project-media-control-panel.module.scss';
import { UploadLabelSelectorDialog } from './upload-label-selector-dialog';
import {
    MIN_NUMBER_OF_NORMAL_REQUIRED_MEDIA_ITEMS,
    MIN_NUMBER_OF_ANOMALOUS_REQUIRED_MEDIA_ITEMS,
    ITEMS_TO_PREFETCH,
} from './utils';

const countUploadedImages = async (media: MediaItem[], files: File[] = []) => {
    const totalMediaImages = sum(
        media.map((item) => {
            return isVideo(item) ? Math.ceil(item.metadata.frames / item.metadata.frameStride) : 1;
        })
    );

    const imagesPerFile = files.map<Promise<number>>((file) => {
        switch (defineMediaType(file)) {
            case MEDIA_TYPE.VIDEO:
                return new Promise((resolve) => {
                    const video = document.createElement('video');
                    video.preload = 'metadata';
                    video.onloadeddata = () => {
                        // We aren't able to accurately determine the video's frames and fps,
                        // so instead we assume we will be able to train on one frame per second
                        resolve(Math.ceil(video.duration));
                    };
                    video.src = URL.createObjectURL(file);
                });
            default:
                return Promise.resolve(1);
        }
    });

    const totalImagesUploaded = sum(await Promise.all(imagesPerFile));

    return totalImagesUploaded + totalMediaImages;
};
export interface UploadMediaMetaData
    extends Pick<
        MediaUploadContextProps,
        | 'isUploadInProgress'
        | 'isUploadStatusBarVisible'
        | 'labelSelectorDialogActivated'
        | 'filesForLabelAssignment'
        | 'isNormalTriggered'
        | 'isAnomalousTriggered'
        | 'setLabelSelectorDialogActivated'
        | 'setFilesForLabelAssignment'
        | 'setUploadMedia'
    > {
    reloadTrigger: boolean;
    setReloadTrigger: (flag: boolean) => void;
}

interface MediaContentProps {
    header?: string;
    dropBoxIcon?: string;
    dropBoxIconSize?: Responsive<DimensionValue>;
    dropBoxPendingText?: string;
    dropBoxInProgressText?: string;
    dropBoxHoverText?: string;
    showDropOverlayPanel?: boolean;
    uploadMediaMetaData: UploadMediaMetaData;
    margin?: Responsive<DimensionValue>;
    enoughMediaCallback?: () => void;
    uploadedMediaCallback?: () => void;
}

export const MediaContent = ({
    header,
    uploadMediaMetaData,
    dropBoxIcon,
    dropBoxIconSize,
    dropBoxPendingText,
    dropBoxInProgressText,
    dropBoxHoverText,
    showDropOverlayPanel = false,
    margin,
    enoughMediaCallback,
    uploadedMediaCallback,
}: MediaContentProps): JSX.Element => {
    const { isSingleDomainProject, project } = useProject();
    const datasetIdentifier = useDatasetIdentifier();

    const isAnomalyProject = isSingleDomainProject(isAnomalyDomain);
    const minNumberOfRequiredMediaItems =
        header === ANOMALY_LABEL.NORMAL
            ? MIN_NUMBER_OF_NORMAL_REQUIRED_MEDIA_ITEMS
            : MIN_NUMBER_OF_ANOMALOUS_REQUIRED_MEDIA_ITEMS;

    const {
        media,
        loadNextMedia,
        anomalyLabel,
        isMediaFetching,
        isDeletionInProgress,
        sortingOptions,
        setSortingOptions,
        isMediaFilterEmpty,
    } = useMedia();

    const hasMediaItems = media.length > 0;

    const {
        isUploadInProgress,
        isUploadStatusBarVisible,
        labelSelectorDialogActivated,
        filesForLabelAssignment,
        isNormalTriggered,
        isAnomalousTriggered,
        setLabelSelectorDialogActivated,
        setFilesForLabelAssignment,
        setUploadMedia,
        reloadTrigger,
        setReloadTrigger,
    } = uploadMediaMetaData;

    useEffect(() => {
        if (!reloadTrigger) return;

        loadNextMedia(true).finally(() => {
            if (setReloadTrigger) setReloadTrigger(false);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reloadTrigger]);

    useEffect(() => {
        countUploadedImages(media).then((totalUploadedImages) => {
            if (totalUploadedImages >= minNumberOfRequiredMediaItems) {
                enoughMediaCallback && enoughMediaCallback();
            }
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media, enoughMediaCallback]);

    const uploadMediaCallback = (files: File[]): void => {
        if (isSingleDomainProject(DOMAIN.CLASSIFICATION)) {
            setFilesForLabelAssignment(files);
            setLabelSelectorDialogActivated(true);
        } else if (isAnomalyProject) {
            if (!anomalyLabel) return;

            countUploadedImages(media, files).then((totalUploadedImages) => {
                if (totalUploadedImages >= minNumberOfRequiredMediaItems) {
                    uploadedMediaCallback && uploadedMediaCallback();
                }
            });

            setUploadMedia({ datasetIdentifier, files, labelIds: [anomalyLabel.id], meta: anomalyLabel.name });
        } else {
            setUploadMedia({ datasetIdentifier, files });
        }
    };

    const toggleSortDirection = (): void => {
        setSortingOptions((prev) => ({ ...prev, sortDir: prev.sortDir === 'asc' ? 'dsc' : 'asc' }));
    };

    const isMediaDropVisible = useMemo<boolean>((): boolean => {
        const commonVisibility = !isMediaFetching && media.length === 0 && isMediaFilterEmpty;

        if (anomalyLabel) {
            switch (anomalyLabel.name) {
                case ANOMALY_LABEL.NORMAL:
                    return (
                        (commonVisibility && !isUploadInProgress) ||
                        (commonVisibility && isUploadInProgress && !isNormalTriggered)
                    );
                case ANOMALY_LABEL.ANOMALOUS:
                    return (
                        (commonVisibility && !isUploadInProgress) ||
                        (commonVisibility && isUploadInProgress && !isAnomalousTriggered)
                    );
            }
        }

        return commonVisibility && !isUploadInProgress;
    }, [
        anomalyLabel,
        isMediaFetching,
        isMediaFilterEmpty,
        isNormalTriggered,
        isAnomalousTriggered,
        isUploadInProgress,
        media.length,
    ]);

    const isLoadingOverlayVisible = useMemo<boolean>((): boolean => {
        if (anomalyLabel) {
            switch (anomalyLabel.name) {
                case ANOMALY_LABEL.NORMAL:
                    return isMediaFetching || (isUploadInProgress && isNormalTriggered);
                case ANOMALY_LABEL.ANOMALOUS:
                    return isMediaFetching || (isUploadInProgress && isAnomalousTriggered);
            }
        }

        return isMediaFetching || isUploadInProgress;
    }, [anomalyLabel, isUploadInProgress, isNormalTriggered, isAnomalousTriggered, isMediaFetching]);

    return (
        <>
            {isSingleDomainProject(DOMAIN.CLASSIFICATION) && (
                <UploadLabelSelectorDialog
                    labels={project.labels}
                    isActivated={labelSelectorDialogActivated}
                    onDismiss={() => {
                        setFilesForLabelAssignment([]);
                        setLabelSelectorDialogActivated(false);
                    }}
                    onSkipAction={() => setUploadMedia({ datasetIdentifier, files: filesForLabelAssignment })}
                    onPrimaryAction={(labels: ReadonlyArray<Label>) => {
                        const newUploadMedia: UploadMedia = { datasetIdentifier, files: filesForLabelAssignment };
                        const labelIds = labels.map((tagLabel: Label) => tagLabel.id);

                        if (labelIds.length > 0) newUploadMedia.labelIds = labelIds;

                        setUploadMedia(newUploadMedia);
                    }}
                />
            )}
            <Flex
                id='media-content-id'
                position='relative'
                direction='column'
                height='100%'
                gap='size-100'
                UNSAFE_style={{ userSelect: 'none' }}
            >
                <DeletionStatusBar
                    visible={isDeletionInProgress}
                    offset={isUploadStatusBarVisible ? 'size-800' : undefined}
                />

                {showDropOverlayPanel && isMediaDropVisible && (
                    <Grid position='absolute' columns={['1fr', '1fr']} gap='size-150' width='100%' zIndex={2}>
                        {header && (
                            <View padding='size-200' paddingTop='size-250'>
                                <Text UNSAFE_style={{ fontWeight: 'bold' }}>{header}</Text>
                            </View>
                        )}
                    </Grid>
                )}
                <MediaDrop
                    dropBoxIcon={dropBoxIcon}
                    dropBoxIconSize={dropBoxIconSize}
                    dropBoxPendingText={dropBoxPendingText}
                    dropBoxInProgressText={dropBoxInProgressText}
                    dropBoxHoverText={dropBoxHoverText}
                    anomalyLabel={anomalyLabel}
                    isVisible={isMediaDropVisible}
                    onDrop={uploadMediaCallback}
                    showUploadButton={!media.length}
                />
                <Flex
                    direction='column'
                    flex={1}
                    gap='size-100'
                    margin={margin}
                    position='relative'
                    UNSAFE_style={{ overflow: 'hidden' }}
                >
                    {(hasMediaItems || !isMediaFilterEmpty) && (
                        <ProjectMediaControlPanel header={header} uploadMediaCallback={uploadMediaCallback} />
                    )}
                    <IllustratedMessage
                        isHidden={
                            isUploadInProgress ||
                            isMediaFetching ||
                            hasMediaItems ||
                            (hasMediaItems && !isMediaFilterEmpty)
                        }
                    >
                        <NotFound />
                    </IllustratedMessage>

                    {hasMediaItems && sortingOptions.sortBy ? (
                        <>
                            <Flex alignItems='center'>
                                <Link isQuiet onPress={() => toggleSortDirection()} UNSAFE_className={classes.sortBy}>
                                    <span>
                                        <Flex alignItems='center' gap='size-100'>
                                            <span>{sortingOptions.sortBy}</span>
                                            {sortingOptions.sortDir === 'asc' ? <SortDown /> : <SortUp />}
                                        </Flex>
                                    </span>
                                </Link>
                            </Flex>
                        </>
                    ) : (
                        <></>
                    )}

                    <Divider isHidden={!hasMediaItems} size='S' />

                    <div className={classes.gridWrapper}>
                        <VirtuosoGrid
                            totalCount={media.length}
                            overscan={ITEMS_TO_PREFETCH}
                            listClassName={
                                isAnomalyProject ? 'mediaContentGridList anomalyGrid' : 'mediaContentGridList'
                            }
                            itemClassName='mediaContentGridListItem'
                            components={{
                                ScrollSeekPlaceholder: ({ height, width, index }) => (
                                    <ImagePlaceholder key={`image-loader-${index}`} width={width} height={height} />
                                ),
                            }}
                            itemContent={(index) => {
                                return (
                                    <GridMediaItem
                                        key={`media-item-${index}`}
                                        mediaItem={media[index]}
                                        anomalyLabel={anomalyLabel}
                                    />
                                );
                            }}
                            endReached={() => {
                                loadNextMedia();
                            }}
                        />
                        <LoadingOverlay visible={isLoadingOverlayVisible} />
                    </div>
                </Flex>
            </Flex>
        </>
    );
};
