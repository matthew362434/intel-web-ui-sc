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

import { View } from '@react-spectrum/view';
import { AutoSizer, Column, Index, Table as TableVirtualized } from 'react-virtualized';

import { DefaultHeaderRenderer } from './components';
import { TableProps, ColumnProps } from './table.interface';
import 'react-virtualized/styles.css';
import './table.scss';

export const Table = <T extends unknown>({
    columns,
    data,
    height,
    sorting,
    onRowClick,
    headerClassName,
    rowClassName,
    rowHeight = 48,
    headerHeight = 30,
}: TableProps<T>): JSX.Element => {
    const rowGetter = ({ index }: Index): T => data[index];

    return (
        <View minHeight={height}>
            <AutoSizer>
                {({ width: autoSizerWidth, height: autoSizerHeight }) => (
                    <TableVirtualized
                        id='table-id'
                        width={autoSizerWidth}
                        height={autoSizerHeight}
                        headerHeight={headerHeight}
                        rowHeight={rowHeight}
                        rowCount={data.length}
                        rowGetter={rowGetter}
                        sortDirection={sorting?.sortDirection}
                        sortBy={sorting?.sortBy}
                        sort={sorting?.sort}
                        onRowClick={onRowClick}
                        rowClassName={[
                            !onRowClick ? 'ReactVirtualized__Table__row-unclickable' : '',
                            rowClassName,
                        ].join(' ')}
                        headerClassName={headerClassName}
                    >
                        {columns.map(
                            ({
                                width,
                                dataKey,
                                label,
                                component,
                                sortable,
                                className,
                                headerRenderer,
                            }: ColumnProps) => (
                                <Column
                                    width={width}
                                    dataKey={dataKey}
                                    label={label}
                                    cellRenderer={component}
                                    key={dataKey}
                                    id={dataKey || 'button'}
                                    disableSort={!sortable}
                                    flexGrow={1}
                                    className={className || ''}
                                    headerRenderer={headerRenderer || DefaultHeaderRenderer}
                                />
                            )
                        )}
                    </TableVirtualized>
                )}
            </AutoSizer>
        </View>
    );
};
