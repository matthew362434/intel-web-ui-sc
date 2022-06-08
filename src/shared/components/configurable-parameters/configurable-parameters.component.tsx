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
import { View } from '@react-spectrum/view';

import { TrainHPO } from '../../../pages/project-details/components/project-models/train-model-dialog/train-configurable-parameters/train-hpo';
import { idMatchingFormat } from '../../../test-utils';
import { TabItem } from '../tabs';
import { ConfigurableParametersProps, ConfigurableParametersType } from './configurable-parameters.interface';
import { CPGroupsList } from './cp-groups-list';
import { CPParamsList } from './cp-list';
import { SelectableCustomizedTabs } from './selectable-customized-tabs';
import { SelectableManyTasks } from './selectable-many-tasks';
import { isLearningParametersTab } from './utils';

export const ConfigurableParameters = (props: ConfigurableParametersProps): JSX.Element => {
    if (props.type === ConfigurableParametersType.MANY_CONFIG_PARAMETERS) {
        const {
            configParametersData,
            updateParameter,
            selectedComponent,
            selectedComponentId,
            setSelectedComponentId,
        } = props;

        return (
            <View minHeight={0} height={'100%'}>
                <SelectableManyTasks
                    configurableParameters={configParametersData}
                    updateParameter={updateParameter}
                    selectedComponent={selectedComponent}
                    selectedComponentId={selectedComponentId}
                    setSelectedComponentId={setSelectedComponentId}
                />
            </View>
        );
    } else {
        let ITEMS: TabItem[] = [];
        let isHPO = false;
        if (props.type === ConfigurableParametersType.SINGLE_CONFIG_PARAMETERS) {
            const { updateParameter, configParametersData, hpo } = props;
            isHPO = hpo.isHPO;
            ITEMS = configParametersData.components.map(({ header, groups, parameters, entityIdentifier }) => {
                const isLearningParameters = isLearningParametersTab(entityIdentifier);
                const shouldShowHPOToggle = isLearningParameters && hpo.isHPOSupported;
                return {
                    id: `${idMatchingFormat(header)}-id`,
                    key: `${idMatchingFormat(header)}-id`,
                    name: header,
                    isLearningParametersTab: isLearningParameters,
                    children: (
                        <>
                            {shouldShowHPOToggle ? (
                                <>
                                    <TrainHPO {...hpo} />
                                    {parameters && (
                                        <CPParamsList
                                            parameters={parameters}
                                            updateParameter={updateParameter}
                                            isHPO={isHPO}
                                        />
                                    )}
                                    {groups && (
                                        <CPGroupsList
                                            isPadding
                                            groups={groups}
                                            updateParameter={updateParameter}
                                            isHPO={isHPO}
                                        />
                                    )}
                                </>
                            ) : (
                                <>
                                    {parameters && (
                                        <CPParamsList
                                            parameters={parameters}
                                            updateParameter={updateParameter}
                                            isHPO={false}
                                        />
                                    )}
                                    {groups && (
                                        <CPGroupsList
                                            isPadding
                                            groups={groups}
                                            updateParameter={updateParameter}
                                            isHPO={false}
                                        />
                                    )}
                                </>
                            )}
                        </>
                    ),
                };
            });
        } else {
            ITEMS = props.configParametersData.components.map(({ header, groups, parameters }) => ({
                id: `${idMatchingFormat(header)}-id`,
                key: `${idMatchingFormat(header)}-id`,
                name: header,
                children: (
                    <>
                        {parameters && <CPParamsList parameters={parameters} isHPO={false} />}
                        {groups && <CPGroupsList groups={groups} isHPO={false} />}
                    </>
                ),
            }));
        }

        return (
            <View minHeight={0} height={'100%'}>
                <SelectableCustomizedTabs items={ITEMS} orientation={'vertical'} height={'100%'} isHPO={isHPO} />
            </View>
        );
    }
};
