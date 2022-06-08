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
import { StatusDTO } from './status.interface';

export interface JobDTO {
    description: string;
    id: string;
    name: string;
    project_id: string;
    status: StatusDTO;
    metadata: {
        task: {
            dataset_storage_id: string;
            model_architecture: string;
            model_template_id: string;
            model_version: number;
            name: string;
        };
    };
}
