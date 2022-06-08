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

import { fireEvent, providersRender as render, screen } from '../../../../test-utils';
import { UseSubmitAnnotationsMutationResult } from '../../providers/submit-annotations-provider/submit-annotations.interface';
import { SavingFailedDialog } from './saving-failed-dialog.component';

describe('Saving annotations failed dialog', () => {
    const mutation = {
        status: 'error',
    } as UseSubmitAnnotationsMutationResult;

    it('Allows the user to retry', () => {
        const cancel = jest.fn();
        const retry = jest.fn();

        render(<SavingFailedDialog cancel={cancel} retry={retry} submitAnnotationsMutation={mutation} />);
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /try again/i }));
        expect(retry).toHaveBeenCalled();
    });

    it('Dismisses the alertdialog', () => {
        const cancel = jest.fn();
        const retry = jest.fn();

        render(<SavingFailedDialog cancel={cancel} retry={retry} submitAnnotationsMutation={mutation} />);

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(cancel).toHaveBeenCalled();
    });

    it('Shows a saving message', () => {
        const cancel = jest.fn();
        const retry = jest.fn();

        render(
            <SavingFailedDialog
                cancel={cancel}
                retry={retry}
                submitAnnotationsMutation={{ ...mutation, status: 'loading' }}
            />
        );

        expect(screen.getByRole('button', { name: /saving annotations/i })).toBeDisabled();
    });
});
