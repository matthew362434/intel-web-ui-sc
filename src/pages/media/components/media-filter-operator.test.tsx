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

import { SearchRuleField, SearchRuleOperator } from '../media-filter.interface';
import { MediaFilterOperator } from './media-filter-operator.component';

describe('MediaFilterOperator', () => {
    const onSelectionChange = jest.fn();
    const ariaLabel = 'media-filter-operator';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('anomaly projects', () => {
        it('allows to select the options and call onSelectionChange', async () => {
            await render(
                <Provider theme={defaultTheme}>
                    <MediaFilterOperator
                        value=''
                        isAnomalyProject={false}
                        field={SearchRuleField.MediaHeight}
                        onSelectionChange={onSelectionChange}
                    />
                </Provider>
            );

            userEvent.selectOptions(
                screen.getByRole('listbox', { hidden: true }),
                screen.getByRole('option', { hidden: true, name: 'Equal' })
            );

            expect(onSelectionChange).toHaveBeenCalledWith(SearchRuleOperator.Equal);
        });

        it('call onSelectionChange and disable it when field is LabelId', async () => {
            await render(
                <Provider theme={defaultTheme}>
                    <MediaFilterOperator
                        isAnomalyProject={true}
                        field={SearchRuleField.LabelId}
                        value={SearchRuleOperator.Greater}
                        onSelectionChange={onSelectionChange}
                    />
                </Provider>
            );

            const input = screen.getByLabelText(ariaLabel) as HTMLInputElement;

            expect(input.disabled).toBe(true);
            expect(input.textContent).toBe('In');
            expect(onSelectionChange).toHaveBeenNthCalledWith(1, SearchRuleOperator.In);
        });

        it('call onSelectionChange and disable it when field is AnnotationSceneState', async () => {
            await render(
                <Provider theme={defaultTheme}>
                    <MediaFilterOperator
                        isAnomalyProject={true}
                        field={SearchRuleField.AnnotationSceneState}
                        value={SearchRuleOperator.Greater}
                        onSelectionChange={onSelectionChange}
                    />
                </Provider>
            );

            const input = screen.getByLabelText(ariaLabel) as HTMLInputElement;

            expect(input.disabled).toBe(true);
            expect(input.textContent).toBe('Equal');
            expect(onSelectionChange).toHaveBeenNthCalledWith(1, SearchRuleOperator.Equal);
        });
    });
});
