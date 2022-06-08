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

import { DetailedHTMLProps, HTMLAttributes, useEffect, useRef, useState } from 'react';

import { idMatchingFormat } from '../../../test-utils';

type WidthValues = number | 'inherit';

export interface TruncatedTextProps extends DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
    children: string;
    width?: WidthValues;
    isQuiet?: boolean;
    id?: string;
    classes?: string;
}

export const TruncatedText = ({ width, isQuiet = false, id, classes, children }: TruncatedTextProps): JSX.Element => {
    const [truncateWidth, setTruncatedWidth] = useState<WidthValues | undefined>(width);
    const ref = useRef<HTMLSpanElement>({} as HTMLSpanElement);

    useEffect(() => {
        if (!ref.current || truncateWidth !== undefined) return;

        setTruncatedWidth(ref.current.parentElement?.clientWidth);
    }, [ref, truncateWidth]);

    return (
        <span
            id={id || idMatchingFormat(children)}
            className={classes}
            title={isQuiet ? '' : children}
            ref={ref}
            style={{
                maxWidth: truncateWidth ?? 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
            }}
        >
            {children}
        </span>
    );
};
