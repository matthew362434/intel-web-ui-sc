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

import { MouseEvent, useEffect, useState } from 'react';

import { Flex } from '@adobe/react-spectrum';

import { LabelItemType, LabelTreeItem, LabelTreeLabel } from '../label-tree-view.interface';
import { LabelEditionMode } from './label-edition-mode';
import { LabelPresentationMode } from './label-presentation-mode';

const attrs = {
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

export interface LabelTreeViewItemProps {
    item: LabelTreeItem;
    isEditable: boolean;
    save: (editedItem?: LabelTreeItem, previousId?: string) => void;
    addChild: (parentId: string, groupName: string, type: LabelItemType) => void;
    projectLabels: LabelTreeItem[];
    remove: (deletedLabel: LabelTreeItem) => void;
    isHovered: boolean;
    newTree: boolean;
    isMixedRelation: boolean;
}

export const LabelTreeViewLabel = ({
    item,
    isEditable,
    save,
    addChild,
    projectLabels,
    remove,
    isHovered,
    newTree,
    isMixedRelation,
}: LabelTreeViewItemProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState<boolean>(item.open);
    const [inEditMode, setInEditMode] = useState<boolean>(item.inEditMode);

    useEffect(() => setInEditMode(item.inEditMode), [item.inEditMode]);

    const onOpenClickHandler = (event: MouseEvent<SVGSVGElement>) => {
        event.stopPropagation();
        setIsOpen(!isOpen);
        save({ ...item, open: !isOpen }, item.id);
    };

    return (
        <>
            {item.children.length > 0 && (
                <svg {...(isOpen ? attrs.openSvg : attrs.closedSvg)} onClick={onOpenClickHandler}>
                    <use {...attrs.chevron} />
                </svg>
            )}
            <Flex width={'100%'} height={'100%'} alignItems={'center'}>
                <Flex alignItems='center' gap='size-100' width={'100%'}>
                    {inEditMode ? (
                        <LabelEditionMode
                            label={item as LabelTreeLabel}
                            finishEdition={() => setInEditMode(false)}
                            save={save}
                            projectLabels={projectLabels}
                            relation={item.relation}
                        />
                    ) : (
                        <LabelPresentationMode
                            label={item as LabelTreeLabel}
                            isHovered={isHovered}
                            isEditable={isEditable}
                            setEditMode={() => setInEditMode(true)}
                            addChild={addChild}
                            deleteLabel={remove}
                            newTree={newTree}
                            isMixedRelation={isMixedRelation}
                        />
                    )}
                </Flex>
            </Flex>
        </>
    );
};
