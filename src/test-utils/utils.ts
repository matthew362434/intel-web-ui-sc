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

import { ReactElement } from 'react';

import { queryByAttribute, queryAllByAttribute, waitFor, fireEvent } from '@testing-library/react';

import { teamProvider as render } from '../test-utils/team-management-providers-render';

export const getById = queryByAttribute.bind(null, 'id');
export const getAllWithMatchId = (container: HTMLElement, id: string): HTMLElement[] =>
    queryAllByAttribute('id', container, id, { exact: false });

export const gqlSetup = async (component: ReactElement, emptyUsers = false): Promise<void> => {
    render(component, emptyUsers);
    await waitFor(() => new Promise((resolve) => setTimeout(resolve, 0)));
};

export const onHoverTooltip = (element: HTMLElement | null): void => {
    if (element === null) {
        throw new Error('Element cannot be null');
    }

    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    fireEvent.mouseEnter(element);
};

export const MORE_THAN_100_CHARS_NAME =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer malesuada rutrum felis nec rhoncus tincidunt.';
