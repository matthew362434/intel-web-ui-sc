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
import { applicationRender as render, screen } from '../../../../../../test-utils';
import { TrainingProgressTask } from './training-progress-task.component';

describe('Training progress task', () => {
    it('Check if version, name and architecture are properly displayed', async () => {
        await render(<TrainingProgressTask name={'Classification'} architecture={'Some test arch'} version={'3'} />);

        expect(screen.getByText('Some test arch')).toBeInTheDocument();
        expect(screen.getByText('Classification')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });
});
