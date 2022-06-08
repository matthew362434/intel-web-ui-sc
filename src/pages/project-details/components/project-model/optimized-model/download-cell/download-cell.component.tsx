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

import { ActionButton } from '@adobe/react-spectrum';

import { DownloadIcon } from '../../../../../../assets/icons';
import { idMatchingFormat } from '../../../../../../test-utils';
import { TrainedModel } from '../optimized-models.interface';

interface DownloadCellInterface {
    rowData: TrainedModel;
    url: string;
}

export const DownloadCell = ({ rowData, url }: DownloadCellInterface): JSX.Element => {
    return (
        <a download href={`/api/${url}`}>
            <ActionButton id={`${idMatchingFormat(rowData.id)}-download-model-button`} isQuiet>
                <DownloadIcon id={'download-model-id'} />
            </ActionButton>
        </a>
    );
};
