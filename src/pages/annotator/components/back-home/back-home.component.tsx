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

import { Flex, View } from '@adobe/react-spectrum';
import { useHistory } from 'react-router-dom';

import { PATHS } from '../../../../core/services';
import { DatasetChapters } from '../../../project-details/components/project-dataset/project-dataset.component';
import { useProject } from '../../../project-details/providers';
import { BackHomeButton } from './back-home-button.component';

export const BackHome = (): JSX.Element => {
    const history = useHistory();
    const { project } = useProject();

    const handleGoBack = () => {
        history.push(PATHS.getProjectDatasetUrl(project.id, DatasetChapters.DEFAULT));
    };

    return (
        <View
            backgroundColor='gray-200'
            borderBottomColor='gray-100'
            borderBottomWidth='thin'
            borderEndColor='gray-100'
            borderEndWidth='thin'
        >
            <Flex gridArea='backHome' alignContent='center' justifyContent='center' alignItems='center' height='100%'>
                <BackHomeButton onPress={handleGoBack} />
            </Flex>
        </View>
    );
};
