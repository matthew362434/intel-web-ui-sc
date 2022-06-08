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
import { fireEvent, screen, within } from '@testing-library/react';

import { Label } from '../../../../../core/labels';
import { providersRender as render } from '../../../../../test-utils';
import { getMockedLabel, getMockedTreeLabel } from '../../../../../test-utils/mocked-items-factory';
import { UploadLabelSelectorDialog } from './upload-label-selector-dialog.component';

describe('UploadLabelSelectorDialog', () => {
    const mockLabels = [
        getMockedLabel({
            id: 'first',
            color: '#00ff00',
            name: 'first',
            group: 'first-group',
            hotkey: 'ctrl+1',
        }),
        getMockedLabel({
            id: 'second',
            color: '#00ff00',
            name: 'second',
            group: 'second-group',
            hotkey: 'ctrl+1',
        }),
    ];

    const renderUploadLabelDialog = (labels = mockLabels) => {
        return render(
            <UploadLabelSelectorDialog
                isActivated={true}
                onPrimaryAction={jest.fn()}
                onDismiss={jest.fn()}
                onSkipAction={jest.fn()}
                labels={labels}
            />
        );
    };

    it('should list all labels', () => {
        renderUploadLabelDialog();

        const textInput = screen.getByLabelText('Select label');

        expect(screen.getByText('Assign a label to the uploaded images')).toBeInTheDocument();

        fireEvent.focus(textInput);

        expect(screen.getAllByRole('listitem')).toHaveLength(mockLabels.length);
        expect(screen.getByTestId('accept-button-id')).toBeDisabled();
    });

    it('should be able to assign multiple labels', () => {
        const [firstLabel, secondLabel] = mockLabels;

        renderUploadLabelDialog();

        const textInput = screen.getByLabelText('Select label');

        // Trigger LabelSearch and pick the `firstLabel`
        fireEvent.focus(textInput);
        fireEvent.click(screen.getByText(firstLabel.name));

        // Button should now be enabled
        expect(screen.getByTestId('accept-button-id')).toBeEnabled();

        // The container with all the selected labels should now be present
        const selectedLabelsContainer = screen.getByTestId('classified-labels');

        expect(within(selectedLabelsContainer).getByText(firstLabel.name)).toBeInTheDocument();

        // Trigger LabelSearch again and pick the `secondLabel`
        fireEvent.focus(textInput);
        fireEvent.click(screen.getByText(secondLabel.name));

        expect(within(selectedLabelsContainer).getByText(firstLabel.name)).toBeInTheDocument();
        expect(within(selectedLabelsContainer).getByText(secondLabel.name)).toBeInTheDocument();
    });

    it('should be able to toggle label selection', () => {
        const [firstLabel, secondLabel] = mockLabels;

        renderUploadLabelDialog();

        const textInput = screen.getByLabelText('Select label');

        // Trigger LabelSearch and pick the `firstLabel`
        fireEvent.focus(textInput);
        fireEvent.click(screen.getByText(firstLabel.name));

        // Button should now be enabled
        expect(screen.getByTestId('accept-button-id')).toBeEnabled();

        // The container with all the selected labels should now be present
        const selectedLabelsContainer = screen.getByTestId('classified-labels');

        expect(within(selectedLabelsContainer).getByText(firstLabel.name)).toBeInTheDocument();

        // Trigger LabelSearch again and pick the `secondLabel`
        fireEvent.focus(textInput);
        fireEvent.click(screen.getByText(secondLabel.name));

        expect(within(selectedLabelsContainer).getByText(firstLabel.name)).toBeInTheDocument();
        expect(within(selectedLabelsContainer).getByText(secondLabel.name)).toBeInTheDocument();

        fireEvent.click(within(selectedLabelsContainer).getByText(firstLabel.name));
        expect(within(selectedLabelsContainer).queryByText(firstLabel.name)).not.toBeInTheDocument();

        fireEvent.click(within(selectedLabelsContainer).getByText(secondLabel.name));
        expect(within(selectedLabelsContainer).queryByText(secondLabel.name)).not.toBeInTheDocument();
    });

    it('should handle adding/deleting labels with children', () => {
        const mockTeslaLabel = getMockedTreeLabel({
            id: 'tesla',
            color: '#00ff00',
            name: 'tesla',
            group: 'tesla-group',
            hotkey: 'ctrl+3',
            parentLabelId: 'car',
            children: [],
        });

        const mockCarLabel = getMockedTreeLabel({
            id: 'car',
            color: '#00ff00',
            name: 'car',
            group: 'car-group',
            hotkey: 'ctrl+2',
            parentLabelId: 'vehicle',
            children: [mockTeslaLabel],
        });

        const mockVehicleLabel = getMockedTreeLabel({
            id: 'vehicle',
            color: '#00ff00',
            name: 'vehicle',
            group: 'vehicle-group',
            hotkey: 'ctrl+1',
            children: [mockCarLabel],
        });

        const mockLabelsWithChildren = [mockVehicleLabel, mockCarLabel, mockTeslaLabel];

        renderUploadLabelDialog(mockLabelsWithChildren as Label[]);

        const textInput = screen.getByLabelText('Select label');

        // Trigger LabelSearch and pick the third label
        fireEvent.focus(textInput);
        fireEvent.click(screen.getByTestId(`chevron-${mockVehicleLabel.id}`));
        fireEvent.click(screen.getByTestId(`chevron-${mockCarLabel.id}`));
        fireEvent.click(screen.getByText(mockTeslaLabel.name));

        expect(screen.getByTestId('accept-button-id')).toBeEnabled();

        // The container with all the selected labels should now be present
        const selectedLabelsContainer = screen.getByTestId('classified-labels');

        mockLabelsWithChildren.forEach((mockedLabel) => {
            expect(within(selectedLabelsContainer).queryByText(mockedLabel.name)).toBeInTheDocument();
        });

        // Delete the previously added label
        fireEvent.click(within(selectedLabelsContainer).getByText(mockVehicleLabel.name));

        // Verify that the label and its children got removed
        mockLabelsWithChildren.forEach((mockedLabel) => {
            expect(within(selectedLabelsContainer).queryByText(mockedLabel.name)).not.toBeInTheDocument();
        });
    });

    it('should handle adding labels from the same group', () => {
        const mockTeslaLabel = getMockedLabel({
            id: 'tesla',
            color: '#00ff00',
            name: 'tesla',
            group: 'car-group',
            hotkey: 'ctrl+3',
        });

        const mockCarLabel = getMockedLabel({
            id: 'car',
            color: '#00ff00',
            name: 'car',
            group: 'car-group',
            hotkey: 'ctrl+2',
        });

        const mockLabelsOfSameGroup = [mockCarLabel, mockTeslaLabel];

        renderUploadLabelDialog(mockLabelsOfSameGroup);

        const textInput = screen.getByLabelText('Select label');

        // Trigger LabelSearch and pick the third label
        fireEvent.focus(textInput);
        fireEvent.click(screen.getByText(mockTeslaLabel.name));

        expect(screen.getByTestId('accept-button-id')).toBeEnabled();

        // The container with all the selected labels should now be present
        const selectedLabelsContainer = screen.getByTestId('classified-labels');

        expect(within(selectedLabelsContainer).queryByText(mockTeslaLabel.name)).toBeInTheDocument();

        // Try adding the Car label, which has the same group
        fireEvent.focus(textInput);
        fireEvent.click(screen.getByText(mockCarLabel.name));

        // Verify that the previous label from the same group got replace
        expect(within(selectedLabelsContainer).queryByText(mockCarLabel.name)).toBeInTheDocument();
        expect(within(selectedLabelsContainer).queryByText(mockTeslaLabel.name)).not.toBeInTheDocument();
    });
});
