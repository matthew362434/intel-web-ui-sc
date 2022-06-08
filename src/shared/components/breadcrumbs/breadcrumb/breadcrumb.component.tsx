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

import { Link } from 'react-router-dom';

import { ChevronRight } from '../../../../assets/icons';
import { BreadcrumbProps } from './breadcrumb.interface';
import classes from './breadcrumb.module.scss';

export const Breadcrumb = ({ breadcrumb, href, currentPage, id }: BreadcrumbProps): JSX.Element => {
    const className = ['spectrum-Breadcrumbs-itemLink', classes.breadcrumbText].join(' ');

    return currentPage ? (
        <li className='spectrum-Breadcrumbs-item' id={id}>
            <div className={className} aria-current='page'>
                {breadcrumb}
            </div>
        </li>
    ) : (
        <li className='spectrum-Breadcrumbs-item' id={id}>
            <Link to={href ? href : '/'} className={className} tabIndex={0}>
                {breadcrumb}
            </Link>
            <ChevronRight className={classes.breadcrumbChevron} />
        </li>
    );
};
