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

import { fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { AnnotationScene } from '../../core';
import { useAnnotationScene } from '../../providers/annotation-scene-provider/annotation-scene-provider.component';
import { useSyncHiddenStateBasedOnRejection, ToggleRejectButton } from './prediction-list-item.component';

jest.mock('../../providers/annotation-scene-provider/annotation-scene-provider.component', () => ({
    useAnnotationScene: jest.fn(),
}));

describe('useSyncHiddenStateBasedOnRejection', () => {
    const mockHideAnnotation = jest.fn();
    const mockShowAnnotation = jest.fn();

    jest.mocked(useAnnotationScene).mockImplementation(
        () =>
            ({
                hideAnnotation: mockHideAnnotation,
                showAnnotation: mockShowAnnotation,
            } as unknown as AnnotationScene)
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('hides annotations if isRejected and !isHidden', () => {
        renderHook(() => useSyncHiddenStateBasedOnRejection(true, false, 'fake-id'));

        expect(mockHideAnnotation).toHaveBeenCalledTimes(1);
        expect(mockShowAnnotation).not.toHaveBeenCalled();
    });

    it('shows annotations if !isRejected and isHidden', () => {
        renderHook(() => useSyncHiddenStateBasedOnRejection(false, true, 'fake-id'));

        expect(mockHideAnnotation).not.toHaveBeenCalled();
        expect(mockShowAnnotation).toHaveBeenCalledTimes(1);
    });

    it('hides annotations if isRejected and !isHidden while having a state equal to the previous state', () => {
        const { rerender } = renderHook(() => useSyncHiddenStateBasedOnRejection(true, false, 'fake-id'));

        // To test the usePrevious
        rerender();

        expect(mockShowAnnotation).not.toHaveBeenCalled();
        expect(mockHideAnnotation).toHaveBeenCalledTimes(2);
    });
});

describe('ToggleRejectButton', () => {
    it('displays the correct label based on rejection status', () => {
        const { rerender } = render(<ToggleRejectButton id='some-id' onPress={jest.fn()} isRejected />);

        expect(screen.queryByLabelText('accept prediction')).toBeInTheDocument();

        rerender(<ToggleRejectButton id='some-id' onPress={jest.fn()} isRejected={false} />);

        expect(screen.queryByLabelText('reject prediction')).toBeInTheDocument();
    });

    it('executes callback correctly', () => {
        const mockOnPress = jest.fn();
        render(<ToggleRejectButton id='some-id' onPress={mockOnPress} isRejected />);

        fireEvent.click(screen.getByLabelText('accept prediction'));

        expect(mockOnPress).toHaveBeenCalled();
    });
});
