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

import { Annotation, labelFromUser } from '../../../../core/annotations';
import { SelectedMediaItem } from '../../../../core/media';
import { fireEvent, providersRender, screen, waitFor, waitForElementToBeRemoved } from '../../../../test-utils';
import {
    getMockedAnnotation,
    getMockedImageMediaItem,
    getMockedLabel,
} from '../../../../test-utils/mocked-items-factory';
import { useSubmitAnnotations, SubmitAnnotationsProvider } from './submit-annotations-provider.component';

describe('Saving annotations', () => {
    const selectedMediaItem: SelectedMediaItem = {
        ...getMockedImageMediaItem({}),
        image: new Image(),
        annotations: [],
    };

    const render = (app: JSX.Element, annotations: Annotation[], withoutSelectedMediaItem = false) => {
        const setSelectedMediaItem = jest.fn();
        const saveAnnotations = jest.fn();

        providersRender(
            <SubmitAnnotationsProvider
                annotations={annotations}
                saveAnnotations={saveAnnotations}
                currentMediaItem={withoutSelectedMediaItem ? undefined : selectedMediaItem}
            >
                {app}
            </SubmitAnnotationsProvider>
        );

        return { setSelectedMediaItem, saveAnnotations };
    };

    describe('Submitting annotations', () => {
        const App = ({ callback }: { callback?: () => Promise<void> }) => {
            const { submitAnnotationsMutation } = useSubmitAnnotations();
            const isSaving = submitAnnotationsMutation.isLoading;

            return (
                <button onClick={() => submitAnnotationsMutation.mutate({ callback })} disabled={isSaving}>
                    {isSaving ? 'Loading' : 'Submit'}
                </button>
            );
        };

        const annotations: Annotation[] = [{ ...getMockedAnnotation({}), labels: [labelFromUser(getMockedLabel())] }];

        it('Saves annotations then calls a callback', async () => {
            const callback = jest.fn();
            const { saveAnnotations } = render(<App callback={callback} />, annotations);

            fireEvent.click(screen.getByRole('button'));

            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /loading/i })).not.toBeInTheDocument();
            });

            expect(callback).toHaveBeenCalled();
            expect(saveAnnotations).toHaveBeenCalledWith(annotations);
        });

        it('Only calls a callback when there are no changes', async () => {
            const callback = jest.fn();
            const { saveAnnotations } = render(<App callback={callback} />, selectedMediaItem.annotations);

            fireEvent.click(screen.getByRole('button'));

            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /loading/i })).not.toBeInTheDocument();
            });

            expect(callback).toHaveBeenCalled();
            expect(saveAnnotations).not.toHaveBeenCalled();
        });

        it('Shows an error dialog when saving fails', async () => {
            const callback = jest.fn();
            const spy = jest.spyOn(console, 'error').mockImplementation();
            const { saveAnnotations } = render(<App callback={callback} />, annotations);

            const errorMessage = 'A server error occured';
            saveAnnotations.mockImplementation(() => {
                throw new Error(errorMessage);
            });

            fireEvent.click(screen.getByRole('button'));

            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /loading/i })).not.toBeInTheDocument();
            });

            expect(callback).not.toHaveBeenCalled();
            expect(saveAnnotations).toHaveBeenCalledWith(annotations);

            expect(screen.getByText(errorMessage)).toBeInTheDocument();

            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockRestore();
        });

        it('Submits unfinished annotations', async () => {
            const SetUnfinishedAnnotations = ({ unfinishedAnnotations }: { unfinishedAnnotations: Annotation[] }) => {
                const { setUnfinishedShapeCallback } = useSubmitAnnotations();
                const handleClick = () => {
                    setUnfinishedShapeCallback(() => unfinishedAnnotations);
                };

                return <button onClick={handleClick}>Set unfinished annotations</button>;
            };

            const callback = jest.fn();
            const { saveAnnotations } = render(
                <>
                    <App callback={callback} />
                    <SetUnfinishedAnnotations unfinishedAnnotations={annotations} />
                </>,
                []
            );

            fireEvent.click(screen.getByRole('button', { name: /Set unfinished annotations/i }));
            fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /loading/i })).not.toBeInTheDocument();
            });

            expect(callback).toHaveBeenCalled();
            expect(saveAnnotations).toHaveBeenCalledWith(annotations);
        });

        describe('Handling invalid user annotation scene', () => {
            const invalidAnnotations = [
                { ...getMockedAnnotation({ id: 'test-1' }), labels: [labelFromUser(getMockedLabel())] },
                { ...getMockedAnnotation({ id: 'test-2' }), labels: [] },
            ];

            it('Shows a dialog informing the user of invalid annotations', async () => {
                const callback = jest.fn();
                const { saveAnnotations } = render(<App callback={callback} />, invalidAnnotations);

                fireEvent.click(screen.getByRole('button'));

                expect(await screen.findByRole('alertdialog')).toBeInTheDocument();

                expect(callback).not.toHaveBeenCalled();
                expect(saveAnnotations).not.toHaveBeenCalledWith(annotations);

                fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

                expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

                expect(callback).not.toHaveBeenCalled();
                expect(saveAnnotations).not.toHaveBeenCalledWith(invalidAnnotations);
            });

            it('Shows a dialog informing the user of invalid annotations and removes invalid annotations', async () => {
                const callback = jest.fn();
                const { saveAnnotations } = render(<App callback={callback} />, invalidAnnotations);

                fireEvent.click(screen.getByRole('button'));

                expect(await screen.findByRole('alertdialog')).toBeInTheDocument();

                expect(callback).not.toHaveBeenCalled();
                expect(saveAnnotations).not.toHaveBeenCalledWith(annotations);

                fireEvent.click(screen.getByRole('button', { name: /Delete & continue/i }));

                await waitForElementToBeRemoved(screen.getByRole('alertdialog'));

                expect(callback).toHaveBeenCalled();
                expect(saveAnnotations).toHaveBeenCalledWith([invalidAnnotations[0]]);
            });
        });

        describe('Adding empty labels when submitting an empty annotation scene', () => {
            it.todo('Classification');
            it.todo('Detection');
            it.todo('Segmentation');
            describe('Task chain', () => {
                it.todo('Detection -> Classification');
                it.todo('Detection -> Segmentation');
            });
        });
    });

    describe('Asking user for confirmation to submit or discard', () => {
        const App = ({ callback }: { callback?: () => Promise<void> }) => {
            const { confirmSaveAnnotations } = useSubmitAnnotations();

            return <button onClick={() => confirmSaveAnnotations(callback)}>Show confirmation</button>;
        };

        const annotations: Annotation[] = [{ ...getMockedAnnotation({}), labels: [labelFromUser(getMockedLabel())] }];

        it('Discards changes then calls a callback', () => {
            const callback = jest.fn();
            const { saveAnnotations } = render(<App callback={callback} />, annotations);

            fireEvent.click(screen.getByRole('button'));

            expect(screen.getByRole('dialog')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: /Discard/i }));

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(callback).toHaveBeenCalled();
            expect(saveAnnotations).not.toHaveBeenCalled();
        });

        it('Saves annotations then calls a callback', async () => {
            const callback = jest.fn();
            const { saveAnnotations } = render(<App callback={callback} />, annotations);

            fireEvent.click(screen.getByRole('button'));

            expect(screen.getByRole('dialog')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

            const loading = await screen.findByRole('progressbar');
            await waitFor(() => {
                expect(loading).not.toBeInTheDocument();
            });

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(callback).toHaveBeenCalled();
            expect(saveAnnotations).toHaveBeenCalledWith(annotations);
        });

        it('Shows an error message when saving fails', async () => {
            const callback = jest.fn();
            const spy = jest.spyOn(console, 'error').mockImplementation();
            const { saveAnnotations } = render(<App callback={callback} />, annotations);

            const errorMessage = 'A server error occured';
            saveAnnotations.mockImplementation(() => {
                throw new Error(errorMessage);
            });

            fireEvent.click(screen.getByRole('button'));

            expect(screen.getByRole('dialog')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

            const loading = await screen.findByRole('progressbar');
            await waitFor(() => {
                expect(loading).not.toBeInTheDocument();
            });

            expect(saveAnnotations).toHaveBeenCalledWith(annotations);

            expect(screen.queryByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            expect(callback).not.toHaveBeenCalled();

            expect(spy).toHaveBeenCalledTimes(1);
            spy.mockRestore();
        });

        it('Cancels the confirmation and does not call a callback', () => {
            const callback = jest.fn();
            const { saveAnnotations } = render(<App callback={callback} />, annotations);

            fireEvent.click(screen.getByRole('button'));

            expect(screen.getByRole('dialog')).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(callback).not.toHaveBeenCalled();
            expect(saveAnnotations).not.toHaveBeenCalled();
        });

        it("Doesn't show a confirmation dialog if there are no changes", () => {
            const callback = jest.fn();
            const { saveAnnotations } = render(<App callback={callback} />, selectedMediaItem.annotations);

            fireEvent.click(screen.getByRole('button'));

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            expect(callback).toHaveBeenCalled();
            expect(saveAnnotations).not.toHaveBeenCalled();
        });
    });

    it('Requires the SubmitAnnotationsProvider', () => {
        // Expect an error to be thrown when rendering app
        const App = () => {
            useSubmitAnnotations();

            return null;
        };

        const spy = jest.spyOn(console, 'error').mockImplementation();
        expect(() => providersRender(<App />)).toThrow();
        expect(spy).toHaveBeenCalledTimes(2);

        spy.mockRestore();
    });
});
