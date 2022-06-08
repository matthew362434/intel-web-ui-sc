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

import { Annotation, labelFromUser } from '../../../../../core/annotations';
import { fakeAnnotationToolContext, screen, waitForElementToBeRemoved } from '../../../../../test-utils';
import { getMockedAnnotation, getMockedLabel, getMockedTask } from '../../../../../test-utils/mocked-items-factory';
import { annotatorRender as render } from '../../../test-utils/annotator-render';
import { AnnotationListCounting } from './annotation-list-counting.component';

describe('AnnotationListCounting', () => {
    it('should show the number of annotations in front of the title if the current task has only one label', async () => {
        const mockedLabels = [getMockedLabel({ id: 'tree-item-1' })];
        const mockAnnotations: Annotation[] = [
            getMockedAnnotation({
                labels: [labelFromUser(mockedLabels[0])],
            }),
            getMockedAnnotation({
                labels: [labelFromUser(mockedLabels[0])],
            }),
            getMockedAnnotation({
                labels: [labelFromUser(mockedLabels[0])],
            }),
        ];

        const fakeContext = fakeAnnotationToolContext({
            annotations: mockAnnotations,
            tasks: [getMockedTask({ labels: mockedLabels })],
        });

        await render(<AnnotationListCounting annotationToolContext={fakeContext} />);

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        expect(screen.queryByLabelText('annotation-label-count-tree-item-1')).toBeFalsy();
        expect(screen.getByTestId('single-label-count')).toHaveTextContent('3');
    });

    it('should render a labelTreeView with the correct number of annotations per label', async () => {
        const mockedLabels = [
            getMockedLabel({ id: 'tree-item-1' }),
            getMockedLabel({ id: 'tree-item-2' }),
            getMockedLabel({ id: 'tree-item-3' }),
        ];
        const mockAnnotations: Annotation[] = [
            getMockedAnnotation({
                labels: [labelFromUser(mockedLabels[0]), labelFromUser(mockedLabels[1])],
            }),
            getMockedAnnotation({
                labels: [labelFromUser(mockedLabels[2])],
            }),
            getMockedAnnotation({
                labels: [labelFromUser(mockedLabels[0])],
            }),
            getMockedAnnotation({
                labels: [labelFromUser(mockedLabels[0]), labelFromUser(mockedLabels[1])],
            }),
        ];

        const fakeContext = fakeAnnotationToolContext({
            annotations: mockAnnotations,
            tasks: [getMockedTask({ labels: mockedLabels })],
        });

        await render(<AnnotationListCounting annotationToolContext={fakeContext} />);

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        expect(screen.getByLabelText('annotation-label-count-tree-item-1')).toHaveTextContent('3');
        expect(screen.getByLabelText('annotation-label-count-tree-item-2')).toHaveTextContent('2');
        expect(screen.getByLabelText('annotation-label-count-tree-item-3')).toHaveTextContent('1');
    });
});
