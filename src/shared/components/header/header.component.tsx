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
import { Flex, Heading, View, Image } from '@adobe/react-spectrum';
import { Link } from 'react-router-dom';

import Logo from '../../../assets/brain.png';
import { ROUTER_PATHS } from '../../../core/services';
import { HeaderActions } from './header-actions/header-actions.component';
import classes from './header.module.scss';

export const LandingPageHeader = ({ grayscale = false }: { grayscale?: boolean }): JSX.Element => {
    return (
        <>
            <Flex
                UNSAFE_className={grayscale ? classes.gray200color : classes.energyBlueShade1Color}
                justifyContent={'space-between'}
                height={'100%'}
                alignItems={'center'}
                data-testid={'application-header'}
            >
                <Flex height={'100%'}>
                    <View isHidden={grayscale} minWidth={'size-200'} UNSAFE_className={classes.energyBlueColor} />

                    <Link to={ROUTER_PATHS.LANDING_PAGE} className={classes.headerLogoLink}>
                        <Image
                            marginStart={'size-200'}
                            height={'size-250'}
                            marginY={'auto'}
                            id={'application-logo'}
                            src={Logo}
                            alt={'application logo'}
                        />

                        <Heading level={3} marginStart={'size-200'} marginY={'auto'} id={'application-title'}>
                            Sonoma Creek
                        </Heading>
                    </Link>
                </Flex>

                <HeaderActions grayscale={grayscale} />
            </Flex>
            <View
                isHidden={grayscale}
                height={'size-200'}
                width={'size-200'}
                UNSAFE_className={classes.energyBlueShade1Color}
                position={'absolute'}
            />
            <View
                isHidden={grayscale}
                height={'size-100'}
                width={'size-100'}
                UNSAFE_className={classes.energyBlueShade1Color}
                position={'absolute'}
                marginStart={'size-200'}
                marginTop={'size-200'}
            />
        </>
    );
};
