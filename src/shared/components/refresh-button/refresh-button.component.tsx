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

import { ActionButton } from '@adobe/react-spectrum';

import classes from './refresh-button.module.scss';

interface RefreshButtonProps {
    id: string;
    ariaLabel: string;
    isLoading: boolean;
    onPress: () => void;
    isDisabled?: boolean;
}

export const RefreshButton = ({
    id,
    ariaLabel,
    isLoading,
    onPress,
    isDisabled = isLoading,
}: RefreshButtonProps): JSX.Element => {
    return (
        <ActionButton
            isQuiet
            id={id}
            aria-label={ariaLabel}
            isDisabled={isLoading || isDisabled}
            UNSAFE_className={isLoading ? classes.rotate : ''}
            onPress={onPress}
        >
            {/* eslint-disable max-len  */}
            <svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                    d='M15.9997 9C17.9327 9 19.6827 9.7835 20.9494 11.0503L21.5729 10.4268C21.7304 10.2693 21.9997 10.3808 21.9997 10.6036V12.75C21.9997 12.8881 21.8877 13 21.7497 13H19.6032C19.3805 13 19.2689 12.7307 19.4264 12.5732L20.2423 11.7574C19.1565 10.6716 17.6565 10 15.9997 10C12.7698 10 10.136 12.5521 10.0048 15.7498C9.99913 15.8877 9.88773 16 9.74966 16H9.24966C9.11159 16 8.99921 15.8876 9.00406 15.7496C9.1359 11.9996 12.2175 9 15.9997 9Z'
                    fill='#E3E3E5'
                />
                <path
                    d='M10.4264 21.5732L11.0499 20.9497C12.3167 22.2165 14.0667 23 15.9997 23C19.7818 23 22.8634 20.0004 22.9953 16.2504C23.0001 16.1124 22.8877 16 22.7497 16H22.2497C22.1116 16 22.0002 16.1123 21.9945 16.2502C21.8634 19.4479 19.2296 22 15.9997 22C14.3428 22 12.8428 21.3284 11.757 20.2426L12.5729 19.4268C12.7304 19.2693 12.6188 19 12.3961 19H10.2497C10.1116 19 9.99966 19.1119 9.99966 19.25V21.3964C9.99966 21.6192 10.2689 21.7307 10.4264 21.5732Z'
                    fill='#E3E3E5'
                />
                <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M15.4997 12.25C15.4997 12.1119 15.6116 12 15.7497 12L16.2497 12C16.3877 12 16.4997 12.1119 16.4997 12.25V13.0415C16.9555 13.118 17.3765 13.2972 17.7379 13.5546L18.2978 12.9948C18.3954 12.8972 18.5537 12.8972 18.6513 12.9948L19.0049 13.3484C19.1025 13.446 19.1025 13.6043 19.0049 13.7019L18.445 14.2617C18.7024 14.6232 18.8817 15.0442 18.9582 15.5H19.7497C19.8877 15.5 19.9997 15.6119 19.9997 15.75V16.25C19.9997 16.3881 19.8877 16.5 19.7497 16.5H18.9582C18.8817 16.9558 18.7024 17.3768 18.445 17.7383L19.0049 18.2981C19.1025 18.3957 19.1025 18.554 19.0049 18.6517L18.6513 19.0052C18.5537 19.1028 18.3954 19.1028 18.2978 19.0052L17.7379 18.4454C17.3765 18.7028 16.9555 18.882 16.4997 18.9585V19.75C16.4997 19.8881 16.3877 20 16.2497 20H15.7497C15.6116 20 15.4997 19.8881 15.4997 19.75V18.9585C15.0438 18.882 14.6229 18.7028 14.2614 18.4454L13.7016 19.0052C13.6039 19.1028 13.4456 19.1028 13.348 19.0052L12.9945 18.6517C12.8968 18.554 12.8968 18.3957 12.9945 18.2981L13.5543 17.7383C13.2969 17.3768 13.1176 16.9558 13.0411 16.5H12.2497C12.1116 16.5 11.9997 16.3881 11.9997 16.25L11.9997 15.75C11.9997 15.6119 12.1116 15.5 12.2497 15.5H13.0411C13.1176 15.0442 13.2969 14.6232 13.5543 14.2617L12.9945 13.7019C12.8968 13.6043 12.8968 13.446 12.9945 13.3483L13.348 12.9948C13.4456 12.8972 13.6039 12.8972 13.7016 12.9948L14.2614 13.5546C14.6229 13.2972 15.0438 13.118 15.4997 13.0415V12.25ZM17.9997 16C17.9997 17.1046 17.1042 18 15.9997 18C14.8951 18 13.9997 17.1046 13.9997 16C13.9997 14.8954 14.8951 14 15.9997 14C17.1042 14 17.9997 14.8954 17.9997 16Z'
                    fill='#E3E3E5'
                />
            </svg>
        </ActionButton>
    );
};
