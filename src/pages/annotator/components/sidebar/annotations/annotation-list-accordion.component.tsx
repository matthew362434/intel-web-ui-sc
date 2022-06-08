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

import { Flex } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';

import { Accordion } from '../../../../../shared/components';
import { AnnotationListContainer } from '../../../annotation/annotation-list/annotation-list-container/annotation-list-container.component';
import { ToolAnnotationContextProps } from '../../../tools/tools.interface';

export const AnnotationListAccordion = ({ annotationToolContext }: ToolAnnotationContextProps): JSX.Element => {
    const {
        scene: { replaceAnnotations },
    } = annotationToolContext;

    return (
        <Accordion
            defaultOpenState
            idPrefix={'annotations'}
            overflow={'auto'}
            height={'100%'}
            data-testid='annotation-list-accordion'
            backgroundColor={'gray-200'}
            padding='size-150'
            header={
                <Flex justifyContent='space-between' alignItems='center' height='100%' flexGrow={1}>
                    <Heading level={4}>Annotations</Heading>
                </Flex>
            }
        >
            <AnnotationListContainer replaceAnnotations={replaceAnnotations} />
        </Accordion>
    );
};
