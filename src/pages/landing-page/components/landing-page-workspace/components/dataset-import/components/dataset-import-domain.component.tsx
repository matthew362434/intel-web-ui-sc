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

import { Key, useMemo } from 'react';

import { ComboBox, Flex, Item, TextField } from '@adobe/react-spectrum';

import { capitalize } from '../../../../../../../shared/utils';
import { DatasetImportUploadItem } from '../dataset-import.interface';

interface DatasetImportDomainProps {
    uploadItem: DatasetImportUploadItem;
    patchUpload: (uploadId: string, data: Partial<DatasetImportUploadItem>) => void;
}

export const DatasetImportDomain = ({ uploadItem, patchUpload }: DatasetImportDomainProps): JSX.Element => {
    const { fileId, labelToTasks, projectName, taskType } = uploadItem;

    const taskTypes = useMemo((): Record<string, string>[] => {
        return Object.values(labelToTasks)
            .flat()
            .sort()
            .filter((taskTypeItem: string, index: number, self: string[]) => self.indexOf(taskTypeItem) === index)
            .map((taskTypeItem: string) => ({
                id: taskTypeItem.toLowerCase(),
                name: taskTypeItem.toLowerCase(),
            }));
    }, [labelToTasks]);

    return (
        <Flex direction='column' gap='size-250'>
            <TextField
                width='100%'
                label='Project name'
                placeholder='Project name'
                defaultValue={projectName}
                onChange={(value: string) => {
                    patchUpload(fileId, { projectName: value.trim() });
                }}
            />
            <ComboBox
                width='100%'
                label='Task type'
                menuTrigger='focus'
                items={taskTypes}
                allowsCustomValue={false}
                defaultInputValue={capitalize(taskType || '')}
                onSelectionChange={(selectedType: Key) => {
                    const selectedTaskType = String(selectedType).trim().toLowerCase();
                    if (selectedTaskType === taskType) return;
                    const labelsToSelect: string[] = [];
                    for (const [key, value] of Object.entries(labelToTasks)) {
                        const loweredTaskTypes = value.map((type: string) => type.toLowerCase());
                        if (!loweredTaskTypes.includes(selectedTaskType)) continue;
                        labelsToSelect.push(key);
                    }
                    patchUpload(fileId, {
                        taskType: selectedTaskType,
                        labels: [],
                        labelsToSelect: labelsToSelect.sort(),
                    });
                }}
            >
                {(option) => <Item key={option.id}>{capitalize(option.name)}</Item>}
            </ComboBox>
        </Flex>
    );
};
