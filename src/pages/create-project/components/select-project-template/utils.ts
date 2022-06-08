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

import DetectionWithClassificationImg from '../../../../assets/domains/a1-Detection-classification.png';
import ClassificationChainImg from '../../../../assets/domains/a2-detection-Classification.png';
import AnomalyClassificationImg from '../../../../assets/domains/anomaly-classification.svg';
import AnomalyDetectionImg from '../../../../assets/domains/anomaly-detection.svg';
import AnomalySegmentationImg from '../../../../assets/domains/anomaly-segmentation.svg';
import DetectionWithSegmentationImg from '../../../../assets/domains/b1-Detection-segmentation.png';
import SegmentationChainImg from '../../../../assets/domains/b2-detection-Segmentation.png';
import ClassificationHierarchicalImg from '../../../../assets/domains/classification-hierarchical.svg';
import ClassificationMultiLabelImg from '../../../../assets/domains/classification-multi-label.svg';
import ClassificationImg from '../../../../assets/domains/classification-single.svg';
import DetectionImg from '../../../../assets/domains/detection-normal.svg';
import DetectionRotatedImg from '../../../../assets/domains/detection-rotated.svg';
import SegmentationInstanceImg from '../../../../assets/domains/segmentation-instance.svg';
import SegmentationImg from '../../../../assets/domains/segmentation-semantic.svg';
import { DOMAIN, SUBDOMAIN } from '../../../../core/projects';
import { DomainCardsMetadata, TaskChainMetadata } from './project-template.interface';

type TABS = 'Detection' | 'Segmentation' | 'Classification' | 'Anomaly';

export enum LabelsRelationType {
    SINGLE_SELECTION = 'Single selection',
    MULTI_SELECTION = 'Multiple selection',
    MIXED = 'Mixed',
}

export const TABS_SINGLE_TEMPLATE: Record<TABS, DomainCardsMetadata[]> = {
    Detection: [
        {
            imgSrc: DetectionImg,
            alt: 'detection-bounding-box',
            domain: DOMAIN.DETECTION,
            subDomain: SUBDOMAIN.DETECTION_BOUNDING_BOX,
            description: 'Draw a rectangle around an object in an image',
            id: 'detection-card-id',
            relation: LabelsRelationType.SINGLE_SELECTION,
        },
        {
            imgSrc: DetectionRotatedImg,
            alt: 'detection-rotated-bounding-box',
            domain: DOMAIN.DETECTION_ROTATED_BOUNDING_BOX,
            subDomain: SUBDOMAIN.DETECTION_ROTATED_BOUNDING_BOX,
            description: 'Draw and enclose an object within a minimal rectangle',
            id: 'rotated-detection-card-id',
            relation: LabelsRelationType.SINGLE_SELECTION,
        },
    ],
    Segmentation: [
        {
            imgSrc: SegmentationInstanceImg,
            alt: 'segmentation-instance',
            domain: DOMAIN.SEGMENTATION_INSTANCE,
            subDomain: SUBDOMAIN.SEGMENTATION_INSTANCE,
            description: 'Detect and delineate each distinct object of interest in an image',
            id: 'instance-segmentation-card-id',
            relation: LabelsRelationType.SINGLE_SELECTION,
        },
        {
            imgSrc: SegmentationImg,
            alt: 'segmentation-semantic',
            domain: DOMAIN.SEGMENTATION,
            subDomain: SUBDOMAIN.SEGMENTATION_SEMANTIC,
            description: 'Group parts of an image that belong the same object',
            id: 'segmentation-card-id',
            relation: LabelsRelationType.SINGLE_SELECTION,
        },
    ],
    Classification: [
        {
            imgSrc: ClassificationImg,
            alt: 'classification-multi-class',
            domain: DOMAIN.CLASSIFICATION,
            subDomain: SUBDOMAIN.CLASSIFICATION_MULTI_CLASS,
            description: 'Choose a single label per image',
            id: 'classification-card-id',
            relation: LabelsRelationType.SINGLE_SELECTION,
        },
        {
            imgSrc: ClassificationMultiLabelImg,
            alt: 'classification-multi-label',
            domain: DOMAIN.CLASSIFICATION,
            subDomain: SUBDOMAIN.CLASSIFICATION_MULTI_LABEL,
            description: 'Choose multiple labels per image',
            id: 'classification-card-multi-label',
            relation: LabelsRelationType.MULTI_SELECTION,
        },
        {
            imgSrc: ClassificationHierarchicalImg,
            alt: 'classification-hierarchical',
            domain: DOMAIN.CLASSIFICATION,
            subDomain: SUBDOMAIN.CLASSIFICATION_HIERARCHICAL,
            description: 'Choose a single label and multiple labels per image in a hierarchical label structure',
            id: 'classification-card-hierarchical',
            relation: LabelsRelationType.MIXED,
        },
    ],
    Anomaly: [
        {
            imgSrc: AnomalyClassificationImg,
            alt: 'anomaly-classification',
            domain: DOMAIN.ANOMALY_CLASSIFICATION,
            subDomain: SUBDOMAIN.ANOMALY_CLASSIFICATION,
            description: 'Categorize images as normal or anomalous',
            id: 'anomaly-classification-card-id',
            relation: LabelsRelationType.SINGLE_SELECTION,
        },
        {
            imgSrc: AnomalyDetectionImg,
            alt: 'anomaly-detection',
            domain: DOMAIN.ANOMALY_DETECTION,
            subDomain: SUBDOMAIN.ANOMALY_DETECTION,
            description: 'Detect and categorize an object as normal or anomalous',
            id: 'anomaly-detection-card-id',
            relation: LabelsRelationType.SINGLE_SELECTION,
        },
        {
            imgSrc: AnomalySegmentationImg,
            alt: 'anomaly-segmentation',
            domain: DOMAIN.ANOMALY_SEGMENTATION,
            subDomain: SUBDOMAIN.ANOMALY_SEGMENTATION,
            description: 'Segment and categorize an object as normal or anomalous',
            id: 'anomaly-segmentation-card-id',
            relation: LabelsRelationType.SINGLE_SELECTION,
        },
    ],
};

export const taskChainSubDomains: TaskChainMetadata[] = [
    {
        domains: [DOMAIN.DETECTION, DOMAIN.CLASSIFICATION],
        description:
            'Detecting objects and drawing rectangles around them followed by classification of the detected objects',
        images: [DetectionWithClassificationImg, ClassificationChainImg],
        relations: [LabelsRelationType.SINGLE_SELECTION, LabelsRelationType.MIXED],
    },
    {
        domains: [DOMAIN.DETECTION, DOMAIN.SEGMENTATION],
        description:
            'Detecting objects and drawing rectangles around them followed by segmentation of the detected objects',
        images: [DetectionWithSegmentationImg, SegmentationChainImg],
        relations: [LabelsRelationType.SINGLE_SELECTION, LabelsRelationType.SINGLE_SELECTION],
    },
];
