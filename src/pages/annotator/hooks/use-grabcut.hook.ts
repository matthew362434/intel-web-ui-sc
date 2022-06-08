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

import { useMutation, UseMutationResult } from 'react-query';

import { Polygon } from '../../../core/annotations';
import { AlgorithmType, useWorker } from '../../../hooks/use-worker/use-worker.hook';
import { getImageData } from '../../../shared/utils';
import { GrabcutData, GrabcutMethods, GrabcutWorker } from '../tools/grabcut-tool/grabcut-tool.interface';

interface useGrabcutProps {
    onSuccess: (data: Polygon, variables: GrabcutData) => void;
    showNotificationError: (error: unknown) => void;
}

interface useGrabcutResult {
    cleanModels: () => void;
    isLoadingGrabcut: boolean;
    mutation: UseMutationResult<Polygon, unknown, GrabcutData>;
}

export const useGrabcut = ({ showNotificationError, onSuccess }: useGrabcutProps): useGrabcutResult => {
    const { worker } = useWorker(AlgorithmType.GRABCUT) as {
        worker: GrabcutWorker;
    };

    const GrabcutRef = useRef<GrabcutMethods | null>(null);
    const isMounted = useRef(true);

    const [isLoadingGrabcut, setIsLoadingGrabcut] = useState(true);

    useEffect(() => {
        isMounted.current = true;

        if (worker) {
            worker.isModuleLoaded('grabCut').then(() => setIsLoadingGrabcut(false));
        }

        return () => {
            cleanModels();
            isMounted.current = false;
        };
    }, [worker]);

    const mutation = useMutation(
        async ({ image, ...data }: GrabcutData) => {
            if (!GrabcutRef.current) {
                GrabcutRef.current = await new worker.Grabcut(getImageData(image));
            }

            return GrabcutRef.current.startGrabcut(data);
        },
        {
            onError: showNotificationError,
            onSuccess: (data: Polygon, variables: GrabcutData) => {
                if (isMounted.current) {
                    onSuccess(data, variables);
                }
            },
        }
    );

    const cleanModels = () => {
        if (GrabcutRef.current) {
            GrabcutRef.current.cleanModels();
        }

        GrabcutRef.current = null;
    };

    return { mutation, cleanModels, isLoadingGrabcut };
};
