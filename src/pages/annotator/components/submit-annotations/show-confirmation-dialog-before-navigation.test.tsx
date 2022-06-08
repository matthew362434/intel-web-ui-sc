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

import { useHistory, useLocation } from 'react-router-dom';

import { screen, fireEvent, waitForElementToBeRemoved } from '../../../../test-utils';
import { useSubmitAnnotations } from '../../providers/submit-annotations-provider/submit-annotations-provider.component';
import { UseSubmitAnnotationsMutationResult } from '../../providers/submit-annotations-provider/submit-annotations.interface';
import { annotatorRender as render } from '../../test-utils/annotator-render';
import { ShowConfirmationDialogBeforeNavigation } from './show-confirmation-dialog-before-navigation.component';

jest.mock('../../providers/submit-annotations-provider/submit-annotations-provider.component', () => ({
    ...jest.requireActual('../../providers/submit-annotations-provider/submit-annotations-provider.component'),
    useSubmitAnnotations: jest.fn(),
}));

describe('Show confirmation dialog before navigation', () => {
    // We use this component to check that the location has changed
    const LocationPathName = () => {
        const { pathname } = useLocation();
        const { push } = useHistory();
        return (
            <div>
                <span aria-label='Pathname'>{pathname}</span>
                <button onClick={() => push('/test')}>Navigate</button>
            </div>
        );
    };

    it('Goes back to the project page', async () => {
        jest.mocked(useSubmitAnnotations).mockImplementation(() => ({
            confirmSaveAnnotations: async (callback?: () => Promise<void>) => {
                if (callback) {
                    callback();
                }
            },
            submitAnnotationsMutation: {} as UseSubmitAnnotationsMutationResult,
            setUnfinishedShapeCallback: jest.fn(),
        }));

        render(
            <>
                <ShowConfirmationDialogBeforeNavigation />
                <LocationPathName />
            </>
        );

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        expect(screen.getByLabelText('Pathname')).toHaveTextContent('/');
        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByLabelText('Pathname')).toHaveTextContent('/test');
    });

    it('Asks the user for confirmation when navigating', async () => {
        const confirmSaveAnnotations = jest.fn();
        jest.mocked(useSubmitAnnotations).mockImplementation(() => ({
            confirmSaveAnnotations,
            submitAnnotationsMutation: {} as UseSubmitAnnotationsMutationResult,
            setUnfinishedShapeCallback: jest.fn(),
        }));

        render(
            <>
                <ShowConfirmationDialogBeforeNavigation />
                <LocationPathName />
            </>
        );

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        expect(screen.getByLabelText('Pathname')).toHaveTextContent('/');
        fireEvent.click(screen.getByRole('button'));

        expect(confirmSaveAnnotations).toHaveBeenCalled();
        expect(screen.getByLabelText('Pathname')).toHaveTextContent('/');
    });
});
