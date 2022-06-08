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

import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { verticalDrag } from 'react-beautiful-dnd-tester';

import { Annotation, labelFromUser, ShapeType } from '../../../../../core/annotations';
import { LABEL_BEHAVIOUR } from '../../../../../core/labels';
import { createInMemoryProjectService, DOMAIN } from '../../../../../core/projects';
import { screen, getById, fakeAnnotationToolContext } from '../../../../../test-utils';
import {
    getMockedAnnotation,
    getMockedLabel,
    getMockedProject,
    getMockedTask,
} from '../../../../../test-utils/mocked-items-factory';
import { AnnotationToolProvider, useAnnotationToolContext } from '../../../providers';
import { useTaskChain } from '../../../providers/task-chain-provider/task-chain-provider.component';
import { annotatorRender as render } from '../../../test-utils/annotator-render';
import { ZoomProvider, TransformZoom } from '../../../zoom';
import {
    defaultAnnotationState,
    notSelectedAnnotation,
    selectedAnnotation,
    selectedHiddenAnnotation,
    selectedLockedAnnotation,
} from '../test-utils';
import { AnnotationListContainer } from './annotation-list-container.component';

jest.mock('./../../../providers/task-chain-provider/task-chain-provider.component', () => ({
    ...jest.requireActual('./../../../providers/task-chain-provider/task-chain-provider.component'),
    useTaskChain: jest.fn(),
}));

jest.mock('../../../providers/annotation-tool-provider/annotation-tool-provider.component', () => ({
    ...jest.requireActual('../../../providers/annotation-tool-provider/annotation-tool-provider.component'),
    useAnnotationToolContext: jest.fn(),
}));

describe('Annotation container', (): void => {
    jest.mocked(useAnnotationToolContext).mockImplementation(() => {
        return fakeAnnotationToolContext({});
    });

    const replaceAnnotations = jest.fn();
    const [firstAnnotationState, secondAnnotationState] = defaultAnnotationState;

    const renderAnnotationListContainer = (annotations?: Annotation[]) => {
        jest.mocked(useTaskChain).mockImplementation(() => ({
            inputs: [],
            outputs: annotations ?? defaultAnnotationState,
        }));

        return render(
            <ZoomProvider>
                <TransformZoom>
                    <AnnotationToolProvider>
                        <AnnotationListContainer replaceAnnotations={replaceAnnotations} />
                    </AnnotationToolProvider>
                </TransformZoom>
            </ZoomProvider>
        );
    };

    it('render list of annotations', async () => {
        renderAnnotationListContainer();

        const firstAnnotation = await screen.findByText(/dog/);
        const secondAnnotation = await screen.findByText(/parrot/);

        expect(firstAnnotation).toBeInTheDocument();
        expect(secondAnnotation).toBeInTheDocument();
        expect(replaceAnnotations).not.toHaveBeenCalled();
    });

    it('render list of annotations and drag annotation', async () => {
        renderAnnotationListContainer();
        const firstAnnotation = await screen.findByText(/dog/);
        const secondAnnotation = await screen.findByText(/parrot/);

        expect(firstAnnotation).toBeInTheDocument();
        expect(secondAnnotation).toBeInTheDocument();
        expect(replaceAnnotations).not.toHaveBeenCalled();

        verticalDrag(secondAnnotation).inFrontOf(firstAnnotation);

        expect(replaceAnnotations).toHaveBeenCalledWith([
            { ...secondAnnotationState, zIndex: 0 },
            { ...firstAnnotationState, zIndex: 1 },
        ]);
    });

    describe('Actions menu', () => {
        it('Check if there are buttons above annotations', async () => {
            const { container } = renderAnnotationListContainer();

            await waitFor(() => {
                expect(getById(container, 'annotations-list-select-all')).toBeInTheDocument();
                expect(getById(container, 'annotations-list-delete-selected')).toBeInTheDocument();
                expect(getById(container, 'annotation-selected-annotations-toggle-visibility')).toBeInTheDocument();
                expect(getById(container, 'annotation-selected-annotations-toggle-lock')).toBeInTheDocument();
            });
        });

        describe('Changed behaviour - actions take into account state of selected annotations', () => {
            it('lock button has locked status - first selected annotation is locked, second is not locked', async () => {
                const { container } = renderAnnotationListContainer([
                    { ...selectedAnnotation, zIndex: 0 },
                    { ...selectedLockedAnnotation, zIndex: 1 },
                ]);

                await waitFor(() => {
                    const lockIcon = getById(container, 'annotation-selected-annotations-lock-closed-icon');

                    expect(lockIcon).toBeInTheDocument();
                });
            });
            it('visibility button has hidden status - first selected annotation is hidden, second is visible', async () => {
                const { container } = renderAnnotationListContainer([
                    { ...selectedAnnotation, zIndex: 0 },
                    { ...selectedLockedAnnotation, zIndex: 1 },
                ]);

                await waitFor(() => {
                    const lockIcon = getById(container, 'annotation-selected-annotations-visibility-on-icon');

                    expect(lockIcon).toBeInTheDocument();
                });
            });

            it('select all button is selected when all annotations are selected', async () => {
                const { container } = renderAnnotationListContainer([
                    { ...selectedHiddenAnnotation, zIndex: 0 },
                    { ...selectedAnnotation, zIndex: 1 },
                    { ...selectedLockedAnnotation, zIndex: 2 },
                ]);

                await waitFor(() => {
                    const selectAllCheckbox = getById(container, 'annotations-list-select-all');

                    expect(selectAllCheckbox).toBeChecked();
                });
            });

            it('select all button is not selected when all annotations are not selected', async () => {
                const { container } = renderAnnotationListContainer();

                await waitFor(() => {
                    const selectAllCheckbox = getById(container, 'annotations-list-select-all');

                    expect(selectAllCheckbox).not.toBeChecked();
                });
            });

            it('select all button is indeterminate when some annotations are selected and some are not', async () => {
                const { container } = renderAnnotationListContainer([
                    { ...selectedHiddenAnnotation, zIndex: 0 },
                    { ...selectedAnnotation, zIndex: 1 },
                    { ...notSelectedAnnotation, zIndex: 2 },
                ]);

                await waitFor(() => {
                    const selectAllCheckbox = getById(container, 'annotations-list-select-all');

                    expect(selectAllCheckbox).toHaveAttribute('aria-checked', 'mixed');
                });
            });
        });
    });

    it('does not show global annotations in an anomaly project', async () => {
        const EMPTY_SHAPE = { shapeType: ShapeType.Rect as const, x: 0, y: 0, width: 200, height: 200 };

        const normalLabel = getMockedLabel({
            id: 'normal-label-id',
            name: 'Normal',
            behaviour: LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.GLOBAL,
        });

        const anomalousLabel = getMockedLabel({
            id: 'anomalous-label-id',
            name: 'Anomalous',
            behaviour: LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.ANOMALOUS,
        });

        const tasks = [
            getMockedTask({
                id: 'anomaly-segmentation',
                domain: DOMAIN.ANOMALY_SEGMENTATION,
                labels: [normalLabel, anomalousLabel],
            }),
        ];
        const projectService = createInMemoryProjectService();
        projectService.getProject = async () => {
            return getMockedProject({ tasks });
        };

        const annotationToolContext = fakeAnnotationToolContext({
            tasks,
            selectedTask: tasks[0],
            image: { ...new Image(), ...EMPTY_SHAPE },
        });
        jest.mocked(useAnnotationToolContext).mockImplementation(() => {
            return annotationToolContext;
        });

        const annotations = [
            getMockedAnnotation(
                { id: '1', zIndex: 0, shape: EMPTY_SHAPE, labels: [labelFromUser(anomalousLabel)] },
                ShapeType.Rect
            ),
            getMockedAnnotation({ id: '2', zIndex: 1, labels: [labelFromUser(anomalousLabel)] }, ShapeType.Rect),
        ];

        jest.mocked(useTaskChain).mockImplementation(() => ({
            inputs: [],
            outputs: annotations,
        }));

        render(
            <ZoomProvider>
                <TransformZoom>
                    <AnnotationToolProvider>
                        <AnnotationListContainer replaceAnnotations={replaceAnnotations} />
                    </AnnotationToolProvider>
                </TransformZoom>
            </ZoomProvider>,
            { services: { projectService } }
        );

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });
});
