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
import differenceBy from 'lodash/differenceBy';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { v4 as uuidv4 } from 'uuid';

import { Label } from '../../core/labels';
import { AdvancedFilterOptions, SearchOptionsRule, SearchRuleField } from './media-filter.interface';

export const textRegex = /\D+/;
export const numberRegex = /^\d+(\.\d+)?$/;
export const lastCommaRegex = /,\s*$/;

export const isDigit = (keyCode: number): boolean => keyCode >= 48 && keyCode <= 90;

export const hasLabelsDifference = (labels: Label[], otherLabels: Label[]): boolean =>
    differenceBy(labels, otherLabels, 'id').length > 0;

export const isEmptyRule = ({ value, field, operator }: SearchOptionsRule): boolean =>
    [value, field, operator].includes('');

export const isUniqueRule = (newRule: SearchOptionsRule, rules: SearchOptionsRule[]): boolean =>
    rules.every((currentRule) => !isEqual(newRule, currentRule));

export const findLabelsById = (ids: string[], labels: Label[]): Label[] =>
    ids.map((searchId) => labels.find(({ id }) => id === searchId) as Label).filter((label) => Boolean(label));

export const addOrUpdateFilterRule = (
    filterOptions: AdvancedFilterOptions,
    newRule: Omit<SearchOptionsRule, 'id'>
): AdvancedFilterOptions => {
    const finalRule = { ...newRule, id: uuidv4() };

    if (isEmpty(filterOptions)) {
        return {
            condition: 'and',
            rules: [{ ...finalRule }],
        };
    }

    const filteredRules = filterOptions.rules.filter(
        ({ field, operator }) => field !== newRule.field && operator !== newRule.operator
    );

    return {
        condition: 'and',
        rules: [...filteredRules, { ...finalRule }],
    };
};

export const removeRuleById = (filterOptions: AdvancedFilterOptions, filterId: string): AdvancedFilterOptions => {
    if (isEmpty(filterOptions)) {
        return {};
    }

    const filteredRules = filterOptions.rules.filter(({ id }) => id !== filterId);

    if (isEmpty(filteredRules)) {
        return {};
    }

    return {
        condition: 'and',
        rules: filteredRules,
    };
};

export const getValidRules = (rules: SearchOptionsRule[] = []) =>
    rules.filter((rule, index) => {
        const untestedRules = rules.slice(index + 1, rules.length + 1);
        return !isEmptyRule(rule) && isUniqueRule(rule, untestedRules);
    });

export const getRuleByField = (rules: SearchOptionsRule[] = [], field: SearchRuleField) =>
    rules.filter((rule) => rule.field === field);
