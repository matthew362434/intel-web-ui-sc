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

import { ReactNode } from 'react';

import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { createInMemoryAnnotationService, createInmemoryPredictionService } from '../../../../../core/annotations';
import { createInMemoryMediaService } from '../../../../../core/media/services';
import { RequiredProviders } from '../../../../../test-utils';
import { AnnotatorProviders } from '../../../test-utils/annotator-render';
import { useToggleSelectAllKeyboardShortcut } from './use-toggle-select-all-keyboard-shortcut';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => jest.fn(),
}));

jest.mock('../../../../../shared/components/header/settings/use-settings.hook', () => {
    return {
        useSettings: jest.fn(),
    };
});

const wrapper = ({ children }: { children: ReactNode }): JSX.Element => {
    const annotationService = createInMemoryAnnotationService();
    const mediaService = createInMemoryMediaService();
    const predictionService = createInmemoryPredictionService();

    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };

    return (
        <RequiredProviders>
            <AnnotatorProviders
                annotationService={annotationService}
                mediaService={mediaService}
                predictionService={predictionService}
                datasetIdentifier={datasetIdentifier}
            >
                {children}
            </AnnotatorProviders>
        </RequiredProviders>
    );
};

describe('useToggleSelectAllKeyboardShortcut', () => {
    it('should toggleSelectAll with "true" after "selectAll" hotkey is pressed', async () => {
        const toggleSelectAll = jest.fn();

        const { waitForNextUpdate } = renderHook(() => useToggleSelectAllKeyboardShortcut(toggleSelectAll), {
            wrapper,
        });

        await waitForNextUpdate();

        fireEvent.keyDown(document.body, { key: 'a', keyCode: 65, ctrlKey: true });

        expect(toggleSelectAll).toHaveBeenNthCalledWith(1, true);
    });

    it('should toggleSelectAll with "false" after "deselectAll" hotkey is pressed', async () => {
        const toggleSelectAll = jest.fn();

        const { waitForNextUpdate } = renderHook(() => useToggleSelectAllKeyboardShortcut(toggleSelectAll), {
            wrapper,
        });

        await waitForNextUpdate();

        fireEvent.keyDown(document.body, { key: 'd', keyCode: 68, ctrlKey: true });

        expect(toggleSelectAll).toHaveBeenNthCalledWith(1, false);
    });
});
