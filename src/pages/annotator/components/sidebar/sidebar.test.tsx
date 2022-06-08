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

import { TransformComponent } from 'react-zoom-pan-pinch';

import { createInMemoryMediaService } from '../../../../core/media/services';
import { DOMAIN } from '../../../../core/projects';
import {
    FEATURES,
    initialConfig,
    SettingsConfig,
    UseSettings,
} from '../../../../shared/components/header/settings/use-settings.hook';
import { fakeAnnotationToolContext, providersRender as render, screen } from '../../../../test-utils';
import {
    getMockedImageMediaItem,
    getMockedProject,
    mockedProjectContextProps,
} from '../../../../test-utils/mocked-items-factory';
import { useProject } from '../../../project-details/providers';
import { AnnotationToolContext, ANNOTATOR_MODE } from '../../core';
import {
    AnnotationSceneProvider,
    AnnotationToolProvider,
    DatasetProvider,
    PredictionProvider,
    SubmitAnnotationsProvider,
    TaskProvider,
} from '../../providers';
import { useAnnotationToolContext } from '../../providers/annotation-tool-provider/annotation-tool-provider.component';
import { AnnotatorContextProps, useAnnotator } from '../../providers/annotator-provider/annotator-provider.component';
import { DefaultToolTypes } from '../../providers/annotator-provider/utils';
import { TaskChainProvider } from '../../providers/task-chain-provider/task-chain-provider.component';
import { ZoomProvider } from '../../zoom';
import { Sidebar } from './sidebar.component';

jest.mock('../../providers/annotator-provider/annotator-provider.component', () => ({
    ...jest.requireActual('../../providers/annotator-provider/annotator-provider.component'),
    useAnnotator: jest.fn(() => ({
        selectedMediaItem: {},
    })),
}));

jest.mock('../../providers/annotation-tool-provider/annotation-tool-provider.component', () => ({
    ...jest.requireActual('../../providers/annotation-tool-provider/annotation-tool-provider.component'),
    useAnnotationToolContext: jest.fn(),
}));

jest.mock('../../../project-details/providers', () => ({
    ...jest.requireActual('../../../project-details/providers'),
    useProject: jest.fn(() => mockedProjectContextProps({})),
}));

const App = ({
    annotationToolContext,
    settings,
}: {
    annotationToolContext: AnnotationToolContext;
    settings?: Partial<UseSettings>;
}) => {
    jest.mocked(useAnnotationToolContext).mockImplementation(() => annotationToolContext);

    const datasetIdentifier = {
        workspaceId: 'workspace-id',
        projectId: 'project-id',
        datasetId: 'dataset-id',
    };
    const mockSettings: UseSettings = {
        saveConfig: jest.fn(),
        isSavingConfig: false,
        config: initialConfig,
        ...settings,
    };

    const mediaService = createInMemoryMediaService();

    return (
        <AnnotationSceneProvider annotations={[]} labels={[]}>
            <ZoomProvider>
                <TaskProvider>
                    <DatasetProvider datasetIdentifier={datasetIdentifier} mediaService={mediaService}>
                        <SubmitAnnotationsProvider
                            annotations={[]}
                            saveAnnotations={jest.fn()}
                            currentMediaItem={undefined}
                        >
                            <TaskChainProvider tasks={[]} selectedTask={null} defaultLabel={null}>
                                <PredictionProvider
                                    initialPredictionAnnotations={[]}
                                    predictionAnnotationScene={annotationToolContext.scene}
                                    userAnnotationScene={annotationToolContext.scene}
                                    maps={[]}
                                    refreshPredictions={jest.fn()}
                                    saveAnnotations={jest.fn()}
                                >
                                    <AnnotationToolProvider>
                                        <Sidebar
                                            settings={mockSettings}
                                            annotationToolContext={annotationToolContext}
                                        />
                                        <TransformComponent>{''}</TransformComponent>
                                    </AnnotationToolProvider>
                                </PredictionProvider>
                            </TaskChainProvider>
                        </SubmitAnnotationsProvider>
                    </DatasetProvider>
                </TaskProvider>
            </ZoomProvider>
        </AnnotationSceneProvider>
    );
};

describe('Sidebar', () => {
    const image = document.createElement('img');
    const mockedImageItem = getMockedImageMediaItem(image);

    jest.mocked(useAnnotator).mockImplementation(
        () =>
            ({
                selectedMediaItem: mockedImageItem,
                hotKeys: DefaultToolTypes,
            } as unknown as AnnotatorContextProps)
    );

    it('should render Prediction accordion when on PREDICTION MODE', () => {
        const fakeContext = fakeAnnotationToolContext({ mode: ANNOTATOR_MODE.PREDICTION });

        render(<App annotationToolContext={fakeContext} />);

        expect(screen.getByTestId('prediction-accordion')).toBeInTheDocument();
    });

    it('should render Anomaly accordion if it is a single task anomaly project', () => {
        jest.mocked(useProject).mockReturnValue(
            mockedProjectContextProps({
                isSingleDomainProject: (domain) => {
                    if (domain === DOMAIN.ANOMALY_CLASSIFICATION) {
                        return true;
                    }

                    return false;
                },
                project: getMockedProject({ domains: [DOMAIN.ANOMALY_CLASSIFICATION] }),
            })
        );

        const fakeContext = fakeAnnotationToolContext({ mode: ANNOTATOR_MODE.ANNOTATION });

        render(<App annotationToolContext={fakeContext} />);

        expect(screen.getByTestId('anomaly-accordion')).toBeInTheDocument();
        expect(screen.queryByTestId('prediction-accordion')).toBeFalsy();
    });

    it('should render AnnotationList accordion if "annotation panel" is enabled and if it is a single task and not classification or anomaly project', () => {
        jest.mocked(useProject).mockReturnValue(
            mockedProjectContextProps({
                isSingleDomainProject: () => false,
            })
        );

        const fakeContext = fakeAnnotationToolContext({ mode: ANNOTATOR_MODE.ANNOTATION });

        // Annotation panel is enabled by default on the settings
        render(<App annotationToolContext={fakeContext} />);

        expect(screen.getByTestId('annotation-list-accordion')).toBeInTheDocument();
        expect(screen.queryByTestId('anomaly-accordion')).toBeFalsy();
        expect(screen.queryByTestId('prediction-accordion')).toBeFalsy();
    });

    it('should NOT render AnnotationList accordion if "annotation panel" is disabled on user settings', () => {
        const mockConfig: SettingsConfig = {
            [FEATURES.ANNOTATION_PANEL]: {
                title: 'Annotation',
                isEnabled: false,
                tooltipDescription: 'Toggle annotation list on the right sidebar',
            },
            [FEATURES.COUNTING_PANEL]: {
                title: 'Counting',
                isEnabled: false,
                tooltipDescription: 'Toggle counting list on the right sidebar',
            },
        };
        const mockSettings = {
            config: mockConfig,
        };

        jest.mocked(useProject).mockReturnValue(
            mockedProjectContextProps({
                isSingleDomainProject: () => false,
            })
        );

        const fakeContext = fakeAnnotationToolContext({ mode: ANNOTATOR_MODE.ANNOTATION });

        render(<App settings={mockSettings} annotationToolContext={fakeContext} />);

        expect(screen.queryByTestId('annotation-list-accordion')).toBeFalsy();
    });

    it('should NOT render AnnotationListCounting if "counting panel" is disabled on user settings', () => {
        const mockConfig: SettingsConfig = {
            [FEATURES.ANNOTATION_PANEL]: {
                title: 'Annotation',
                isEnabled: true,
                tooltipDescription: 'Toggle annotation list on the right sidebar',
            },
            [FEATURES.COUNTING_PANEL]: {
                title: 'Counting',
                isEnabled: false,
                tooltipDescription: 'Toggle counting list on the right sidebar',
            },
        };
        const mockSettings = {
            config: mockConfig,
        };

        jest.mocked(useProject).mockReturnValue(
            mockedProjectContextProps({
                isTaskChainProject: false,
            })
        );

        const fakeContext = fakeAnnotationToolContext({
            mode: ANNOTATOR_MODE.ANNOTATION,
        });

        render(<App annotationToolContext={fakeContext} settings={mockSettings} />);

        expect(screen.queryByTestId('annotation-counting-list')).toBeFalsy();
    });

    it('should render AnnotationListCounting if "counting panel" is enabled on user settings', () => {
        const mockConfig: SettingsConfig = {
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
        };
        const mockSettings = {
            config: mockConfig,
        };

        jest.mocked(useProject).mockReturnValue(
            mockedProjectContextProps({
                isTaskChainProject: false,
            })
        );

        const fakeContext = fakeAnnotationToolContext({
            mode: ANNOTATOR_MODE.ANNOTATION,
        });

        render(<App annotationToolContext={fakeContext} settings={mockSettings} />);

        expect(screen.getByTestId('annotation-counting-list')).toBeInTheDocument();
    });
});
