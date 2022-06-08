// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AnnotationSceneState } from '../../media-filter.interface';
import {
    annotationSceneItems,
    anomalyItems,
    MediaFilterValueAnnotationSceneState,
} from './media-filter-value-annotation-scene-state.component';

describe('MediaFilterValueAnnotationSceneState', () => {
    const onSelectionChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('allows to select the Annotated and call onSelectionChange', async () => {
        await render(
            <Provider theme={defaultTheme}>
                <MediaFilterValueAnnotationSceneState
                    value=''
                    isAnomalyProject={false}
                    onSelectionChange={onSelectionChange}
                />
            </Provider>
        );

        userEvent.selectOptions(
            screen.getByRole('listbox', { hidden: true }),
            screen.getByRole('option', { hidden: true, name: 'Annotated' })
        );

        expect(onSelectionChange).toHaveBeenCalledWith(AnnotationSceneState.ANNOTATED);
    });

    it('render all option list', async () => {
        await render(
            <Provider theme={defaultTheme}>
                <MediaFilterValueAnnotationSceneState
                    value=''
                    isAnomalyProject={false}
                    onSelectionChange={onSelectionChange}
                />
            </Provider>
        );

        annotationSceneItems.forEach(({ text }) => {
            expect(screen.queryByText(text)).toBeInTheDocument();
        });
    });

    it('render valid options for anomaly project', async () => {
        await render(
            <Provider theme={defaultTheme}>
                <MediaFilterValueAnnotationSceneState
                    value=''
                    isAnomalyProject={true}
                    onSelectionChange={onSelectionChange}
                />
            </Provider>
        );

        const anomalyOptions = annotationSceneItems.filter(({ key }) => anomalyItems.includes(key));

        const otherOptions = annotationSceneItems.filter(({ key }) => !anomalyItems.includes(key));

        anomalyOptions.forEach(({ text }) => {
            expect(screen.queryByText(text)).toBeInTheDocument();
        });

        otherOptions.forEach(({ text }) => {
            expect(screen.queryByText(text)).not.toBeInTheDocument();
        });
    });
});
