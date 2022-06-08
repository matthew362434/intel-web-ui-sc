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

import { Dispatch, SetStateAction } from 'react';

import { Flex, Text } from '@adobe/react-spectrum';

import { MediaSearchOptions } from '../../../../core/media/services/media-service.interface';
import { isAnomalyDomain } from '../../../../core/projects/domains';
import { useProject } from '../../providers';
import { ProjectMediaFilterLabels } from './project-media-filter-labels.component';
import { ProjectMediaFilterStatusList } from './project-media-filter-status-list.component';

interface ProjectMediaFilterPanelProps {
    mediaSearchOptions: Partial<MediaSearchOptions>;
    setMediaSearchOptions: Dispatch<SetStateAction<Partial<MediaSearchOptions>>>;
}

export const ProjectMediaFilterPanel = ({
    mediaSearchOptions,
    setMediaSearchOptions,
}: ProjectMediaFilterPanelProps): JSX.Element => {
    const { isSingleDomainProject } = useProject();

    return (
        <Flex>
            <Flex direction='column' marginEnd='size-200' flex={2}>
                <Text marginBottom='size-150' id={'filter-media-status-id'}>
                    STATUS
                </Text>
                <ProjectMediaFilterStatusList
                    selected={mediaSearchOptions.status}
                    onSelectionChange={(key: string) =>
                        setMediaSearchOptions({
                            ...mediaSearchOptions,
                            status: key,
                        })
                    }
                />
            </Flex>
            {!isSingleDomainProject(isAnomalyDomain) && (
                <Flex direction='column' marginStart='size-300' flex={5}>
                    <Text marginBottom='size-150' id={'filter-media-labels-id'}>
                        LABELS
                    </Text>
                    <ProjectMediaFilterLabels setMediaSearchOptions={setMediaSearchOptions} />
                </Flex>
            )}
        </Flex>
    );
};
