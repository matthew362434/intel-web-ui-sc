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
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { applicationRender as render, getById } from '../../../../../../test-utils';
import { LabelsRelationType } from '../../../select-project-template/utils';
import { LABEL_TREE_TYPE } from '../../label-tree-type.enum';
import { NewLabelTreeLabel } from './new-label-tree-label.component';

describe('NewLabelTreeLabel', () => {
    it('should change color after adding a label', async () => {
        const { container } = await render(
            <NewLabelTreeLabel
                type={LABEL_TREE_TYPE.HIERARCHY}
                labels={[]}
                projectLabels={[]}
                relation={LabelsRelationType.SINGLE_SELECTION}
                addLabel={jest.fn()}
                name={''}
                color={'#ed3300ff'}
                withLabel
            />
        );

        const input = screen.getByLabelText('Label');
        const colorButton = getById(container, 'change-color-button')?.firstElementChild;
        const firstStyling = JSON.stringify(colorButton?.getAttribute('style'));

        userEvent.type(input, 'Test label');
        userEvent.keyboard('{Enter}');

        const secondStyling = JSON.stringify(colorButton?.getAttribute('style'));
        expect(firstStyling).not.toBe(secondStyling);
    });

    it('Change color - it should not add a label', async () => {
        const addLabelHandler = jest.fn();
        await render(
            <NewLabelTreeLabel
                type={LABEL_TREE_TYPE.FLAT}
                labels={[]}
                projectLabels={[]}
                relation={LabelsRelationType.SINGLE_SELECTION}
                addLabel={addLabelHandler}
                name={''}
                color={'#ed3300ff'}
            />
        );

        const colorButton = screen.getByRole('button', { name: 'Color picker button' });
        userEvent.click(colorButton);
        userEvent.click(screen.getByRole('slider', { name: /color/i }));
        expect(addLabelHandler).not.toHaveBeenCalled();
    });
});
