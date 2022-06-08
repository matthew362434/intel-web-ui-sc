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

import { Flex } from '@adobe/react-spectrum';

import DetectionWithClassificationImg from '../../../../assets/domains/a1-Detection-classification-small.png';
import ClassificationChainImg from '../../../../assets/domains/a2-detection-Classification-small.png';
import DetectionWithSegmentationImg from '../../../../assets/domains/b1-Detection-segmentation-small.png';
import SegmentationChainImg from '../../../../assets/domains/b2-detection-Segmentation-small.png';
import { ChevronRightSmallLight } from '../../../../assets/icons';
import { DOMAIN } from '../../../../core/projects';
import { SelectDomainButton } from './select-domain-button.component';

export const DomainChainSteps = ({
    domains,
    selected,
    handleSelection,
    isValid,
}: {
    domains: DOMAIN[];
    handleSelection: (domain: DOMAIN) => void;
    selected?: DOMAIN;
    isValid: boolean;
}): JSX.Element => {
    const getDomainButton = (domain: DOMAIN, isNextEnabled = true): JSX.Element => {
        switch (domain) {
            case DOMAIN.DETECTION:
                return (
                    <SelectDomainButton
                        imgSrc={
                            domains[1] === DOMAIN.CLASSIFICATION
                                ? DetectionWithClassificationImg
                                : DetectionWithSegmentationImg
                        }
                        alt={'detection step'}
                        id={'detection-step'}
                        text={'Detection'}
                        select={() => handleSelection(DOMAIN.DETECTION)}
                        isSelected={selected === DOMAIN.DETECTION}
                        isDisabled={selected !== DOMAIN.DETECTION ? !isNextEnabled : false}
                    />
                );
            case DOMAIN.SEGMENTATION:
                return (
                    <SelectDomainButton
                        imgSrc={SegmentationChainImg}
                        alt={'segmentation step'}
                        id={'segmentation-step'}
                        text={'Segmentation'}
                        select={() => handleSelection(DOMAIN.SEGMENTATION)}
                        isSelected={selected === DOMAIN.SEGMENTATION}
                        isDisabled={selected !== DOMAIN.SEGMENTATION ? !isNextEnabled : false}
                    />
                );
            case DOMAIN.CLASSIFICATION:
                return (
                    <SelectDomainButton
                        imgSrc={ClassificationChainImg}
                        alt={'classification step'}
                        id={'classification-step'}
                        text={'Classification'}
                        select={() => handleSelection(DOMAIN.CLASSIFICATION)}
                        isSelected={selected === DOMAIN.CLASSIFICATION}
                        isDisabled={selected !== DOMAIN.CLASSIFICATION ? !isNextEnabled : false}
                    />
                );
            default:
                throw new Error('Unsupported domain in chain');
        }
    };

    return (
        <Flex direction={'row'} alignItems={'center'} gap={'size-50'} marginX={'size-200'} marginBottom={'size-200'}>
            {getDomainButton(domains[0])}
            <ChevronRightSmallLight />
            {getDomainButton(domains[1], isValid)}
        </Flex>
    );
};
