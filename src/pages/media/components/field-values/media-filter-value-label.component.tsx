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

import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { TextArea } from '@adobe/react-spectrum';

import { Label } from '../../../../core/labels';
import { useOutsideClick } from '../../../../hooks';
import { KeyMap } from '../../../../shared/keyboard-events';
import { LabelResultPanel } from '../../../annotator/components/labels/label-search/label-result-panel.component';
import { fetchLabelsTree } from '../../../annotator/components/labels/utils/labels-utils';
import { useProject } from '../../../project-details/providers';
import { SearchRuleValue } from '../../media-filter.interface';
import { findLabelsById, hasLabelsDifference, isDigit, lastCommaRegex } from '../../util';

interface MediaFilterValueLabelProps {
    value: string | string[];
    onSelectionChange: (key: SearchRuleValue) => void;
}

const isEmptyInput = (value: string) => value.trim().length === 0;

const getLowercaseLabelsNames = (names: string): string[] => {
    //The regex "/\s*/g" can be replace with replaceAll once our node version get updated ^14
    return names.toLowerCase().replace(lastCommaRegex, '').replace(/\s*/g, '').split(',');
};

const isDelete = (event: KeyboardEvent) => event.code === KeyMap.Backspace || event.code === KeyMap.Delete;

export const MediaFilterValueLabel = ({ value = '', onSelectionChange }: MediaFilterValueLabelProps): JSX.Element => {
    const { project } = useProject();
    const { labels } = project;
    const savedLabels = useRef<Label[]>([]);
    const [inputValue, setInputValue] = useState('');
    const labelSearchRef = useRef<HTMLDivElement>({} as HTMLDivElement);
    const [resultPanelOpen, setResultPanelOpen] = useState(false);

    const setInputValueAndSelectionChange = useCallback(
        (newLabels: Label[], callOnSelection = true) => {
            savedLabels.current = newLabels;
            setInputValue(newLabels.reduce((accum, label) => `${accum}${label.name}, `, ''));
            callOnSelection && onSelectionChange(newLabels.map(({ id }) => id));
        },
        [onSelectionChange]
    );

    useEffect(() => {
        if (value === '') {
            savedLabels.current = [];
        }

        if (Array.isArray(value)) {
            const newLabels = findLabelsById(value, labels);
            setInputValueAndSelectionChange(newLabels, false);
        }
    }, [labels, setInputValueAndSelectionChange, value]);

    const openResultPanel = () => {
        !resultPanelOpen && setResultPanelOpen(true);
    };

    const closeResultPanel = () => {
        resultPanelOpen && setResultPanelOpen(false);
    };

    useOutsideClick({
        ref: labelSearchRef,
        callback: () => closeResultPanel(),
    });

    const labelsTree = useMemo(() => {
        return fetchLabelsTree(labels, []);
    }, [labels]);

    const labelNames = useMemo(() => {
        return labels.map(({ name }) => name.toLowerCase());
    }, [labels]);

    const isLabelNameValid = (names: string) => {
        return getLowercaseLabelsNames(names).every((name) => labelNames.includes(name));
    };

    const treeItemClickHandler = (label: Label): void => {
        const isNewLabel = savedLabels.current.every(({ id }) => id !== label.id);
        if (isNewLabel) {
            setInputValueAndSelectionChange([...savedLabels.current, label]);
        }
        closeResultPanel();
    };

    const onKeyUp = (event: KeyboardEvent) => {
        const textValue = (event.target as HTMLInputElement).value;
        const validLabesNames = getLowercaseLabelsNames(textValue);
        const newLabels = labels.filter(({ name }) => validLabesNames.includes(name.toLowerCase()));

        if (isDigit(event.keyCode) && isLabelNameValid(textValue)) {
            setInputValueAndSelectionChange(newLabels);
        }

        if (isDelete(event) && hasLabelsDifference(savedLabels.current, newLabels)) {
            setInputValueAndSelectionChange(newLabels);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={labelSearchRef}>
            <TextArea
                isQuiet
                width={'auto'}
                value={inputValue}
                aria-label={'media-filter-label'}
                onFocus={() => openResultPanel()}
                validationState={isLabelNameValid(inputValue) ? 'valid' : 'invalid'}
                onKeyUp={onKeyUp}
                onChange={(currentValue) => {
                    setInputValue(currentValue);

                    if (isEmptyInput(currentValue)) {
                        openResultPanel();
                    }
                }}
            />
            <LabelResultPanel labelsTree={labelsTree} isHidden={!resultPanelOpen} onSelected={treeItemClickHandler} />
        </div>
    );
};
