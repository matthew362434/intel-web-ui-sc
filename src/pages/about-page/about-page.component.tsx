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

import { View, Text } from '@adobe/react-spectrum';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { useWorkspacesService } from '../../core/workspaces/hooks';
import { VersionEntity } from '../../core/workspaces/services';
import { NOTIFICATION_TYPE, useNotification } from '../../notification';
import { PageLayout } from '../../shared/components';

const AboutPage = (): JSX.Element => {
    const services = useWorkspacesService().workspacesService;
    const { addNotification } = useNotification();

    const { isLoading, data } = useQuery<VersionEntity, AxiosError>({
        queryFn: services.getProductVersion,
        onError: (error) => {
            addNotification(error.message, NOTIFICATION_TYPE.ERROR);
        },
    });

    return (
        <PageLayout breadcrumbs={[{ id: 'about-id', breadcrumb: 'About' }]}>
            <>
                <View marginTop={'size-250'}>
                    <Text>Sonoma Creek - {isLoading ? ' -- --' : data?.productVersion}</Text>
                </View>
                <View marginTop={'size-250'}>
                    <Text>
                        Sonoma Creek is an end-to-end AI development platform designed for domain experts to train AI
                        models for computer vision applications. Sonoma Creek equips/provides subject matter experts
                        with a graphical user interface as a go-to tool for creating AI models. What is special about
                        the platform is that it significantly reduces the AI development time through the
                        state-of-the-art technology.
                    </Text>
                </View>
            </>
        </PageLayout>
    );
};

export default AboutPage;
