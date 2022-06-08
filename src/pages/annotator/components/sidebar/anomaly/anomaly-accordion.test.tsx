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

import { labelFromUser } from '../../../../../core/annotations';
import {
    fakeAnnotationToolContext,
    fireEvent,
    providersRender as render,
    screen,
    within,
} from '../../../../../test-utils';
import { getMockedAnnotation, labels } from '../../../../../test-utils/mocked-items-factory';
import { AnomalyAccordion } from './anomaly-accordion.component';

describe('Anomaly accordion', () => {
    it('allows assigning a label to a media item', () => {
        const annotationToolContext = fakeAnnotationToolContext({
            labels,
            annotations: [getMockedAnnotation({ labels: [] })],
        });

        render(<AnomalyAccordion annotationToolContext={annotationToolContext} />);

        const input = screen.getByRole('textbox', { name: 'Select label' });
        input.focus();

        fireEvent.click(screen.getByText('♣'));

        expect(annotationToolContext.scene.addLabel).toHaveBeenCalled();
    });

    it('updates annotation the annotation if the media item has an annotation', () => {
        const annotationToolContext = fakeAnnotationToolContext({
            labels,
            annotations: [getMockedAnnotation({ labels: [labelFromUser(labels[0])] })],
        });

        render(<AnomalyAccordion annotationToolContext={annotationToolContext} />);

        const input = screen.getByRole('textbox', { name: 'Select label' });
        input.focus();

        fireEvent.click(screen.getByText('♣'));

        expect(annotationToolContext.scene.addLabel).toHaveBeenCalled();
    });

    it('allows removing a label from a media item', () => {
        const annotationToolContext = fakeAnnotationToolContext({
            labels,
            annotations: [
                getMockedAnnotation({
                    labels: [labelFromUser(labels[0]), labelFromUser(labels[1])],
                }),
            ],
        });

        render(<AnomalyAccordion annotationToolContext={annotationToolContext} />);

        fireEvent.click(within(screen.getByLabelText('Classified labels')).getByText(labels[1].name));

        expect(annotationToolContext.scene.removeLabels).toHaveBeenCalled();
    });
});
