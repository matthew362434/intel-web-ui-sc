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

import { isVideo, isVideoFrame } from '../../../../../../core/media';
import { capitalize } from '../../../../../../shared/utils';
import { ToolType } from '../../../../core';
import { useAnnotationToolContext, useAnnotator } from '../../../../providers';
import { useDrawingTools } from '../../utils';
import { HotKeysItem } from '../hot-keys-item';
import classes from './hot-keys-list.module.scss';
import { isToolAvailable } from './utils';

export const HotKeysList = (): JSX.Element => {
    const { hotKeys, selectedMediaItem } = useAnnotator();
    const { activeDomains } = useAnnotationToolContext();
    const availableDrawingTools = useDrawingTools(activeDomains);
    const isBoundingBoxAvailable = isToolAvailable(availableDrawingTools, ToolType.BoxTool);
    const isCircleToolAvailable = isToolAvailable(availableDrawingTools, ToolType.CircleTool);
    const isPolygonToolAvailable = isToolAvailable(availableDrawingTools, ToolType.PolygonTool);
    const isGrabcutToolAvailable = isToolAvailable(availableDrawingTools, ToolType.GrabcutTool);
    const isWatershedToolAvailable = isToolAvailable(availableDrawingTools, ToolType.WatershedTool);

    const isVideoLoaded = selectedMediaItem && (isVideo(selectedMediaItem) || isVideoFrame(selectedMediaItem));

    const redoShortcut = (
        <>
            {hotKeys.redo.toUpperCase()}
            <Text UNSAFE_className={classes.hotKeysListRedo}> or </Text>
            {hotKeys.redoSecond.toUpperCase()}
        </>
    );

    const imageDragShortcut = (
        <>
            CTRL+DRAG
            <Text UNSAFE_className={classes.hotKeysListRedo}> or </Text>
            MOUSE MIDDLE CLICK
        </>
    );

    const deleteShortcut = (
        <>
            {capitalize(hotKeys.delete)}
            <Text UNSAFE_className={classes.hotKeysListRedo}> or </Text>
            {capitalize(hotKeys.deleteSecond)}
        </>
    );

    return (
        <View marginTop={'size-150'} height={'100%'} UNSAFE_className={classes.hotKeysListContainer}>
            <HotKeysItem title={'Select all'} shortcut={hotKeys.selectAll.toUpperCase()} />
            <HotKeysItem title={'Deselect all'} shortcut={hotKeys.deselectAll.toUpperCase()} />
            <Divider size={'S'} marginBottom={'size-150'} />
            <HotKeysItem title={'Undo'} shortcut={hotKeys.undo.toUpperCase()} />
            <HotKeysItem title={'Redo'} shortcut={redoShortcut} />
            <Divider size={'S'} marginBottom={'size-150'} />
            <HotKeysItem title={'Deleting selected'} shortcut={deleteShortcut} />
            <Divider size={'S'} marginBottom={'size-150'} />
            <HotKeysItem title={'Selection tool'} shortcut={hotKeys['select-tool'].toUpperCase()} />
            <HotKeysItem
                title={'Bounding tool'}
                shortcut={hotKeys['bounding-box-tool'].toUpperCase()}
                disabled={isBoundingBoxAvailable}
            />
            <HotKeysItem
                title={'Circle tool'}
                shortcut={hotKeys['circle-tool'].toUpperCase()}
                disabled={isCircleToolAvailable}
            />
            <HotKeysItem
                title={'Polygon tool'}
                shortcut={hotKeys['polygon-tool'].toUpperCase()}
                disabled={isPolygonToolAvailable}
            />
            <HotKeysItem
                title={'Object selection tool'}
                shortcut={hotKeys['grabcut-tool'].toUpperCase()}
                disabled={isGrabcutToolAvailable}
            />
            <HotKeysItem
                title={'Object coloring'}
                shortcut={hotKeys['watershed-tool'].toUpperCase()}
                disabled={isWatershedToolAvailable}
            />
            <HotKeysItem title={'Fit image to screen'} shortcut={hotKeys.zoom.toUpperCase()} />
            <HotKeysItem title={'Scroll image with hand tool'} shortcut={imageDragShortcut} />
            <Divider size={'S'} marginBottom={'size-150'} />
            <HotKeysItem
                title={'Play / Pause video'}
                shortcut={capitalize(hotKeys.playOrPause)}
                disabled={!isVideoLoaded}
            />
            <HotKeysItem title={'Next frame'} shortcut={capitalize(hotKeys.nextFrame)} disabled={!isVideoLoaded} />
            <HotKeysItem
                title={'Previous frame'}
                shortcut={capitalize(hotKeys.previousFrame.toUpperCase())}
                disabled={!isVideoLoaded}
            />
        </View>
    );
};
