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

import { useState } from 'react';

import { Flex, View } from '@adobe/react-spectrum';
import { SplitPaneProps } from 'react-split-pane';

import { DOMAIN } from '../../../../core/projects';
import { FEATURES, UseSettings } from '../../../../shared/components/header/settings/use-settings.hook';
import { SplitPaneWrapper } from '../../../../shared/components/splitpane-wrapper/splitpane-wrapper.component';
import { useProject } from '../../../project-details/providers';
import { ANNOTATOR_MODE } from '../../core';
import { useAnnotator } from '../../providers';
import { ToolAnnotationContextProps } from '../../tools/tools.interface';
import { AnnotationListAccordion } from './annotations/annotation-list-accordion.component';
import { AnnotationListCounting } from './annotations/annotation-list-counting.component';
import { AnomalyAccordion } from './anomaly/anomaly-accordion.component';
import { DatasetAccordion } from './dataset/dataset-accordion.component';
import { PredictionAccordion } from './prediction-accordion/prediction-accordion.component';
import { ToggleSidebarButton } from './toggle-sidebar-button.component';

const OUTER_SPLIT_PANE_PROPS: SplitPaneProps = {
    split: 'horizontal',
    style: { position: 'relative', minHeight: 0 },
    paneStyle: { minHeight: '30%', maxHeight: '70%' },
    resizerStyle: {
        color: 'var(--spectrum-global-color-gray-50)',
        minHeight: 'var(--spectrum-alias-border-size-thin)',
        height: 'var(--spectrum-alias-border-size-thin)',
        borderTop: 'var(--spectrum-alias-border-size-thin) solid',
        borderBottom: 'var(--spectrum-alias-border-size-thin) solid',
        cursor: 'row-resize',
    },
    defaultSize: Number(localStorage.getItem('outerPanePosition')),
    onChange: (size) => localStorage.setItem('outerPanePosition', size.toString()),
};

interface SidebarProps extends ToolAnnotationContextProps {
    settings: UseSettings;
}

/*
    Outer pane = Top list section + Bottom dataset section
    Inner pane = Within the outer pane, holds all the accordions and lists

    * Panes (inner and outer) have different minHeights depending on how much space needs to be allocated
    * If we only render 2 elements, we only need one split pane
    * If we render more than 3 elements, we need 2 split panes, and to adjust their height to split space equally

    * On annotation mode we can:
        * Show only dataset (no splitpane)
        * Show only annotation list (normal splitpane, list + dataset)
        * Show only counting list (normal splitpane, counting + dataset)
        * Show both annotation list and counting list (outer splitpane and inner splitpane with annotation/counting)
    
    * On prediction mode we can:
        * Show counting list (outer splitpane and inner splitpane with counting/prediction)
        * Show only prediction list (normal splitpane, list + dataset)
*/
export const Sidebar = ({ annotationToolContext, settings }: SidebarProps): JSX.Element => {
    const { isSingleDomainProject } = useProject();
    const { selectedMediaItem } = useAnnotator();

    const { mode } = annotationToolContext;
    const [isOpen, setIsOpen] = useState(true);

    const { config } = settings;

    const isPredictionMode = mode === ANNOTATOR_MODE.PREDICTION;

    const showCountingPanel = config[FEATURES.COUNTING_PANEL].isEnabled;
    const showAnnotationPanel = config[FEATURES.ANNOTATION_PANEL].isEnabled && !isPredictionMode;

    const withOuterPane = showAnnotationPanel || showCountingPanel || isPredictionMode;
    const withInnerPane =
        (showCountingPanel && isPredictionMode) || (showCountingPanel && showAnnotationPanel && !isPredictionMode);

    const renderListAccordion = (): JSX.Element | null => {
        if (mode === ANNOTATOR_MODE.PREDICTION) {
            return <PredictionAccordion annotationToolContext={annotationToolContext} />;
        }

        return isSingleDomainProject(DOMAIN.ANOMALY_CLASSIFICATION) ? (
            <AnomalyAccordion annotationToolContext={annotationToolContext} />
        ) : showAnnotationPanel ? (
            <AnnotationListAccordion annotationToolContext={annotationToolContext} />
        ) : null;
    };

    return (
        <View backgroundColor='gray-200' gridArea='aside' maxWidth='size-4600'>
            <Flex gap='1px' direction='column' height='100%'>
                <ToggleSidebarButton onChange={setIsOpen} isSelected={isOpen} />

                {isOpen ? (
                    <View backgroundColor='gray-200' height='100%' overflow='hidden'>
                        <Flex
                            direction='column'
                            height='100%'
                            UNSAFE_style={{ overflow: 'hidden' }}
                            minWidth='size-4600'
                            justifyContent='stretch'
                        >
                            {selectedMediaItem !== undefined ? (
                                <SplitPaneWrapper
                                    withPane={withOuterPane}
                                    options={{
                                        ...OUTER_SPLIT_PANE_PROPS,
                                        pane1Style: {
                                            minHeight: showCountingPanel ? '50%' : '30%',
                                        },
                                    }}
                                >
                                    <Flex direction='column' flexGrow={1}>
                                        <SplitPaneWrapper
                                            options={{
                                                ...OUTER_SPLIT_PANE_PROPS,
                                                paneStyle: { minHeight: '40%', maxHeight: '60%' },
                                                defaultSize: Number(localStorage.getItem('innerPanePosition')),
                                                onChange: (size) =>
                                                    localStorage.setItem('innerPanePosition', size.toString()),
                                            }}
                                            withPane={withInnerPane}
                                        >
                                            {showCountingPanel && (
                                                <AnnotationListCounting annotationToolContext={annotationToolContext} />
                                            )}

                                            {renderListAccordion()}
                                        </SplitPaneWrapper>
                                    </Flex>
                                    <DatasetAccordion />
                                </SplitPaneWrapper>
                            ) : (
                                <DatasetAccordion />
                            )}
                        </Flex>
                    </View>
                ) : (
                    <></>
                )}
            </Flex>
        </View>
    );
};
