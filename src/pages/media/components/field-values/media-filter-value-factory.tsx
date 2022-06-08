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

import { SearchRuleField, SearchRuleValue } from '../../media-filter.interface';
import { useMedia } from '../../providers/media-provider.component';
import { numberRegex, textRegex } from '../../util';
import { MediaFilterLabelNormalAnomalous } from './media-filter-label-normal-anomalous.component';
import { MediaFilterValueAnnotationSceneState } from './media-filter-value-annotation-scene-state.component';
import { MediaFilterValueDate } from './media-filter-value-date.component';
import { MediaFilterValueLabel } from './media-filter-value-label.component';
import { MediaTextField } from './media-text-field.component';

interface MediaFilterValueFactoryProps {
    value: SearchRuleValue;
    field: SearchRuleField | '';
    isAnomalyProject: boolean;
    isDisabled?: boolean;
    onSelectionChange: (key: SearchRuleValue) => void;
}

export const MediaFilterValueFactory = (props: MediaFilterValueFactoryProps): JSX.Element => {
    const { anomalyLabel } = useMedia();

    switch (props.field) {
        case SearchRuleField.MediaWidth:
        case SearchRuleField.MediaHeight:
            return (
                <MediaTextField
                    isNumber
                    {...props}
                    regex={numberRegex}
                    value={props.value as string}
                    aria-label={'media-filter-size'}
                />
            );

        case SearchRuleField.LabelId:
            if (props.isAnomalyProject && anomalyLabel?.id) {
                return <MediaFilterLabelNormalAnomalous {...props} anomalyLabel={anomalyLabel} />;
            }
            return <MediaFilterValueLabel {...props} value={props.value as string} />;

        case SearchRuleField.AnnotationSceneState:
            return (
                <MediaFilterValueAnnotationSceneState
                    {...props}
                    value={props.value as string}
                    isAnomalyProject={props.isAnomalyProject}
                />
            );

        case SearchRuleField.MediaUploadDate:
        case SearchRuleField.AnnotationCreationDate:
            return <MediaFilterValueDate {...props} value={props.value as string} />;

        default:
            return (
                <MediaTextField
                    {...props}
                    regex={textRegex}
                    isDisabled={props.field === ''}
                    value={props.value as string}
                    aria-label={'media-filter-name'}
                />
            );
    }
};
