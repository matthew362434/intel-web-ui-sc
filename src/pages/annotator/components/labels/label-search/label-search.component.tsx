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

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, MouseEvent } from 'react';

import { TextField } from '@adobe/react-spectrum';
import { useFilter } from '@react-aria/i18n';
import { TextFieldRef } from '@react-types/textfield';

import { Label } from '../../../../../core/labels';
import { useEventListener, useOutsideClick } from '../../../../../hooks';
import { KeyboardEvents, KeyMap } from '../../../../../shared/keyboard-events';
import { LabelTreeLabel } from '../label-tree-view';
import { fetchLabelsTree, findLabelParents, uniqueLabels } from '../utils/labels-utils';
import { LabelResultPanel } from './label-result-panel.component';
import { LabelTreeItemSuffix } from './label-tree-view-item.component';

interface LabelSearchProps {
    id?: string;
    size?: {
        searchInput?: number | string;
        labelTree?: number | string;
    };
    labels: ReadonlyArray<Label>;
    onClick: (label: Label) => void;
    onReset?: () => void;
    onOpen?: (height: number) => void;
    shouldFocusTextInput?: boolean;
    treeViewHeight?: number;
    textAriaLabel?: string;
    placeholder?: string;
    suffix?: LabelTreeItemSuffix;
    classificationSearch?: boolean;
    isOpen?: boolean;
    className?: string;
}

const handleMouseWheel = (event: MouseEvent) => {
    // This allows the user to scroll through the labels without triggering any parent events.
    // Which will avoid any zooming in/out upon scroll using the mousewheel
    event.stopPropagation();
};

export const LabelSearch = ({
    size = { searchInput: 200, labelTree: 400 },
    id = '',
    labels,
    onClick,
    onReset,
    onOpen,
    treeViewHeight,
    shouldFocusTextInput = false,
    textAriaLabel = 'Select label',
    placeholder = 'Select label',
    suffix,
    classificationSearch,
    isOpen = false,
    className = undefined,
}: LabelSearchProps): JSX.Element => {
    const DEFAULT_SIZE = {
        searchInput: 200,
        labelTree: 400,
    };

    const [input, setInput] = useState('');
    const [resultPanelOpen, setResultPanelOpen] = useState<boolean>(isOpen);
    const labelSearchRef = useRef<HTMLDivElement>({} as HTMLDivElement);
    const inputRef = useRef<TextFieldRef>(null);

    const { contains } = useFilter({ sensitivity: 'base' });

    const openResultPanel = () => {
        !isOpen && setResultPanelOpen(true);
    };

    const closeResultPanel = useCallback(() => {
        !isOpen && setResultPanelOpen(false);
    }, [isOpen]);

    const results = useMemo((): LabelTreeLabel[] => {
        const emptyInput = input.trim().length === 0;

        const matchLabels = emptyInput ? labels : labels.filter((label: Label) => contains(label.name, input));
        const parents: Label[] = matchLabels.flatMap((label: Label) => findLabelParents(labels, label));
        const resultLabels: Label[] = uniqueLabels(matchLabels.concat(parents));

        const openNodes = input.trim().length === 0 ? [] : resultLabels.map((label: Label) => label.id);

        return fetchLabelsTree(resultLabels, openNodes);
    }, [input, labels, contains]);

    const treeItemClickHandler = useCallback(
        (label: Label): void => {
            onClick(label);
            setInput('');
            closeResultPanel();
        },
        [onClick, closeResultPanel]
    );

    useEventListener(
        KeyboardEvents.KeyDown,
        (event: KeyboardEvent) => {
            const { key } = event;

            if (key === KeyMap.Esc) {
                setInput('');
                closeResultPanel();

                if (onReset) {
                    onReset();
                }
            }
        },
        labelSearchRef
    );

    useOutsideClick({
        ref: labelSearchRef,
        callback: () => {
            closeResultPanel();

            if (onReset) {
                onReset();
            }
        },
    });

    useEffect(() => {
        if (shouldFocusTextInput && inputRef && inputRef.current) {
            inputRef.current.focus();
        }
    }, [shouldFocusTextInput]);

    useEffect(() => {
        const inputFieldHeight = labelSearchRef.current.clientHeight;

        if (onOpen) onOpen(inputFieldHeight);
    }, [onOpen]);

    return (
        <div
            ref={labelSearchRef}
            style={{ position: 'relative' }}
            className={className}
            onWheelCapture={handleMouseWheel}
        >
            <TextField
                id={id ? `${id}-label-search-field-id` : 'label-search-field-id'}
                label={classificationSearch ? textAriaLabel : null}
                value={input}
                width={size.searchInput || DEFAULT_SIZE.searchInput}
                ref={inputRef}
                placeholder={placeholder}
                aria-label={textAriaLabel}
                onFocus={() => {
                    openResultPanel();
                }}
                onInput={(event: FormEvent<HTMLInputElement>) => {
                    const value = event.currentTarget.value;

                    setInput(value);

                    if (value.trim().length === 0) {
                        openResultPanel();
                    }
                }}
            />
            <LabelResultPanel
                suffix={suffix}
                isOpen={isOpen}
                labelsTree={results}
                isHidden={!resultPanelOpen}
                size={classificationSearch ? '100%' : undefined}
                treeViewHeight={classificationSearch ? undefined : treeViewHeight}
                onSelected={treeItemClickHandler}
            />
        </div>
    );
};
