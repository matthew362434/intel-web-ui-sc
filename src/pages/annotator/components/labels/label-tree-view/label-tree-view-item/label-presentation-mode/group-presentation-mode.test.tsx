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
import { LabelsRelationType } from '../../../../../../create-project/components/select-project-template/utils';
import { LabelItemEditionState, LabelItemType, LabelTreeGroup } from '../../label-tree-view.interface';
import { GroupPresentationMode } from './group-presentation-mode.component';

describe('Group presentation mode', () => {
    it('Deletion of group calls delete function', async () => {
        const deleteGroupMock = jest.fn();

        const group: LabelTreeGroup = {
            state: LabelItemEditionState.IDLE,
            id: 'test',
            inEditMode: true,
            parentName: null,
            children: [],
            open: false,
            type: LabelItemType.GROUP,
            name: 'group',
            parentLabelId: null,
            relation: LabelsRelationType.MIXED,
        };

        await render(
            <GroupPresentationMode
                group={group}
                isHovered={true}
                isEditable={true}
                setEditMode={jest.fn()}
                deleteGroup={deleteGroupMock}
                addChild={jest.fn()}
                newTree={true}
            />
        );

        userEvent.click(screen.getByRole('button', { name: 'delete' }));

        expect(deleteGroupMock).toBeCalledWith(group);
    });
});
