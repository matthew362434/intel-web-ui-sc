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

import '@spectrum-css/treeview/dist/index-vars.css';

import { Label } from '../../../../../core/labels';
import { LabelTreeItem, LabelTreeLabel } from '../label-tree-view';
import { LabelTreeItemSuffix, LabelTreeViewItem } from './label-tree-view-item.component';

interface LabelTreeViewProps {
    itemClickHandler: (label: Label) => void;
    labels: LabelTreeItem[];
    light?: boolean;
    width?: number | string;
    suffix?: LabelTreeItemSuffix;
}

export const LabelTreeView = ({
    labels,
    itemClickHandler,
    light = false,
    width,
    suffix,
}: LabelTreeViewProps): JSX.Element => {
    return (
        <ul
            className={'spectrum-TreeView spectrum-TreeView--thumbnail'}
            style={{ margin: 0, maxWidth: width || '100%' }}
        >
            {labels.map((label: LabelTreeItem) => {
                return (
                    <LabelTreeViewItem
                        key={label.id}
                        label={label as LabelTreeLabel}
                        clickHandler={itemClickHandler}
                        light={light}
                        suffix={suffix}
                    >
                        {label.children ? (
                            <LabelTreeView
                                labels={label.children as LabelTreeLabel[]}
                                itemClickHandler={itemClickHandler}
                                width={width}
                                light={light}
                                suffix={suffix}
                            />
                        ) : (
                            <></>
                        )}
                    </LabelTreeViewItem>
                );
            })}
        </ul>
    );
};
