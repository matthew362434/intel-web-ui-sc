// INTEL CONFIDENTIAL
//
// Copyright (C) 2022 Intel Corporation
//
// This software and the related documents are Intel copyrighted materials, and your use of them is governed by
// the express license under which they were provided to you ("License"). Unless the License provides otherwise,
// you may not use, modify, copy, publish, distribute, disclose or transmit this software or the related documents
// without Intel's prior written permission.
//
// This software and the related documents are provided as is, with no express or implied warranties,
// other than those that are expressly stated in the License.

import { useEffect, useState } from 'react';

import {
    DialogTrigger,
    ActionButton,
    Dialog,
    Heading,
    Divider,
    Content,
    ButtonGroup,
    Button,
    Item,
    TabList,
    TabPanels,
    Tabs,
    Switch,
    Text,
    Flex,
} from '@adobe/react-spectrum';
import { isEqual } from 'lodash';

import { Gear } from '../../../../assets/icons';
import { useFeatureFlags } from '../../../../hooks/use-feature-flags/use-feature-flags';
import { ButtonWithLoading } from '../../button-with-loading';
import { InfoTooltip } from '../../info-tooltip/info-tooltip.component';
import classes from './settings.module.scss';
import { FEATURES, SettingsConfig, UseSettings } from './use-settings.hook';

export const Settings = ({ settings }: { settings: UseSettings }): JSX.Element => {
    const { saveConfig, config, isSavingConfig } = settings;
    const featureFlags = useFeatureFlags();

    // Used for temporary state before the user saves the changes
    const [tempConfig, setTempConfig] = useState<SettingsConfig>(config);

    useEffect(() => {
        setTempConfig(config);
    }, [config]);

    const handleToggleFeature = (isEnabled: boolean, feature: FEATURES) => {
        setTempConfig((prevConfig) => ({ ...prevConfig, [feature]: { ...prevConfig[feature], isEnabled } }));
    };

    const hasUnsavedChanges = !isEqual(tempConfig, config);

    if (!featureFlags.ANNOTATOR_SETTINGS) {
        return <></>;
    }

    return (
        <DialogTrigger>
            <ActionButton data-testid='settings-icon' isQuiet UNSAFE_className={classes.gearButton}>
                <Gear />
            </ActionButton>

            {(close) => (
                <Dialog UNSAFE_className={classes.dialogWrapper}>
                    <Heading>Settings</Heading>

                    <Divider />

                    <Content UNSAFE_className={classes.dialogContent}>
                        <Tabs aria-label='Settings dialog' orientation='vertical' height={'100%'}>
                            <TabList UNSAFE_className={classes.tabList}>
                                <Item key='tab-view'>View</Item>
                                {/*
                                TODO: enable this once we implement the "first user experience" feature
                                <Item key='tab-ux'>First user experience</Item>
                                */}
                            </TabList>
                            <TabPanels UNSAFE_className={classes.tabPanels}>
                                <Item key='tab-view'>
                                    <Flex direction={'column'} justifyContent='center'>
                                        <Flex direction={'column'} UNSAFE_className={classes.tabPanelItem}>
                                            <Text>Annotation</Text>
                                            <Switch
                                                data-testid='annotation-panel-switch-id'
                                                isSelected={tempConfig[FEATURES.ANNOTATION_PANEL].isEnabled}
                                                onChange={(isToggled) =>
                                                    handleToggleFeature(isToggled, FEATURES.ANNOTATION_PANEL)
                                                }
                                            >
                                                {tempConfig[FEATURES.ANNOTATION_PANEL].isEnabled ? 'On' : 'Off'}
                                            </Switch>
                                            <InfoTooltip
                                                id='toggle-info-annotation-list'
                                                tooltipText={tempConfig[FEATURES.ANNOTATION_PANEL].tooltipDescription}
                                                buttonClasses={classes.infoButton}
                                            />
                                        </Flex>

                                        <Flex direction={'column'} UNSAFE_className={classes.tabPanelItem}>
                                            <Text>Counting</Text>
                                            <Switch
                                                data-testid='counting-panel-switch-id'
                                                isSelected={tempConfig[FEATURES.COUNTING_PANEL].isEnabled}
                                                onChange={(isToggled) =>
                                                    handleToggleFeature(isToggled, FEATURES.COUNTING_PANEL)
                                                }
                                            >
                                                {tempConfig[FEATURES.COUNTING_PANEL].isEnabled ? 'On' : 'Off'}
                                            </Switch>
                                            <InfoTooltip
                                                id='toggle-info-counting-list'
                                                tooltipText={tempConfig[FEATURES.COUNTING_PANEL].tooltipDescription}
                                                buttonClasses={classes.infoButton}
                                            />
                                        </Flex>
                                    </Flex>
                                </Item>
                                <Item key='tab-ux'>TBD</Item>
                            </TabPanels>
                        </Tabs>
                    </Content>

                    <ButtonGroup>
                        <Button variant='secondary' onPress={close} data-testid='cancel-settings-dialog-id'>
                            Cancel
                        </Button>
                        <ButtonWithLoading
                            isDisabled={!hasUnsavedChanges}
                            onPress={() => {
                                saveConfig(tempConfig);
                                close();
                            }}
                            isLoading={isSavingConfig}
                            data-testid='save-settings-dialog-id'
                        >
                            Save
                        </ButtonWithLoading>
                    </ButtonGroup>
                </Dialog>
            )}
        </DialogTrigger>
    );
};
