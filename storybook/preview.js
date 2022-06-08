import { Provider as ThemeProvider, defaultTheme } from '@adobe/react-spectrum';

import '../src/assets/index.scss';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    layout: 'centered',
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};

export const decorators = [
    (Story) => (
        <ThemeProvider theme={defaultTheme} colorScheme='dark' UNSAFE_className='spectrum'>
            <Story />
        </ThemeProvider>
    ),
];
