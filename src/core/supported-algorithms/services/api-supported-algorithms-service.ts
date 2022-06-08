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

import { sortAscending } from '../../../shared/utils';
import { DOMAIN } from '../../projects';
import { API_URLS } from '../../services';
import AXIOS from '../../services/axios-instance';
import { SupportedAlgorithm, SupportedAlgorithmDTO } from '../dtos';
import { getSupportedAlgorithmEntity } from './utils';

export interface CreateApiSupportedAlgorithmsService {
    getSupportedAlgorithms: (domain?: DOMAIN) => Promise<SupportedAlgorithm[]>;
}

export const createApiSupportedAlgorithmsService = (): CreateApiSupportedAlgorithmsService => {
    const getSupportedAlgorithms = async (domain?: DOMAIN): Promise<SupportedAlgorithm[]> => {
        const { data } = await AXIOS.get<{ items: SupportedAlgorithmDTO[] }>(API_URLS.SUPPORTED_ALGORITHMS(domain));
        const supportedAlgorithms = data.items
            .map(getSupportedAlgorithmEntity)
            .filter((suportedAlgorithm): suportedAlgorithm is SupportedAlgorithm => suportedAlgorithm !== undefined);

        return sortAscending(supportedAlgorithms, 'gigaflops');
    };
    return { getSupportedAlgorithms };
};
