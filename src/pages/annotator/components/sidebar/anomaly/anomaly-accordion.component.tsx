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
import { Flex, Heading, View } from '@adobe/react-spectrum';

import { Annotation } from '../../../../../core/annotations';
import { Label } from '../../../../../core/labels';
import { Accordion } from '../../../../../shared/components';
import { ToolAnnotationContextProps } from '../../../tools/tools.interface';
import { LabelSearch } from '../../labels/label-search/label-search.component';
import { LabelTreeView } from '../../labels/label-search/label-tree-view.component';
import { SelectionIndicator } from '../../labels/label-search/selection-indicator.component';
import { LabelTreeLabel } from '../../labels/label-tree-view';
import { fetchLabelsTree } from '../../labels/utils/labels-utils';

const getAnnotationLabelsAsTree = (annotation: Annotation | undefined): LabelTreeLabel[] => {
    if (annotation === undefined) {
        return [];
    }

    return fetchLabelsTree(
        annotation.labels,
        annotation.labels.map(({ id }) => id)
    );
};

export const AnomalyAccordion = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const {
        scene: { addLabel, removeLabels, annotations, labels },
    } = annotationToolContext;

    // In a anomaly domain we only have 1 annotation which we classify with a set of labels
    // If no annotation is found we will make a new annotation with the given label, this is done
    // after the user selected a label to avoid issues with undo redo
    const annotation = annotations.length > 0 ? annotations[0] : undefined;
    const annotationLabels = getAnnotationLabelsAsTree(annotation);

    const toggleLabel = (label: Label) => {
        if (annotation === undefined) {
            return;
        } else {
            if (annotation.labels.some(({ id }) => id === label.id)) {
                removeLabels([label], [annotation.id]);
            } else {
                addLabel(label, [annotation.id]);
            }
        }
    };

    return (
        <Accordion
            padding='size-150'
            defaultOpenState
            height={'100%'}
            data-testid='anomaly-accordion'
            idPrefix={'annotations'}
            overflow={'auto'}
            header={
                <Flex justifyContent='space-between' alignItems='center' height='100%' flexGrow={1}>
                    <Heading level={4}>Anomaly</Heading>
                </Flex>
            }
        >
            <LabelSearch
                labels={labels}
                onClick={toggleLabel}
                size={{ searchInput: '100%', labelTree: '100%' }}
                suffix={(label, { isHovered }) => {
                    return (
                        <SelectionIndicator
                            isHovered={isHovered}
                            isSelected={annotationLabels.some(({ id }) => id === label.id)}
                        />
                    );
                }}
            />

            {annotationLabels.length > 0 ? (
                <View backgroundColor='gray-50' borderWidth='thin' borderColor='gray-400' marginTop='size-75'>
                    <div id='classified-labels' aria-label='Classified labels'>
                        <LabelTreeView light={true} labels={annotationLabels} itemClickHandler={toggleLabel} />
                    </div>
                </View>
            ) : (
                <></>
            )}
        </Accordion>
    );
};
