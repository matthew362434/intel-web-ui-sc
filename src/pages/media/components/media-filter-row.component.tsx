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
import { useEffect, useState } from 'react';

import { ActionButton, Flex } from '@adobe/react-spectrum';

import { Delete } from '../../../assets/icons';
import { isAnomalyDomain } from '../../../core/projects';
import { useProject } from '../../project-details/providers';
import { SearchRuleField, SearchRuleOperator, SearchOptionsRule, SearchRuleValue } from '../media-filter.interface';
import classes from '../media-filter.module.scss';
import { isEmptyRule } from '../util';
import { MediaFilterValueFactory } from './field-values/media-filter-value-factory';
import { MediaFilterField } from './media-filter-field.component';
import { MediaFilterOperator } from './media-filter-operator.component';

interface MediaFilterRowProps {
    onRemove: (id: string) => void;
    rule: SearchOptionsRule;
    onUpdate: (id: string, rule: SearchOptionsRule) => void;
}

export const MediaFilterRow = ({ rule, onUpdate, onRemove }: MediaFilterRowProps): JSX.Element => {
    const [field, setField] = useState<SearchRuleField | ''>('');
    const [operator, setOperator] = useState<SearchRuleOperator | ''>('');
    const [ruleValue, setRuleValue] = useState<SearchRuleValue>('');
    const { isSingleDomainProject } = useProject();
    const isAnomalyProject = isSingleDomainProject(isAnomalyDomain);

    useEffect(() => {
        setField(rule.field);
    }, [rule.field]);

    useEffect(() => {
        setOperator(rule.operator);
    }, [rule.operator]);

    useEffect(() => {
        setRuleValue(rule.value);
    }, [rule.value]);

    useEffect(() => {
        const newRule = { ...rule, field, operator, value: ruleValue };
        if (!isEmptyRule(newRule)) {
            onUpdate(rule.id, newRule);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onUpdate, field, operator, ruleValue]);

    return (
        <Flex UNSAFE_className={classes.rowBody}>
            <Flex UNSAFE_className={classes.rowFields}>
                <MediaFilterField
                    value={field}
                    isDisabled={rule.isUnremovable}
                    onSelectionChange={(updatedField) => {
                        setOperator('');
                        setRuleValue('');
                        setField(updatedField);
                    }}
                />
                <MediaFilterOperator
                    value={operator}
                    field={field}
                    isDisabled={rule.isUnremovable}
                    onSelectionChange={setOperator}
                    isAnomalyProject={isAnomalyProject}
                />
                <MediaFilterValueFactory
                    value={ruleValue}
                    field={field}
                    isDisabled={rule.isUnremovable}
                    onSelectionChange={setRuleValue}
                    isAnomalyProject={isAnomalyProject}
                />
            </Flex>
            {!rule.isUnremovable && (
                <ActionButton isQuiet onPress={() => onRemove(rule.id)}>
                    <Delete width={52} />
                </ActionButton>
            )}
        </Flex>
    );
};
