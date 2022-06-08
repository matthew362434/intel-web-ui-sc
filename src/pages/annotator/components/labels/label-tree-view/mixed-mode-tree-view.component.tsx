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

import noop from 'lodash/noop';

import { Label } from '../../../../../core/labels';
import { LabelTreeViewItem } from './label-tree-view-item/label-tree-view-item.component';
import { LabelItemType, LabelTreeItem } from './label-tree-view.interface';

interface LabelTreeViewProps {
    itemClickHandler?: (label: Label) => void;
    labels: LabelTreeItem[];
    isEditable: boolean;
    save: (editedLabel?: LabelTreeItem, previousId?: string) => void;
    addChild: (parentId: string, groupName: string, type: LabelItemType) => void;
    projectLabels: LabelTreeItem[];
    setTaskLabels: (labels: LabelTreeItem[]) => void;
    isMixedRelation: boolean;
    width?: number | string;
    light?: boolean;
    newTree?: boolean;
    level?: number;
}

export const MixedModeTreeView = ({
    labels,
    itemClickHandler = noop,
    isEditable,
    save,
    addChild,
    projectLabels,
    setTaskLabels,
    width,
    isMixedRelation,
    light = false,
    newTree = false,
    level = 0,
}: LabelTreeViewProps): JSX.Element => {
    return (
        <ul
            className={`spectrum-TreeView ${isEditable ? 'spectrum-TreeView--thumbnail' : ''}`}
            style={{
                margin: 0,
                paddingLeft: level && 'var(--spectrum-global-dimension-size-300)',
                maxWidth: width || '100%',
            }}
        >
            {labels.map((label: LabelTreeItem) => {
                if (!label.children || !label.children.length) {
                    return (
                        <LabelTreeViewItem
                            key={label.id}
                            item={label}
                            clickHandler={itemClickHandler}
                            isEditable={isEditable}
                            light={light}
                            save={save}
                            addChild={addChild}
                            projectLabels={projectLabels}
                            newTree={newTree}
                            isMixedRelation={isMixedRelation}
                        />
                    );
                }
                return (
                    <LabelTreeViewItem
                        light={light}
                        key={label.id}
                        item={label}
                        clickHandler={itemClickHandler}
                        isEditable={isEditable}
                        save={save}
                        addChild={addChild}
                        projectLabels={projectLabels}
                        newTree={newTree}
                        isMixedRelation={isMixedRelation}
                    >
                        <MixedModeTreeView
                            labels={label.children}
                            itemClickHandler={itemClickHandler}
                            isEditable={isEditable}
                            light={light}
                            save={save}
                            addChild={addChild}
                            projectLabels={projectLabels}
                            setTaskLabels={setTaskLabels}
                            newTree={newTree}
                            level={++level}
                            width={width}
                            isMixedRelation={isMixedRelation}
                        />
                    </LabelTreeViewItem>
                );
            })}
        </ul>
    );
};
