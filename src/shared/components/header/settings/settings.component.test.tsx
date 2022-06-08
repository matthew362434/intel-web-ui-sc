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

import { useFeatureFlags } from '../../../../hooks/use-feature-flags/use-feature-flags';
import { annotatorRender as render } from '../../../../pages/annotator/test-utils/annotator-render';
import { screen, waitForElementToBeRemoved, fireEvent } from '../../../../test-utils';
import { Settings } from './settings.component';
import { FEATURES, initialConfig, UseSettings } from './use-settings.hook';

jest.mock('../../../../hooks/use-feature-flags/use-feature-flags', () => ({
    useFeatureFlags: jest.fn(() => ({
        ANNOTATOR_SETTINGS: true,
    })),
}));

describe('Settings', () => {
    const mockSettings = {
        config: initialConfig,
        saveConfig: jest.fn(),
        isSavingConfig: false,
    };

    const renderSettingsDialog = async (settings: UseSettings) => {
        await render(<Settings settings={settings} />);

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        fireEvent.click(screen.getByTestId('settings-icon'));
    };

    it('should render a dialog with the correct settings', async () => {
        await renderSettingsDialog(mockSettings);

        const annotationSwitch = screen.getByTestId('annotation-panel-switch-id');
        const countingSwitch = screen.getByTestId('counting-panel-switch-id');

        expect(annotationSwitch).toHaveProperty('checked', true);
        expect(countingSwitch).toHaveProperty('checked', false);
    });

    it('should disable "save" button by default', async () => {
        await renderSettingsDialog(mockSettings);

        const saveButton = screen.getByTestId('save-settings-dialog-id');

        expect(saveButton).toBeDisabled();
    });

    it('should enable "save" button if the user makes changes to the original config', async () => {
        await renderSettingsDialog(mockSettings);

        const saveButton = screen.getByTestId('save-settings-dialog-id');

        expect(saveButton).toBeDisabled();

        const annotationSwitch = screen.getByTestId('annotation-panel-switch-id');

        fireEvent.click(annotationSwitch);

        expect(saveButton).toBeEnabled();
    });

    it('should show the save button with a loading state if it is saving the new config', async () => {
        const mockSettingsLoading = {
            config: initialConfig,
            saveConfig: jest.fn(),
            isSavingConfig: true,
        };

        await renderSettingsDialog(mockSettingsLoading);

        const loadingIndicator = screen.queryByRole('progressbar');

        expect(loadingIndicator).toBeInTheDocument();
    });

    it('should execute saveConfig callback properly', async () => {
        const mockSettingsCallback = {
            config: initialConfig,
            saveConfig: jest.fn(),
            isSavingConfig: false,
        };

        await renderSettingsDialog(mockSettingsCallback);

        const saveButton = screen.getByTestId('save-settings-dialog-id');

        expect(saveButton).toBeDisabled();

        const countingSwitch = screen.getByTestId('counting-panel-switch-id');

        fireEvent.click(countingSwitch);

        expect(saveButton).not.toBeDisabled();
        fireEvent.click(saveButton);

        expect(mockSettingsCallback.saveConfig).toHaveBeenCalledWith({
            [FEATURES.ANNOTATION_PANEL]: {
                title: 'Annotation',
                isEnabled: true,
                tooltipDescription: 'Toggle annotation list on the right sidebar',
            },
            [FEATURES.COUNTING_PANEL]: {
                title: 'Counting',
                isEnabled: true,
                tooltipDescription: 'Toggle counting list on the right sidebar',
            },
        });
    });

    it('should not render anything if the SETTINGS feature flag is disabled', async () => {
        jest.mocked(useFeatureFlags).mockImplementation(() => ({
            DATASET_EXPORT: true,
            DATASET_IMPORT: true,
            ANNOTATOR_SETTINGS: false,
        }));

        await render(<Settings settings={mockSettings} />);

        await waitForElementToBeRemoved(screen.getByRole('progressbar'));

        expect(screen.queryByTestId('settings-icon')).not.toBeInTheDocument();
    });
});
