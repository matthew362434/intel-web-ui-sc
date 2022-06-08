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

import { useEffect, useRef, useState } from 'react';

import { View, Content, TooltipTrigger, ToggleButton, Tooltip } from '@adobe/react-spectrum';
import { useDialog } from '@react-aria/dialog';
import { FocusScope } from '@react-aria/focus';
import { useOverlayTrigger, DismissButton, useModal, useOverlay } from '@react-aria/overlays';
import { mergeProps } from '@react-aria/utils';
import { useUnwrapDOMRef } from '@react-spectrum/utils';
import { useOverlayTriggerState } from '@react-stately/overlays';
import { FocusableRefValue } from '@react-types/shared';

import { Filter } from '../../../assets/icons';
import classes from '../media-filter.module.scss';

interface MediaFilterDialogProps {
    children: JSX.Element;
}

export const MediaFilterDialog = ({ children }: MediaFilterDialogProps): JSX.Element => {
    const dialogState = useOverlayTriggerState({});
    const containerRef = useRef(null);
    const triggerRef = useRef<FocusableRefValue<HTMLButtonElement>>(null);
    const unwrappedTriggerRef = useUnwrapDOMRef(triggerRef);
    const unwrappedContainerRef = useUnwrapDOMRef(containerRef);
    const [positionStyles, setPositionStyles] = useState({});

    const { triggerProps, overlayProps: overlayPropsTrigger } = useOverlayTrigger(
        { type: 'dialog' },
        dialogState,
        unwrappedTriggerRef
    );

    const { overlayProps } = useOverlay(
        {
            onClose: dialogState.close,
            isOpen: dialogState.isOpen,
            isDismissable: true,
        },
        unwrappedContainerRef
    );

    useEffect(() => {
        if (dialogState.isOpen) {
            const buttonrRef = unwrappedTriggerRef.current as HTMLButtonElement;
            const clientRect = buttonrRef.getBoundingClientRect();
            setPositionStyles({
                right: document.body.clientWidth - clientRect.right - clientRect.width,
                top: clientRect.bottom,
            });
        }
    }, [dialogState.isOpen, unwrappedTriggerRef]);

    const { modalProps } = useModal();
    const { dialogProps } = useDialog({}, containerRef);

    return (
        <View position={'relative'}>
            <TooltipTrigger placement='bottom'>
                <ToggleButton
                    isQuiet
                    aria-label='modal-trigger'
                    isSelected={dialogState.isOpen}
                    onPress={() => dialogState.toggle()}
                    ref={triggerRef}
                    {...triggerProps}
                >
                    <Filter />
                </ToggleButton>
                <Tooltip>Filter media</Tooltip>
            </TooltipTrigger>
            {dialogState.isOpen && (
                <FocusScope restoreFocus>
                    <Content
                        ref={containerRef}
                        UNSAFE_className={classes.dialogBody}
                        UNSAFE_style={positionStyles}
                        {...mergeProps(overlayPropsTrigger, overlayProps, dialogProps, overlayProps, modalProps)}
                    >
                        {children}
                        <DismissButton onDismiss={dialogState.close} />
                    </Content>
                </FocusScope>
            )}
        </View>
    );
};
