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

import { Heading, View, Text } from '@adobe/react-spectrum';
import noop from 'lodash/noop';

import { getUserDefinedLabels } from '../../../../../shared/utils';
import { ToolAnnotationContextProps } from '../../../tools/tools.interface';
import { LabelTreeView } from '../../labels/label-search/label-tree-view.component';
import { LabelTreeItem } from '../../labels/label-tree-view';
import { fetchLabelsTree } from '../../labels/utils/labels-utils';
import classes from './annotation-list-counting.module.scss';

export const AnnotationListCounting = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const {
        scene: { annotations },
        tasks,
    } = annotationToolContext;

    const userDefinedLabels = getUserDefinedLabels(tasks);
    const labels = fetchLabelsTree(userDefinedLabels);
    const hasOnlyOneLabel = userDefinedLabels.length === 1;

    // Loop through all the annotations and their labels,
    // to get the total count of annotations containing a specific label
    const getNumberOfAnnotationsPerLabel = (label: LabelTreeItem): number => {
        let count = 0;

        for (let i = 0; i < annotations.length; i++) {
            const labelsFromAnnotation = annotations[i].labels;

            for (let j = 0; j < labelsFromAnnotation.length; j++) {
                if (labelsFromAnnotation[j].id === label.id) {
                    count += 1;
                }
            }
        }

        return count;
    };

    return (
        <View data-testid='annotation-counting-list' UNSAFE_className={classes.countingList}>
            <View
                UNSAFE_className={hasOnlyOneLabel ? classes.singleLabelWrapper : classes.multipleLabelWrapper}
                padding={'size-150'}
            >
                <Heading level={4}>Counting</Heading>

                {hasOnlyOneLabel ? (
                    <Text UNSAFE_className={classes.titleCount} data-testid='single-label-count'>
                        {getNumberOfAnnotationsPerLabel(labels[0])}
                    </Text>
                ) : (
                    <View UNSAFE_className={classes.labelTreeWrapper}>
                        <LabelTreeView
                            labels={labels}
                            itemClickHandler={noop}
                            suffix={(label) => {
                                const count = getNumberOfAnnotationsPerLabel(label);

                                return <span aria-label={`annotation-label-count-${label.id}`}>{count}</span>;
                            }}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};
