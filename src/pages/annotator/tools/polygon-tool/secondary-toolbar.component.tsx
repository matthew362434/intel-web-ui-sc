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

import { Switch, Divider, Flex, Tooltip, TooltipTrigger } from '@adobe/react-spectrum';
import { Text } from '@react-spectrum/text';

import { useDrawingToolsKeyboardShortcut } from '../../../annotator/hot-keys';
import { ToolAnnotationContextProps } from '../tools.interface';
import { blurActiveInput } from '../utils';
import { usePolygonState } from './polygon-state-provider.component';
import { PolygonMode } from './polygon-tool.enum';

const SecondaryToolbar = (_annotationToolContext: ToolAnnotationContextProps): JSX.Element => {
    const { mode, setMode, isIntelligentScissorsLoaded } = usePolygonState();
    const isMagneticLasso = mode === PolygonMode.MagneticLasso;

    const onChangeSnappingMode = (isSelected: boolean) => setMode(isSelected ? PolygonMode.MagneticLasso : null);
    const handleToggleSnappingMode = () => isIntelligentScissorsLoaded && onChangeSnappingMode(!isMagneticLasso);

    useDrawingToolsKeyboardShortcut(PolygonMode.MagneticLasso, handleToggleSnappingMode, [mode]);

    return (
        <Flex direction='row' alignItems='center' justifyContent='center' gap='size-200'>
            <Text>Polygon Tool</Text>
            <Divider orientation='vertical' size='S' />
            <TooltipTrigger placement='right'>
                <Switch
                    isSelected={isMagneticLasso}
                    isDisabled={!isIntelligentScissorsLoaded}
                    onFocusChange={blurActiveInput}
                    onChange={onChangeSnappingMode}
                >
                    Snapping mode
                </Switch>
                <Tooltip isOpen placement='right'>
                    shift+s
                </Tooltip>
            </TooltipTrigger>
        </Flex>
    );
};

export default SecondaryToolbar;
