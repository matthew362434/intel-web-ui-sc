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

import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { fakeAnnotationToolContext, getById, waitFor } from '../../../../../test-utils';
import { getMockedAnnotation, labels } from '../../../../../test-utils/mocked-items-factory';
import { ProjectProvider } from '../../../../project-details/providers';
import { AnnotationSceneProvider, TaskProvider } from '../../../providers';
import { annotationItemRender as render } from '../test-utils';
import { AnnotationListItem } from './annotation-list-item.component';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => ({
        pathname: '',
    }),
}));

describe('annotation list item', () => {
    const mockToolContext = fakeAnnotationToolContext({ labels });

    it('check if not visible annotation has proper button', async () => {
        const mockAnnotationHidden = getMockedAnnotation({ id: 'test-annotation-1', isHidden: true }, ShapeType.Rect);
        const mockAnnotationShown = getMockedAnnotation({ id: 'test-annotation-2' }, ShapeType.Rect);

        const { container } = await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <TaskProvider>
                    <AnnotationSceneProvider annotations={[mockAnnotationHidden, mockAnnotationShown]} labels={[]}>
                        <AnnotationListItem annotation={mockAnnotationHidden} annotationToolContext={mockToolContext} />
                    </AnnotationSceneProvider>
                </TaskProvider>
            </ProjectProvider>
        );

        await waitFor(() => {
            getById(container, 'annotation-list-item-test-annotation-1-visibility-off');
        });

        const visibilityOffFirstAnnotation = getById(
            container,
            'annotation-list-item-test-annotation-1-visibility-off'
        );
        const visibilityOffSecondAnnotation = getById(
            container,
            'annotation-list-item-test-annotation-2-visibility-off'
        );

        expect(visibilityOffFirstAnnotation).toBeInTheDocument();
        expect(visibilityOffSecondAnnotation).not.toBeInTheDocument();
    });

    it('check if locked annotation has proper button', async () => {
        const mockAnnotationLocked = getMockedAnnotation({ id: 'test-annotation-1', isLocked: true }, ShapeType.Rect);
        const mockAnnotationUnlocked = getMockedAnnotation({ id: 'test-annotation-2' }, ShapeType.Rect);

        const { container } = await render(
            <ProjectProvider projectIdentifier={{ workspaceId: 'workspace-id', projectId: 'project-id' }}>
                <TaskProvider>
                    <AnnotationSceneProvider annotations={[mockAnnotationLocked, mockAnnotationUnlocked]} labels={[]}>
                        <AnnotationListItem annotation={mockAnnotationLocked} annotationToolContext={mockToolContext} />
                    </AnnotationSceneProvider>
                </TaskProvider>
            </ProjectProvider>
        );

        const lockFirstAnnotation = getById(container, 'annotation-test-annotation-1-lock-closed-icon');
        const lockSecondAnnotation = getById(container, 'annotation-test-annotation-2-lock-closed-icon');

        expect(lockFirstAnnotation).toBeInTheDocument();
        expect(lockSecondAnnotation).not.toBeInTheDocument();
    });
});
