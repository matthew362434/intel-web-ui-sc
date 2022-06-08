module.exports = {
  stories: ['./stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/preset-create-react-app', '@storybook/addon-a11y'],
  framework: '@storybook/react',
  staticDirs: ['../public'],
  core: {
    builder: "webpack5"
  }
};