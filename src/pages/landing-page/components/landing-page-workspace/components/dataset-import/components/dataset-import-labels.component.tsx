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

import { useCallback, useMemo } from 'react';

import { Checkbox, Divider, Flex, Heading, IllustratedMessage, Text, View } from '@adobe/react-spectrum';
import NotFound from '@spectrum-icons/illustrations/NotFound';

import { capitalize } from '../../../../../../../shared/utils';
import { getRandomDistinctColor } from '../../../../../../create-project/components/distinct-colors';
import { DatasetImportUploadItem } from '../dataset-import.interface';
import classes from '../dataset-import.module.scss';

interface DatasetImportLabelsProps {
    uploadItem: DatasetImportUploadItem;
    patchUpload: (uploadId: string, data: Partial<DatasetImportUploadItem>) => void;
}

interface DatasetImportLabelItemProps {
    label: string;
    toggleLabel: (label: string) => void;
    isSelected: (label: string) => boolean;
}

const DatasetImportLabelItem = ({ label, toggleLabel, isSelected }: DatasetImportLabelItemProps): JSX.Element => {
    const labelItemColor = useMemo<string>(() => getRandomDistinctColor(), []);

    return (
        <View height='size-600' marginBottom='size-25' backgroundColor='gray-100'>
            <Flex gap='size-250' height='100%' alignItems='center' marginX='size-250'>
                <Checkbox
                    aria-label='toggle-label'
                    isSelected={isSelected(label)}
                    onChange={() => toggleLabel(label)}
                    UNSAFE_style={{ paddingRight: 0 }}
                />
                <Divider orientation='vertical' size='M' UNSAFE_className={classes.divider} />
                <Flex alignItems='center' marginStart='size-400' gap='size-150'>
                    <View
                        width='size-200'
                        height='size-200'
                        borderRadius='regular'
                        UNSAFE_style={{ backgroundColor: labelItemColor }}
                    />
                    <Text>{capitalize(label)}</Text>
                </Flex>
            </Flex>
        </View>
    );
};

export const DatasetImportLabels = ({ uploadItem, patchUpload }: DatasetImportLabelsProps): JSX.Element => {
    const { labelsToSelect } = uploadItem;

    const selectAll = useCallback(
        (state: boolean) => {
            patchUpload(uploadItem.fileId, { labels: state ? uploadItem.labelsToSelect : [] });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [uploadItem]
    );

    const isLabelSelected = useCallback((label: string): boolean => uploadItem.labels.includes(label), [uploadItem]);

    const toggleLabel = useCallback(
        (label: string): void => {
            const { labels, fileId } = uploadItem;
            let updatedLabels: string[] = [];
            if (labels.includes(label)) {
                updatedLabels = labels.filter((labelItem: string) => labelItem !== label);
            } else {
                updatedLabels = [...labels, label];
            }
            patchUpload(fileId, { labels: updatedLabels });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [uploadItem]
    );

    const isSelected = useMemo((): boolean => {
        const { labels } = uploadItem;
        return labels.length > 0 && labels.length === labelsToSelect.length;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadItem]);

    const isIndeterminate = useMemo((): boolean => {
        const { labels } = uploadItem;
        return labels.length > 0 && labels.length < labelsToSelect.length;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadItem]);

    return (
        <>
            {!!labelsToSelect.length ? (
                <Flex direction='column' height='100%'>
                    <Flex alignItems='center' marginX='size-250'>
                        <Checkbox onChange={selectAll} isSelected={isSelected} isIndeterminate={isIndeterminate}>
                            Select all labels
                        </Checkbox>
                    </Flex>
                    <View marginTop='size-150' UNSAFE_style={{ overflow: 'auto' }}>
                        {labelsToSelect.sort().map((label: string) => (
                            <DatasetImportLabelItem
                                key={label}
                                label={label}
                                toggleLabel={toggleLabel}
                                isSelected={isLabelSelected}
                            />
                        ))}
                    </View>
                </Flex>
            ) : (
                <IllustratedMessage>
                    <NotFound />
                    <Heading>No labels</Heading>
                </IllustratedMessage>
            )}
        </>
    );
};
