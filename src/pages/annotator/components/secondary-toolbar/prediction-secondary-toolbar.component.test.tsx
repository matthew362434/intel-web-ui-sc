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

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { PredictionMap } from '../../../../core/annotations/prediction.interface';
import { DOMAIN } from '../../../../core/projects';
import { fakeAnnotationToolContext, providersRender } from '../../../../test-utils';
import { getMockedTask } from '../../../../test-utils/mocked-items-factory';
import { ANNOTATOR_MODE } from '../../core';
import { PredictionSecondaryToolbar } from './prediction-secondary-toolbar.component';

const mockMaps: PredictionMap[] = [
    {
        id: '6138bca43b7b11505c43f2c1',
        labelsId: '6138bca43b7b11505c43f2c1',
        name: 'Lorem',
        type: 'Result media type 1',
        url: 'https://placekitten.com/g/600/400',
    },
    {
        id: '6138bca43b7b11505c43f2c2',
        labelsId: '6138bca43b7b11505c43f2c2',
        name: 'Ipsum',
        type: 'Result media type 2',
        url: 'https://placekitten.com/g/700/500',
    },
    {
        id: '6138bca43b7b11505c43f2c3',
        labelsId: '6138bca43b7b11505c43f2c3',
        name: 'Dolor',
        type: 'Result media type 3',
        url: 'https://placekitten.com/g/800/600',
    },
    {
        id: '6138bca43b7b11505c43f2c4',
        labelsId: '6138bca43b7b11505c43f2c4',
        name: 'Sit',
        type: 'Result media type 4',
        url: 'https://placekitten.com/g/900/700',
    },
    {
        id: '6138bca43b7b11505c43f2c5',
        labelsId: '6138bca43b7b11505c43f2c5',
        name: 'Amet',
        type: 'Result media type 5',
        url: 'https://placekitten.com/g/1000/800',
    },
];

jest.mock('../../providers', () => ({
    ...jest.requireActual('../../providers'),
    usePrediction: jest.fn(() => ({
        maps: mockMaps,
        isInferenceMapVisible: true,
        inferenceMapOpacity: 50,
        selectedInferenceMap: mockMaps[0],
    })),
}));

it('renders map picker correctly', async () => {
    const annotationToolContext = fakeAnnotationToolContext({
        mode: ANNOTATOR_MODE.PREDICTION,
    });

    providersRender(<PredictionSecondaryToolbar annotationToolContext={annotationToolContext} />);

    await waitFor(() => {
        screen.getByTestId('show-maps-dropdown');
    });

    fireEvent.click(screen.getByTestId('show-maps-dropdown'));
    expect(screen.getAllByText('Lorem')).toHaveLength(2);
    expect(screen.getByText('Ipsum')).toBeInTheDocument();
    expect(screen.getByText('Dolor')).toBeInTheDocument();
    expect(screen.getByText('Sit')).toBeInTheDocument();
    expect(screen.getByText('Amet')).toBeInTheDocument();
});

it('renders opacity slider correctly', async () => {
    const annotationToolContext = fakeAnnotationToolContext({
        mode: ANNOTATOR_MODE.PREDICTION,
    });

    providersRender(<PredictionSecondaryToolbar annotationToolContext={annotationToolContext} />);

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
});

it.each([
    [DOMAIN.CLASSIFICATION, 'Saliency map'],
    [DOMAIN.DETECTION, 'Inference map'],
    [DOMAIN.DETECTION_ROTATED_BOUNDING_BOX, 'Inference map'],
    [DOMAIN.SEGMENTATION, 'Probability map'],
    [DOMAIN.SEGMENTATION_INSTANCE, 'Probability map'],
    [DOMAIN.ANOMALY_CLASSIFICATION, 'Anomaly heatmap'],
    [DOMAIN.ANOMALY_DETECTION, 'Anomaly heatmap'],
    [DOMAIN.ANOMALY_SEGMENTATION, 'Anomaly heatmap'],
])('%o shows %o', (domain: DOMAIN, mapName: string) => {
    const task = getMockedTask({ domain });
    const annotationToolContext = fakeAnnotationToolContext({
        tasks: [task],
        selectedTask: task,
    });

    providersRender(<PredictionSecondaryToolbar annotationToolContext={annotationToolContext} />);

    screen.getByText(mapName);

    expect(screen.getByText(mapName)).toBeInTheDocument();
});
