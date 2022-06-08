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
import { providersRender as render, screen } from '../../../../../../../../test-utils';
import { LabelPresentationModeMenu } from './label-presentation-mode-menu.component';

describe('label presentation mode menu', () => {
    it('label is not hovered - actions are not visible', () => {
        render(
            <LabelPresentationModeMenu
                isHovered={false}
                setEditMode={jest.fn()}
                deleteLabel={jest.fn()}
                addLabel={jest.fn()}
                addGroup={jest.fn()}
            />
        );
        expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('label is hovered - actions are visible', () => {
        render(
            <LabelPresentationModeMenu
                isHovered={true}
                setEditMode={jest.fn()}
                deleteLabel={jest.fn()}
                addLabel={jest.fn()}
                addGroup={jest.fn()}
            />
        );
        expect(screen.queryAllByRole('button')).toHaveLength(4);
    });

    it('do not show addLabel and addGroup', () => {
        render(<LabelPresentationModeMenu isHovered={true} setEditMode={jest.fn()} deleteLabel={jest.fn()} />);
        expect(screen.queryAllByRole('button')).toHaveLength(2);
    });

    it('do not show any optional action - only edition is visible', () => {
        render(<LabelPresentationModeMenu isHovered={true} setEditMode={jest.fn()} />);
        expect(screen.queryAllByRole('button')).toHaveLength(1);
    });
});
