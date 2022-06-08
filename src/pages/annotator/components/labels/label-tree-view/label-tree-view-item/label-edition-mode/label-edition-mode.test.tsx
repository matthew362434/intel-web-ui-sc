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

import { Label } from '../../../../../../../core/labels';
import { MORE_THAN_100_CHARS_NAME, providersRender as render, screen } from '../../../../../../../test-utils';
import { getMockedLabel } from '../../../../../../../test-utils/mocked-items-factory';
import { LabelsRelationType } from '../../../../../../create-project/components/select-project-template/utils';
import { LabelItemEditionState, LabelItemType, LabelTreeLabel } from '../../label-tree-view.interface';
import { DEFAULT_GROUP_NAME } from '../../utils';
import { LabelEditionMode } from './label-edition-mode.component';

describe('label edition', () => {
    const label: LabelTreeLabel = {
        open: false,
        inEditMode: true,
        children: [],
        state: LabelItemEditionState.IDLE,
        relation: LabelsRelationType.MULTI_SELECTION,
        type: LabelItemType.LABEL,
        ...(getMockedLabel({ name: 'apple', group: 'default group', hotkey: 'control+a+f' }) as Label),
    };

    it('check if edited name has visible new value', () => {
        render(
            <LabelEditionMode
                label={label}
                finishEdition={jest.fn()}
                projectLabels={[]}
                save={jest.fn()}
                relation={LabelsRelationType.SINGLE_SELECTION}
            />
        );
        const nameField = screen.getByRole('textbox', { name: 'edited name' });

        userEvent.type(nameField, ' test');
        expect(nameField).toHaveValue('apple test');
    });

    it('check if name is limited to 100 chars in label edition', () => {
        render(
            <LabelEditionMode
                label={label}
                finishEdition={jest.fn()}
                projectLabels={[]}
                save={jest.fn()}
                relation={LabelsRelationType.SINGLE_SELECTION}
            />
        );
        const nameField = screen.getByRole('textbox', { name: 'edited name' });

        userEvent.clear(nameField);
        userEvent.type(nameField, MORE_THAN_100_CHARS_NAME);
        expect(nameField).toHaveValue(MORE_THAN_100_CHARS_NAME.substring(0, 100));
    });

    it('check if edited hotkey has visible new value', () => {
        render(
            <LabelEditionMode
                label={label}
                finishEdition={jest.fn()}
                projectLabels={[]}
                save={jest.fn()}
                relation={LabelsRelationType.SINGLE_SELECTION}
            />
        );
        const hotkeyField = screen.getByRole('textbox', { name: 'edited hotkey' });
        expect(hotkeyField).toHaveValue('control+a+f');

        userEvent.click(hotkeyField);
        expect(hotkeyField).toHaveAttribute('placeholder', 'Press keys');

        userEvent.type(hotkeyField, 'sd');
        expect(hotkeyField).toHaveValue('s+d');
    });

    it('check if hotkey is limited to 2 keys', () => {
        render(
            <LabelEditionMode
                label={label}
                finishEdition={jest.fn()}
                projectLabels={[]}
                save={jest.fn()}
                relation={LabelsRelationType.SINGLE_SELECTION}
            />
        );
        const hotkeyField = screen.getByRole('textbox', { name: 'edited hotkey' });

        userEvent.type(hotkeyField, 'qwer');
        expect(hotkeyField).toHaveValue('e+r');
    });

    it('check if hotkey value stays after gaining and loosing focus without any changes', () => {
        render(
            <LabelEditionMode
                label={label}
                finishEdition={jest.fn()}
                projectLabels={[]}
                save={jest.fn()}
                relation={LabelsRelationType.SINGLE_SELECTION}
            />
        );
        const hotkeyField = screen.getByRole('textbox', { name: 'edited hotkey' });
        const nameField = screen.getByRole('textbox', { name: 'edited name' });
        userEvent.type(hotkeyField, 'wer');
        expect(hotkeyField).toHaveValue('e+r');
        userEvent.click(nameField);
        expect(hotkeyField).toHaveValue('e+r');
        userEvent.click(hotkeyField);
        expect(hotkeyField).toHaveAttribute('placeholder', 'Press keys');
        userEvent.click(nameField);
        expect(hotkeyField).toHaveValue('e+r');
    });

    it('Check group name of new label from single label project', () => {
        let labelValues: LabelTreeLabel | undefined;
        const saveMock = (editedLabel?: LabelTreeLabel) => {
            labelValues = editedLabel;
        };

        render(
            <LabelEditionMode
                finishEdition={jest.fn()}
                projectLabels={[]}
                save={saveMock}
                relation={LabelsRelationType.SINGLE_SELECTION}
            />
        );

        userEvent.type(screen.getByRole('textbox', { name: 'edited name' }), 'Test label');
        userEvent.keyboard('[Enter]');
        expect(labelValues).toBeTruthy();
        labelValues && expect(labelValues.group).toBe(DEFAULT_GROUP_NAME);
    });

    it('Check group name of new label from multi label project', () => {
        let labelValues: LabelTreeLabel | undefined;
        const saveMock = (editedLabel?: LabelTreeLabel) => {
            labelValues = editedLabel;
        };

        const name = 'Test label';

        render(
            <LabelEditionMode
                finishEdition={jest.fn()}
                projectLabels={[]}
                save={saveMock}
                relation={LabelsRelationType.MULTI_SELECTION}
            />
        );

        userEvent.type(screen.getByRole('textbox', { name: 'edited name' }), name);
        userEvent.keyboard('[Enter]');
        expect(labelValues).toBeTruthy();
        labelValues && expect(labelValues.group).toBe(name);
    });

    it('Empty label - cancel deletes it', async () => {
        const finishEditionMock = jest.fn();
        const saveMock = jest.fn();
        await render(
            <LabelEditionMode
                projectLabels={[]}
                save={saveMock}
                finishEdition={finishEditionMock}
                relation={LabelsRelationType.SINGLE_SELECTION}
            />
        );

        userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(saveMock).toHaveBeenCalledWith();
        expect(finishEditionMock).toHaveBeenCalled();
    });
});
