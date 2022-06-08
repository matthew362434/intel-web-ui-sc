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
import { Divider, Text, View } from '@adobe/react-spectrum';
import { motion, AnimatePresence } from 'framer-motion';

import { ANIMATION_PARAMETERS } from '../../../../../shared/animation-parameters/animation-parameters';
import { ArchitectureModels } from '../project-models.interface';
import { TrainingProgressStatusBar } from './training-progress-status-bar';
import { TrainingProgressTask } from './training-progress-task';
import classes from './training-progress.module.scss';
import { useTrainingProgress } from './use-training-progress';

interface TrainingProgressProps {
    models: ArchitectureModels[];
}

export const TrainingProgress = ({ models }: TrainingProgressProps): JSX.Element => {
    const trainingData = useTrainingProgress(models);

    return (
        <AnimatePresence exitBeforeEnter>
            {trainingData.showTrainingProgress && (
                <motion.div
                    variants={ANIMATION_PARAMETERS.ANIMATE_ELEMENT_WITH_JUMP}
                    initial={'hidden'}
                    animate={'visible'}
                    exit={'exit'}
                >
                    <View marginY={'size-400'}>
                        <Text id={'current-training-id'}>Current training</Text>
                        <View
                            borderTopStartRadius={'small'}
                            borderTopEndRadius={'small'}
                            backgroundColor={'gray-75'}
                            marginTop={'size-100'}
                            paddingY={'size-250'}
                            paddingX={'size-200'}
                        >
                            <TrainingProgressTask
                                name={trainingData.trainingDetails.taskMetadata.name}
                                architecture={trainingData.trainingDetails.taskMetadata.architecture}
                                version={trainingData.modelVersion}
                            />
                            <Divider size={'S'} marginY={'size-200'} />
                            <TrainingProgressStatusBar trainingStatus={trainingData.trainingDetails.status} />
                        </View>
                        <View
                            borderBottomStartRadius={'small'}
                            borderBottomEndRadius={'small'}
                            borderBottomWidth={'thicker'}
                            borderBottomColor={'blue-700'}
                            backgroundColor={'gray-75'}
                            width={trainingData.trainingDetails.status.progress}
                            height={'size-25'}
                            UNSAFE_className={classes.trainingProgress}
                        />
                    </View>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
