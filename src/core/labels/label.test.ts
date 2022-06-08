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
import { getMockedLabel } from '../../test-utils/mocked-items-factory';
import { DOMAIN } from '../projects';
import { LabelDTO } from './dtos';
import { getBehaviourFromDTO, isExclusive, isGlobal, isLocal, isAnomalous } from './label';
import { LABEL_BEHAVIOUR } from './label.interface';

it.each([
    [LABEL_BEHAVIOUR.EXCLUSIVE, true],
    [LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.LOCAL, true],
    [LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.GLOBAL, true],
    [LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL, true],
    [LABEL_BEHAVIOUR.LOCAL, false],
    [LABEL_BEHAVIOUR.GLOBAL, false],
    [LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL, false],
])('isExclusive(%o) === %o', (behaviour: LABEL_BEHAVIOUR, expectedResult: boolean) => {
    const label = getMockedLabel({ behaviour });

    expect(isExclusive(label)).toBe(expectedResult);
});

it.each([
    [LABEL_BEHAVIOUR.EXCLUSIVE, false],
    [LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.LOCAL, true],
    [LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.GLOBAL, false],
    [LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL, true],
    [LABEL_BEHAVIOUR.LOCAL, true],
    [LABEL_BEHAVIOUR.GLOBAL, false],
    [LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL, true],
])('isLocal(%o) === %o', (behaviour: LABEL_BEHAVIOUR, expectedResult: boolean) => {
    const label = getMockedLabel({ behaviour });

    expect(isLocal(label)).toBe(expectedResult);
});

it.each([
    // NOTE: Empty labels are considered as global
    [LABEL_BEHAVIOUR.EXCLUSIVE, true],
    [LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.LOCAL, true],

    [LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.GLOBAL, true],
    [LABEL_BEHAVIOUR.EXCLUSIVE + LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL, true],
    [LABEL_BEHAVIOUR.LOCAL, false],
    [LABEL_BEHAVIOUR.GLOBAL, true],
    [LABEL_BEHAVIOUR.LOCAL + LABEL_BEHAVIOUR.GLOBAL, true],
])('isGlobal(%o) === %o', (behaviour: LABEL_BEHAVIOUR, expectedResult: boolean) => {
    const label = getMockedLabel({ behaviour });

    expect(isGlobal(label)).toBe(expectedResult);
});

it.each([
    [LABEL_BEHAVIOUR.ANOMALOUS, true],
    [LABEL_BEHAVIOUR.LOCAL, false],
])('isAnomalous(%o) === %o', (behaviour: LABEL_BEHAVIOUR, expectedResult: boolean) => {
    const label = getMockedLabel({ behaviour });

    expect(isAnomalous(label)).toBe(expectedResult);
});

describe('Label behaviour based on task type', () => {
    const labelDTO: LabelDTO = {
        id: '1',
        color: 'red',
        name: 'Hearts',
        group: 'suit',
        hotkey: 'ctrl+1',
        parent_id: null,
        is_empty: false,
    };

    it.each([DOMAIN.CLASSIFICATION, DOMAIN.DETECTION, DOMAIN.SEGMENTATION])(
        'gives empty labels a GLOBAL and EMPTY behavior for %o domain',
        (domain: DOMAIN) => {
            expect(getBehaviourFromDTO({ ...labelDTO, is_empty: true }, domain)).toEqual(
                LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.EXCLUSIVE
            );
        }
    );

    it('gives labels from clasification tasks a GLOBAL behavior', () => {
        expect(getBehaviourFromDTO(labelDTO, DOMAIN.CLASSIFICATION)).toEqual(LABEL_BEHAVIOUR.GLOBAL);
    });

    it('gives labels from detection tasks a LOCAL behavior', () => {
        expect(getBehaviourFromDTO(labelDTO, DOMAIN.DETECTION)).toEqual(LABEL_BEHAVIOUR.LOCAL);
    });

    it('gives labels from segmentation tasks a LOCAL behavior', () => {
        expect(getBehaviourFromDTO(labelDTO, DOMAIN.SEGMENTATION)).toEqual(LABEL_BEHAVIOUR.LOCAL);
    });

    it('gives the normal label an empty behaviour', () => {
        expect(getBehaviourFromDTO({ ...labelDTO, name: 'Normal' }, DOMAIN.ANOMALY_CLASSIFICATION)).toEqual(
            LABEL_BEHAVIOUR.GLOBAL + LABEL_BEHAVIOUR.EXCLUSIVE
        );
    });

    it.each([DOMAIN.ANOMALY_CLASSIFICATION, DOMAIN.ANOMALY_DETECTION, DOMAIN.ANOMALY_SEGMENTATION])(
        'gives anomalous behaviour to anomalous labels for %o domain',
        (domain) => {
            const behaviour = getBehaviourFromDTO({ ...labelDTO, name: 'Anomalous' }, domain);
            const label = getMockedLabel({ behaviour });

            expect(isAnomalous(label)).toEqual(true);
        }
    );

    it.each([DOMAIN.CLASSIFICATION, DOMAIN.DETECTION, DOMAIN.SEGMENTATION])(
        'does not give anomalous behaviour to anomalous labels for %o domain',
        (domain) => {
            const behaviour = getBehaviourFromDTO({ ...labelDTO, name: 'Anomalous' }, domain);
            const label = getMockedLabel({ behaviour });

            expect(isAnomalous(label)).not.toEqual(true);
        }
    );
});
