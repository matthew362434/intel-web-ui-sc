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

import { fireEvent, render } from '@testing-library/react';

import { getById } from '../../../../test-utils';
import { ToggleVisibilityButton } from './index';

describe('toggle visibility button', () => {
    it("show 'visibility on' icon when isHidden is false and 'visibility off' icon when parameter is true", () => {
        const onPressHandler = jest.fn();
        const { container, rerender } = render(
            <ToggleVisibilityButton id={'test'} isDisabled={false} onPress={onPressHandler} isHidden={false} />
        );
        const iconVisibilityOn = getById(container, 'annotation-test-visibility-on-icon');

        expect(iconVisibilityOn).toBeInTheDocument();

        rerender(<ToggleVisibilityButton id={'test'} isDisabled={false} onPress={onPressHandler} isHidden />);

        const iconVisibilityOff = getById(container, 'annotation-test-visibility-off-icon');

        expect(iconVisibilityOff).toBeInTheDocument();
    });

    it('onPress function handler is called after button click', () => {
        const onPressHandler = jest.fn();
        const { container } = render(
            <ToggleVisibilityButton id={'test'} isDisabled={false} onPress={onPressHandler} isHidden />
        );

        const button = getById(container, 'annotation-test-toggle-visibility');

        expect(button).toBeInTheDocument();

        button && fireEvent.click(button);

        expect(onPressHandler).toHaveBeenCalled();
    });

    it('cannot click button when it is disabled', () => {
        const onPressHandler = jest.fn();
        const { container } = render(
            <ToggleVisibilityButton id={'test'} isDisabled onPress={onPressHandler} isHidden />
        );

        const button = getById(container, 'annotation-test-toggle-visibility');
        expect(button).toBeInTheDocument();

        button && fireEvent.click(button);

        expect(onPressHandler).not.toHaveBeenCalled();
    });
});
