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

import { ChangeEvent, Key, useRef } from 'react';

import { Share } from '../../../assets/icons';
import {
    mediaExtensionHandler,
    VALID_MEDIA_TYPES_DISPLAY,
} from '../../../providers/media-upload-provider/media-upload.validator';
import { MenuTrigger } from '../menu-trigger';

const DIRECTORY_ATTRS = ['allowdirs', 'directory', 'mozdirectory', 'webkitdirectory'];

enum MenuItemsKey {
    FILES = 'Files',
    FOLDER = 'Folder',
}

interface UploadMediaButtonProps {
    id: string;
    title: string;
    isQuiet?: boolean;
    regularButton?: boolean;
    variant?: 'cta' | 'overBackground' | 'primary' | 'secondary' | 'negative';
    uploadCallback: (files: File[]) => void;
}

export const UploadMediaButton = ({
    id,
    title,
    isQuiet = false,
    regularButton = !isQuiet,
    variant = 'secondary',
    uploadCallback,
}: UploadMediaButtonProps): JSX.Element => {
    const fileInputRef = useRef<HTMLInputElement>({} as HTMLInputElement);

    const onMenuAction = async (key: Key): Promise<void> => {
        switch (key) {
            case MenuItemsKey.FILES.toLowerCase():
                for (const attr of DIRECTORY_ATTRS) {
                    fileInputRef.current.removeAttribute(attr);
                }
                break;
            case MenuItemsKey.FOLDER.toLowerCase():
                for (const attr of DIRECTORY_ATTRS) {
                    fileInputRef.current.setAttribute(attr, '');
                }
                // TODO: Add addNotification(EMPTY_FOLDER_WARNING_MESSAGE, NOTIFICATION_TYPE.DEFAULT);
                //  in case if uploading folder is empty
                break;
        }
        fileInputRef.current.click();
    };

    const onFileInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const fileList = event.target.files;
        if (!fileList) return;
        const files: File[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file: File | null = fileList.item(i);
            if (file) files.push(file);
        }
        if (files.length > 0) {
            uploadCallback(files);
        }
    };

    return (
        <>
            <input
                type='file'
                ref={fileInputRef}
                onChange={onFileInputChange}
                onClick={() => (fileInputRef.current.value = '')}
                accept={mediaExtensionHandler(VALID_MEDIA_TYPES_DISPLAY)}
                style={{ pointerEvents: 'all' }}
                hidden
                multiple
            />
            <MenuTrigger
                id={id}
                title={title}
                quiet={isQuiet}
                icon={isQuiet ? <Share /> : undefined}
                variant={variant}
                regularButton={regularButton}
                items={[MenuItemsKey.FILES, MenuItemsKey.FOLDER]}
                onAction={onMenuAction}
            />
        </>
    );
};
