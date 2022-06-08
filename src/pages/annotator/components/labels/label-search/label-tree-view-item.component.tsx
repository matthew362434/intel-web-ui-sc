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

import { useEffect, useState, MouseEvent, ReactNode } from 'react';

import { Flex, View, Text, ActionButton } from '@adobe/react-spectrum';
import { useHover } from '@react-aria/interactions';

import { Label } from '../../../../../core/labels';
import { TruncatedText } from '../../../../../shared/components/truncated-text';
import { LabelColorThumb } from '../label-color-thumb/label-color-thumb.component';
import { LabelTreeLabel } from '../label-tree-view';
import { getLabelId } from '../utils/labels-utils';
import classes from './label-tree-view-item.module.scss';

const attrs = {
    itemLink: { UNSAFE_className: `spectrum-TreeView-itemLink  ${classes.adjustableHeight}` },
    itemLabel: { UNSAFE_className: 'spectrum-TreeView-itemLabel' },
    chevron: { xlinkHref: '#spectrum-css-icon-Chevron100' },
    closedSvg: {
        className: 'spectrum-Icon spectrum-UIIcon-ChevronRight100 spectrum-TreeView-itemIndicator',
        focusable: false,
        'aria-hidden': true,
        'aria-label': 'Click to show child labels',
    },
    openSvg: {
        className: 'spectrum-Icon spectrum-UIIcon-ChevronDown100 spectrum-TreeView-itemIndicator',
        focusable: false,
        'aria-hidden': true,
        'aria-label': 'Click to hide child labels',
    },
};

export interface LabelTreeItemSuffix {
    (label: LabelTreeLabel, { isHovered }: { isHovered: boolean }): ReactNode;
}

export interface LabelTreeViewItemProps {
    label: LabelTreeLabel;
    clickHandler: (label: Label) => void;
    children: ReactNode;
    light: boolean;
    suffix?: LabelTreeItemSuffix;
}

export const ToggleableChevron = ({ isOpen, toggle, id }: { isOpen: boolean; toggle: () => void; id: string }) => {
    return (
        <ActionButton
            isQuiet
            id={id}
            data-testid={`chevron-${id}`}
            aria-label={`${id}-chevron-button`}
            onPress={() => {
                toggle();
            }}
            UNSAFE_className={classes.chevronButton}
        >
            <svg {...(isOpen ? attrs.openSvg : attrs.closedSvg)}>
                <use {...attrs.chevron} />
            </svg>
        </ActionButton>
    );
};

export const LabelTreeViewItem = ({
    label,
    clickHandler,
    children,
    light,
    suffix,
}: LabelTreeViewItemProps): JSX.Element => {
    const { name, hotkey } = label;
    const { hoverProps, isHovered } = useHover({});

    const [isOpen, setIsOpen] = useState<boolean>(label.open);

    useEffect(() => setIsOpen(label.open), [label.open]);

    return (
        <li
            className={`spectrum-TreeView-item ${isOpen ? 'is-open' : ''} ${light ? classes.lightMode : ''}`}
            id={`label-item-${label.id}`}
            aria-label={`label item ${label.name}`}
            onClick={(event: MouseEvent<HTMLLIElement>) => {
                event.stopPropagation();

                clickHandler(label);
            }}
        >
            <View {...attrs.itemLink} paddingEnd={'size-200'} backgroundColor={isHovered ? 'gray-100' : undefined}>
                {label.children.length > 0 && (
                    <ToggleableChevron
                        isOpen={isOpen}
                        toggle={() => {
                            setIsOpen((open: boolean) => !open);
                        }}
                        id={label.id}
                    />
                )}
                <div {...hoverProps} className={classes.listItem}>
                    <LabelColorThumb label={label} id={`${getLabelId('tree', label)}-color`} />

                    <Flex direction={'column'} flexGrow={1} maxWidth={'size-2000'} marginEnd={'auto'}>
                        <TruncatedText width={'inherit'} id={getLabelId('tree', label)} {...attrs.itemLabel}>
                            {name}
                        </TruncatedText>
                    </Flex>

                    {suffix ? (
                        suffix(label, { isHovered })
                    ) : hotkey ? (
                        <Text id={`label-hotkey-${name}`}>{hotkey.toUpperCase()}</Text>
                    ) : (
                        <></>
                    )}
                </div>
            </View>

            {children}
        </li>
    );
};
