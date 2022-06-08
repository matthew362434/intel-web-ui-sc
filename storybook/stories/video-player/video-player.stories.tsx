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

import { DialogTrigger, ActionButton } from '@adobe/react-spectrum';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Video } from '../../../src/core/media';
import { DatasetIdentifier } from '../../../src/core/projects';
import { VideoPlayerDialog } from '../../../src/pages/annotator/components/range-based-video-player/video-player-dialog.component';
import { ProjectProvider } from '../../../src/pages/project-details/providers';
import { RequiredProviders } from '../../../src/test-utils';
import { getMockedVideoMediaItem } from '../../../src/test-utils/mocked-items-factory';

const src =
    // eslint-disable-next-line max-len
    'http://localhost:3000/api/v1.0/workspaces/623b014a948d4113fc31e06c/projects/623c2967948d4113fc31e193/datasets/623c2967948d4113fc31e192/media/videos/623c2973948d4113fc31e1a0/display/stream';

const mediaItem = getMockedVideoMediaItem({
    name: 'Bunny.mp4',
    src: src,
    metadata: {
        duration: 20,
        fps: 30,
        frames: 605,
        frameStride: 30,
        height: 720,
        width: 1280,
    },
});

const datasetIdentifier: DatasetIdentifier = {
    workspaceId: 'workspace-id',
    projectId: 'project-id',
    datasetId: 'dataset-id',
};

const VideoPlayer = ({ mediaItem: videoMediaItem }: { mediaItem: Video }) => {
    return (
        <RequiredProviders>
            <ProjectProvider projectIdentifier={datasetIdentifier}>
                <DialogTrigger>
                    <ActionButton>Split this video</ActionButton>
                    {(close) => (
                        <VideoPlayerDialog
                            datasetIdentifier={datasetIdentifier}
                            mediaItem={videoMediaItem}
                            close={close}
                        />
                    )}
                </DialogTrigger>
            </ProjectProvider>
        </RequiredProviders>
    );
};

export default {
    title: 'Videoplayer',
    component: VideoPlayer,
} as ComponentMeta<typeof VideoPlayer>;

const Template: ComponentStory<typeof VideoPlayer> = (args) => <VideoPlayer {...args} />;

export const Default = Template.bind({});
Default.args = {
    mediaItem,
};
