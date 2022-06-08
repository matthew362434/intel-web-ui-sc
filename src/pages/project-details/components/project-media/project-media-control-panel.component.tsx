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

import { Key, useMemo, useRef, useState } from 'react';

import { ActionButton, Checkbox, Flex, Form, SearchField, Text, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { TextFieldRef } from '@react-types/textfield';
import isEmpty from 'lodash/isEmpty';

import { Delete, Search, SortUpDown } from '../../../../assets/icons';
import { NOTIFICATION_TYPE, useNotification } from '../../../../notification';
import { CornerIndicator, MenuTrigger, MenuTriggerPopup, UploadMediaButton } from '../../../../shared/components';
import { idMatchingFormat } from '../../../../test-utils';
import { MediaFilter } from '../../../media/media-filter.component';
import { SearchRuleField, SearchRuleOperator, SortMenuActionKey } from '../../../media/media-filter.interface';
import { useMedia } from '../../../media/providers/media-provider.component';
import { addOrUpdateFilterRule } from '../../../media/util';
import classes from './project-media-control-panel.module.scss';

interface ProjectMediaControlPanelProps {
    uploadMediaCallback: (files: File[]) => void;
    header?: string | undefined;
}

export const ProjectMediaControlPanel = ({
    header,
    uploadMediaCallback,
}: ProjectMediaControlPanelProps): JSX.Element => {
    const [searchText, setSearchText] = useState<string>('');
    const [isActiveSearch, setIsActiveSearch] = useState<boolean>(false);
    const searchFieldRef = useRef<TextFieldRef>(null);

    const { addNotification } = useNotification();

    const {
        media,
        totalImages,
        totalVideos,
        loadNextMedia,
        deleteMedia,
        mediaSelection,
        resetMediaSelection,
        addBulkMediaToSelection,
        mediaFilterOptions,
        setMediaFilterOptions,
        anomalyLabel,
        isMediaFilterEmpty,
        setSortingOptions,
        sortingOptions,
    } = useMedia();

    const isIndeterminate = useMemo<boolean>(
        () => mediaSelection.length > 0 && mediaSelection.length < media.length,
        [media, mediaSelection]
    );

    const isSelected = useMemo<boolean>(
        () => mediaSelection.length > 0 && mediaSelection.length === media.length,
        [media, mediaSelection]
    );

    const totalItems = totalImages + totalVideos;
    const deletionConfirmation = `Are you sure you want to delete ${mediaSelection.length} of ${totalItems} items?`;

    const onSortMenuAction = (key: Key): void => {
        setSortingOptions((prevOptions) => ({
            sortBy: String(key).toUpperCase(),
            sortDir: prevOptions.sortDir ?? 'asc',
        }));
    };

    const searchAction = (): void => {
        setIsActiveSearch(true);
        searchFieldRef.current && searchFieldRef.current.focus();
    };

    const setFilterByMediaName = (newValue: string) => {
        if (newValue === '') {
            return setMediaFilterOptions({});
        }

        setMediaFilterOptions(
            addOrUpdateFilterRule(mediaFilterOptions, {
                field: SearchRuleField.MediaName,
                operator: SearchRuleOperator.Equal,
                value: newValue,
            })
        );
    };

    const onClearField = (): void => {
        setSearchText('');
        setIsActiveSearch(false);
        setFilterByMediaName('');
    };

    const onFocusChange = (isFocused: boolean): void => {
        !isFocused && !searchText && setIsActiveSearch(false);
    };

    const onSearchChange = (text: string): void => {
        setSearchText(text);
        isEmpty(text) && setFilterByMediaName(text);
    };

    const onSubmit = (): void => {
        const mediaName = searchText.trim();
        setSearchText(mediaName);
        setFilterByMediaName(mediaName);
    };

    const isDeleteButtonDisabled = mediaSelection.length === 0;

    return (
        <>
            <Flex alignItems='center' gap='size-100'>
                {header && (
                    <Text marginEnd='size-100' UNSAFE_style={{ fontWeight: 'bold' }}>
                        {header}
                    </Text>
                )}
                {media.length > 0 && (
                    <Flex gap='size-100' alignItems='center'>
                        <Checkbox
                            aria-label='Select all media'
                            isSelected={isSelected}
                            isIndeterminate={isIndeterminate}
                            UNSAFE_style={{ padding: 0 }}
                            onChange={(state: boolean) =>
                                state ? addBulkMediaToSelection(media) : resetMediaSelection()
                            }
                        />
                        <MenuTriggerPopup
                            isButtonDisabled={isDeleteButtonDisabled}
                            question={deletionConfirmation}
                            onPrimaryAction={() =>
                                deleteMedia(mediaSelection)
                                    .then(() => loadNextMedia(true))
                                    .catch((error) => {
                                        const { message } = error.response.data;
                                        addNotification(`Media cannot be deleted. ${message}`, NOTIFICATION_TYPE.ERROR);
                                    })
                                    .finally(() => resetMediaSelection())
                            }
                        >
                            <Delete data-testid='delete-media-id' id='delete-media-id' />
                        </MenuTriggerPopup>
                    </Flex>
                )}
                <Flex flex={1} alignItems='center' justifyContent='end'>
                    <Form flex={isActiveSearch && 1} UNSAFE_className={classes.mediaSearchBox}>
                        <SearchField
                            ref={searchFieldRef}
                            value={searchText}
                            type='search'
                            inputMode='search'
                            aria-label='search'
                            placeholder='Search media by name'
                            icon={<Search height={'32px'} style={{ position: 'absolute', top: 0 }} />}
                            id='search-field-media-id'
                            isQuiet={true}
                            onClear={onClearField}
                            onFocusChange={onFocusChange}
                            onSubmit={onSubmit}
                            onChange={onSearchChange}
                            UNSAFE_className={
                                isActiveSearch ? classes.mediaSearchFieldActive : classes.mediaSearchFieldInactive
                            }
                        />
                        <TooltipTrigger placement='bottom'>
                            <ActionButton
                                key='search'
                                aria-label='Search button'
                                id='search-media-button-id'
                                isQuiet={true}
                                onPress={searchAction}
                                isHidden={isActiveSearch}
                                justifySelf='end'
                            >
                                <Search />
                            </ActionButton>
                            <Tooltip>Search media</Tooltip>
                        </TooltipTrigger>
                    </Form>
                    <CornerIndicator isActive={!isMediaFilterEmpty}>
                        <MediaFilter filterOptions={mediaFilterOptions} onSetFilterOptions={setMediaFilterOptions} />
                    </CornerIndicator>
                    <CornerIndicator isActive={!!sortingOptions.sortBy}>
                        <TooltipTrigger placement='bottom'>
                            <MenuTrigger
                                id='sort-media-action-menu'
                                items={[SortMenuActionKey.NAME, SortMenuActionKey.DATE]}
                                onAction={onSortMenuAction}
                                icon={<SortUpDown />}
                            />
                            <Tooltip>Sort media</Tooltip>
                        </TooltipTrigger>
                    </CornerIndicator>
                    <TooltipTrigger placement='bottom'>
                        <UploadMediaButton
                            id={`upload-media-${!!anomalyLabel ? idMatchingFormat(anomalyLabel.name) : 'action-menu'}`}
                            title='Upload'
                            isQuiet={true}
                            uploadCallback={uploadMediaCallback}
                        />
                        <Tooltip>Upload media</Tooltip>
                    </TooltipTrigger>
                </Flex>
            </Flex>
        </>
    );
};
