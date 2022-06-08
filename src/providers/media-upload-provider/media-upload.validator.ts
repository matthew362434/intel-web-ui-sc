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

import filesize from 'file-size';

import { ValidationFailStatus } from './media-upload.interface';

export enum MEDIA_TYPE {
    IMAGE,
    VIDEO,
}

const SPECIFIC_VIDEO_MIME_TYPES = ['quicktime', 'x-msvideo', 'x-matroska'];
const SPECIFIC_IMAGE_TYPES = ['tif', 'tiff'];

export const VALID_VIDEO_TYPES = ['mp4', 'avi', 'mkv', 'mov'];
export const VALID_IMAGE_TYPES = ['jpg', 'jpeg', 'bmp', 'png', ...SPECIFIC_IMAGE_TYPES];
export const VALID_MEDIA_TYPES_DISPLAY = [...VALID_IMAGE_TYPES, ...VALID_VIDEO_TYPES];

export const mediaExtensionHandler = (extensions: string[]): string => extensions.map((ext) => `.${ext}`).join(',');

const VALIDATION_RULES = {
    IMAGE: {
        MIN_WIDTH: 32, // Pixels
        MIN_HEIGHT: 32, // Pixels
        MAX_WIDTH: 20000, // Pixels
        MAX_HEIGHT: 20000, // Pixels
    },
    VIDEO: {
        MIN_SIZE: 8, // KB
        MAX_SIZE: 8, // GB
        MAX_LENGTH: 3, // Hours
    },
};

const VALIDATION_MESSAGES = {
    UNSUPPORTED_MEDIA_TYPE: `Not a valid media format. Only the following are allowed: [
    .${VALID_MEDIA_TYPES_DISPLAY.join(', .')}
    ]`,
    IMAGE: {
        MIN_WIDTH: `Image width should be more than or equal ${VALIDATION_RULES.IMAGE.MIN_WIDTH} pixels`,
        MIN_HEIGHT: `Image height should be more than or equal ${VALIDATION_RULES.IMAGE.MIN_HEIGHT} pixels`,
        MAX_WIDTH: `Image width should be less than or equal ${VALIDATION_RULES.IMAGE.MAX_WIDTH} pixels`,
        MAX_HEIGHT: `Image height should be less than or equal ${VALIDATION_RULES.IMAGE.MAX_HEIGHT} pixels`,
    },
    VIDEO: {
        MIN_SIZE: `Video size should be more than or equal ${VALIDATION_RULES.VIDEO.MIN_SIZE} KB`,
        MAX_SIZE: `Video size should be less than or equal ${VALIDATION_RULES.VIDEO.MAX_SIZE} GB`,
        MAX_LENGTH: `Video length should be less than or equal ${VALIDATION_RULES.VIDEO.MAX_LENGTH} hours`,
    },
};

// UploadButton component uses FileSystem API to upload the folders
// MIME types only exist in the HTTP protocol, for the file system they are always deduced from the file extension
const getFileExt = (file: File): string | undefined => {
    const extRegex = /\.[0-9a-z]+$/i;

    return file.name.match(extRegex)?.shift()?.slice(1);
};

export const defineMediaType = (file: File): MEDIA_TYPE | undefined => {
    const mediaType = file.type || getFileExt(file);

    if (!mediaType) return undefined;

    const isImage = VALID_IMAGE_TYPES.some((type: string): boolean =>
        mediaType.toLowerCase().endsWith(type.toLowerCase())
    );

    const isVideo = [...VALID_VIDEO_TYPES, ...SPECIFIC_VIDEO_MIME_TYPES].some((type: string): boolean =>
        mediaType.toLowerCase().endsWith(type.toLowerCase())
    );

    if (isImage) return MEDIA_TYPE.IMAGE;
    if (isVideo) return MEDIA_TYPE.VIDEO;

    return undefined;
};

const isTiffFormat = (image: File): boolean => {
    if (image.type) {
        const type = image.type.split('/').pop();

        return SPECIFIC_IMAGE_TYPES.includes(type as string);
    }

    return SPECIFIC_IMAGE_TYPES.includes(getFileExt(image) as string);
};

const validateImage = (file: File): Promise<File> => {
    // TIFs aren't a guarantee on the web, so we can't expect it to be loaded and the onload event will not be triggered
    // In this case, just pass it as is to be verified by server (https://stackoverflow.com/questions/23345194)
    if (isTiffFormat(file)) return Promise.resolve(file);

    return new Promise<File>((resolve, reject) => {
        const fileReader = new FileReader();
        const errors: string[] = [];

        fileReader.onload = () => {
            const img = new Image();

            img.onload = (): void => {
                if (img.width < VALIDATION_RULES.IMAGE.MIN_WIDTH) errors.push(VALIDATION_MESSAGES.IMAGE.MIN_WIDTH);
                if (img.width > VALIDATION_RULES.IMAGE.MAX_WIDTH) errors.push(VALIDATION_MESSAGES.IMAGE.MAX_WIDTH);
                if (img.height < VALIDATION_RULES.IMAGE.MIN_HEIGHT) errors.push(VALIDATION_MESSAGES.IMAGE.MIN_HEIGHT);
                if (img.height > VALIDATION_RULES.IMAGE.MAX_HEIGHT) errors.push(VALIDATION_MESSAGES.IMAGE.MAX_HEIGHT);

                if (errors.length > 0) {
                    reject({ file, errors, status: ValidationFailStatus.INVALID_DIMENSIONS });
                } else {
                    resolve(file);
                }
            };

            img.src = `${fileReader.result}`;
        };

        fileReader.readAsDataURL(file);
    });
};

const validateVideo = (file: File): Promise<File> => {
    return new Promise<File>((resolve, reject) => {
        const errors: string[] = [];

        if (Number(filesize(file.size).to('KB')) < VALIDATION_RULES.VIDEO.MIN_SIZE) {
            errors.push(VALIDATION_MESSAGES.VIDEO.MIN_SIZE);

            reject({ file, errors, status: ValidationFailStatus.INVALID_DIMENSIONS });
        }

        if (Number(filesize(file.size).to('GB')) > VALIDATION_RULES.VIDEO.MAX_SIZE) {
            errors.push(VALIDATION_MESSAGES.VIDEO.MAX_SIZE);

            reject({ file, errors, status: ValidationFailStatus.INVALID_DIMENSIONS });
        }

        // In case of this is an AVI video, duration validation will be processed on server side
        // There is no possibility to playback HTML5 video element with AVI media file source
        // Event listener would not work for such element
        // https://stackoverflow.com/questions/4129674/does-html5-video-playback-support-the-avi-format
        if (file.type.endsWith('avi') || file.type.endsWith('x-msvideo') || getFileExt(file) === 'avi') {
            resolve(file);

            return;
        }

        const video = document.createElement('video');

        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
        };

        if (video.duration > VALIDATION_RULES.VIDEO.MAX_LENGTH * 3600) {
            errors.push(VALIDATION_MESSAGES.VIDEO.MAX_LENGTH);

            reject({ file, errors, status: ValidationFailStatus.INVALID_DURATION });
        }

        video.onloadstart = () => {
            resolve(file);
        };

        video.src = URL.createObjectURL(file);
    });
};

export const validateMedia = (file: File): Promise<File> => {
    switch (defineMediaType(file)) {
        case MEDIA_TYPE.IMAGE:
            return validateImage(file);
        case MEDIA_TYPE.VIDEO:
            return validateVideo(file);
        default:
            return Promise.reject({
                file,
                status: ValidationFailStatus.UNSUPPORTED_TYPE,
                errors: [VALIDATION_MESSAGES.UNSUPPORTED_MEDIA_TYPE],
            });
    }
};
