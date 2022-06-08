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

import { RowMouseEventHandlerParams, TableCellRenderer, TableHeaderRenderer } from 'react-virtualized';

export type SortDirection = 'ASC' | 'DESC' | undefined;

export interface Sorting {
    sortBy: string | undefined;
    sortDirection: SortDirection;
}

export interface ColumnProps {
    label: string;
    dataKey: string;
    width: number;
    component: TableCellRenderer;
    sortable?: boolean;
    className?: string;
    headerRenderer?: TableHeaderRenderer;
}

export interface SortingParams extends Sorting {
    sort: (props: Sorting) => void;
}

export interface TableProps<T> {
    data: T[];
    columns: ColumnProps[];
    height: string;
    onRowClick?: (info: RowMouseEventHandlerParams) => void;
    sorting?: SortingParams;
    headerClassName?: string;
    rowClassName?: string;
    rowHeight?: number;
    headerHeight?: number;
}
