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
import { useEffect, useRef, useState } from 'react';

import {
    ActionButton,
    Button,
    ButtonGroup,
    Content,
    Dialog,
    DialogContainer,
    Divider,
    Heading,
    Radio,
    RadioGroup,
    Text,
    View,
} from '@adobe/react-spectrum';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import dayjs from 'dayjs';

import { API_URLS } from '../../../../../core/services';
import { NOTIFICATION_TYPE, useNotification } from '../../../../../notification';
import { capitalize } from '../../../../utils';

import './export-logs.scss';

enum LogsTypes {
    APPLICATION = 'APPLICATION',
    CLUSTER = 'CLUSTER',
}

export const ExportLogs = (): JSX.Element => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedLogType, setSelectedLogType] = useState<LogsTypes>(LogsTypes.APPLICATION);
    const [date, setDate] = useState<(Date | null)[]>([null, null]);
    const [downloadLink, setDownloadLink] = useState<string | undefined>(undefined);
    const { addNotification } = useNotification();

    const anchorRef = useRef<HTMLAnchorElement>(null);

    const handleOpen = (): void => {
        setIsOpen(true);
    };

    const handleOnDismiss = (): void => {
        setIsOpen(false);
        setSelectedLogType(LogsTypes.APPLICATION);
        setDate([null, null]);
        setDownloadLink(undefined);
    };

    const handleLogsTypeChange = (value: string): void => {
        setSelectedLogType(value as LogsTypes);
    };

    const handleDateChange = (value: Date[] | null): void | undefined => {
        if (value) {
            setDate(value);
        } else {
            setDate([null, null]);
        }
    };

    const handleExport = (): void => {
        anchorRef.current?.click();
        handleOnDismiss();
        addNotification(
            'The system is preparing the logs file, your download will start soon.',
            NOTIFICATION_TYPE.INFO
        );
    };

    useEffect(() => {
        const [startDate, endDate] = date;
        if (startDate && endDate) {
            // start date should start at 00:00:000 am, end date should finish at 23:59:999
            const [firstPartOfStartDate] = dayjs(startDate).startOf('day').toISOString().split('T');
            const startDateAtMidnight = `${firstPartOfStartDate}T00:00:00.000Z`;
            const [firstPartOfEndDate] = dayjs(endDate).endOf('day').toISOString().split('T');
            const endDateBeforeMidnight = `${firstPartOfEndDate}T23:59:59.999Z`;
            const areSelectedApplicationLogs = selectedLogType === LogsTypes.APPLICATION;

            setDownloadLink(
                API_URLS.EXPORT_LOGS(
                    startDateAtMidnight,
                    endDateBeforeMidnight,
                    areSelectedApplicationLogs ? 'logs' : 'cluster'
                )
            );
        } else {
            setDownloadLink(undefined);
        }
    }, [date, selectedLogType]);

    return (
        <>
            <ActionButton onPress={handleOpen} UNSAFE_className={'exportLogsBtn'} isQuiet>
                Export logs
            </ActionButton>

            <DialogContainer onDismiss={handleOnDismiss}>
                {isOpen && (
                    <Dialog width={'40rem'}>
                        <Heading>Export logs</Heading>
                        <Divider />
                        <Content UNSAFE_className={'dialogContent'}>
                            <RadioGroup
                                label={'Type'}
                                isEmphasized
                                value={selectedLogType}
                                onChange={handleLogsTypeChange}
                            >
                                <Radio value={LogsTypes.APPLICATION}>{capitalize(LogsTypes.APPLICATION)}</Radio>
                                <Radio value={LogsTypes.CLUSTER}>{capitalize(LogsTypes.CLUSTER)}</Radio>
                            </RadioGroup>
                            <View marginTop={'size-200'} data-testid={'date-range-picker-box-id'}>
                                <Text UNSAFE_className={'dateRange'}>Date range</Text>
                                <DateRangePicker
                                    value={date}
                                    onChange={handleDateChange}
                                    format={'MM/dd/yyyy'}
                                    dayPlaceholder={'dd'}
                                    yearPlaceholder={'yyyy'}
                                    monthPlaceholder={'mm'}
                                    maxDate={new Date()}
                                />
                            </View>
                        </Content>
                        <ButtonGroup UNSAFE_className={'logsButtonGroup'}>
                            <Button variant={'secondary'} onPress={handleOnDismiss}>
                                Cancel
                            </Button>
                            <Button
                                variant={'cta'}
                                onPress={handleExport}
                                isDisabled={!downloadLink}
                                UNSAFE_className={'exportButton'}
                            >
                                <a href={downloadLink} ref={anchorRef} download>
                                    Export
                                </a>
                            </Button>
                        </ButtonGroup>
                    </Dialog>
                )}
            </DialogContainer>
        </>
    );
};
