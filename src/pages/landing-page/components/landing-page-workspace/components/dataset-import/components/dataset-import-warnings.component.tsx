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

import { Divider, Flex, Text, View } from '@adobe/react-spectrum';
import Alert from '@spectrum-icons/workflow/Alert';

import { Image } from '../../../../../../../assets/icons';
import { capitalize } from '../../../../../../../shared/utils';
import {
    DatasetImportUploadItem,
    DatasetImportWarning,
    DATASET_IMPORT_WARNING_TYPE,
} from '../dataset-import.interface';
import classes from '../dataset-import.module.scss';

interface DatasetImportWarningsProps {
    uploadItem: DatasetImportUploadItem;
}

interface DatasetImportWarningItemProps {
    warning: DatasetImportWarning;
}

const DatasetImportWarningItem = ({ warning }: DatasetImportWarningItemProps): JSX.Element => {
    const { type, name, description, affectedImages, resolveStrategy } = warning;

    return (
        <View height='size-1200' backgroundColor='gray-100' padding='size-200'>
            <Flex height='100%' direction='column' gap='size-100'>
                <Flex alignItems='center' justifyContent='space-between'>
                    <Flex alignItems='center' gap='size-200'>
                        <Alert
                            size='S'
                            marginStart='size-50'
                            UNSAFE_className={
                                type === DATASET_IMPORT_WARNING_TYPE.ERROR ? classes.negative : classes.warning
                            }
                        />
                        <Text UNSAFE_className={classes.warningName}>
                            {type === DATASET_IMPORT_WARNING_TYPE.ERROR
                                ? capitalize(DATASET_IMPORT_WARNING_TYPE.ERROR)
                                : capitalize(DATASET_IMPORT_WARNING_TYPE.WARNINIG)}
                            {''} - {name}
                        </Text>
                    </Flex>
                    <Flex alignItems='center' gap='size-50'>
                        <Image />
                        <Text>{`${affectedImages} affected image${affectedImages > 1 ? 's' : ''}`}</Text>
                    </Flex>
                </Flex>
                <Flex alignItems='center' justifyContent='space-between'>
                    <Text UNSAFE_className={classes.warningDescription}>{description}</Text>
                </Flex>
                <Divider size='S' marginY='size-50' />
                <Flex marginStart='size-500'>{resolveStrategy}</Flex>
            </Flex>
        </View>
    );
};

export const DatasetImportWarnings = ({ uploadItem }: DatasetImportWarningsProps): JSX.Element => {
    const { warnings } = uploadItem;
    return (
        <Flex direction='column' height='100%' gap='size-250'>
            <Text>Detected issues in the dataset</Text>
            <Flex direction='column' gap='size-200' UNSAFE_className={classes.warnings}>
                {warnings.map((warning: DatasetImportWarning, idx: number) => (
                    <DatasetImportWarningItem key={`${warning.name}-${idx}`} warning={warning} />
                ))}
            </Flex>
        </Flex>
    );
};
