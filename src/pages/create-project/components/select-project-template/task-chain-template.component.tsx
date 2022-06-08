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

import { useEffect, Fragment } from 'react';

import { Flex, Image, Text, View } from '@adobe/react-spectrum';
import { Heading } from '@react-spectrum/text';
import isEqual from 'lodash/isEqual';

import { ChevronRightSmallLight } from '../../../../assets/icons';
import { CustomWell } from '../../../../shared/components';
import wellClasses from '../../../../shared/components/custom-well/custom-well.module.scss';
import { idMatchingFormat } from '../../../../test-utils';
import { TaskChainTemplateProps, TaskChainMetadata } from './project-template.interface';
import taskChainClasses from './project-template.module.scss';

export const TaskChainTemplate = ({
    setSelectedDomains,
    selectedDomains,
    subDomains,
}: TaskChainTemplateProps): JSX.Element => {
    useEffect(() => {
        if (selectedDomains.length < 2) {
            setSelectedDomains(subDomains[0].domains, subDomains[0].relations);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Flex direction={'column'} gap={'size-300'} UNSAFE_className={taskChainClasses.projectCreationWellWrapper}>
            {subDomains.map((chain: TaskChainMetadata) => (
                <CustomWell
                    key={idMatchingFormat(chain.domains.join('-'))}
                    id={`project-creation-${idMatchingFormat(chain.domains.join('-'))}-chain`}
                    onPress={() => {
                        setSelectedDomains(chain.domains, chain.relations);
                    }}
                    margin={0}
                    isSelected={isEqual(chain.domains, selectedDomains)}
                    className={wellClasses.projectCreationWell}
                >
                    <Flex direction={'row'}>
                        <View
                            backgroundColor={'gray-200'}
                            width={'48.8rem'}
                            minWidth={'48.8rem'}
                            UNSAFE_style={{
                                textAlign: 'center',
                            }}
                            height={'size-1700'}
                            borderTopStartRadius={'regular'}
                            borderBottomStartRadius={'regular'}
                        >
                            <Flex direction={'row'} alignItems={'center'} justifyContent={'center'}>
                                {chain.images.map((imageSrc: string, index: number) => (
                                    <Fragment key={imageSrc}>
                                        <Image src={imageSrc} alt={'chain'} />
                                        {index === chain.images.length - 1 ? <></> : <ChevronRightSmallLight />}
                                    </Fragment>
                                ))}
                            </Flex>
                        </View>
                        <Flex direction={'column'} margin={'size-200'} width={'size-3000'} gap={'size-75'}>
                            <Flex direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <Heading level={4} margin={0}>
                                    {chain.domains.join(' > ')}
                                </Heading>
                            </Flex>
                            <Text>{chain.description}</Text>
                        </Flex>
                    </Flex>
                </CustomWell>
            ))}
        </Flex>
    );
};
