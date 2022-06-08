// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.
import userEvent from '@testing-library/user-event';

import { applicationRender as render, screen } from '../../../../../../../test-utils';
import { getMockedTreeLabel } from '../../../../../../../test-utils/mocked-items-factory';
import { LabelTreeLabel } from '../../label-tree-view.interface';
import { LabelPresentationMode } from './label-presentation-mode.component';

describe('label menu actions', () => {
    it('Single label or multiple label mode has only edit and delete option', async () => {
        await render(
            <LabelPresentationMode
                label={getMockedTreeLabel({ name: 'test' }) as LabelTreeLabel}
                isHovered={true}
                isEditable={true}
                setEditMode={jest.fn()}
                deleteLabel={jest.fn()}
                addChild={jest.fn()}
                newTree={false}
                isMixedRelation={false}
            />
        );

        expect(screen.getAllByRole('button')).toHaveLength(2);
        expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'edit-label-button' })).toBeInTheDocument();
    });

    it('Check if clicking on delete button calls deleteLabel', async () => {
        const deleteLabelMock = jest.fn();
        const label: LabelTreeLabel = getMockedTreeLabel({ name: 'test' }) as LabelTreeLabel;

        await render(
            <LabelPresentationMode
                label={label}
                isHovered={true}
                isEditable={true}
                setEditMode={jest.fn()}
                deleteLabel={deleteLabelMock}
                addChild={jest.fn()}
                newTree={false}
                isMixedRelation={false}
            />
        );

        userEvent.click(screen.getByRole('button', { name: 'delete' }));
        expect(deleteLabelMock).toHaveBeenCalledWith(label);
    });
});
