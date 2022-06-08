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
import { ActionButton, Dialog, DialogTrigger, View } from '@adobe/react-spectrum';
import { BorderRadiusValue } from '@react-types/shared/src/dna';
import { Responsive } from '@react-types/shared/src/style';
import { HexColorPicker } from 'react-colorful';

import classes from './color-picker-dialog.module.scss';

interface ColorPickerDialogProps {
    id: string;
    color: string | undefined;
    onColorChange: (color: string) => void;
    size?: 'S' | 'L';
    onOpenChange?: (isOpen: boolean) => void;
}

export const ColorPickerDialog = ({
    id,
    color,
    onColorChange,
    size = 'L',
    onOpenChange = () => {
        /**/
    },
    ...rest
}: ColorPickerDialogProps): JSX.Element => {
    const sizeParameters: { size: string; radius?: Responsive<BorderRadiusValue> } =
        size === 'L' ? { size: 'size-400', radius: 'small' } : { size: 'size-125' };

    return (
        <DialogTrigger type='popover' onOpenChange={onOpenChange}>
            <ActionButton id={id} height={'fit-content'} isQuiet={false} aria-label={'Color picker button'} {...rest}>
                <View
                    width={sizeParameters.size}
                    height={sizeParameters.size}
                    minWidth={sizeParameters.size}
                    borderRadius={sizeParameters.radius || undefined}
                    margin={10}
                    id={`${id}-selected-color`}
                    UNSAFE_style={{ backgroundColor: color }}
                />
            </ActionButton>
            <Dialog UNSAFE_className={classes.dialog}>
                <View margin={'size-400'} UNSAFE_style={{ width: 'fit-content' }}>
                    <HexColorPicker color={color} onChange={onColorChange} />
                </View>
            </Dialog>
        </DialogTrigger>
    );
};
