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
import { render, screen } from '@testing-library/react';

import { getById } from '../../../test-utils';
import { NumberBadge } from './number-badge.component';

describe('Number badge', () => {
    it('Check if number in badge is shown properly', () => {
        const { container } = render(<NumberBadge number={2} id={'test'} />);

        expect(getById(container, 'number-badge-test')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('Check if component is not displayed when there is no number passed', () => {
        const { container } = render(<NumberBadge number={undefined} id={'test'} />);

        expect(getById(container, 'number-badge-test')).not.toBeInTheDocument();
    });

    it('Component is selected', () => {
        const { container } = render(<NumberBadge number={2} selected id={'test'} />);

        expect(getById(container, 'number-badge-test')).toBeInTheDocument();

        const numberBadge = getById(container, 'number-badge-test');

        expect(numberBadge).toHaveClass('selected', { exact: false });
        expect(numberBadge).not.toHaveClass('reversedColor', { exact: false });
        expect(numberBadge).not.toHaveClass('basic', { exact: false });
    });

    it('Component is not selected', () => {
        const { container } = render(<NumberBadge number={2} id={'test'} />);

        expect(getById(container, 'number-badge-test')).toBeInTheDocument();

        const numberBadge = getById(container, 'number-badge-test');

        expect(numberBadge).not.toHaveClass('selected', { exact: false });
        expect(numberBadge).not.toHaveClass('reversedColor', { exact: false });
        expect(numberBadge).toHaveClass('basic', { exact: false });
    });

    it('Component is reversed', () => {
        const { container } = render(<NumberBadge number={2} selected reversedColor id={'test'} />);

        expect(getById(container, 'number-badge-test')).toBeInTheDocument();

        const numberBadge = getById(container, 'number-badge-test');

        expect(numberBadge).not.toHaveClass('selected', { exact: false });
        expect(numberBadge).toHaveClass('reversedColor', { exact: false });
        expect(numberBadge).not.toHaveClass('basic', { exact: false });
    });

    it('Error in getting number - should show question mark', () => {
        const { container } = render(<NumberBadge number={undefined} id={'test'} isError />);
        const questionMarkBadge = getById(container, 'question-mark-badge-test');

        expect(questionMarkBadge).toBeInTheDocument();
        expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('should apply "medium" class if the number is bigger than 10', () => {
        render(<NumberBadge number={12} id={'test'} />);
        const numberBadge = screen.getByTestId('number-badge-test-value');

        expect(numberBadge).toBeInTheDocument();
        expect(numberBadge).toHaveClass('medium');
    });

    it('should apply "large" class if the number is bigger than 100', () => {
        render(<NumberBadge number={123} id={'test'} />);
        const numberBadge = screen.getByTestId('number-badge-test-value');

        expect(numberBadge).toBeInTheDocument();
        expect(numberBadge).toHaveClass('large');
    });

    it('should show the number compact version if it is bigger than 1000', () => {
        render(<NumberBadge number={1200} id={'test'} />);
        const numberBadge = screen.getByTestId('number-badge-test-value');

        expect(numberBadge).toBeInTheDocument();

        expect(screen.queryByText('1.2K')).toBeTruthy();
    });
});
