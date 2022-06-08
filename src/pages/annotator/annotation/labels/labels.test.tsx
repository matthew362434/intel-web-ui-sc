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

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Annotation, AnnotationLabel, labelFromUser, ShapeType } from '../../../../core/annotations';
import { LABEL_BEHAVIOUR, LABEL_SOURCE } from '../../../../core/labels';
import { DOMAIN, Task } from '../../../../core/projects';
import { fakeAnnotationToolContext } from '../../../../test-utils';
import {
    labels,
    getMockedAnnotation,
    mockedLongLabels,
    getMockedLabel,
    getMockedTask,
} from '../../../../test-utils/mocked-items-factory';
import { useTaskChain } from '../../providers/task-chain-provider/task-chain-provider.component';
import { Labels } from './labels.component';

jest.mock('../../providers/task-chain-provider/task-chain-provider.component', () => ({
    ...jest.requireActual('../../providers/task-chain-provider/task-chain-provider.component'),
    useTaskChain: jest.fn(),
}));

describe('Labels', (): void => {
    jest.mocked(useTaskChain).mockImplementation(() => {
        return { inputs: [], outputs: [] };
    });

    it('Allows to remove an annotation', (): void => {
        const annotation: Annotation = getMockedAnnotation({
            labels: [labelFromUser(labels[0]), labelFromUser(labels[1]), labelFromUser(labels[3])],
        });
        const annotationToolContext = fakeAnnotationToolContext({ annotations: [annotation], labels });

        render(<Labels annotation={annotation} annotationToolContext={annotationToolContext} />);

        expect(screen.getByRole('list')).toHaveAttribute('id', `${annotation.id}-labels`);

        // Should show all the user's labels
        const labelItems = screen.getAllByRole('listitem');
        expect(labelItems).toHaveLength(annotation.labels.length);
        labelItems.forEach((labelItem, idx) => {
            expect(labelItem).toHaveTextContent(annotation.labels[idx].name);
        });

        userEvent.hover(labelItems[0]);
        fireEvent.click(screen.getByRole('button', { name: 'Remove annotation' }));

        expect(annotationToolContext.scene.removeAnnotations).toHaveBeenCalledWith([annotation]);
    });

    it('Does not allow to remove a global annotation', (): void => {
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

        const EMPTY_SHAPE = { shapeType: ShapeType.Rect as const, x: 0, y: 0, width: 200, height: 200 };

        const annotation: Annotation = getMockedAnnotation({
            labels: [labelFromUser(anomalousLabel)],
            shape: EMPTY_SHAPE,
        });
        const annotationToolContext = fakeAnnotationToolContext({
            annotations: [annotation],
            labels,
            tasks,
            selectedTask: tasks[0],
            image: { ...new Image(), ...EMPTY_SHAPE },
        });

        render(<Labels annotation={annotation} annotationToolContext={annotationToolContext} />);

        expect(screen.getByRole('list')).toHaveAttribute('id', `${annotation.id}-labels`);

        // Should show all the user's labels
        const labelItems = screen.getAllByRole('listitem');

        userEvent.hover(labelItems[0]);
        expect(screen.queryByRole('button', { name: 'Remove annotation' })).not.toBeInTheDocument();
    });

    it('Allows removing a global empty label from detection task', (): void => {
        const emptyLabel = getMockedLabel({
            id: 'empty-label-id',
            name: 'Empty',
            behaviour: LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.GLOBAL,
        });

        const tasks = [
            getMockedTask({
                id: 'detection',
                domain: DOMAIN.DETECTION,
                labels: [emptyLabel],
            }),
        ];

        const EMPTY_SHAPE = { shapeType: ShapeType.Rect as const, x: 0, y: 0, width: 200, height: 200 };

        const annotation: Annotation = getMockedAnnotation({
            labels: [labelFromUser(emptyLabel)],
            shape: EMPTY_SHAPE,
        });
        const annotationToolContext = fakeAnnotationToolContext({
            annotations: [annotation],
            labels,
            tasks,
            selectedTask: tasks[0],
            image: { ...new Image(), ...EMPTY_SHAPE },
        });

        render(<Labels annotation={annotation} annotationToolContext={annotationToolContext} />);

        expect(screen.getByRole('list')).toHaveAttribute('id', `${annotation.id}-labels`);

        // Should show all the user's labels
        const labelItems = screen.getAllByRole('listitem');

        userEvent.hover(labelItems[0]);
        expect(screen.getByRole('button', { name: 'Remove annotation' })).toBeInTheDocument();
    });

    it("Allows to change an annotation's labels", () => {
        const annotation: Annotation = getMockedAnnotation({
            labels: [],
        });
        const annotationToolContext = fakeAnnotationToolContext({ annotations: [annotation], labels });

        render(<Labels annotation={annotation} annotationToolContext={annotationToolContext} />);

        expect(screen.getByRole('list')).toHaveAttribute('id', `${annotation.id}-labels`);

        const selectLabel = screen.getByRole('listitem');
        expect(selectLabel).toHaveTextContent('Select label');

        userEvent.hover(selectLabel);
        fireEvent.click(screen.getByRole('button', { name: 'Edit labels' }));

        expect(screen.getAllByRole('listitem')).toHaveLength(11);
        fireEvent.click(screen.getByText(labels[3].name));
        expect(annotationToolContext.scene.addLabel).toHaveBeenCalledWith(expect.objectContaining(labels[3]), [
            annotation.id,
        ]);
    });
    it('check if long label is displayed properly', () => {
        const mockedAnnotationLabels: AnnotationLabel[] = [
            {
                ...mockedLongLabels[0],
                source: {
                    type: LABEL_SOURCE.USER,
                    id: 'annotation-label-id-1',
                },
            },
        ];
        const mockedAnnotation = getMockedAnnotation({ labels: mockedAnnotationLabels });
        const annotationToolContext = fakeAnnotationToolContext({ annotations: [mockedAnnotation], labels });

        render(<Labels annotation={mockedAnnotation} annotationToolContext={annotationToolContext} />);

        expect(screen.getByText(mockedLongLabels[0].name)).toHaveStyle('text-overflow: ellipsis');
        expect(screen.getByText(mockedLongLabels[0].name)).toHaveStyle('maxWidth: 200px');
    });

    it('check if label is shown properly', () => {
        const mockedAnnotationLabels: AnnotationLabel[] = [
            {
                ...getMockedLabel({ name: 'princess' }),
                source: {
                    type: LABEL_SOURCE.USER,
                    id: 'annotation-label-id-1',
                },
            },
        ];
        const mockedAnnotation = getMockedAnnotation({ labels: mockedAnnotationLabels });
        const annotationToolContext = fakeAnnotationToolContext({ annotations: [mockedAnnotation], labels });
        render(<Labels annotation={mockedAnnotation} annotationToolContext={annotationToolContext} />);

        expect(screen.getByText('princess')).toBeInTheDocument();
    });

    describe('Task chain support', () => {
        const [detectionLabel, ...classificationLabels] = labels;
        const detectionLabels = [detectionLabel];

        const tasks: Task[] = [
            {
                id: 'detection',
                title: 'Detection',
                labels: detectionLabels,
                domain: DOMAIN.DETECTION,
            },
            {
                id: 'classification',
                title: 'Classification',
                labels: classificationLabels,
                domain: DOMAIN.CLASSIFICATION,
            },
        ];

        const annotation: Annotation = getMockedAnnotation({
            labels: [
                labelFromUser(detectionLabel),
                labelFromUser(classificationLabels[0]),
                labelFromUser(classificationLabels[3]),
            ],
        });

        it('if all tasks are selected it shows all labels', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [annotation],
                labels,
                tasks,
                selectedTask: null,
            });

            render(<Labels annotation={annotation} annotationToolContext={annotationToolContext} />);

            expect(screen.getByRole('list')).toHaveAttribute('id', `${annotation.id}-labels`);

            const labelItems = screen.getAllByRole('listitem');
            expect(labelItems).toHaveLength(annotation.labels.length);
            labelItems.forEach((labelItem, idx) => {
                expect(labelItem).toHaveTextContent(annotation.labels[idx].name);
            });

            userEvent.hover(labelItems[0]);

            fireEvent.click(screen.getByRole('button', { name: 'Edit labels' }));

            expect(screen.getAllByRole('listitem')).toHaveLength(labels.length);
            fireEvent.click(screen.getByText(labels[3].name));
            expect(annotationToolContext.scene.addLabel).toHaveBeenCalledWith(expect.objectContaining(labels[3]), [
                annotation.id,
            ]);
        });

        it('only shows labels from the currently active task (detection)', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [annotation],
                labels,
                tasks,
                selectedTask: tasks[0],
            });

            render(<Labels annotation={annotation} annotationToolContext={annotationToolContext} />);

            expect(screen.getByRole('list')).toHaveAttribute('id', `${annotation.id}-labels`);

            // The annotation has 1 detection label
            const labelItems = screen.getAllByRole('listitem');
            expect(labelItems).toHaveLength(1);
            expect(labelItems[0]).toHaveTextContent(annotation.labels[0].name);

            userEvent.hover(labelItems[0]);
            fireEvent.click(screen.getByRole('button', { name: 'Edit labels' }));
            expect(screen.getAllByRole('listitem')).toHaveLength(detectionLabels.length);
        });

        it('only shows labels from the currently active task (classification)', () => {
            const annotationToolContext = fakeAnnotationToolContext({
                annotations: [annotation],
                labels,
                tasks,
                selectedTask: tasks[1],
            });

            render(<Labels annotation={annotation} annotationToolContext={annotationToolContext} />);

            expect(screen.getByRole('list')).toHaveAttribute('id', `${annotation.id}-labels`);

            // The annotation has 2 classification label
            const labelItems = screen.getAllByRole('listitem');
            expect(labelItems).toHaveLength(2);
            expect(labelItems[0]).toHaveTextContent(annotation.labels[1].name);
            expect(labelItems[1]).toHaveTextContent(annotation.labels[2].name);

            userEvent.hover(labelItems[0]);
            fireEvent.click(screen.getByRole('button', { name: 'Edit labels' }));
            expect(screen.getAllByRole('listitem')).toHaveLength(classificationLabels.length);
        });
    });

    describe('Anomaly', () => {
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

        it('Shows both normal and anomalous labels for global annotations', () => {
            const annotation: Annotation = getMockedAnnotation({
                shape: EMPTY_SHAPE,
                labels: [],
            });

            const annotationToolContext = fakeAnnotationToolContext({
                image: { ...new Image(), ...EMPTY_SHAPE },
                tasks,
                selectedTask: tasks[0],
                annotations: [annotation],
            });

            render(<Labels annotation={annotation} annotationToolContext={annotationToolContext} />);

            expect(screen.getByRole('list')).toHaveAttribute('id', `${annotation.id}-labels`);

            const selectLabel = screen.getByRole('listitem');
            expect(selectLabel).toHaveTextContent('Select label');

            userEvent.hover(selectLabel);
            fireEvent.click(screen.getByRole('button', { name: 'Edit labels' }));

            expect(screen.getAllByRole('listitem')).toHaveLength(2);
        });

        it('Shows only anomalous label for local annotations', () => {
            const annotation: Annotation = getMockedAnnotation({ labels: [] });

            const annotationToolContext = fakeAnnotationToolContext({
                image: { ...new Image(), ...EMPTY_SHAPE },
                tasks,
                selectedTask: tasks[0],
                annotations: [annotation],
            });

            render(<Labels annotation={annotation} annotationToolContext={annotationToolContext} />);

            expect(screen.getByRole('list')).toHaveAttribute('id', `${annotation.id}-labels`);

            const selectLabel = screen.getByRole('listitem');
            expect(selectLabel).toHaveTextContent('Select label');

            userEvent.hover(selectLabel);
            fireEvent.click(screen.getByRole('button', { name: 'Edit labels' }));

            expect(screen.getAllByRole('listitem')).toHaveLength(1);
            expect(screen.getByRole('listitem')).toHaveTextContent(anomalousLabel.name);
        });
    });
});
