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

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';

import ReactNotification, { DismissOptions, store } from 'react-notifications-component';
import { useLocation } from 'react-router-dom';

import { MissingProviderError } from '../shared/missing-provider-error';
import { NOTIFICATION_TYPE, NotificationToast } from './notification-toast';
import classes from './notification.module.scss';

interface NotificationContextProps {
    addNotification: (message: string, type: NOTIFICATION_TYPE, dismiss?: DismissOptions) => void;
}

interface NotificationProviderProps {
    children: JSX.Element;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

const defaultDismiss = {
    duration: 0,
    onScreen: false,
    pauseOnHover: true,
    click: false,
    showIcon: true,
};

export const NotificationProvider = ({ children }: NotificationProviderProps): JSX.Element => {
    const notificationsIds = useRef<string[]>([]);
    const location = useLocation();

    const addNotification = useCallback(
        (message: string, type: NOTIFICATION_TYPE, dismiss: DismissOptions = defaultDismiss): void => {
            const notificationId = `${message}-${Date.now()}`;

            const isActiveNotification = notificationsIds.current.find((notification) =>
                notification.includes(message)
            );

            if (isActiveNotification) {
                return;
            }

            notificationsIds.current.push(notificationId);

            store.addNotification({
                id: notificationId,
                content: (
                    <NotificationToast
                        message={message}
                        type={type}
                        remove={() => removeNotification(notificationId)}
                    />
                ),
                insert: 'top',
                container: 'bottom-full',
                animationIn: ['animate__animated', 'animate__fadeIn'],
                animationOut: ['animate__animated', 'animate__fadeOut'],
                dismiss,
            });
        },
        []
    );

    const removeNotification = (id: string) => {
        notificationsIds.current = [...notificationsIds.current].filter(
            (notificationId: string) => notificationId !== id
        );

        store.removeNotification(id);
    };

    const removeNotifications = () => {
        notificationsIds.current.forEach((notificationsId: string) => {
            store.removeNotification(notificationsId);
        });

        notificationsIds.current = [];
    };

    useEffect(() => {
        removeNotifications();
    }, [location]);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            <ReactNotification className={classes.notificationContainer} isMobile breakpoint={1024} />
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextProps => {
    const context = useContext(NotificationContext);

    if (context === undefined) {
        throw new MissingProviderError('useNotification', 'NotificationProvider');
    }

    return context;
};
