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
import 'jest-canvas-mock';

import { labelFromUser } from '../../../../../core/annotations';
import { DOMAIN } from '../../../../../core/projects';
import {
    fakeAnnotationToolContext,
    fireEvent,
    screen,
    waitFor,
    providersRender as render,
} from '../../../../../test-utils';
import {
    getMockedAnnotation,
    getMockedLabel,
    labels,
    mockedLongLabels,
} from '../../../../../test-utils/mocked-items-factory';
import { useProject } from '../../../../project-details/providers';
import { useTask } from '../../../providers';
import { AnnotationListItemContent } from './annotation-list-item-content.component';

jest.mock('../../../providers/task-provider/task-provider.component', () => ({
    ...jest.requireActual('../../../providers/task-provider/task-provider.component'),
    useTask: jest.fn(() => ({
        labels: [],
        activeDomains: [],
        isTaskChainDomainSelected: jest.fn(),
    })),
}));

jest.mock('../../../../project-details/providers', () => ({
    ...jest.requireActual('../../../../project-details/providers'),
    useProject: jest.fn(() => ({
        project: {
            domains: [],
            tasks: [],
        },
        isSingleDomainProject: jest.fn(),
    })),
}));

describe('Annotation list item content', () => {
    const mockToolContext = fakeAnnotationToolContext({ labels });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('allows the user to add a label by clicking on its content', async () => {
        const annotation = getMockedAnnotation({ labels: [] });
        render(
            <AnnotationListItemContent
                annotation={annotation}
                isHovered={false}
                annotationToolContext={mockToolContext}
            />
        );

        await waitFor(() => {
            screen.getByText('Select label');
        });

        const selectLabel = screen.getByText('Select label');
        expect(selectLabel).toBeInTheDocument();

        fireEvent.click(selectLabel);

        const input = screen.getByRole('textbox', { name: 'Select label' });
        input.focus();
        fireEvent.click(screen.getByText(labels[6].name));

        expect(input).not.toBeInTheDocument();
        expect(mockToolContext.scene.addLabel).toHaveBeenCalled();
    });

    it('allows the user to add a label by double clicking on its content', async () => {
        const annotation = getMockedAnnotation({ labels: [] });

        render(
            <AnnotationListItemContent
                annotation={annotation}
                isHovered={false}
                annotationToolContext={mockToolContext}
            />
        );

        await waitFor(() => {
            screen.getByText('Select label');
        });

        const selectLabel = screen.getByText('Select label');
        expect(selectLabel).toBeInTheDocument();

        fireEvent.doubleClick(selectLabel);

        const input = screen.getByRole('textbox', { name: 'Select label' });
        input.focus();
        fireEvent.click(screen.getByText(labels[6].name));

        expect(input).not.toBeInTheDocument();
        expect(mockToolContext.scene.addLabel).toHaveBeenCalled();
    });

    it('does not allow the user to add a label by clicking on its content if it already has a label', async () => {
        const annotation = getMockedAnnotation({ labels: [labelFromUser(labels[0])] });

        render(
            <AnnotationListItemContent
                annotation={annotation}
                isHovered={false}
                annotationToolContext={mockToolContext}
            />
        );

        await waitFor(() => {
            screen.getByLabelText(`Labels of annotation with id ${annotation.id}`);
        });

        expect(screen.getByLabelText(`Labels of annotation with id ${annotation.id}`)).toHaveTextContent(
            labels[0].name
        );

        const selectLabel = screen.getByText(labels[0].name);
        expect(selectLabel).toBeInTheDocument();

        fireEvent.click(selectLabel);

        expect(screen.queryByRole('textbox', { name: 'Select label' })).not.toBeInTheDocument();
    });

    it('allows the user to add a label using the menu', async () => {
        const annotation = getMockedAnnotation({ labels: [labelFromUser(labels[0])] });

        render(
            <AnnotationListItemContent
                annotation={annotation}
                isHovered={true}
                annotationToolContext={mockToolContext}
            />
        );

        await waitFor(() => {
            screen.getByText(labels[0].name);
        });

        const selectLabel = screen.getByText(labels[0].name);
        expect(selectLabel).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Show actions' }));
        fireEvent.click(screen.getByRole('menuitem', { name: 'Edit labels' }));

        const input = screen.getByRole('textbox', { name: 'Select label' });
        input.focus();
        fireEvent.click(screen.getByText(labels[6].name));

        expect(input).not.toBeInTheDocument();
        expect(mockToolContext.scene.addLabel).toHaveBeenCalled();
    });

    it('allows the user to remove a label', async () => {
        const annotation = getMockedAnnotation({ labels: [labelFromUser(labels[0])] });
        render(
            <AnnotationListItemContent
                annotation={annotation}
                isHovered={true}
                annotationToolContext={mockToolContext}
            />
        );

        await waitFor(() => {
            screen.getByText(labels[0].name);
        });

        const selectLabel = screen.getByText(labels[0].name);
        expect(selectLabel).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Show actions' }));
        fireEvent.click(screen.getByRole('menuitem', { name: 'Edit labels' }));

        const input = screen.getByRole('textbox', { name: 'Select label' });
        input.focus();
        fireEvent.click(screen.getByText(labels[0].name));

        expect(input).not.toBeInTheDocument();
        expect(mockToolContext.scene.removeLabels).toHaveBeenCalled();
    });

    it('too long label should be truncated', async () => {
        const annotation = getMockedAnnotation({ labels: [labelFromUser(mockedLongLabels[0])] });

        render(
            <AnnotationListItemContent
                annotation={annotation}
                isHovered={true}
                annotationToolContext={mockToolContext}
            />
        );

        await waitFor(() => {
            screen.getByText(mockedLongLabels[0].name);
        });

        const labelText = screen.getByText(mockedLongLabels[0].name);

        expect(labelText).toHaveStyle('text-overflow: ellipsis');
        expect(labelText).toHaveStyle('max-width: 200px');
    });

    it('displays a thumbnail for task chain classification tasks', async () => {
        const fakeTasks = [
            { id: 'test-task-1', title: 'test-1', labels: [], domain: DOMAIN.DETECTION },
            { id: 'test-task-2', title: 'test-2', labels: [], domain: DOMAIN.CLASSIFICATION },
        ];
        const fakeSelectedTask = {
            id: 'test-task-2',
            title: 'test-2',
            labels: [],
            domain: DOMAIN.CLASSIFICATION,
        };

        (useTask as jest.Mock).mockImplementation(() => ({
            selectedTask: fakeSelectedTask,
            activeDomains: [],
            isTaskChainDomainSelected: jest.fn(() => true),
        }));

        (useProject as jest.Mock).mockImplementation(() => ({
            isTaskChainProject: true,
            project: {
                tasks: [],
            },
            isSingleDomainProject: jest.fn(),
        }));

        const annotation = getMockedAnnotation({ id: 'test-annotation', labels: [labelFromUser(mockedLongLabels[0])] });
        const context = fakeAnnotationToolContext({
            tasks: fakeTasks,
            selectedTask: fakeSelectedTask,
            image: new Image(100, 100),
        });

        render(<AnnotationListItemContent isHovered={false} annotation={annotation} annotationToolContext={context} />);

        expect(screen.queryByTestId(`annotation-${annotation.id}-thumbnail`)).toBeTruthy();
    });

    it('does not display a thumbnail for non-classification tasks', async () => {
        const annotation = getMockedAnnotation({ id: 'test-annotation', labels: [labelFromUser(mockedLongLabels[0])] });
        const context = fakeAnnotationToolContext({ activeDomains: [DOMAIN.SEGMENTATION] });

        (useTask as jest.Mock).mockImplementation(() => ({
            selectedTask: undefined,
            activeDomains: [],
            isTaskChainDomainSelected: jest.fn(() => false),
        }));

        render(<AnnotationListItemContent isHovered={false} annotation={annotation} annotationToolContext={context} />);

        expect(screen.queryByTestId(`annotation-${annotation.id}-thumbnail`)).toBeFalsy();
    });

    // it('displays the label names separated by chevrons if labels have a parent-child relationship', async () => {
    //     const mockLabels = [
    //         labelFromUser(getMockedLabel({ name: 'label-1', id: 'label-1' })),
    //         labelFromUser(getMockedLabel({ name: 'label-2', id: 'label-2', parentLabelId: 'label-1' })),
    //     ];
    //     const annotation = getMockedAnnotation({ id: 'test-annotation', labels: mockLabels });
    //     const context = fakeAnnotationToolContext({ activeDomains: [] });
    //
    //     render(<AnnotationListItemContent isHovered={false} annotation={annotation} annotationToolContext={context} />);
    //
    //     const caretRight = screen.getByText('caret-right.svg');
    //
    //     expect(screen.queryByText(`${mockLabels[0].name}`)).toBeTruthy();
    //     expect(caretRight).toBeTruthy();
    //     expect(screen.queryByText(', ')).toBeFalsy();
    //     expect(screen.queryByText(`${mockLabels[1].name}`)).toBeTruthy();
    // });

    it('displays the label names separated by commas if labels do not have a parent-child relationship', async () => {
        const mockLabels = [
            labelFromUser(getMockedLabel({ name: 'label-1', id: 'label-1' })),
            labelFromUser(getMockedLabel({ name: 'label-2', id: 'label-2', parentLabelId: undefined })),
        ];
        const annotation = getMockedAnnotation({ id: 'test-annotation', labels: mockLabels });
        const context = fakeAnnotationToolContext({ activeDomains: [] });

        render(<AnnotationListItemContent isHovered={false} annotation={annotation} annotationToolContext={context} />);

        expect(screen.queryByText(`${mockLabels[0].name}`)).toBeTruthy();
        expect(screen.queryByText(',')).toBeTruthy();
        expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(1); // Only the SelectionIndicator is present
        expect(screen.queryByText(`${mockLabels[1].name}`)).toBeTruthy();
    });
});
