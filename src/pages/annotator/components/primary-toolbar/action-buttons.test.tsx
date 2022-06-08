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

import { fireEvent } from '@testing-library/react';
import { TransformComponent } from 'react-zoom-pan-pinch';

import { labelFromUser } from '../../../../core/annotations';
import { DOMAIN } from '../../../../core/projects';
import { fakeAnnotationToolContext, getById, providersRender as render } from '../../../../test-utils';
import {
    getMockedAnnotation,
    getMockedTask,
    labels as mockedLabels,
} from '../../../../test-utils/mocked-items-factory';
import { AnnotationToolContext } from '../../core';
import { AnnotationSceneProvider, useAnnotationScene } from '../../providers';
import { ZoomProvider } from '../../zoom';
import { ActionButtons } from './action-buttons.component';

// Used  fitImageToScreen button
jest.mock('../../providers/annotator-provider/annotator-provider.component', () => ({
    useAnnotator: () => {
        return {
            image: { width: 100, height: 100 },
        };
    },
}));

describe('Action buttons', () => {
    const App = ({ annotationToolContext }: { annotationToolContext: AnnotationToolContext }) => {
        const scene = useAnnotationScene();
        return (
            <ActionButtons
                annotationToolContext={{
                    ...annotationToolContext,
                    scene,
                }}
            />
        );
    };

    it('toggles visibility of annotations', () => {
        const annotationToolContext = fakeAnnotationToolContext({
            annotations: [
                getMockedAnnotation({ id: '1', isHidden: false }),
                getMockedAnnotation({ id: '2', isHidden: false }),
            ],
        });

        const { container } = render(
            <AnnotationSceneProvider
                annotations={annotationToolContext.scene.annotations}
                labels={annotationToolContext.scene.labels}
            >
                <ZoomProvider>
                    <App annotationToolContext={annotationToolContext} />
                    <TransformComponent>{''}</TransformComponent>
                </ZoomProvider>
            </AnnotationSceneProvider>
        );

        const visibilityButton = getById(container, 'annotation-all-annotations-toggle-visibility');
        expect(visibilityButton).toBeInTheDocument();
        visibilityButton && fireEvent.click(visibilityButton);

        expect(visibilityButton).toHaveAttribute('aria-pressed', 'true');

        visibilityButton && fireEvent.click(visibilityButton);
        expect(visibilityButton).toHaveAttribute('aria-pressed', 'false');
    });

    describe('task chain aware', () => {
        it('bases its state on the output from the current task', () => {
            const [firstLabel, ...otherLabels] = mockedLabels;
            const tasks = [
                getMockedTask({ id: '1', domain: DOMAIN.DETECTION, labels: [firstLabel] }),
                getMockedTask({ id: '2', domain: DOMAIN.SEGMENTATION, labels: otherLabels }),
            ];
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [
                    getMockedAnnotation({
                        id: '1',
                        isHidden: false,
                        labels: [labelFromUser(firstLabel)],
                        isSelected: true,
                    }),
                    getMockedAnnotation({ id: '2', isHidden: true, labels: [labelFromUser(otherLabels[0])] }),
                ],
                labels: mockedLabels,
                tasks,
                selectedTask: tasks[1],
            });

            const { container } = render(
                <AnnotationSceneProvider
                    annotations={annotationToolContext.scene.annotations}
                    labels={annotationToolContext.scene.labels}
                >
                    <ZoomProvider>
                        <App annotationToolContext={annotationToolContext} />
                        <TransformComponent>{''}</TransformComponent>
                    </ZoomProvider>
                </AnnotationSceneProvider>
            );

            const visibilityButton = getById(container, 'annotation-all-annotations-toggle-visibility');
            expect(visibilityButton).toBeInTheDocument();
            visibilityButton && fireEvent.click(visibilityButton);

            // Since the second task's annotations are all hidden the button should not
            // have a pressed state (i.e. it should show annotations when pressed)
            expect(visibilityButton).toHaveAttribute('aria-pressed', 'false');

            visibilityButton && fireEvent.click(visibilityButton);
            expect(visibilityButton).toHaveAttribute('aria-pressed', 'true');
        });
    });
});
