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

/*
    Usage:

    (1) Add your algorithm enum to AlgorithmType
    (2) Add your algorithm to src/pages/annotator/tools/your-algorithm.ts
    (3) Add your worker on src/webworkers/your-worker.worker.ts
    (4) Define an interface for the worker
    (4) Import the hook
        
        const { worker } = useWorker(AlgorithmType.YOUR_ALGORITHM) as YOUR_INTERFACE;

*/

import { useState, useEffect } from 'react';

import { Remote, wrap } from 'comlink';

import { GrabcutWorker } from '../../pages/annotator/tools/grabcut-tool/grabcut-tool.interface';
import { IntelligentScissorsWorker } from '../../pages/annotator/tools/polygon-tool/polygon-tool.interface';
import { WatershedWorker } from '../../pages/annotator/tools/watershed-tool/watershed-tool.interface';
import { getWorker } from './utils';

export interface WorkerWrapper<T> {
    worker: T;
}

interface UseWorker<T> {
    worker?: T;
    terminateWorkers: () => void;
}

export enum AlgorithmType {
    GRABCUT = 'GRABCUT',
    WATERSHED = 'WATERSHED',
    INTELLIGENT_SCISSORS = 'INTELLIGENT_SCISSORS',
}

type Algorithm = GrabcutWorker | WatershedWorker | IntelligentScissorsWorker;

const mapLoadedWorkers = new Map<AlgorithmType, Remote<Algorithm>>();

const terminateWorkers = () => {
    mapLoadedWorkers.forEach((worker, key) => {
        (worker as { terminate: () => void })?.terminate();

        mapLoadedWorkers.delete(key);
    });
};

export const useWorker = (algorithm?: AlgorithmType): UseWorker<unknown> => {
    const [loadedWorker, setLoadedWorker] = useState<WorkerWrapper<unknown>>();

    useEffect(() => {
        if (!algorithm) return;

        if (mapLoadedWorkers.has(algorithm)) {
            setLoadedWorker({ worker: mapLoadedWorkers.get(algorithm) });
        } else {
            // Create worker leveraging webpack 5
            const baseWorker = getWorker(algorithm);

            // Wrap the worker using Comlink
            const worker = wrap<Algorithm>(baseWorker);

            mapLoadedWorkers.set(algorithm, worker);

            // This is wrapped in an object because `useState` doesn't like Comlink's Proxy type
            setLoadedWorker({ worker });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [algorithm]);

    return { worker: loadedWorker?.worker, terminateWorkers };
};
