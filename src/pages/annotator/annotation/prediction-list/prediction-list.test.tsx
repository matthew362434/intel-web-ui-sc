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

import { fireEvent, screen } from '@testing-library/react';

import { Annotation, AnnotationLabel, labelFromModel } from '../../../../core/annotations';
import { ShapeType } from '../../../../core/annotations/shapetype.enum';
import { applicationRender as render, fakeAnnotationToolContext } from '../../../../test-utils';
import { getMockedLabel } from '../../../../test-utils/mocked-items-factory';
import { ProjectProvider } from '../../../project-details/providers';
import { TaskProvider } from '../../providers';
import { PredictionList } from './prediction-list.component';

jest.mock('../../providers/annotation-scene-provider/annotation-scene-provider.component', () => ({
    ...jest.requireActual('../../providers/annotation-scene-provider/annotation-scene-provider.component'),
    useAnnotationScene: jest.fn(() => ({
        hideAnnotation: jest.fn(),
        showAnnotation: jest.fn(),
    })),
}));

describe('Prediction list', () => {
    const annotationToolContext = fakeAnnotationToolContext();
    const shape = { shapeType: ShapeType.Rect, x: 0, y: 10, width: 100, height: 110 } as const;
    const firstLabel: AnnotationLabel = labelFromModel(
        getMockedLabel({ id: 'label-1', color: 'blue', group: 'label-1', name: 'label-1' }),
        1.0
    );
    const secondLabel: AnnotationLabel = labelFromModel(
        getMockedLabel({ id: 'label-2', color: 'red', group: 'label-2', name: 'label-2' }),
        1.0
    );

    const annotation: Annotation = {
        id: 'x',
        labels: [firstLabel, secondLabel],
        shape,
        zIndex: 0,
        isHovered: false,
        isSelected: false,
        isHidden: false,
        isLocked: false,
    };

    const props = {
        annotationToolContext,
        isRejected: jest.fn(),
        rejectAnnotation: jest.fn(),
        acceptAnnotation: jest.fn(),
        hoverAnnotation: jest.fn(),
        hideAnnotation: jest.fn(),
        showAnnotation: jest.fn(),
    };

    it("shows the score of a prediction's labels", async () => {
        await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <TaskProvider>
                    <PredictionList annotations={[annotation]} {...props} />
                </TaskProvider>
            </ProjectProvider>
        );

        const getScore = (score?: number): string | number => (score ? score * 100 : '');

        const caretRight = screen.queryByText('caret-right.svg');

        expect(screen.queryByText(firstLabel.name)).toBeTruthy();
        expect(screen.queryByText(`${getScore(firstLabel.score)}%,`)).toBeTruthy();
        expect(caretRight).toBeFalsy();
        expect(screen.queryByText(secondLabel.name)).toBeTruthy();
        expect(screen.queryByText(`${getScore(secondLabel.score)}%`)).toBeTruthy();
    });

    it('allows to hide an prediction', async () => {
        await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <TaskProvider>
                    <PredictionList annotations={[annotation]} {...props} />
                </TaskProvider>
            </ProjectProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: /hide/ }));
        expect(props.hideAnnotation).toHaveBeenCalled();
    });

    it('allows to show an prediction', async () => {
        await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <TaskProvider>
                    <PredictionList annotations={[{ ...annotation, isHidden: true }]} {...props} />
                </TaskProvider>
            </ProjectProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: /show/ }));
        expect(props.showAnnotation).toHaveBeenCalled();
    });

    it('allows to reject an prediction', async () => {
        await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <TaskProvider>
                    <PredictionList annotations={[annotation]} {...props} />
                </TaskProvider>
            </ProjectProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: /reject/ }));
        expect(props.rejectAnnotation).toHaveBeenCalled();
    });

    it('allows to accept an prediction', async () => {
        props.isRejected.mockImplementation(() => true);

        await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <TaskProvider>
                    <PredictionList annotations={[annotation]} {...props} />
                </TaskProvider>
            </ProjectProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: /accept/ }));
        expect(props.acceptAnnotation).toHaveBeenCalled();
    });
});
