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

import { MouseEvent, ReactNode, useEffect, useState } from 'react';

import { View } from '@adobe/react-spectrum';
import { useHover } from '@react-aria/interactions';

import { Label } from '../../../../../../core/labels';
import { LabelItemEditionState, LabelItemType, LabelTreeItem } from '../label-tree-view.interface';
import { LabelTreeViewGroup } from './label-tree-view-group.component';
import classes from './label-tree-view-item.module.scss';
import { LabelTreeViewLabel } from './lable-tree-view-label.component';
import { setRemovedStateToChildren } from './utils';

const attrs = {
    itemLink: { UNSAFE_className: `spectrum-TreeView-itemLink ${classes.viewCursor} ${classes.adjustableHeight}` },
};

export interface LabelTreeViewItemProps {
    item: LabelTreeItem;
    clickHandler: (label: Label) => void;
    isEditable: boolean;
    children?: ReactNode;
    light?: boolean;
    save: (editedItem?: LabelTreeItem, previousId?: string) => void;
    addChild: (parentId: string, groupName: string, type: LabelItemType) => void;
    projectLabels: LabelTreeItem[];
    newTree?: boolean;
    isMixedRelation: boolean;
}

export const LabelTreeViewItem = ({
    item,
    clickHandler,
    isEditable,
    children,
    light,
    save,
    addChild,
    projectLabels,
    newTree = false,
    isMixedRelation,
}: LabelTreeViewItemProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState<boolean>(item.open);
    const { isHovered, hoverProps } = useHover({});

    useEffect(() => setIsOpen(item.open), [item.open]);

    const markAsRemoved = (deletedLabel: LabelTreeItem) => {
        save(
            {
                ...deletedLabel,
                state: deletedLabel.type === LabelItemType.LABEL ? LabelItemEditionState.REMOVED : deletedLabel.state,
                children: setRemovedStateToChildren(deletedLabel),
            },
            deletedLabel.id
        );
    };

    const remove = (deletedLabel: LabelTreeItem) => {
        save(
            {
                ...deletedLabel,
                state: LabelItemEditionState.NEW_EMPTY,
            },
            deletedLabel.id
        );
    };

    const deleteLabelHandler = (deletedLabel: LabelTreeItem) => {
        if (newTree || deletedLabel.state === LabelItemEditionState.NEW) {
            remove(deletedLabel);
        } else {
            markAsRemoved(deletedLabel);
        }
    };

    const saveEditionHandler = (editedLabel?: LabelTreeItem, previousId?: string) => {
        if (editedLabel) {
            save(editedLabel, previousId);
        } else {
            save();
        }
    };

    return (
        <li
            className={`${classes.default} spectrum-TreeView-item ${isOpen ? 'is-open' : ''} ${
                light ? classes.lightMode : classes.darkMode
            }`}
            onClick={(event: MouseEvent<HTMLLIElement>) => {
                event.stopPropagation();
                clickHandler(item as Label);
            }}
            id={`label-item-${item.id}`}
            aria-label={`label item ${item.name}`}
        >
            <div {...hoverProps}>
                <View
                    UNSAFE_className={`${attrs.itemLink.UNSAFE_className} ${
                        item.type !== LabelItemType.GROUP ? classes.indent : classes.smallIndent
                    }`}
                    data-testid={`item-link-${item.id}`}
                    UNSAFE_style={{ minHeight: '4.4rem' }}
                >
                    {item.type === LabelItemType.LABEL ? (
                        <LabelTreeViewLabel
                            item={item}
                            isEditable={isEditable}
                            save={saveEditionHandler}
                            addChild={addChild}
                            projectLabels={projectLabels}
                            isHovered={isHovered}
                            remove={deleteLabelHandler}
                            newTree={newTree}
                            isMixedRelation={isMixedRelation}
                        />
                    ) : (
                        <LabelTreeViewGroup
                            item={item}
                            isEditable={isEditable}
                            save={saveEditionHandler}
                            remove={deleteLabelHandler}
                            addChild={addChild}
                            isHovered={isHovered}
                            newTree={newTree}
                            projectLabels={projectLabels}
                        />
                    )}
                </View>
            </div>
            {item.children.length > 0 && children ? <>{children}</> : <></>}
        </li>
    );
};
