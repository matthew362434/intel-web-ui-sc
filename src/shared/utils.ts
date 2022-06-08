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

import dayjs, { OptionType } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import { GraphQLError } from 'graphql';

import { isExclusive, Label } from '../core/labels';
import { isAnomalyDomain, Task } from '../core/projects';
import { LOCAL_STORAGE_KEYS } from './local-storage-keys';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export enum ErrorBackendMessage {
    USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    INVALID_INPUT = 'INVALID_INPUT',
    WRONG_OLD_PASSWORD = 'WRONG_OLD_PASSWORD',
    SAME_NEW_PASSWORD = 'SAME_NEW_PASSWORD',
    EMAIL_ALREADY_REGISTERED = 'EMAIL_ALREADY_REGISTERED',
    INVALID_EMAIL = 'INVALID_EMAIL',
    BAD_REQUEST = 'BAD_REQUEST',
}

export enum ErrorFrontMessage {
    USER_ALREADY_EXISTS = 'This email address is already being used.',
    USER_NOT_FOUND = "User doesn't exist.",
    WRONG_OLD_PASSWORD = 'That’s an incorrect password. Try again.',
    SAME_NEW_PASSWORD = 'Password should be different from your old password.',
    EMAIL_ALREADY_REGISTERED = 'This email address is already being used.',
    INVALID_EMAIL = 'Invalid email.',
    BAD_REQUEST = 'Your profile image cannot be greater than 300 x 300 px.',
}

export const getDefinedFromList = <T>(items: (T | undefined)[]): T[] => {
    const isUndefined = (item: T | undefined): item is T => {
        return !!item;
    };
    return items.filter(isUndefined);
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
const sort = <T, K extends keyof T>(list: T[], attribute: K, toLowercase = false, ascending = true): T[] => {
    return [
        ...list.sort((previous: T, current: T): number => {
            let previousValue: any = previous[attribute],
                currentValue: any = current[attribute];
            let comparison: any;
            if (typeof previous[attribute] === 'string' && toLowercase) {
                previousValue = (previous[attribute] as unknown as string).toLowerCase();
                currentValue = (current[attribute] as unknown as string).toLowerCase();
                comparison = previousValue.localeCompare(currentValue);
            } else {
                comparison = previousValue < currentValue ? -1 : 1;
            }
            return ascending ? comparison : comparison <= 0 ? 1 : -1;
        }),
    ];
};

export const sortAscending = <T, K extends keyof T>(list: T[], attribute: K, toLowercase = false): T[] => {
    return sort(list, attribute, toLowercase);
};

export const sortDescending = <T, K extends keyof T>(list: T[], attribute: K, toLowercase = false): T[] => {
    return sort(list, attribute, toLowercase, false);
};

export const capitalize = (value: string): string =>
    `${value.charAt(0).toUpperCase()}${value.slice(1).toLocaleLowerCase()}`;

export const encodeToBase64 = (password: string): string => {
    return btoa(password);
};

export const extractErrorCode = (error: GraphQLError): string => {
    const [errorCode] = error.message.split('::');
    return errorCode;
};

export const errorMessageMapping = (message: ErrorBackendMessage): string => {
    switch (message) {
        case ErrorBackendMessage.USER_ALREADY_EXISTS:
            return ErrorFrontMessage.USER_ALREADY_EXISTS;
        case ErrorBackendMessage.USER_NOT_FOUND:
            return ErrorFrontMessage.USER_NOT_FOUND;
        case ErrorBackendMessage.INVALID_INPUT:
            return ErrorFrontMessage.USER_NOT_FOUND;
        case ErrorBackendMessage.WRONG_OLD_PASSWORD:
            return ErrorFrontMessage.WRONG_OLD_PASSWORD;
        case ErrorBackendMessage.SAME_NEW_PASSWORD:
            return ErrorFrontMessage.SAME_NEW_PASSWORD;
        case ErrorBackendMessage.EMAIL_ALREADY_REGISTERED:
            return ErrorFrontMessage.EMAIL_ALREADY_REGISTERED;
        case ErrorBackendMessage.INVALID_EMAIL:
            return ErrorFrontMessage.INVALID_EMAIL;
        case ErrorBackendMessage.BAD_REQUEST:
            return ErrorFrontMessage.BAD_REQUEST;
        default:
            return message;
    }
};

export const passwordRegex = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])((?=.*[0-9])|(?=.*[#?!@$%^&*-])).{8,200}$/);

export const newPasswordErrorMessage =
    'Password must consists of 8 - 200 characters, at least one capital letter, lower letter, digit or symbol.';
export const confirmPasswordErrorMessage = 'The password you entered did not match.';

export const formatDate = (date: string, format: string): string => dayjs(date).format(format);

export const isValidDate = (date: string, formats: OptionType): boolean => dayjs(date, formats, true).isValid();

export const formatUtcToLocal = (date: string, format: string): string => dayjs.utc(date).local().format(format);

export const formatLocalToUtc = (date: string, localFormat: string): string =>
    dayjs(date, localFormat).utc(false).local().format();

export const filterOutExclusiveLabel = (labels: readonly Label[]): readonly Label[] => {
    return labels.filter((label: Label) => !isExclusive(label));
};

export const getUserDefinedLabels = (tasks: Task[]): Label[] => {
    return tasks.flatMap(({ domain, labels }) => {
        // We make an exception for anomaly domains where we want to show both normal and anomalous labels
        if (isAnomalyDomain(domain)) {
            return labels;
        }

        // Remove the empty / exclusive labels as these are generated automatically
        return filterOutExclusiveLabel(labels);
    });
};

export const getImageData = (img: HTMLImageElement): ImageData => {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    return ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
};

export const renderImageData = (imgData: ImageData, name = ''): void => {
    let canvasContainer: HTMLDivElement | null = document.querySelector('.canvasContainer');
    const canvas = document.createElement('canvas');
    canvas.dataset.name = name;
    (canvas as any).style = 'width: 300px;';

    if (!canvasContainer) {
        canvasContainer = document.createElement('div') as HTMLDivElement;
        canvasContainer.classList.add('canvasContainer');
        document.body.appendChild(canvasContainer);
    }

    canvasContainer?.prepend(canvas);

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    ctx.putImageData(imgData, 0, 0);
};

export const runWhen =
    <T>(predicate: (...args: T[]) => boolean) =>
    (whenTrueFn: (...args: T[]) => void) =>
    (...args: T[]): void => {
        if (predicate(...args)) {
            whenTrueFn(...args);
        }
    };

export const openNewTab = (url: string): void => {
    window.open(url, '_blank', 'noreferrer');
};

export const removeLocalStorageKey = (key: LOCAL_STORAGE_KEYS): void => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
    }
};

export const getParsedLocalStorage = <T>(key: LOCAL_STORAGE_KEYS): T | null => {
    if (Boolean(localStorage.getItem(key))) {
        return JSON.parse(localStorage.getItem(key) as string) as T;
    }

    return null;
};
