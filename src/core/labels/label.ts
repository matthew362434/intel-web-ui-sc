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

import { DOMAIN, isAnomalyDomain, isClassificationDomain } from '../projects';
import { DeletedLabelDTO, LabelDTO, NewLabelDTO } from './dtos';
import { Label, LABEL_BEHAVIOUR } from './label.interface';

export const isExclusive = (label: { behaviour: LABEL_BEHAVIOUR }): boolean => {
    return Boolean(label.behaviour & LABEL_BEHAVIOUR.EXCLUSIVE);
};

export const isLocal = (label: Label): boolean => {
    return Boolean(label.behaviour & LABEL_BEHAVIOUR.LOCAL);
};

export const isGlobal = (label: Label): boolean => {
    return Boolean(label.behaviour & LABEL_BEHAVIOUR.GLOBAL) || isExclusive(label);
};

export const isAnomalous = (label: Label): boolean => {
    return Boolean(label.behaviour & LABEL_BEHAVIOUR.ANOMALOUS);
};

export const getBehaviourFromDTO = (
    label: LabelDTO | NewLabelDTO | DeletedLabelDTO,
    domain: DOMAIN
): LABEL_BEHAVIOUR => {
    const labelIsEmpty = isAnomalyDomain(domain) && label.name === 'Normal' ? true : label.is_empty;

    if (labelIsEmpty) {
        return LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.GLOBAL;
    }

    if (isAnomalyDomain(domain)) {
        if (label.name === 'Anomalous') {
            return LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.ANOMALOUS;
        }
    }

    if (isClassificationDomain(domain)) {
        return LABEL_BEHAVIOUR.GLOBAL;
    }

    return LABEL_BEHAVIOUR.LOCAL;
};
