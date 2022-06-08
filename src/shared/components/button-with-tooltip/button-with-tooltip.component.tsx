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

import { ComponentProps, ComponentType } from 'react';

import { Button as SpectrumButton, ActionButton, Link } from '@adobe/react-spectrum';
import { SpectrumButtonProps } from '@react-types/button';

import { ElementWithTooltip, ElementWithTooltipProps } from '../element-with-tooltip/element-with-tooltip.component';
import classes from './button-with-tooltip.module.scss';

interface ButtonType {
    type: 'button';
    button: ComponentType<ComponentProps<typeof SpectrumButton>>;
}

interface ActionButtonType {
    type: 'action_button';
    button: ComponentType<ComponentProps<typeof ActionButton>>;
}

type Button = ButtonType | ActionButtonType;

interface ButtonWithTooltipProps extends Partial<SpectrumButtonProps>, ElementWithTooltipProps {
    buttonInfo: Button;
    buttonClasses?: string;
    isClickable?: boolean;
}

export const ButtonWithTooltip = (props: ButtonWithTooltipProps): JSX.Element => {
    const {
        buttonInfo: { button: Button },
        variant = 'cta',
        content,
        tooltipProps,
        tooltipTriggerProps,
        buttonClasses,
        isClickable = false,
        ...rest
    } = props;

    return (
        <ElementWithTooltip
            tooltipProps={tooltipProps}
            tooltipTriggerProps={tooltipTriggerProps}
            content={
                isClickable ? (
                    <Link UNSAFE_className={classes.tooltipLink}>
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href={undefined}>
                            <Button
                                variant={variant}
                                UNSAFE_className={[buttonClasses, !isClickable ? classes.tooltipBtn : ''].join(' ')}
                                {...rest}
                            >
                                {content}
                            </Button>
                        </a>
                    </Link>
                ) : (
                    <Button
                        variant={variant}
                        UNSAFE_className={[buttonClasses, !isClickable ? classes.tooltipBtn : ''].join(' ')}
                        {...rest}
                    >
                        {content}
                    </Button>
                )
            }
        />
    );
};
