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

import { mockedEditableConfigTaskChainData } from '../../../../../../core/configurable-parameters/services/test-utils';
import { applicationRender as render, idMatchingFormat } from '../../../../../../test-utils';
import { HPOProps } from '../use-training-state-value';
import { TrainConfigurableParameters } from './train-configurable-parameters.component';
import { hpoTitle } from './train-hpo/utils';

describe('TrainConfigurableParameters', () => {
    const [learningParametersComponent] = mockedEditableConfigTaskChainData.components.filter(
        ({ header }) => header === 'Learning Parameters'
    );
    const [componentOtherThanLP] = mockedEditableConfigTaskChainData.components.filter(
        ({ header }) => header === 'Optimization by NNCF'
    );

    const learningParameters = learningParametersComponent.parameters || [];
    const parametersOtherThanLP = componentOtherThanLP.parameters || [];

    const setConfigParameters = jest.fn();
    const setTrainFromScratch = jest.fn();
    const updateParameter = jest.fn();

    const renderTrainingConfigParams = async (hpo: HPOProps): Promise<void> => {
        await render(
            <TrainConfigurableParameters
                configParameters={mockedEditableConfigTaskChainData}
                setConfigParameters={setConfigParameters}
                setTrainFromScratch={setTrainFromScratch}
                trainFromScratch={false}
                animationDirection={-1}
                updateParameter={updateParameter}
                modelTemplateId={'detection_yolo'}
                taskId={'task-id'}
                hpo={hpo}
            />
        );

        userEvent.click(screen.getByTestId('learning-parameters-id'));
    };

    it('Learning Parameters tab should have HPO configuration button', async () => {
        await renderTrainingConfigParams({
            setHPO: jest.fn(),
            isHPOSupported: true,
            isHPO: false,
            selectedHPOTimeRatio: 4,
        });

        expect(screen.getByText(hpoTitle)).toBeInTheDocument();
    });

    it('Should not show HPO as status on the Learning parameters tab when HPO is on', async () => {
        await renderTrainingConfigParams({
            setHPO: jest.fn(),
            isHPOSupported: true,
            isHPO: false,
            selectedHPOTimeRatio: 4,
        });

        expect(screen.queryByTestId('hpo-status-id')).not.toBeInTheDocument();
    });

    it('Should show HPO as status on the Learning parameters tab when HPO is on', async () => {
        await renderTrainingConfigParams({
            setHPO: jest.fn(),
            isHPOSupported: true,
            isHPO: true,
            selectedHPOTimeRatio: 4,
        });

        const learningParametersTab = screen.getByTestId('learning-parameters-id');

        learningParametersTab.contains(screen.getByTestId('hpo-status-id'));
    });

    it('Learning parameters should be in the edit mode when HPO is off', async () => {
        await renderTrainingConfigParams({
            setHPO: jest.fn(),
            isHPOSupported: true,
            isHPO: false,
            selectedHPOTimeRatio: 4,
        });

        learningParameters.forEach(({ header }) => {
            expect(screen.getByText(header)).toBeInTheDocument();
            const resetButtonId = `${idMatchingFormat(header)}-reset-button-id`;
            expect(screen.getByTestId(resetButtonId)).toBeInTheDocument();
        });

        userEvent.click(screen.getByTestId('optimization-by-nncf-id'));

        parametersOtherThanLP.forEach(({ header }) => {
            expect(screen.getByText(header)).toBeInTheDocument();
            const resetButtonId = `${idMatchingFormat(header)}-reset-button-id`;
            expect(screen.getByTestId(resetButtonId)).toBeInTheDocument();
        });
    });

    it('Learning parameters should be in the read only mode when HPO is on, other tabs are in edit mode', async () => {
        await renderTrainingConfigParams({
            setHPO: jest.fn(),
            isHPOSupported: true,
            isHPO: true,
            selectedHPOTimeRatio: 4,
        });

        learningParameters.forEach(({ header }) => {
            expect(screen.getByText(header)).toBeInTheDocument();
            const resetButtonId = `${idMatchingFormat(header)}-reset-button-id`;
            expect(screen.queryByTestId(resetButtonId)).not.toBeInTheDocument();
        });

        userEvent.click(screen.getByTestId('optimization-by-nncf-id'));

        parametersOtherThanLP.forEach(({ header }) => {
            expect(screen.getByText(header)).toBeInTheDocument();
            const resetButtonId = `${idMatchingFormat(header)}-reset-button-id`;
            expect(screen.getByTestId(resetButtonId)).toBeInTheDocument();
        });
    });

    it('Learning parameters should have reset to HPO value button', async () => {
        await renderTrainingConfigParams({
            setHPO: jest.fn(),
            isHPOSupported: true,
            isHPO: false,
            selectedHPOTimeRatio: 4,
        });
        learningParameters.forEach(({ header }) => {
            expect(screen.getByText(header)).toBeInTheDocument();
            const resetHPOButtonId = `${idMatchingFormat(header)}-reset-hpo-button-id`;
            expect(screen.getByTestId(resetHPOButtonId)).toBeInTheDocument();
        });

        userEvent.click(screen.getByTestId('optimization-by-nncf-id'));

        parametersOtherThanLP.forEach(({ header }) => {
            expect(screen.getByText(header)).toBeInTheDocument();
            const resetHPOButtonId = `${idMatchingFormat(header)}-reset-hpo-button-id`;
            expect(screen.queryByTestId(resetHPOButtonId)).not.toBeInTheDocument();
        });
    });

    it('HPO should not be visible when it is not supported', async () => {
        await renderTrainingConfigParams({
            setHPO: jest.fn(),
            isHPOSupported: false,
            isHPO: false,
            selectedHPOTimeRatio: 4,
        });

        expect(screen.queryByTestId('hpo-toggle-btn-id')).not.toBeInTheDocument();
    });
});
