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

import { IntelLogo } from '../../../../assets/images';
import { ROUTER_PATHS } from '../../../../core/services';
import { SidebarMenu } from '../../../../shared/components';
import { MenuOptionText } from '../../../../shared/components/menu-option.interface';

export const LandingPageSidebar = (): JSX.Element => {
    const options: MenuOptionText[] = [
        { id: 'home', name: 'Home', url: ROUTER_PATHS.LANDING_PAGE, ariaLabel: 'home' },
        { id: 'empty', name: '', ariaLabel: '' },
        { id: 'profile', name: 'Profile', url: ROUTER_PATHS.PROFILE_PAGE, ariaLabel: 'profile' },
        { id: 'about', name: 'About', url: ROUTER_PATHS.ABOUT_PAGE, ariaLabel: 'about' },
        { id: 'team', name: 'Team', url: ROUTER_PATHS.TEAM, ariaLabel: 'team' },
    ];

    const DISABLED_OPTIONS = ['empty'];

    return (
        <Flex justifyContent={'space-between'} direction={'column'} height={'100%'}>
            <View>
                <SidebarMenu options={[options]} disabledOptions={DISABLED_OPTIONS} id={'landing-page'} />
            </View>
            <View marginStart={'size-400'} marginBottom={'size-400'}>
                <IntelLogo id={'intel-logo-image'} />
            </View>
        </Flex>
    );
};
