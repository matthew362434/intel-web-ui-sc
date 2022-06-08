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
import { ActionButton, Flex, Provider, View } from '@adobe/react-spectrum';
import { useHistory } from 'react-router-dom';

import { HelpCircleOutlinedIcon, InstallPWA, User } from '../../../../assets/icons';
import { useStatus } from '../../../../core/jobs/hooks/use-status.hook';
import { ROUTER_PATHS } from '../../../../core/services';
import { usePWA } from '../../../../hooks/use-pwa/use-pwa.hook';
import { openNewTab } from '../../../utils';
import { ElementWithTooltip } from '../../element-with-tooltip/element-with-tooltip.component';
import { JobsManagementOption } from '../jobs-management-option';
import classes from './header-actions.module.scss';

interface HeaderMenuProps {
    grayscale: boolean;
}

export const HeaderActions = ({ grayscale }: HeaderMenuProps): JSX.Element => {
    const { data, error } = useStatus();
    const { isPWAReady, handlePromptInstallApp } = usePWA();

    const history = useHistory();

    return (
        <View marginEnd={'size-400'}>
            <Provider isQuiet>
                <Flex
                    gap={'size-75'}
                    id={'header-actions-container'}
                    UNSAFE_className={grayscale ? '' : classes.basicColor}
                >
                    {isPWAReady && (
                        <ElementWithTooltip
                            tooltipProps={{ children: 'Install application' }}
                            content={
                                <ActionButton
                                    key={'install-app'}
                                    aria-label={'Install app'}
                                    onPress={handlePromptInstallApp}
                                    id={'install-app'}
                                    UNSAFE_className={classes.button}
                                >
                                    <InstallPWA aria-label={'install-app'} />
                                </ActionButton>
                            }
                        />
                    )}

                    <JobsManagementOption runningJobs={data?.runningJobs} error={error} reversedColors={!grayscale} />

                    <ElementWithTooltip
                        tooltipProps={{ children: 'Documentation' }}
                        content={
                            <ActionButton
                                key={'question'}
                                aria-label={'Question'}
                                id={'question'}
                                onPress={() => openNewTab('/docs/')}
                                UNSAFE_className={classes.button}
                            >
                                <HelpCircleOutlinedIcon aria-label={'help'} />
                            </ActionButton>
                        }
                    />

                    <ElementWithTooltip
                        tooltipProps={{ children: 'Profile' }}
                        content={
                            <ActionButton
                                key={'user'}
                                aria-label={'Profile'}
                                id={'user'}
                                onPress={() => history.push(ROUTER_PATHS.PROFILE_PAGE)}
                                UNSAFE_className={classes.button}
                            >
                                <User aria-label={'profile page'} />
                            </ActionButton>
                        }
                    />
                </Flex>
            </Provider>
        </View>
    );
};
