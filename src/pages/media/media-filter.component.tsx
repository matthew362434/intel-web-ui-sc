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

import { Dispatch, MutableRefObject, useCallback, useEffect, useReducer, useRef } from 'react';

import { ActionButton, Content, Footer, Header, Text } from '@adobe/react-spectrum';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import { Add } from '../../assets/icons';
import { MediaFilterDialog } from './components/media-filter-dialog.component';
import { MediaFilterRow } from './components/media-filter-row.component';
import {
    AdvancedFilterOptions,
    SearchOptionsActions,
    SearchOptionsActionsType,
    SearchOptionsRule,
    SearchRuleField,
} from './media-filter.interface';
import classes from './media-filter.module.scss';
import { SearchOptionReducer } from './reducers/search-options-reducer';
import { getRuleByField, getValidRules } from './util';

export interface MediaFilterProps {
    filterOptions: AdvancedFilterOptions;
    onSetFilterOptions: (options: AdvancedFilterOptions) => void;
}
//The user can filter by name outside this component, this hook dispatches actions to add that search as a filter rule
const useSetFilterByName = (
    filterOptions: AdvancedFilterOptions,
    state: AdvancedFilterOptions,
    dispatch: Dispatch<SearchOptionsActions>,
    canCallFilter: MutableRefObject<boolean>
) => {
    useEffect(() => {
        const searchByNameRule = getRuleByField(filterOptions.rules, SearchRuleField.MediaName);
        if (isEqual(state, filterOptions) && searchByNameRule.length === 0) {
            return;
        }

        const isEmptyRule = searchByNameRule.some(({ value }) => value === '');

        if (isEmptyRule) {
            dispatch({ type: SearchOptionsActionsType.REMOVE_ALL });
        } else {
            canCallFilter.current = false;
            dispatch({ type: SearchOptionsActionsType.UPDATE_ALL, filterOptions });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterOptions]);
};

export const MediaFilter = ({ filterOptions, onSetFilterOptions }: MediaFilterProps): JSX.Element => {
    const canCallFilter = useRef(false);
    const [state, dispatch] = useReducer(SearchOptionReducer, filterOptions);
    useSetFilterByName(filterOptions, state, dispatch, canCallFilter);

    useEffect(() => {
        const validRules = getValidRules(state?.rules);
        if (canCallFilter.current && !isEqual(validRules, filterOptions.rules)) {
            if (validRules.length) {
                onSetFilterOptions({ condition: 'and', rules: validRules });
            } else if (isEmpty(state?.rules) && !isEmpty(filterOptions)) {
                onSetFilterOptions({});
            }
        }

        canCallFilter.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.rules, onSetFilterOptions]);

    const onUpdate = useCallback((id: string, updatedRule: SearchOptionsRule) => {
        canCallFilter.current = true;
        dispatch({ type: SearchOptionsActionsType.UPDATE, id, rule: updatedRule });
    }, []);

    const onRemove = useCallback((id: string) => {
        canCallFilter.current = true;
        dispatch({ type: SearchOptionsActionsType.REMOVE, id });
    }, []);

    return (
        <MediaFilterDialog>
            <>
                <Header UNSAFE_className={classes.filterPanelHeader} marginBottom={'size-350'}>
                    <Text>Show result matching of all the following criteria</Text>
                    <ActionButton isQuiet onPress={() => dispatch({ type: SearchOptionsActionsType.REMOVE_ALL })}>
                        Clear All
                    </ActionButton>
                </Header>
                <Content UNSAFE_className={classes.filterPanelContent}>
                    {state?.rules?.map((rule) => (
                        <MediaFilterRow rule={rule} key={rule.id} onUpdate={onUpdate} onRemove={onRemove} />
                    ))}
                </Content>
                <Footer UNSAFE_className={classes.dialogFooter}>
                    <ActionButton
                        isQuiet
                        onPress={() => {
                            canCallFilter.current = false;
                            dispatch({ type: SearchOptionsActionsType.ADD });
                        }}
                    >
                        <Add className={classes.addIcon} /> <Text>New filter</Text>
                    </ActionButton>
                </Footer>
            </>
        </MediaFilterDialog>
    );
};
