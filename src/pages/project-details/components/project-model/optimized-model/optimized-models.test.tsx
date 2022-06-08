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

import { mockedOptimizedModels, mockedTrainedModel } from '../../../../../core/models/services/test-utils';
import { applicationRender as render } from '../../../../../test-utils';
import { UseOptimizedModels as OptimizedModelsProps } from '../hooks/use-optimized-models';
import { OptimizedModels } from './optimized-models.component';

// TO DO: IMPLEMENT TESTS ONCE SPECTRUM TABLE IS IMPLEMENTED
describe('Optimized models', () => {
    it('should render optimized model', async () => {
        const optimizedModelsProps: Required<OptimizedModelsProps> = {
            modelDetails: { trainedModel: mockedTrainedModel, optimizedModels: mockedOptimizedModels },
            displayPOTBtnAfterNNCF: false,
            displayPOTBtnNoNNCF: false,
            displayNNCFNoModels: false,
            isImproveSpeedOptimizationVisible: false,
            shouldRefetchModels: false,
            displayMessageIsPOTAndNNCFNotSupported: false,
            refetchModels: jest.fn(),
            areOptimizedModelsVisible: false,
            isPOTModel: true,
            isFilterPruningDisabled: false,
            isFilterPruningSupported: false,
        };
        await render(<OptimizedModels {...optimizedModelsProps} />);
    });
});
