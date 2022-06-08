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

import { createContext, Dispatch, SetStateAction, useContext, useRef, useState } from 'react';

import { Point } from '../../../../core/annotations';
import { MissingProviderError } from '../../../../shared/missing-provider-error';
import { StateProviderProps } from '../tools.interface';
import { SelectingToolType } from './selecting-tool.enums';

export interface SelectingStateContextProps {
    brushSize: number;
    showCirclePreview: boolean;
    activeTool: SelectingToolType;
    setBrushSize: Dispatch<SetStateAction<number>>;
    foregroundMarkers: React.MutableRefObject<Point[][]>;
    setActiveTool: Dispatch<SetStateAction<SelectingToolType>>;
    setShowCirclePreview: Dispatch<SetStateAction<boolean>>;
}

const SelectingStateContext = createContext<SelectingStateContextProps | undefined>(undefined);

export const SelectingStateProvider = ({ children }: StateProviderProps): JSX.Element => {
    const foregroundMarkers = useRef<Point[][]>([]);
    const [activeTool, setActiveTool] = useState<SelectingToolType>(SelectingToolType.SelectionTool);
    const [brushSize, setBrushSize] = useState<number>(1);
    const [showCirclePreview, setShowCirclePreview] = useState(false);

    return (
        <SelectingStateContext.Provider
            value={{
                activeTool,
                brushSize,
                setActiveTool,
                setBrushSize,
                foregroundMarkers,
                showCirclePreview,
                setShowCirclePreview,
            }}
        >
            {children}
        </SelectingStateContext.Provider>
    );
};

export const useSelectingState = (): SelectingStateContextProps => {
    const context = useContext(SelectingStateContext);

    if (context === undefined) {
        throw new MissingProviderError('SelectingState', 'SelectingStateProvider');
    }

    return context;
};
