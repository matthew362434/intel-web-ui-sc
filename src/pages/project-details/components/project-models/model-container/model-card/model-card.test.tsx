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

import { screen } from '@testing-library/react';
import dayjs from 'dayjs';

import { formatDate } from '../../../../../../shared/utils';
import { applicationRender as render } from '../../../../../../test-utils';
import { ModelCard } from './index';
import { ModelCardProps } from './model-card.interface';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: jest.fn(),
    }),
    useLocation: () => ({
        pathname: 'localhost:3000/projects/123/models/1',
    }),
}));

describe('Model card', () => {
    const creationDate = dayjs().toString();
    const modelActive: ModelCardProps = {
        id: '1',
        accuracy: 20,
        performance: { type: 'default_performance', score: 20 },
        isActiveModel: true,
        upToDate: false,
        version: 1,
        creationDate,
        architectureId: '1',
        architectureName: 'YoloV4',
    };
    const modelInactive: ModelCardProps = {
        id: '1',
        accuracy: 20,
        performance: { type: 'default_performance', score: 20 },
        isActiveModel: false,
        upToDate: true,
        version: 1,
        creationDate,
        architectureId: '1',
        architectureName: 'ATSS',
    };
    const activeModelLabel = 'Active model';

    it('should model be active and date well formatted', async () => {
        const formattedDate = formatDate(creationDate, 'DD MMM YYYY');
        const formattedTime = formatDate(creationDate, 'hh:mm A');
        await render(<ModelCard {...modelActive} />);
        expect(screen.getByText(activeModelLabel)).toBeInTheDocument();
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
        expect(screen.getByText(formattedTime)).toBeInTheDocument();
    });

    it('should model be inactive', async () => {
        await render(<ModelCard {...modelInactive} />);
        expect(screen.queryByText(activeModelLabel)).not.toBeInTheDocument();
    });

    it('should model accuracy be up to date', async () => {
        await render(<ModelCard {...modelInactive} />);
        expect(screen.getByText('Accuracy').classList.contains('accuracyTextOutdated')).not.toBeTruthy();
    });

    it('should model accuracy be outdated', async () => {
        await render(<ModelCard {...modelActive} />);
        expect(screen.getByText('Accuracy').classList.contains('accuracyTextOutdated')).toBeTruthy();
    });
});
