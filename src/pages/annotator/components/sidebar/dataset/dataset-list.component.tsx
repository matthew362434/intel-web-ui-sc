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

import { useEffect, useMemo, useState } from 'react';

import { Flex, Grid, IllustratedMessage, repeat } from '@adobe/react-spectrum';
import chunk from 'lodash/chunk';
import groupBy from 'lodash/groupBy';
import isEqual from 'lodash/isEqual';
import values from 'lodash/values';
import useVirtual, { Item, OnScrollEvent } from 'react-cool-virtual';

import { isVideo, isVideoFrame, MediaIdentifier, MediaItem, MEDIA_TYPE } from '../../../../../core/media';
import { usePrevious } from '../../../../../hooks/use-previous/use-previous.hook';
import { Loading, NotFound } from '../../../../../shared/components';
import { useAnnotator } from '../../../providers';
import { useDataset } from '../../../providers/dataset-provider/dataset-provider.component';
import { useSelectMediaItemWithSaveConfirmation } from '../../../providers/submit-annotations-provider/use-select-media-item-with-save-confirmation.hook';
import classes from './dataset-accordion.module.scss';
import { DatasetListItem } from './dataset-list-item.component';
import { EmptyActiveSet } from './empty-activeset.component';
import { EmptyDataSet } from './empty-dataset.component';
import { isSelected } from './utils';

const getMediaItemIdentifierId = (media: MediaItem | undefined, isInActiveMode: boolean): null | MediaIdentifier => {
    if (media === undefined) {
        return null;
    }

    // In the active set we show video frames separately, so we want to scroll to them
    if (isInActiveMode) {
        return media.identifier;
    }

    // In the dataset we want video frames to scroll to the associated video in the dataset list
    if (isVideoFrame(media)) {
        return { type: MEDIA_TYPE.VIDEO, videoId: media.identifier.videoId };
    }
    return media.identifier;
};

const useSelectedMediaItemIndex = (
    mediaItems: MediaItem[],
    selectedMediaItem: MediaItem | undefined,
    isInActiveMode: boolean
): number => {
    return useMemo(() => {
        const selectedIdentifier = getMediaItemIdentifierId(selectedMediaItem, isInActiveMode);

        return mediaItems.findIndex((item) =>
            isEqual(getMediaItemIdentifierId(item, isInActiveMode), selectedIdentifier)
        );
    }, [mediaItems, selectedMediaItem, isInActiveMode]);
};

const useChunckedMediaItems = (mediaItems: MediaItem[], columnsQuantity: number) => {
    return useMemo((): MediaItem[][] => {
        const mediaItemsByGroup = groupBy(mediaItems, (mediaItem) => {
            if (isVideoFrame(mediaItem) || isVideo(mediaItem)) {
                return mediaItem.identifier.videoId;
            }

            return mediaItem.identifier.imageId;
        });

        return chunk(values(mediaItemsByGroup).flat(), columnsQuantity);
    }, [mediaItems, columnsQuantity]);
};

interface DatasetListProps {
    itemSize: number;
}

export const DatasetList = ({ itemSize }: DatasetListProps): JSX.Element => {
    const { selectedMediaItem, mode } = useAnnotator();
    const { isInActiveMode, mediaFilterQuery, mediaItemsQuery } = useDataset();
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const selectWithSavingConfirmation = useSelectMediaItemWithSaveConfirmation();

    const previouslySelectedMediaItem = usePrevious(selectedMediaItem);

    const columnsQuantity = useMemo(() => Math.floor(containerWidth / itemSize), [containerWidth, itemSize]);

    const { hasNextPage, isLoading: isMediaItemsLoading, isFetchingNextPage, fetchNextPage, data } = mediaItemsQuery;
    const hasEmptyPages = data?.pages.some((page) => page.media.length !== 0);
    const activeSetIsEmpty = isInActiveMode && !hasEmptyPages;
    const isDatasetEmpty = !isInActiveMode && !hasEmptyPages;

    const mediaItems = useMemo(() => data?.pages?.flatMap(({ media }) => media) ?? [], [data?.pages]);
    const loadNextMedia = () => {
        if (isInActiveMode) {
            return;
        }

        if (!isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const chunkedMediaItems = useChunckedMediaItems(mediaItems, columnsQuantity);
    const mediaItemIndex = useSelectedMediaItemIndex(mediaItems, selectedMediaItem, isInActiveMode);

    const { outerRef, innerRef, items, scrollToItem } = useVirtual<HTMLDivElement, HTMLDivElement>({
        itemSize,
        itemCount: chunkedMediaItems.length,
        onScroll: (e: OnScrollEvent) => {
            if (isMediaItemsLoading) return;

            if (hasNextPage && e.visibleStopIndex === chunkedMediaItems.length - 1) {
                loadNextMedia();
            }
        },
    });

    useEffect(() => {
        const mediaItemChanged = previouslySelectedMediaItem?.identifier !== selectedMediaItem?.identifier;
        let scrollTimeout: NodeJS.Timeout;

        // We want to automatically scroll to the previously selected media.
        // But only if the media item is different.
        if (mediaItemChanged) {
            scrollTimeout = setTimeout(() => {
                const gridIndex = Math.floor(mediaItemIndex / 3);

                scrollToItem({ index: gridIndex, align: 'center', smooth: true });
            }, 0);
        }

        return () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollToItem, mode, selectedMediaItem]);

    useEffect(() => {
        if (!outerRef.current) return;

        const { width } = outerRef.current.getBoundingClientRect();

        setContainerWidth(width);

        const parentWrapper = outerRef.current?.parentElement?.parentElement;

        if (parentWrapper) parentWrapper.style.overflow = 'hidden';
    }, [outerRef]);

    if (activeSetIsEmpty && !isMediaItemsLoading) {
        return (
            <div ref={outerRef}>
                <EmptyActiveSet />
            </div>
        );
    }
    if (isDatasetEmpty && !isMediaItemsLoading) {
        const [page] = mediaFilterQuery.data?.pages ?? [];
        const totalMedia = page.totalImages + page.totalVideos;

        return (
            <div ref={outerRef}>
                {totalMedia > 0 ? (
                    <IllustratedMessage marginTop={'size-250'}>
                        <NotFound />
                    </IllustratedMessage>
                ) : (
                    <EmptyDataSet />
                )}
            </div>
        );
    }
    if (isMediaItemsLoading) {
        return (
            <Flex justifyContent='center' alignItems='center' UNSAFE_className={classes.loadingWrapper}>
                <Loading size={'M'} />
            </Flex>
        );
    }

    return (
        <div ref={outerRef} className={classes.outerRefDiv}>
            <div ref={innerRef} className={classes.innerRefDiv}>
                <>
                    {items.map((item: Item) => (
                        <Grid
                            key={item.index}
                            alignItems='center'
                            gap='size-75'
                            marginBottom='size-75'
                            // Remove gap size from each dataset list item
                            rows={`${itemSize - 6}px`}
                            columns={repeat(columnsQuantity, `${itemSize - 6}px`)}
                        >
                            {chunkedMediaItems[item.index] !== undefined ? (
                                chunkedMediaItems[item.index].map((mediaItem: MediaItem) => {
                                    const id = JSON.stringify(mediaItem.identifier);

                                    return (
                                        <DatasetListItem
                                            key={id}
                                            mediaItem={mediaItem}
                                            isSelected={isSelected(mediaItem, selectedMediaItem)}
                                            selectMediaItem={() => selectWithSavingConfirmation(mediaItem)}
                                        />
                                    );
                                })
                            ) : (
                                <></>
                            )}
                        </Grid>
                    ))}
                    {isFetchingNextPage && (
                        <Flex justifyContent='center' alignItems='center' UNSAFE_className={classes.fetchingWrapper}>
                            <Loading size={'M'} />
                        </Flex>
                    )}
                </>
            </div>
        </div>
    );
};
