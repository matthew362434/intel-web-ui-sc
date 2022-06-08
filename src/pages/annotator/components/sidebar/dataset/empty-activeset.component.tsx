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

import { Flex, Link, Text, View } from '@adobe/react-spectrum';
import { Link as RouterLink } from 'react-router-dom';

import { InfoOutline } from '../../../../../assets/icons';
import { PATHS } from '../../../../../core/services';
import { DatasetChapters } from '../../../../project-details/components/project-dataset/project-dataset.component';
import { useDataset } from '../../../providers';

export const EmptyActiveSet = (): JSX.Element => {
    const { datasetIdentifier, setIsInActiveMode } = useDataset();

    return (
        <View marginTop='size-200'>
            <Flex>
                <View paddingX='size-100' paddingTop='size-25'>
                    <InfoOutline />
                </View>
                <Flex direction='column'>
                    <Text>Active set is empty.</Text>

                    <Text>
                        <Link
                            variant='overBackground'
                            onPress={() => {
                                setIsInActiveMode(false);
                            }}
                        >
                            Select data set
                        </Link>{' '}
                        or{' '}
                        <Link variant='overBackground'>
                            <RouterLink
                                to={PATHS.getProjectDatasetUrl(datasetIdentifier.projectId, DatasetChapters.DEFAULT)}
                            >
                                upload new media item
                            </RouterLink>
                        </Link>{' '}
                        to annotate more.
                    </Text>
                </Flex>
            </Flex>
        </View>
    );
};
