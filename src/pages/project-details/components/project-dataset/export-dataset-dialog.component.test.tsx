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

import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { useOverlayTriggerState } from '@react-stately/overlays';
import { render, RenderResult, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DOMAIN, ExportFormats } from '../../../../core/projects';
import { NOTIFICATION_TYPE } from '../../../../notification';
import { getMockedProject } from '../../../../test-utils/mocked-items-factory';
import { ProjectContextProps, useProject } from '../../providers';
import {
    ANOMALY_MESSAGE,
    CLASSIFICATION_MESSAGE,
    ExportDatasetDialog,
    ROTATED_BOUNDING_MESSAGE,
    TASK_CHAIN_MESSAGE,
} from './export-dataset-dialog.component';

jest.mock('../../providers', () => ({
    ...jest.requireActual('../../providers'),
    useProject: jest.fn(),
}));

const mockDatasetId = '321';
const mockWorkspaceId = '123';
jest.mock('../../../annotator/hooks/use-dataset-identifier.hook', () => ({
    ...jest.requireActual('../../../annotator/hooks/use-dataset-identifier.hook'),
    useDatasetIdentifier: () => ({ workspaceId: mockWorkspaceId, datasetId: mockDatasetId }),
}));

const mockAddNotification = jest.fn();
jest.mock('../../../../notification', () => ({
    ...jest.requireActual('../../../../notification'),
    useNotification: () => ({ addNotification: mockAddNotification }),
}));

const mockhasLocalstorageDataset = jest.fn();
jest.mock('../../hooks/use-local-storage-export-dataset.hook', () => ({
    ...jest.requireActual('../../hooks/use-local-storage-export-dataset.hook'),
    useLocalStorageExportDataset: () => ({
        hasLocalstorageDataset: mockhasLocalstorageDataset,
    }),
}));

describe('ExportDatasetDialog', () => {
    const mockOnAction = jest.fn();

    const renderApp = async (domains: DOMAIN[], isTaskChainProject = false): Promise<RenderResult> => {
        jest.mocked(useProject).mockImplementation(() => {
            return {
                project: getMockedProject({
                    domains,
                }),
                isTaskChainProject,
            } as unknown as ProjectContextProps;
        });
        const App = () => {
            const exportDialogState = useOverlayTriggerState({});
            return (
                <>
                    <button onClick={() => exportDialogState.open()}>open dialog</button>
                    <Provider theme={defaultTheme}>
                        <ExportDatasetDialog triggerState={exportDialogState} onAction={mockOnAction} />
                    </Provider>
                </>
            );
        };
        const component = await render(<App />);
        userEvent.click(screen.getByText('open dialog'));

        return component;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('call onAction upon clicking Export', async () => {
        await renderApp([DOMAIN.DETECTION]);
        expect(screen.queryByRole('dialog')).toBeInTheDocument();
        expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
        userEvent.click(screen.getByText(ExportFormats.VOC));
        userEvent.click(screen.getByText('Export'));

        expect(mockOnAction).toHaveBeenCalledWith({
            datasetId: mockDatasetId,
            workspaceId: mockWorkspaceId,
            exportFormat: ExportFormats.VOC,
        });
    });

    it('close dialog and shows a warning when there is dataset info in local storage', async () => {
        mockhasLocalstorageDataset.mockReturnValueOnce(() => true);
        await renderApp([DOMAIN.DETECTION]);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(mockAddNotification).toHaveBeenCalledWith(expect.any(String), NOTIFICATION_TYPE.WARNING);
    });

    it('close upon clicking Cancel', async () => {
        await renderApp([DOMAIN.DETECTION]);
        expect(screen.queryByRole('dialog')).toBeInTheDocument();
        userEvent.click(screen.getByText(ExportFormats.COCO));
        userEvent.click(screen.getByText('Cancel'));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('reset config after closing', async () => {
        await renderApp([DOMAIN.DETECTION]);
        //selects an option and close the dialog
        userEvent.click(screen.getByText(ExportFormats.COCO));
        expect(screen.getByRole('button', { name: 'Export' })).not.toBeDisabled();
        userEvent.click(screen.getByText('Cancel'));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        //Reopen dialog
        userEvent.click(screen.getByText('open dialog'));
        expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled();
    });

    describe('render export options', () => {
        it('detection bounding box', async () => {
            await renderApp([DOMAIN.DETECTION]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).toBeInTheDocument();
        });

        it('detection oriented', async () => {
            await renderApp([DOMAIN.DETECTION_ROTATED_BOUNDING_BOX]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).toBeInTheDocument();
        });

        it('segmentation semantic', async () => {
            await renderApp([DOMAIN.SEGMENTATION]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).not.toBeInTheDocument();
        });

        it('segmentation instance', async () => {
            await renderApp([DOMAIN.SEGMENTATION_INSTANCE]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).not.toBeInTheDocument();
        });

        it('classification', async () => {
            await renderApp([DOMAIN.CLASSIFICATION]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).not.toBeInTheDocument();
        });

        it('anomaly classification', async () => {
            await renderApp([DOMAIN.ANOMALY_CLASSIFICATION]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).not.toBeInTheDocument();
        });

        it('anomaly detection', async () => {
            await renderApp([DOMAIN.ANOMALY_DETECTION]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).not.toBeInTheDocument();
        });

        it('anomaly segmentation', async () => {
            await renderApp([DOMAIN.ANOMALY_SEGMENTATION]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).not.toBeInTheDocument();
        });

        it('detection classification', async () => {
            await renderApp([DOMAIN.DETECTION, DOMAIN.CROP, DOMAIN.CLASSIFICATION]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).not.toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).not.toBeInTheDocument();
        });

        it('detection segmentation', async () => {
            await renderApp([DOMAIN.DETECTION, DOMAIN.CROP, DOMAIN.SEGMENTATION]);
            expect(screen.queryByText(ExportFormats.VOC)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.COCO)).toBeInTheDocument();
            expect(screen.queryByText(ExportFormats.YOLO)).not.toBeInTheDocument();
        });
    });

    describe('warning messages', () => {
        it('detection rotated bounding box', async () => {
            await renderApp([DOMAIN.DETECTION_ROTATED_BOUNDING_BOX]);

            expect(screen.queryByText(ROTATED_BOUNDING_MESSAGE)).toBeInTheDocument();
            expect(screen.queryByText(ANOMALY_MESSAGE)).not.toBeInTheDocument();
            expect(screen.queryByText(TASK_CHAIN_MESSAGE)).not.toBeInTheDocument();
            expect(screen.queryByText(CLASSIFICATION_MESSAGE)).not.toBeInTheDocument();
        });

        it('anomaly classification', async () => {
            await renderApp([DOMAIN.ANOMALY_CLASSIFICATION]);

            expect(screen.queryByText(ANOMALY_MESSAGE)).toBeInTheDocument();
            expect(screen.queryByText(CLASSIFICATION_MESSAGE)).toBeInTheDocument();
            expect(screen.queryByText(ROTATED_BOUNDING_MESSAGE)).not.toBeInTheDocument();
            expect(screen.queryByText(TASK_CHAIN_MESSAGE)).not.toBeInTheDocument();
        });

        it('anomaly detection', async () => {
            await renderApp([DOMAIN.ANOMALY_DETECTION]);

            expect(screen.queryByText(ANOMALY_MESSAGE)).toBeInTheDocument();
            expect(screen.queryByText(CLASSIFICATION_MESSAGE)).not.toBeInTheDocument();
            expect(screen.queryByText(ROTATED_BOUNDING_MESSAGE)).not.toBeInTheDocument();
            expect(screen.queryByText(TASK_CHAIN_MESSAGE)).not.toBeInTheDocument();
        });

        it('anomaly segmentation', async () => {
            await renderApp([DOMAIN.ANOMALY_CLASSIFICATION]);

            expect(screen.queryByText(ANOMALY_MESSAGE)).toBeInTheDocument();
            expect(screen.queryByText(CLASSIFICATION_MESSAGE)).toBeInTheDocument();
            expect(screen.queryByText(TASK_CHAIN_MESSAGE)).not.toBeInTheDocument();
            expect(screen.queryByText(ROTATED_BOUNDING_MESSAGE)).not.toBeInTheDocument();
        });

        it('task chain and classification', async () => {
            await renderApp([DOMAIN.CLASSIFICATION], true);

            expect(screen.queryByText(TASK_CHAIN_MESSAGE)).toBeInTheDocument();
            expect(screen.queryByText(CLASSIFICATION_MESSAGE)).toBeInTheDocument();
            expect(screen.queryByText(ANOMALY_MESSAGE)).not.toBeInTheDocument();
            expect(screen.queryByText(ROTATED_BOUNDING_MESSAGE)).not.toBeInTheDocument();
        });
    });
});
