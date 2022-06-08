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
import { render, screen } from '@testing-library/react';

import { TrainHPO } from './train-hpo.component';
import { hpoDescription, SUPPORTED_HPO_RATIOS } from './utils';

describe('TrainHPO', () => {
    it('Show HPO description and time ratios when HPO is on', () => {
        render(<TrainHPO setHPO={jest.fn()} isHPO={true} selectedHPOTimeRatio={4} />);

        expect(screen.getByTestId('hpo-description-id')).toHaveTextContent(hpoDescription);

        SUPPORTED_HPO_RATIOS.forEach((ratio) => {
            expect(screen.getByTestId(`${ratio}-training-time-id`)).toBeInTheDocument();
        });
    });

    it('4x time ratio should be selected by default - has darker background color', async () => {
        render(<TrainHPO setHPO={jest.fn()} isHPO={true} selectedHPOTimeRatio={4} />);

        expect(screen.getByTestId('4-training-time-id')).toHaveStyle(
            'background-color: var(--spectrum-alias-background-color-gray-50, var(--spectrum-global-color-gray-50, var(--spectrum-semantic-gray-50-color-background)))'
        );

        SUPPORTED_HPO_RATIOS.filter((ratio) => ratio !== 4).forEach((ratio) => {
            expect(screen.getByTestId(`${ratio}-training-time-id`)).toHaveStyle(
                'background-color: var(--spectrum-alias-background-color-gray-100, var(--spectrum-global-color-gray-100, var(--spectrum-semantic-gray-100-color-background)))'
            );
        });
    });
});
