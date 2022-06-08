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

import userEvent from '@testing-library/user-event';

import { DOMAIN } from '../../../../core/projects';
import { providersRender as render, screen, fakeAnnotationToolContext, fireEvent } from '../../../../test-utils';
import { labels } from '../../../../test-utils/mocked-items-factory';
import { DefaultLabelCombobox } from './default-label-combobox.component';

describe('Default label combobox', () => {
    const classificationTask = {
        domain: DOMAIN.CLASSIFICATION,
        id: 'classification-id',
        labels,
        title: 'Classification',
    };

    const detectionTask = {
        domain: DOMAIN.DETECTION,
        id: 'detection-id',
        labels,
        title: 'Detection',
    };

    it('renders <LabelSearch /> if the selectedTask doesnt contain a default label', () => {
        const annotationToolContext = fakeAnnotationToolContext({
            labels: classificationTask.labels,
            tasks: [classificationTask],
            selectedTask: classificationTask,
        });

        render(
            <DefaultLabelCombobox
                annotationToolContext={annotationToolContext}
                setDefaultLabel={jest.fn()}
                defaultLabel={null}
            />
        );

        const input = screen.getByRole('textbox', { name: 'Select default label' });
        input.focus();

        expect(screen.getAllByRole('listitem')).toHaveLength(11);

        userEvent.type(input, '♣');

        expect(screen.getAllByRole('listitem')).toHaveLength(3);

        expect(screen.getByText('card')).toBeInTheDocument();
        expect(screen.getByText('black')).toBeInTheDocument();
        expect(screen.getByText('♣')).toBeInTheDocument();
    });

    it('renders <HierarchicalLabelView /> if the selectedTask contains a default label', () => {
        const annotationToolContext = fakeAnnotationToolContext({
            labels: detectionTask.labels,
            tasks: [detectionTask],
            selectedTask: detectionTask,
        });

        render(
            <DefaultLabelCombobox
                annotationToolContext={annotationToolContext}
                setDefaultLabel={jest.fn()}
                defaultLabel={detectionTask.labels[0]}
            />
        );

        expect(screen.getByLabelText('Close hierarchical label view')).toBeInTheDocument();
    });

    it('can remove the default label', () => {
        const annotationToolContext = fakeAnnotationToolContext({
            labels: [detectionTask.labels[0]],
            tasks: [detectionTask],
            selectedTask: detectionTask,
        });
        const mockSetDefaultLabel = jest.fn();

        render(
            <DefaultLabelCombobox
                annotationToolContext={annotationToolContext}
                setDefaultLabel={mockSetDefaultLabel}
                defaultLabel={detectionTask.labels[0]}
            />
        );

        expect(screen.queryByText(detectionTask.labels[0].name)).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Close hierarchical label view'));

        expect(mockSetDefaultLabel).toHaveBeenCalledWith(null);
    });
});
