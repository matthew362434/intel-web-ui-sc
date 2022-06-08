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

import { getMockedLabel } from '../../test-utils/mocked-items-factory';
import {
    AdvancedFilterOptions,
    SearchOptionsRule,
    SearchRuleField,
    SearchRuleOperator,
} from './media-filter.interface';
import {
    textRegex,
    numberRegex,
    lastCommaRegex,
    isDigit,
    isEmptyRule,
    findLabelsById,
    isUniqueRule,
    addOrUpdateFilterRule,
    hasLabelsDifference,
    getValidRules,
    getRuleByField,
    removeRuleById,
} from './util';

const getValidRule = (id = '123', field = SearchRuleField.MediaName): SearchOptionsRule => ({
    id,
    field,
    operator: SearchRuleOperator.Equal,
    value: 'test',
});

describe('media util', () => {
    it('textRegex', () => {
        expect(textRegex.test('abcd')).toBe(true);
        expect(textRegex.test('abcd123')).toBe(true);
        expect(textRegex.test('abc_abc')).toBe(true);
        expect(textRegex.test('abc-abc')).toBe(true);
        expect(textRegex.test('123abcd')).toBe(true);
        expect(textRegex.test('12332')).toBe(false);
        expect(textRegex.test('12332-123')).toBe(true);
    });

    it('hasLabelsDifference', () => {
        expect(hasLabelsDifference([getMockedLabel({ id: 'label-1' })], [getMockedLabel({ id: 'label-1' })])).toBe(
            false
        );
        expect(hasLabelsDifference([getMockedLabel({ id: 'label-1' })], [getMockedLabel({ id: 'label-2' })])).toBe(
            true
        );
    });

    it('numberRegex', () => {
        expect(numberRegex.test('abcd')).toBe(false);
        expect(numberRegex.test('abcd123')).toBe(false);
        expect(numberRegex.test('123abcd')).toBe(false);
        expect(numberRegex.test('12332')).toBe(true);
        expect(numberRegex.test('12332-123')).toBe(false);
        expect(numberRegex.test('1.123')).toBe(true);
    });

    it('lastCommaRegex', () => {
        expect(lastCommaRegex.test('abc,')).toBe(true);
        expect(lastCommaRegex.test('abc ,')).toBe(true);
        expect(lastCommaRegex.test('abc , ')).toBe(true);
        expect(lastCommaRegex.test(', abc')).toBe(false);
        expect(lastCommaRegex.test('abc,abc')).toBe(false);
    });

    describe('isDigit', () => {
        const numbersAndLetters = Array.from({ length: 43 }).map((_, i) => i + 48);
        test.each([numbersAndLetters])('keyCode from 48 to 90', (keyCode) => {
            expect(isDigit(keyCode)).toBe(true);
        });
    });

    it('isEmptyRule', () => {
        expect(isEmptyRule({ id: '123', value: 'test', field: '', operator: SearchRuleOperator.Equal })).toBe(true);
        expect(isEmptyRule({ id: '123', value: 'test', field: SearchRuleField.LabelId, operator: '' })).toBe(true);
        expect(
            isEmptyRule({ id: '123', value: '', field: SearchRuleField.LabelId, operator: SearchRuleOperator.Equal })
        ).toBe(true);
    });

    it('findLabelsById', () => {
        const labels = [
            getMockedLabel({ name: 'label-1', id: 'label-1' }),
            getMockedLabel({ name: 'label-2', id: 'label-2' }),
            getMockedLabel({ name: 'label-3', id: 'label-3' }),
        ];

        expect(findLabelsById(['123'], labels)).toEqual([]);
        expect(findLabelsById([labels[0].id, labels[2].id], labels)).toEqual([labels[0], labels[2]]);
    });

    it('isUniqueRule', () => {
        const rules: SearchOptionsRule[] = [
            { id: '123', field: SearchRuleField.MediaHeight, operator: SearchRuleOperator.In, value: '' },
            { id: '321', field: SearchRuleField.LabelId, operator: SearchRuleOperator.Equal, value: ['123', '322'] },
        ];

        const newRule: SearchOptionsRule = {
            id: '213',
            field: SearchRuleField.LabelId,
            operator: SearchRuleOperator.Equal,
            value: ['123'],
        };

        expect(isUniqueRule(newRule, rules)).toBe(true);
        expect(isUniqueRule(rules[0], rules)).toBe(false);
    });

    describe('getRuleByField', () => {
        it('has match', () => {
            const ruleOne = getValidRule('123', SearchRuleField.MediaName);
            const ruleTwo = getValidRule('321', SearchRuleField.LabelId);
            expect(getRuleByField([ruleOne, ruleTwo], SearchRuleField.LabelId)).toEqual([ruleTwo]);
        });

        it('does not has match', () => {
            const ruleOne = getValidRule('123', SearchRuleField.MediaName);
            const ruleTwo = getValidRule('321', SearchRuleField.LabelId);
            expect(getRuleByField([ruleOne, ruleTwo], SearchRuleField.AnnotationCreationDate)).toEqual([]);
        });

        it('empty rules', () => {
            expect(getRuleByField([], SearchRuleField.AnnotationCreationDate)).toEqual([]);
        });

        it('falsy parameters', () => {
            expect(getRuleByField(undefined, SearchRuleField.AnnotationCreationDate)).toEqual([]);
        });
    });

    describe('addOrUpdateFilterRule', () => {
        const newRule = { field: SearchRuleField.MediaName, operator: SearchRuleOperator.Equal, value: 'test' };

        it('empty options', () => {
            expect(addOrUpdateFilterRule({}, { ...newRule })).toEqual({
                condition: 'and',
                rules: [{ id: expect.any(String), ...newRule }],
            });
        });

        it('add new rule when field and operator are different', () => {
            const oldRule = {
                id: '1',
                field: SearchRuleField.MediaHeight,
                operator: SearchRuleOperator.Greater,
                value: 0,
            };
            expect(
                addOrUpdateFilterRule(
                    {
                        condition: 'and',
                        rules: [oldRule],
                    },
                    { ...newRule }
                )
            ).toEqual({
                condition: 'and',
                rules: [oldRule, { id: expect.any(String), ...newRule }],
            });
        });

        it('replace rule when field and operator are not different', () => {
            const oldRule = {
                id: '1',
                field: SearchRuleField.MediaName,
                operator: SearchRuleOperator.Equal,
                value: 0,
            };
            expect(
                addOrUpdateFilterRule(
                    {
                        condition: 'and',
                        rules: [oldRule],
                    },
                    { ...newRule }
                )
            ).toEqual({
                condition: 'and',
                rules: [{ id: expect.any(String), ...newRule }],
            });
        });
    });

    describe('getValidRules', () => {
        const emptyRule: SearchOptionsRule = { id: '', field: '', operator: '', value: '' };

        it('has empty rules', () => {
            expect(getValidRules([emptyRule, getValidRule(), emptyRule])).toEqual([getValidRule()]);
        });

        it('all valid  but not unique', () => {
            expect(getValidRules([getValidRule(), getValidRule()])).toEqual([getValidRule()]);
        });

        it('all valid and unique', () => {
            expect(getValidRules([getValidRule(), getValidRule('321')])).toEqual([getValidRule(), getValidRule('321')]);
        });

        it('invalid rules', () => {
            expect(getValidRules([emptyRule, emptyRule])).toEqual([]);
        });

        it('empty rules', () => {
            expect(getValidRules([])).toEqual([]);
        });

        it('falsy parameters', () => {
            expect(getValidRules()).toEqual([]);
        });
    });

    describe('removeRuleById', () => {
        const mockOptions: AdvancedFilterOptions = { condition: 'and', rules: [getValidRule('321')] };

        it('empty options', () => {
            expect(removeRuleById({}, '123')).toEqual({});
        });

        it('should return an empty obj when last rule is removed', () => {
            expect(removeRuleById(mockOptions, '321')).toEqual({});
        });

        it('filterId does not mach current rules', () => {
            expect(removeRuleById(mockOptions, '123')).toEqual(mockOptions);
        });

        it('match rule is removed', () => {
            expect(
                removeRuleById({ ...mockOptions, rules: [...mockOptions.rules, getValidRule('123')] }, '123')
            ).toEqual(mockOptions);
        });
    });
});
