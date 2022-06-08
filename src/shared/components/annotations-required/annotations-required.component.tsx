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

import { useRef } from 'react';

import { ActionButton, DialogTrigger, Flex, Text, View } from '@adobe/react-spectrum';

import { Task } from '../../../core/projects';
import { TaskRequiredAnnotations } from '../../../pages/annotator/hooks/use-required-annotations.hook';
import classes from './annotations-required.module.scss';
import { DetailsDialog } from './details-dialog.component';
import { NoAnnotationsRequired } from './no-annotations-required.component';

interface AnnotationsRequiredProps {
    requiredAnnotations: TaskRequiredAnnotations[];
    isTraining?: boolean;
    selectedTask?: Task | null;
    id?: string;
}

export const AnnotationsRequired = ({
    id,
    requiredAnnotations,
    selectedTask,
    isTraining = false,
}: AnnotationsRequiredProps): JSX.Element => {
    const containerRef = useRef<HTMLDivElement>({} as HTMLDivElement);

    const { clientWidth } = containerRef.current;
    const totalRequiredAnnotations = requiredAnnotations.reduce((acc, currentTask) => acc + currentTask.value, 0);

    // We will only enable the dialog if we're on 'All tasks' or if we're on a specific task that has 'details'
    const isDialogDisabled = !requiredAnnotations.some(({ details }) => details.length > 0) && !!selectedTask;

    return (
        <>
            {isTraining ? (
                <NoAnnotationsRequired id={id} ref={containerRef} />
            ) : (
                <DialogTrigger type='popover' hideArrow isDismissable>
                    <div ref={containerRef}>
                        <ActionButton isDisabled={isDialogDisabled} isQuiet UNSAFE_className={classes.button}>
                            <Flex
                                id={id}
                                direction='row-reverse'
                                alignItems='center'
                                marginX='size-100'
                                data-testid={'required-annotations-value'}
                            >
                                <Text id='annotations-required-id'>Annotations required:</Text>
                                <View
                                    id='annotations-required-number-id'
                                    backgroundColor='blue-400'
                                    paddingY='size-10'
                                    paddingX='size-65'
                                    borderRadius='small'
                                >
                                    {totalRequiredAnnotations}
                                </View>
                            </Flex>
                        </ActionButton>
                    </div>

                    <DetailsDialog clientWidth={clientWidth} requiredAnnotations={requiredAnnotations} />
                </DialogTrigger>
            )}
        </>
    );
};
