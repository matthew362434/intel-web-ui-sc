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

import { Children, cloneElement, useRef, useState } from 'react';

import { ActionButton } from '@adobe/react-spectrum';

import { useEventListener, useOutsideClick } from '../../../hooks';
import { MouseEvents } from '../../mouse-events';
import { runWhen } from '../../utils';
import classes from './contex-menu.module.scss';

type Translate = '0%' | '-100%';
interface MenuPosition {
    top: number;
    left: number;
    translate: string;
}

interface ContextMenuProps {
    isSvgParent?: boolean;
    percentageToFlip?: number;
    roi: { width: number; height: number };
    children: JSX.Element | JSX.Element[];
    matcher: (elemt: HTMLElement) => boolean;
    zIndex?: number;
}

const Wrapper = ({ children, isSvgParent }: { children: JSX.Element; isSvgParent: boolean }) =>
    isSvgParent ? <foreignObject style={{ width: '100%', height: '100%' }}>{children}</foreignObject> : <>{children}</>;

export const ContextMenu = ({
    roi,
    children,
    matcher,
    isSvgParent = false,
    percentageToFlip = 10,
    zIndex = undefined,
}: ContextMenuProps): JSX.Element => {
    const viewRef = useRef(null);
    const parentRef = useRef<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, left: 0, translate: '0%, 0%' });
    const onClose = () => setIsVisible(false);

    useOutsideClick({
        ref: viewRef,
        callback: onClose,
    });

    //Calcs the correction to apply when the user right clicks near the edge of the canvas
    const getTranslate = (post: number, measure: number): Translate => {
        const leftPositionPercentage = measure * (percentageToFlip / 100);
        const leftLimit = measure - leftPositionPercentage;

        return post > leftLimit ? '-100%' : '0%';
    };

    const handleMenuPosition = (event: MouseEvent) => {
        event.preventDefault();
        setIsVisible(true);
        parentRef.current = event.target as HTMLElement;
        setMenuPosition({
            top: event.offsetY,
            left: event.offsetX,
            translate: `${getTranslate(event.offsetX, roi.width)}, ${getTranslate(event.offsetY, roi.height)}`,
        });
    };

    useEventListener(
        MouseEvents.ContextMenu,
        runWhen((event: MouseEvent) => matcher(event.target as HTMLElement))(handleMenuPosition)
    );

    if (!isVisible) {
        return <></>;
    }

    return (
        <Wrapper isSvgParent={isSvgParent}>
            <div
                ref={viewRef}
                role={'menu'}
                className={classes.container}
                style={{
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                    transform: `scale(calc(1 / var(--zoom-level))) translate(${menuPosition.translate})`,
                    zIndex,
                }}
            >
                {Children.map(children, (element, index) =>
                    cloneElement(element, {
                        onClose,
                        label: element.props.label,
                        parentRef: parentRef.current,
                        key: `${element.props.label}-${index}`,
                    })
                )}
            </div>
        </Wrapper>
    );
};

interface ContextMenuOptionProps {
    label: string;
    children: JSX.Element;
    onPress: (arg: unknown) => void;
    onClose?: () => void;
    parentRef?: HTMLElement;
    dataTransformer?: (elemt: HTMLElement) => unknown;
}

const Option = (props: ContextMenuOptionProps): JSX.Element => {
    const { label, children, onPress, dataTransformer, parentRef, onClose } = props;
    const formattedData = (dataTransformer && parentRef && dataTransformer(parentRef)) || parentRef;

    return (
        <ActionButton
            aria-label={label}
            onPress={() => {
                onPress(formattedData);
                onClose && onClose();
            }}
        >
            {children}
        </ActionButton>
    );
};

ContextMenu.Option = Option;
