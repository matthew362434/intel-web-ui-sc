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

import { useState } from 'react';

import { Flex, View, Text, Divider } from '@adobe/react-spectrum';
import { usePress } from '@react-aria/interactions';
import { useHistory } from 'react-router-dom';

import { Label as LabelInterface } from '../../../../../../../../core/labels';
import { ProjectProps } from '../../../../../../../../core/projects';
import { API_URLS, PATHS } from '../../../../../../../../core/services';
import { CustomWell, ProjectNameDomain } from '../../../../../../../../shared/components';
import { getUserDefinedLabels } from '../../../../../../../../shared/utils';
import { idMatchingFormat } from '../../../../../../../../test-utils';
import { Label, ProjectActionMenu } from './components';
import classes from './project.module.scss';

export const Project = ({ project }: { project: ProjectProps }): JSX.Element => {
    const NO_IMAGE_ICON = '/icons/image-icon.svg';
    const { id, name, creationDate, thumbnail, tasks } = project;
    const [thumbNailSource, setThumbnailSource] = useState<string>(API_URLS.THUMBNAIL(thumbnail));
    const [errored, setErrored] = useState<boolean>(false);
    const history = useHistory();
    const labels = getUserDefinedLabels(tasks);

    const { pressProps } = usePress({
        onPress: () => history.push(PATHS.getProjectUrl(id)),
    });

    const onError = () => {
        if (!errored) {
            setThumbnailSource(NO_IMAGE_ICON);
            setErrored(true);
        }
    };

    return (
        <CustomWell id={`project-id-${id}`}>
            <div {...pressProps} style={{ display: 'flex', flexDirection: 'row' }}>
                <View
                    backgroundColor={'gray-200'}
                    width={'size-3600'}
                    minWidth={'size-3600'}
                    UNSAFE_style={{
                        textAlign: 'center',
                        overflow: 'hidden',
                    }}
                    borderTopStartRadius={'regular'}
                    borderBottomStartRadius={'regular'}
                >
                    <Flex
                        justifyContent={'center'}
                        alignItems={'center'}
                        height={'100%'}
                        width={'100%'}
                        UNSAFE_style={{ overflow: 'hidden', borderRadius: 'inherit' }}
                    >
                        <img
                            src={thumbNailSource}
                            alt={name}
                            className={!errored ? classes.thumbnail : classes.icon}
                            onError={onError}
                            id={`project-image-${idMatchingFormat(name)}`}
                        />
                    </Flex>
                </View>

                <Flex direction={'column'} minWidth={0} width={'100%'} marginTop={'size-200'} marginX={'size-200'}>
                    <Flex justifyContent={'space-between'} minWidth={0}>
                        <View minWidth={0}>
                            <ProjectNameDomain project={project} textInRow />

                            <Text id={`project-date-${idMatchingFormat(name)}`}>
                                {creationDate.toLocaleString('en-GB', { dateStyle: 'medium' })}
                            </Text>
                        </View>

                        <ProjectActionMenu projectId={project.id} projectName={project.name} />
                    </Flex>

                    <Divider size='S' marginTop={'size-200'} />

                    <Flex direction={'row'} flex={1} marginY={'size-125'} wrap={'wrap'}>
                        {labels.map((label: LabelInterface) => (
                            <Label
                                label={label}
                                key={label.id}
                                id={`project-labels-${idMatchingFormat(name)}-${idMatchingFormat(label.name)}`}
                            />
                        ))}
                    </Flex>
                </Flex>
            </div>
        </CustomWell>
    );
};
