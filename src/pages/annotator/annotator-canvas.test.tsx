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

import { render, screen } from '@testing-library/react';

import { Annotation, labelFromUser } from '../../core/annotations';
import { ShapeType } from '../../core/annotations/shapetype.enum';
import { LABEL_BEHAVIOUR } from '../../core/labels';
import { DOMAIN, Task } from '../../core/projects';
import { fakeAnnotationToolContext, getById } from '../../test-utils';
import {
    getMockedAnnotation,
    getMockedImageMediaItem,
    getMockedLabel,
    getMockedTask,
    labels,
} from '../../test-utils/mocked-items-factory';
import { AnnotatorCanvas } from './annotator-canvas.component';
import { ANNOTATOR_MODE } from './core';
import { AnnotationSceneProvider } from './providers';
import { useTaskChain } from './providers/task-chain-provider/task-chain-provider.component';
import { useZoom } from './zoom';

jest.mock('./providers/task-chain-provider/task-chain-provider.component', () => ({
    useTaskChain: jest.fn(),
}));

jest.mock('./zoom', () => ({
    useZoom: jest.fn(),
}));

jest.mock('./providers/prediction-provider/prediction-provider.component', () => ({
    ...jest.requireActual('./providers/prediction-provider/prediction-provider.component'),
    usePrediction: jest.fn(() => ({
        maps: [],
        isInferenceMapVisible: true,
        inferenceMapOpacity: 50,
        selectedInferenceMap: {
            id: '1',
            labelsId: '1',
            name: 'Test name',
            type: 'Test type',
            url: 'https://fakeimage.url/',
        },
    })),
}));

describe('Annotator canvas', (): void => {
    const annotations: Annotation[] = [
        {
            id: 'rect-1',
            zIndex: 0,
            labels: [labelFromUser(labels[0]), labelFromUser(labels[1]), labelFromUser(labels[3])],
            shape: { shapeType: ShapeType.Rect, x: 0, y: 0, width: 10, height: 10 },
            isHovered: false,
            isSelected: false,
            isHidden: false,
            isLocked: false,
        },
        {
            id: 'rect-2',
            zIndex: 1,
            labels: [labelFromUser(labels[0])],
            shape: { shapeType: ShapeType.Rect, x: 30, y: 30, width: 10, height: 10 },
            isHovered: false,
            isSelected: false,
            isHidden: false,
            isLocked: false,
        },
    ];

    const selectedMediaItem = getMockedImageMediaItem({});

    beforeEach(() => {
        (useZoom as jest.Mock).mockImplementation(() => ({
            setZoomTarget: jest.fn(),
        }));

        jest.mocked(useTaskChain).mockImplementation(() => ({
            inputs: [],
            outputs: annotations,
        }));
    });

    it('renders the annotator canvas', (): void => {
        const tasks = [getMockedTask({ domain: DOMAIN.SEGMENTATION })];
        const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks });
        const { container } = render(
            <AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />
        );

        const image = container.querySelector('image');
        expect(image).toHaveAttribute('href', 'test-src');
        expect(image).toHaveAttribute('id', 'image-test-image');

        const canvasAnnotations = screen.getByLabelText('annotations').querySelectorAll('rect, circle, polygon');
        expect(canvasAnnotations).toHaveLength(annotationToolContext.scene.annotations.length);
    });

    it('does not show annotation tools for a classification task', () => {
        const tasks: Task[] = [getMockedTask({ labels, domain: DOMAIN.CLASSIFICATION })];
        const selectedTask = tasks[0];
        const annotationToolContext = fakeAnnotationToolContext({
            annotations: [{ ...annotations[0], isSelected: true }],
            tasks,
            selectedTask,
        });

        jest.mocked(useTaskChain).mockImplementation(() => ({
            inputs: [],
            outputs: annotationToolContext.scene.annotations,
        }));

        render(<AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />);

        expect(screen.queryByRole('editor')).not.toBeInTheDocument();

        // The annotation's labels are shown
        expect(screen.getByText(labels[0].name)).toBeInTheDocument();
        expect(screen.getByText(labels[1].name)).toBeInTheDocument();
        expect(screen.getByText(labels[3].name)).toBeInTheDocument();
    });

    it('does not show annotation tools for a anomaly classification', () => {
        const tasks: Task[] = [getMockedTask({ labels, domain: DOMAIN.ANOMALY_CLASSIFICATION })];
        const selectedTask = tasks[0];
        const annotationToolContext = fakeAnnotationToolContext({
            annotations: [{ ...annotations[0], isSelected: true }],
            tasks,
            selectedTask,
        });

        jest.mocked(useTaskChain).mockImplementation(() => ({
            inputs: [],
            outputs: annotationToolContext.scene.annotations,
        }));

        render(<AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />);

        expect(screen.queryByRole('editor')).not.toBeInTheDocument();

        // The annotation's labels are shown
        expect(screen.getByText(labels[0].name)).toBeInTheDocument();
        expect(screen.getByText(labels[1].name)).toBeInTheDocument();
        expect(screen.getByText(labels[3].name)).toBeInTheDocument();
    });

    it('renders inference map image with opacity in prediction mode', (): void => {
        const tasks = [getMockedTask({ domain: DOMAIN.SEGMENTATION })];
        const annotationToolContext = fakeAnnotationToolContext({
            mode: ANNOTATOR_MODE.PREDICTION,
            tasks,
        });

        const { container } = render(
            <AnnotationSceneProvider annotations={[]} labels={labels}>
                <AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />
            </AnnotationSceneProvider>
        );

        const inferenceMapImage = getById(container, 'inference-map-image');
        expect(inferenceMapImage).toBeInTheDocument();
        expect(inferenceMapImage).toHaveStyle('opacity: 0.5');
    });

    it('hides the shapes of global annotations', () => {
        const emptyLabel = getMockedLabel({
            name: 'Empty',
            behaviour: LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.EXCLUSIVE,
        });
        const tasks: Task[] = [getMockedTask({ domain: DOMAIN.SEGMENTATION, labels: [emptyLabel] })];
        const selectedTask = tasks[0];
        const roi = { x: 0, y: 0, width: 1000, height: 1000 };
        const image = new Image();

        const annotationId = 'test-annotation';
        const annotationToolContext = fakeAnnotationToolContext({
            annotations: [
                getMockedAnnotation({
                    id: annotationId,
                    labels: [labelFromUser(emptyLabel)],
                    shape: { shapeType: ShapeType.Rect, ...roi },
                    isSelected: false,
                }),
            ],
            tasks,
            selectedTask,
            image: { ...image, ...roi },
        });

        jest.mocked(useTaskChain).mockImplementation(() => ({
            inputs: [],
            outputs: annotationToolContext.scene.annotations,
        }));

        const { container } = render(
            <AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />
        );
        expect(getById(container, `annotations-canvas-${annotationId}-shape`)).toBeNull();
    });

    describe("Showing a mask for a task's input", () => {
        const domains = [
            DOMAIN.CLASSIFICATION,
            DOMAIN.DETECTION,
            DOMAIN.SEGMENTATION,
            DOMAIN.ANOMALY_CLASSIFICATION,
            DOMAIN.ANOMALY_DETECTION,
            DOMAIN.ANOMALY_SEGMENTATION,
        ];

        it.each(domains)('does not show a mask for single %o task projects', (domain) => {
            const tasks = [getMockedTask({ id: 'task', domain })];
            const selectedTask = tasks[0];

            const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks, selectedTask });
            render(
                <AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />
            );

            expect(screen.queryByLabelText(/Annotation mask/i)).not.toBeInTheDocument();
        });

        it('does not shows a mask for when the no task is selected', () => {
            const tasks = [
                getMockedTask({ id: 'detection', domain: DOMAIN.DETECTION }),
                getMockedTask({ id: 'second-task', domain: DOMAIN.CLASSIFICATION }),
            ];

            const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks, selectedTask: null });
            render(
                <AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />
            );

            expect(screen.queryByLabelText(/Annotation mask/i)).not.toBeInTheDocument();
        });

        it('does not shows a mask for when the the first task is selected', () => {
            const tasks = [
                getMockedTask({ id: 'detection', domain: DOMAIN.DETECTION }),
                getMockedTask({ id: 'second-task', domain: DOMAIN.CLASSIFICATION }),
            ];

            const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks, selectedTask: tasks[0] });
            render(
                <AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />
            );

            expect(screen.queryByLabelText(/Annotation mask/i)).not.toBeInTheDocument();
        });

        it.each(domains)('shows a mask for when the second task %o in a task chain project is selected', (domain) => {
            const tasks = [
                getMockedTask({ id: 'detection', domain: DOMAIN.DETECTION }),
                getMockedTask({ id: 'second-task', domain }),
            ];

            const annotationToolContext = fakeAnnotationToolContext({ annotations, tasks, selectedTask: tasks[1] });
            render(
                <AnnotatorCanvas annotationToolContext={annotationToolContext} selectedMediaItem={selectedMediaItem} />
            );

            expect(screen.getByLabelText(/Annotation mask/i)).toBeInTheDocument();
        });
    });
});
