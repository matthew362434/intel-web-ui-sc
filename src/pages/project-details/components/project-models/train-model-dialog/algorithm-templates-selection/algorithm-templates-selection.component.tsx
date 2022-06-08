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
import { Dispatch, SetStateAction } from 'react';

import { SupportedAlgorithm } from '../../../../../../core/supported-algorithms/dtos';
import { AlgorithmTemplatesList } from './algorithm-templates-list';

export interface AlgorithmTemplatesSelectionProps {
    algorithms: SupportedAlgorithm[];
    selectedAlgorithm: SupportedAlgorithm | null;
    setSelectedAlgorithm: Dispatch<SetStateAction<SupportedAlgorithm | null>>;
    animationDirection: number;
}

export const AlgorithmTemplatesSelection = ({
    algorithms,
    selectedAlgorithm,
    setSelectedAlgorithm,
    animationDirection,
}: AlgorithmTemplatesSelectionProps): JSX.Element => {
    return (
        <AlgorithmTemplatesList
            algorithms={algorithms}
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            animationDirection={animationDirection}
        />
    );
};
