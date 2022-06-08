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

import { Key } from 'react';

import { Divider, Flex, Item, Picker, Slider, Switch } from '@adobe/react-spectrum';
import { Text } from '@react-spectrum/text';

import { PredictionMap } from '../../../../core/annotations/prediction.interface';
import { isAnomalyDomain, isClassificationDomain, isSegmentationDomain } from '../../../../core/projects/domains';
import { usePrediction } from '../../providers';
import { ToolAnnotationContextProps } from '../../tools/tools.interface';
import classes from './prediction-secondary-toolbar.module.scss';

export const PredictionSecondaryToolbar = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const {
        maps,
        isInferenceMapVisible,
        selectedInferenceMap,
        inferenceMapOpacity,
        setInferenceMapVisible,
        setSelectedInferenceMap,
        setInferenceMapOpacity,
    } = usePrediction();

    const getTitle = (): string => {
        if (annotationToolContext.selectedTask !== null) {
            if (isAnomalyDomain(annotationToolContext.selectedTask.domain)) {
                return 'Anomaly heatmap';
            }

            if (isClassificationDomain(annotationToolContext.selectedTask.domain)) {
                return 'Saliency map';
            }

            if (isSegmentationDomain(annotationToolContext.selectedTask.domain)) {
                return 'Probability map';
            }
        }

        return 'Inference map';
    };

    const getTextEntryClass = (): string => {
        let className = classes.secondaryToolbarTextEntry;

        if (!isInferenceMapVisible) {
            className = `${className} ${classes.secondaryToolbarTextEntryDisabled}`;
        }

        return className;
    };

    return (
        <>
            {!!maps?.length ? (
                <Flex alignItems='center' height='100%' marginX='size-100' wrap='nowrap'>
                    <Flex alignItems='center' height='100%' gap='size-150' wrap='nowrap'>
                        <Text UNSAFE_className={classes.secondaryToolbarTextEntry}>{getTitle()}</Text>
                        <Switch
                            isSelected={isInferenceMapVisible}
                            onChange={setInferenceMapVisible}
                            aria-label='inference-map-switcher'
                        />
                    </Flex>
                    <Divider
                        size='S'
                        orientation='vertical'
                        marginY='size-100'
                        UNSAFE_style={{ backgroundColor: 'var(--spectrum-global-color-gray-50)' }}
                    />
                    <Flex alignItems='center' height='100%' marginStart='size-150' gap='size-150' wrap='nowrap'>
                        <Flex
                            alignItems='center'
                            height='100%'
                            gap='size-100'
                            maxWidth='static-size-4600'
                            wrap='nowrap'
                        >
                            <Text UNSAFE_className={getTextEntryClass()}>Select map:</Text>
                            <Picker
                                placeholder=''
                                items={maps}
                                selectedKey={selectedInferenceMap?.id}
                                isDisabled={!isInferenceMapVisible}
                                maxWidth='size-1800'
                                data-testid='show-maps-dropdown'
                                aria-label='show-maps-dropdown'
                                UNSAFE_className={classes.secondaryToolbarMapPicker}
                                onSelectionChange={(key: Key) => {
                                    if (!key?.toString().trim().length) return;
                                    const selectedMap = maps.find((map: PredictionMap) => map.id === String(key));
                                    if (!selectedMap) return;
                                    setSelectedInferenceMap(selectedMap);
                                }}
                            >
                                {(item: PredictionMap) => (
                                    <Item key={item.id} aria-label={item.name}>
                                        {item.name}
                                    </Item>
                                )}
                            </Picker>
                        </Flex>
                        <Flex alignItems='center' height='100%' wrap='nowrap'>
                            <Text UNSAFE_className={getTextEntryClass()}>Opacity:</Text>
                            <Slider
                                value={inferenceMapOpacity}
                                onChange={setInferenceMapOpacity}
                                isDisabled={!isInferenceMapVisible}
                                aria-label='opacity-slider'
                                width='size-1800'
                                marginX='size-200'
                                marginY='size-50'
                                isFilled
                            />
                            <Text UNSAFE_className={getTextEntryClass()}>{`${inferenceMapOpacity}%`}</Text>
                        </Flex>
                    </Flex>
                </Flex>
            ) : (
                <Flex alignItems='center' height='100%' marginX='size-100' wrap='nowrap'>
                    <Text UNSAFE_className={classes.secondaryToolbarTextEntry}>AI prediction</Text>
                </Flex>
            )}
        </>
    );
};
