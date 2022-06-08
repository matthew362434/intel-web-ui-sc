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

import { Grid } from '@adobe/react-spectrum';
import { FocusScope } from '@react-aria/focus';

import { isVideo, isVideoFrame } from '../../core/media';
import { ErrorBoundary } from '../errors/error-boundary.component';
import {
    BackHome,
    Footer,
    MainContent,
    NavigationToolbar,
    PrimaryToolbar,
    SecondaryToolbar,
    Sidebar,
    VideoPlayer,
} from './components';
import { LabelsHotkeys } from './components/labels/labels-hotkeys';
import { ANNOTATOR_MODE } from './core';
import { useAnnotationToolContext, useAnnotator } from './providers';
import { ActiveToolProvider } from './providers/annotation-tool-provider/active-tool-provider.component';

const GRID_AREAS = [
    'backHome  navigationToolbar  navigationToolbar',
    'primaryToolbar secondaryToolbar  aside',
    'primaryToolbar content  aside',
    'primaryToolbar  videoplayer  aside',
    'primaryToolbar  footer  aside',
];
const GRID_COLUMNS = ['size-600', '1fr', 'auto'];
const GRID_ROWS = ['size-600', 'auto', '1fr', 'auto', 'size-300'];

export const AnnotatorLayout = (): JSX.Element => {
    const annotationToolContext = useAnnotationToolContext();
    const { selectedMediaItem, mode, settings } = useAnnotator();

    const isPredictionMode = mode === ANNOTATOR_MODE.PREDICTION;

    return (
        <FocusScope>
            <Grid
                areas={GRID_AREAS}
                columns={GRID_COLUMNS}
                rows={GRID_ROWS}
                height='100vh'
                width='100vw'
                maxWidth='100vw'
                maxHeight='100vh'
            >
                <BackHome />
                <NavigationToolbar settings={settings} />
                <Footer zoom={annotationToolContext.zoomState.zoom} />
                <ActiveToolProvider annotationToolContext={annotationToolContext}>
                    <PrimaryToolbar annotationToolContext={annotationToolContext} />
                    <SecondaryToolbar annotationToolContext={annotationToolContext} />
                    <ErrorBoundary>
                        <MainContent annotationToolContext={annotationToolContext} />
                    </ErrorBoundary>
                </ActiveToolProvider>
                {selectedMediaItem !== undefined && (isVideo(selectedMediaItem) || isVideoFrame(selectedMediaItem)) ? (
                    <VideoPlayer />
                ) : (
                    <></>
                )}
                <Sidebar annotationToolContext={annotationToolContext} settings={settings} />
                {!isPredictionMode ? <LabelsHotkeys /> : <></>}
            </Grid>
        </FocusScope>
    );
};
