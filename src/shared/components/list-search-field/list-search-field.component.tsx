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
import { useEffect, useRef, useState } from 'react';

import { SearchField } from '@adobe/react-spectrum';
import { useFilter } from '@react-aria/i18n';
import { ActionButton } from '@react-spectrum/button';
import { TextFieldRef } from '@react-types/textfield';

import { Search } from '../../../assets/icons';
import classes from './list-search-field.module.scss';

interface ListSearchFieldProps<T, K> {
    list: T[] | undefined;
    attribute: K;
    setFilteredList: (list: T[]) => void;
    placeholder: string;
}

export const ListSearchField = <T, K extends keyof T>(props: ListSearchFieldProps<T, K>): JSX.Element => {
    const { list, setFilteredList, attribute, placeholder } = props;

    const [filterText, setFilterText] = useState<string>('');
    const [searchActive, setSearchActive] = useState<boolean>(false);
    const searchField = useRef<TextFieldRef>(null);

    const focusChanged = (isFocused: boolean): void => {
        !isFocused && !filterText && setSearchActive(false);
    };

    const searchAction = (): void => {
        setSearchActive(true);
        searchField.current?.focus();
    };

    const { contains } = useFilter({
        sensitivity: 'base',
    });

    useEffect(() => {
        if (list) {
            const filteredList = list.filter(function (item) {
                const searchAttribute = item[attribute] as unknown as string;
                return contains(searchAttribute, filterText);
            });
            setFilteredList(filteredList);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list, attribute, filterText, setFilteredList]);

    return (
        <div className={classes.searchView}>
            <SearchField
                isQuiet
                value={filterText}
                onFocusChange={focusChanged}
                onChange={setFilterText}
                aria-label={'Search...'}
                placeholder={placeholder}
                UNSAFE_className={searchActive ? classes.searchFieldVisible : classes.searchFieldHidden}
                onClear={() => setSearchActive(false)}
                id={'list-search-field'}
                ref={searchField}
                icon={<Search height={'32px'} style={{ position: 'absolute', top: 0 }} />}
            />
            <ActionButton
                key={'search'}
                aria-label={'Search button'}
                isQuiet={true}
                onPress={searchAction}
                isHidden={searchActive}
            >
                <Search />
            </ActionButton>
        </div>
    );
};
