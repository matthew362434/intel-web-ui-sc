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

import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ShapeType } from '../../../../../core/annotations/shapetype.enum';
import { LABEL_SOURCE } from '../../../../../core/labels';
import { applicationRender as render, onHoverTooltip, screen } from '../../../../../test-utils';
import { getMockedAnnotation, getMockedLabel, getMockedLabels } from '../../../../../test-utils/mocked-items-factory';
import { LabelShortcuts } from './label-shortcuts.component';

describe('Label shortcuts', () => {
    const labels2 = getMockedLabels(2);
    const labels3 = getMockedLabels(3);
    const labels6 = getMockedLabels(6);
    const labels8 = getMockedLabels(8);
    const labels10 = getMockedLabels(10);

    beforeEach(() => {
        global.localStorage.clear();
    });

    const getMoreButton = (): HTMLElement | null => screen.queryByRole('button', { name: 'More more-icon' });

    const clickMoreButton = () => {
        const moreButton = getMoreButton();
        moreButton && userEvent.click(moreButton);
    };

    it('Show 3 labels - More button should not be visible', async () => {
        await render(
            <LabelShortcuts
                addLabel={jest.fn()}
                removeLabels={jest.fn()}
                annotations={[getMockedAnnotation({ id: '1' }, ShapeType.Polygon)]}
                labels={labels3}
            />
        );

        expect(screen.getAllByRole('button')).toHaveLength(3);
        expect(getMoreButton()).not.toBeInTheDocument();
    });

    it('6 labels - show 5 labels - More button should  be visible', async () => {
        await render(
            <LabelShortcuts
                addLabel={jest.fn()}
                removeLabels={jest.fn()}
                annotations={[getMockedAnnotation({ id: '1' }, ShapeType.Polygon)]}
                labels={labels6}
            />
        );

        const moreButton = getMoreButton();
        expect(screen.getAllByRole('button')).toHaveLength(6);
        expect(moreButton).toBeInTheDocument();
    });

    it('8 labels - show 5 and rest under more option', async () => {
        await render(
            <LabelShortcuts
                addLabel={jest.fn()}
                removeLabels={jest.fn()}
                annotations={[getMockedAnnotation({ id: '1' }, ShapeType.Polygon)]}
                labels={labels8}
            />
        );

        expect(screen.getAllByRole('button')).toHaveLength(6);
        expect(screen.queryAllByRole('listitem')).toHaveLength(0);
        clickMoreButton();
        expect(screen.getAllByRole('listitem')).toHaveLength(8);
    });

    it('pin two more labels (test 6, test 7)', async () => {
        await render(
            <LabelShortcuts
                addLabel={jest.fn()}
                removeLabels={jest.fn()}
                annotations={[getMockedAnnotation({ id: '1' }, ShapeType.Polygon)]}
                labels={labels8}
            />
        );

        clickMoreButton();

        userEvent.hover(screen.getByText('test-6'));
        userEvent.click(screen.getByRole('button', { name: '6-pin-icon' }));

        userEvent.hover(screen.getByText('test-7'));
        userEvent.click(screen.getByRole('button', { name: '7-pin-icon' }));

        clickMoreButton();
        expect(screen.getAllByRole('listitem')).toHaveLength(8);
    });

    it('unpin labels: test 2, test 1 and test 3', async () => {
        await render(
            <LabelShortcuts
                addLabel={jest.fn()}
                removeLabels={jest.fn()}
                annotations={[getMockedAnnotation({ id: '1' }, ShapeType.Polygon)]}
                labels={labels8}
            />
        );

        clickMoreButton();
        userEvent.click(screen.getByRole('button', { name: '1-unpin-icon' }));
        userEvent.click(screen.getByRole('button', { name: '2-unpin-icon' }));
        userEvent.click(screen.getByRole('button', { name: '3-unpin-icon' }));

        clickMoreButton();
        expect(screen.getAllByRole('listitem')).toHaveLength(8);
    });

    it('Click shortcut - addLabel should be called', async () => {
        const addLabelMock = jest.fn();

        await render(
            <LabelShortcuts
                addLabel={addLabelMock}
                removeLabels={jest.fn()}
                annotations={[getMockedAnnotation({ id: '1', isSelected: true, labels: [] }, ShapeType.Polygon)]}
                labels={labels2}
            />
        );

        userEvent.click(screen.getByRole('button', { name: 'test-1' }));
        expect(addLabelMock).toHaveBeenCalled();
    });

    it('Click shortcut of already added label - removeLabel should be called', async () => {
        const addLabelMock = jest.fn();
        const removeLabelMock = jest.fn();

        await render(
            <LabelShortcuts
                addLabel={addLabelMock}
                removeLabels={removeLabelMock}
                annotations={[
                    getMockedAnnotation(
                        {
                            id: '1',
                            isSelected: true,
                            labels: [{ ...labels2[0], source: { type: LABEL_SOURCE.USER, id: 'id-1' }, score: 0.9 }],
                        },
                        ShapeType.Polygon
                    ),
                ]}
                labels={labels2}
            />
        );

        userEvent.click(screen.getByRole('button', { name: 'test-1' }));
        expect(removeLabelMock).toHaveBeenCalled();
        expect(addLabelMock).not.toHaveBeenCalled();
    });

    it('Check tooltip on hover', async () => {
        jest.useFakeTimers();

        await render(
            <LabelShortcuts
                addLabel={jest.fn()}
                removeLabels={jest.fn()}
                annotations={[
                    getMockedAnnotation(
                        {
                            id: '1',
                        },
                        ShapeType.Polygon
                    ),
                ]}
                labels={labels2}
            />
        );

        onHoverTooltip(screen.getByRole('button', { name: 'test-1' }));

        act(() => {
            // The tooltip appears after 200 milliseconds
            jest.advanceTimersByTime(200);
        });

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();

        expect(screen.getByText('test-1 (CTRL+1)')).toBeInTheDocument();

        jest.useRealTimers();
    });

    it('Select shortcut without selected annotation - nothing happens', async () => {
        const labels = [...getMockedLabels(2), getMockedLabel({ id: '3', name: 'No object', isExclusive: true })];

        const addLabelMock = jest.fn();
        const removeLabelMock = jest.fn();
        await render(
            <LabelShortcuts
                addLabel={addLabelMock}
                removeLabels={removeLabelMock}
                annotations={[getMockedAnnotation({ id: '1' }, ShapeType.Polygon)]}
                labels={labels}
            />
        );

        userEvent.click(screen.getByRole('button', { name: 'test-1' }));
        expect(addLabelMock).not.toHaveBeenCalled();
        expect(removeLabelMock).not.toHaveBeenCalled();
    });

    it('Select empty label shortcut without selected annotation - should set it on image', async () => {
        const emptyLabel = getMockedLabel({ id: '3', name: 'No object', isExclusive: true });
        const labels = [...getMockedLabels(2), emptyLabel];

        const addLabelMock = jest.fn();
        const removeLabelMock = jest.fn();
        await render(
            <LabelShortcuts
                addLabel={addLabelMock}
                removeLabels={removeLabelMock}
                annotations={[getMockedAnnotation({ id: '1' }, ShapeType.Polygon)]}
                labels={labels}
            />
        );

        userEvent.click(screen.getByRole('button', { name: 'No object' }));
        expect(addLabelMock).toHaveBeenCalledWith(emptyLabel, []);
        expect(removeLabelMock).not.toHaveBeenCalled();
    });

    it('Open labels list and close by clicking outside', async () => {
        await render(
            <div data-testid={'container'}>
                <LabelShortcuts
                    addLabel={jest.fn()}
                    removeLabels={jest.fn()}
                    annotations={[getMockedAnnotation({ id: '1' }, ShapeType.Polygon)]}
                    labels={labels10}
                />
            </div>
        );

        clickMoreButton();
        expect(screen.getAllByRole('list').length > 0).toBeTruthy();
        userEvent.click(screen.getByTestId('container'));
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('Select 3 annotations and click label shortcut - all of them should have label set', async () => {
        const addLabelMock = jest.fn();
        await render(
            <div data-testid={'container'}>
                <LabelShortcuts
                    addLabel={addLabelMock}
                    removeLabels={jest.fn()}
                    annotations={[
                        getMockedAnnotation({ id: '1', isSelected: true }, ShapeType.Polygon),
                        getMockedAnnotation({ id: '2', isSelected: true }, ShapeType.Circle),
                        getMockedAnnotation({ id: '3', isSelected: true }, ShapeType.Rect),
                    ]}
                    labels={labels3}
                />
            </div>
        );

        userEvent.click(screen.getByRole('button', { name: labels3[0].name }));
        expect(addLabelMock).toBeCalledWith(labels3[0], ['1', '2', '3']);
    });

    it('Select 3 annotations and click label shortcut (one of annotations has that label already) - all of them should have label set', async () => {
        const addLabelMock = jest.fn();
        await render(
            <div data-testid={'container'}>
                <LabelShortcuts
                    addLabel={addLabelMock}
                    removeLabels={jest.fn()}
                    annotations={[
                        getMockedAnnotation(
                            {
                                id: '1',
                                isSelected: true,
                                labels: [{ ...labels3[0], source: { type: LABEL_SOURCE.USER } }],
                            },
                            ShapeType.Polygon
                        ),
                        getMockedAnnotation({ id: '2', isSelected: true }, ShapeType.Circle),
                        getMockedAnnotation({ id: '3', isSelected: true }, ShapeType.Rect),
                    ]}
                    labels={labels3}
                />
            </div>
        );

        userEvent.click(screen.getByRole('button', { name: labels3[0].name }));
        expect(addLabelMock).toBeCalledWith(labels3[0], ['1', '2', '3']);
    });

    it('Select 3 annotations and click label shortcut (all of annotations has that label already) - all of them should have label removed', async () => {
        const addLabelMock = jest.fn();
        const removeLabelMock = jest.fn();

        await render(
            <div data-testid={'container'}>
                <LabelShortcuts
                    addLabel={addLabelMock}
                    removeLabels={removeLabelMock}
                    annotations={[
                        getMockedAnnotation(
                            {
                                id: '1',
                                isSelected: true,
                                labels: [{ ...labels3[0], source: { type: LABEL_SOURCE.USER } }],
                            },
                            ShapeType.Polygon
                        ),
                        getMockedAnnotation(
                            {
                                id: '2',
                                isSelected: true,
                                labels: [{ ...labels3[0], source: { type: LABEL_SOURCE.USER } }],
                            },
                            ShapeType.Circle
                        ),
                        getMockedAnnotation(
                            {
                                id: '3',
                                isSelected: true,
                                labels: [{ ...labels3[0], source: { type: LABEL_SOURCE.USER } }],
                            },
                            ShapeType.Rect
                        ),
                    ]}
                    labels={labels3}
                />
            </div>
        );

        userEvent.click(screen.getByRole('button', { name: labels3[0].name }));
        expect(removeLabelMock).toBeCalledWith([labels3[0]], ['1', '2', '3']);
    });
});
