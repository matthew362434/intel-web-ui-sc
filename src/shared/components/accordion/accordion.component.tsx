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

import { ComponentProps, ReactNode, useState } from 'react';

import { ActionButton, Flex, Header, View } from '@adobe/react-spectrum';

import { ChevronUpLight, ChevronDownLight } from '../../../assets/icons';
import classes from './accordion.module.scss';

interface AccordionProps extends ComponentProps<typeof View> {
    children: ReactNode;
    header: ReactNode;
    idPrefix: string;
    defaultOpenState?: boolean;
    overflow?: 'auto' | 'hidden';
    justifyContentHeader?: ComponentProps<typeof Flex>['justifyContent'];
    isFullHeight?: boolean;
}

export const Accordion = (props: AccordionProps): JSX.Element => {
    const {
        children,
        header,
        defaultOpenState = false,
        idPrefix,
        overflow = 'auto',
        justifyContentHeader = 'space-between',
        isFullHeight = true,
        ...rest
    } = props;
    const [isSelected, setIsSelected] = useState(defaultOpenState);

    return (
        <View
            {...rest}
            overflow={isFullHeight ? 'hidden' : ''}
            UNSAFE_className={[classes.accordion, isFullHeight ? classes.accordionHeight : ''].join(' ')}
        >
            <Flex direction='column' minWidth={0} height='100%'>
                <Header>
                    <Flex justifyContent={justifyContentHeader} alignItems='center'>
                        <>{header}</>
                        <ActionButton
                            onPress={() => setIsSelected(!isSelected)}
                            isQuiet
                            id={`${idPrefix}-fold-unfold-button`}
                            data-testid={`${idPrefix}-fold-unfold-button`}
                        >
                            {isSelected ? <ChevronUpLight /> : <ChevronDownLight />}
                        </ActionButton>
                    </Flex>
                </Header>

                {isSelected ? (
                    <View overflow={overflow} height='100%'>
                        {children}
                    </View>
                ) : (
                    <></>
                )}
            </Flex>
        </View>
    );
};
