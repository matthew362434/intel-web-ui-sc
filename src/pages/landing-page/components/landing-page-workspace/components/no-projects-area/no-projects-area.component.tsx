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

import { Image, Text, Flex } from '@adobe/react-spectrum';
import { View } from '@react-spectrum/view';

import Placeholder from '../../../../../../assets/placeholder.png';
import { CustomWell } from '../../../../../../shared/components';
import { NewProjectDialog, NewProjectDialogProvider } from '../../../../../create-project';
import workspaceClasses from '../../landing-page-workspace.module.scss';
import classes from './no-project-area.module.scss';

export const NoProjectArea = (): JSX.Element => {
    const TITLE = 'Create your first project';
    const DESCRIPTION = 'Create new project to leverage AI to automate your Computer Vision task';

    return (
        <CustomWell height={'size-3000'} margin={0} id='no-project-area' isSelectable={false}>
            <Flex direction={'row'} height={'100%'}>
                <Image
                    src={Placeholder}
                    alt={''}
                    minHeight={'100%'}
                    objectFit={'cover'}
                    UNSAFE_className={workspaceClasses.image}
                />
                <Flex
                    direction={'column'}
                    marginStart={'size-300'}
                    marginEnd={'size-700'}
                    justifyContent={'space-between'}
                >
                    <View UNSAFE_className={classes.description}>
                        <h3 id={'no-projects-area-title'}>{TITLE}</h3>
                        <Text id={'no-projects-area-description'}>{DESCRIPTION}</Text>
                    </View>
                    <View marginBottom={'size-300'}>
                        <NewProjectDialogProvider>
                            <NewProjectDialog buttonText={'Create new'} />
                        </NewProjectDialogProvider>
                    </View>
                </Flex>
            </Flex>
        </CustomWell>
    );
};
