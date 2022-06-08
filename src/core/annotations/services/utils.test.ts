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

import { getMockedImageMediaItem, getMockedLabel } from '../../../test-utils/mocked-items-factory';
import { Label, LABEL_SOURCE } from '../../labels';
import { AnnotationDTO, SHAPE_TYPE_DTO } from '../dtos';
import { getAnnotation } from './utils';

it("removes labels that are not present in the project's labels", () => {
    const mediaItem = getMockedImageMediaItem({});
    const projectLabels: Label[] = [getMockedLabel({ id: 'existing-label', name: 'existing label' })];

    const annotationDTO: AnnotationDTO = {
        id: 'test',
        labels: [
            // One label that exists in the project
            {
                id: projectLabels[0].id,
                name: 'existing label',
                color: 'black',
                hotkey: '',
                probability: 1.0,
                source: { id: 'N/A', type: 'N/A' },
            },
            // Another one that does not exist in the project
            {
                id: 'non-existent-label',
                name: 'test',
                color: 'black',
                hotkey: '',
                probability: 1.0,
                source: { id: 'N/A', type: 'N/A' },
            },
        ],
        shape: { type: SHAPE_TYPE_DTO.RECTANGLE, x: 0, y: 0, width: 1.0, height: 1.0 },
        labels_to_revisit: [],
    };

    const annotation = getAnnotation(mediaItem, annotationDTO, projectLabels, 0, LABEL_SOURCE.USER);

    expect(annotation.labels).toHaveLength(1);
});
