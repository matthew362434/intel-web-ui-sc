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

import { fireEvent, render } from '@testing-library/react';

import { getById } from '../../../../../test-utils';
import { ANNOTATOR_MODE } from '../../../core';
import { AnnotationListItemActions } from './annotation-list-item-actions.component';

describe('Annotation list item actions', () => {
    it('Hide and lock button should be visible when hovered', () => {
        const { container } = render(
            <AnnotationListItemActions
                isHovered
                isLocked={false}
                isHidden={false}
                textColor={''}
                mode={ANNOTATOR_MODE.ANNOTATION}
                annotationId={'test-annotation'}
                changeLock={jest.fn()}
                changeVisibility={jest.fn()}
            />
        );

        const lockButton = getById(container, 'annotation-test-annotation-lock-open-icon');
        expect(lockButton).toBeInTheDocument();
        const visibilityButton = getById(container, 'annotation-test-annotation-toggle-visibility');
        expect(visibilityButton).toBeInTheDocument();
    });

    it('Lock button should be visible when annotation is locked', () => {
        const changeLock = jest.fn();
        const { container } = render(
            <AnnotationListItemActions
                isHovered
                isLocked={false}
                isHidden={false}
                textColor={''}
                mode={ANNOTATOR_MODE.ANNOTATION}
                annotationId={'test-annotation'}
                changeLock={changeLock}
                changeVisibility={jest.fn()}
            />
        );

        const lockOpenButton = getById(container, 'annotation-test-annotation-lock-open-icon');
        expect(lockOpenButton).toBeInTheDocument();
        lockOpenButton && fireEvent.click(lockOpenButton);
        expect(changeLock).toBeCalled();
    });

    it('Not visible button should be available when annotation is hidden and not hovered', () => {
        const { container } = render(
            <AnnotationListItemActions
                isHovered={false}
                isLocked={false}
                textColor={''}
                mode={ANNOTATOR_MODE.ANNOTATION}
                annotationId={'test-annotation'}
                isHidden
                changeLock={jest.fn()}
                changeVisibility={jest.fn}
            />
        );

        const NotVisibleIcon = getById(container, 'annotation-list-item-test-annotation-visibility-off');
        expect(NotVisibleIcon).toBeInTheDocument();
    });
});
