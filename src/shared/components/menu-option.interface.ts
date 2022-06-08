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

export type MenuOption = MenuOptionIcon | MenuOptionText | MenuOptionTextAndIcon;

export type MenuOptionTextAndIcon = MenuOptionText & MenuOptionIcon;

export type MenuOptionIcon = MenuOptionOnlyIcon | MenuOptionLink | MenuOptionPopover | MenuOptionAction;
export type MenuOptionText = MenuOptionOnlyText | MenuOptionLinkText;

interface MenuOptionCommon {
    id: string;
    ariaLabel: string;
    isHidden?: boolean;
}

interface MenuOptionOnlyIcon extends MenuOptionCommon {
    icon: JSX.Element;
}

interface MenuOptionLink extends MenuOptionOnlyIcon {
    url: string;
}
interface MenuOptionAction extends MenuOptionOnlyIcon {
    handler: () => void;
}

interface MenuOptionOnlyText extends MenuOptionCommon {
    name: string;
}

interface MenuOptionLinkText extends MenuOptionOnlyText {
    url: string;
}

interface MenuOptionPopover extends MenuOptionOnlyIcon {
    popover: JSX.Element;
    messagesNumber?: number;
}
