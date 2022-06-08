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
/// <reference types="react-scripts" />
/// <reference types="./opencv-types/index" />

declare interface Window {
    // This add showDirectoryPicker to window object to silent the compiler
    // showDirectoryPicker is need for upload whole directory with media files inside using File System Access API
    showDirectoryPicker: (options: FileSystemGetDirectoryOptions) => FileSystemDirectoryHandle;
}

/**
 * The BeforeInstallPromptEvent is fired at the Window.onbeforeinstallprompt handler
 * before a user is prompted to "install" a web site to a home screen on mobile.
 *
 * @deprecated Only supported on Chrome and Android Webview.
 */
declare interface BeforeInstallPromptEvent extends Event {
    /**
     * Returns an array of DOMString items containing the platforms on which the event was dispatched.
     * This is provided for user agents that want to present a choice of versions to the user such as,
     * for example, "web" or "play" which would allow the user to chose between a web version or
     * an Android version.
     */
    readonly platforms: Array<string>;

    /**
     * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
     */
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;

    /**
     * Allows a developer to show the install prompt at a time of their own choosing.
     * This method returns a Promise.
     */
    prompt(): Promise<void>;
}

declare interface WindowEventHandlersEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
}

declare module 'html-dir-content' {
    export function getFilesFromDragEvent(event: React.DragEvent<HTMLElement>, recursive: boolean): Promise<File[]>;
}

declare module '@wojtekmaj/react-daterange-picker' {
    export default function DateTimeRangePicker(props: DateRangePickerProps): JSX.Element;
    interface DateRangePickerProps<TValue extends (Date | null)[]> {
        value: TValue;
        onChange?: (value: TValue) => void | undefined;
        monthPlaceholder?: string | undefined;
    }
}

declare module 'OpenCVTypes' {
    import * as types from 'opencv-types';

    export * from 'opencv-types';
    export type cv = types;
}

declare const cv: Promise<OpenCVTypes.cv>;
