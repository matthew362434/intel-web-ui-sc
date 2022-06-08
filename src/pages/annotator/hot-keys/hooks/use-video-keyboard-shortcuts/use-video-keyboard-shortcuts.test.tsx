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

import { ReactNode } from 'react';

import { fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { createInMemoryAnnotationService, createInmemoryPredictionService } from '../../../../../core/annotations';
import { createInMemoryMediaService } from '../../../../../core/media/services';
import { RequiredProviders } from '../../../../../test-utils';
import { getMockedVideoControls } from '../../../components/video-player/video-controls/test-utils';
import { AnnotatorProviders } from '../../../test-utils/annotator-render';
import { useVideoKeyboardShortcuts } from './use-video-keyboard-shortcuts';

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

describe('useVideoKeyboardShortcuts', () => {
    it('should invoke play callback correctly', async () => {
        const mockedVideoControls = getMockedVideoControls({});
        const { waitForNextUpdate } = renderHook(() => useVideoKeyboardShortcuts(mockedVideoControls), {
            wrapper,
        });

        await waitForNextUpdate();

        fireEvent.keyDown(document.body, { key: 'k', keyCode: 75 });

        expect(mockedVideoControls.play).toHaveBeenCalled();
    });

    it('should invoke pause callback correctly', async () => {
        const mockedVideoControls = getMockedVideoControls({ isPlaying: true });
        const { waitForNextUpdate } = renderHook(() => useVideoKeyboardShortcuts(mockedVideoControls), {
            wrapper,
        });

        await waitForNextUpdate();

        fireEvent.keyDown(document.body, { key: 'k', keyCode: 75 });

        expect(mockedVideoControls.pause).toHaveBeenCalled();
    });

    it('should invoke nextFrame callback correctly', async () => {
        const mockedVideoControls = getMockedVideoControls({ canSelectNext: true });
        const { waitForNextUpdate } = renderHook(() => useVideoKeyboardShortcuts(mockedVideoControls), {
            wrapper,
        });

        await waitForNextUpdate();

        fireEvent.keyDown(document.body, { key: 'ArrowRight', keyCode: 39 });

        expect(mockedVideoControls.next).toHaveBeenCalled();
    });

    it('should invoke previousFrame callback correctly', async () => {
        const mockedVideoControls = getMockedVideoControls({ canSelectPrevious: true });
        const { waitForNextUpdate } = renderHook(() => useVideoKeyboardShortcuts(mockedVideoControls), {
            wrapper,
        });

        await waitForNextUpdate();

        fireEvent.keyDown(document.body, { key: 'ArrowLeft', keyCode: 37 });

        expect(mockedVideoControls.previous).toHaveBeenCalled();
    });

    it('should not invoke callbacks in case of a negative condition', async () => {
        const mockedVideoControls = getMockedVideoControls({
            canSelectPrevious: false,
            canSelectNext: false,
            isPlaying: false,
        });
        const { waitForNextUpdate } = renderHook(() => useVideoKeyboardShortcuts(mockedVideoControls), {
            wrapper,
        });

        await waitForNextUpdate();

        fireEvent.keyDown(document.body, { key: 'k', keyCode: 75 });
        expect(mockedVideoControls.pause).not.toHaveBeenCalled();
        expect(mockedVideoControls.play).toHaveBeenCalled();

        fireEvent.keyDown(document.body, { key: 'ArrowLeft', keyCode: 37 });
        expect(mockedVideoControls.previous).not.toHaveBeenCalled();

        fireEvent.keyDown(document.body, { key: 'ArrowRight', keyCode: 39 });
        expect(mockedVideoControls.next).not.toHaveBeenCalled();
    });
});
