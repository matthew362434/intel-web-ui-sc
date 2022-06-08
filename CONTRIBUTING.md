## Development Setup
### Code Editor Configuration
### Eslint Configuration
Actual eslint rules are available within the `.eslintrc` file, which can be accessed from the project root folder.
### Prettier Configuration
{
 "tabWidth": 4,
 "useTabs": true,
 "trailingComma": "none",
 "singleQuote": true
}
### Simply git hooks configuration
- add a hook in the `package.json` file in the `simple-git-hooks` section
- when you applied changes, run `npm run prepare` to save changes
### Development Environment Setup
## Architecture
- functional programming design pattern
- dry
- do not write library, use already existing
- use context api as state management system
- use hooks instead of massive props pollution
- smart (containers) vs dumb (presentational) components approach
- use composition and HOCs to create reusable components
### Data Contract
## Code Styling
- no magic strings
- no magic numbers
- do not leave console logs
- do not leave comments unless it's absolutely necessary
- do not use ts-ignore - leverage typescript
- write self-explanatory code
- avoid callback hell
- avoid nested conditionals
- avoid if possible providers nesting dependency
- do not use string for conditionals, enums instead
- clone objects instead of retyping
- avoid nested interfaces, to regain usability
- named export is preferred
- handle conditionals on the lowest possible DOM level, to avoid performance issues
- if component should render nothing return react fragment (<></>) 
- do not use defaultProps - declare default values in component props in function
- one line condition should be in new line wrapped with curly brackets
- add IDs to all interactable elements and elements with text
### Naming Convention
By default, we should follow Typescript proposed convention:
- global consts: INITIAL_STATE,
- enums: enum Shape { Rectangle: 'Rectangle' }
- components: ComponentName
- interfaces, types:
  - for components: ComponentNameProps
  - for contexts: ContextNameProps
  - for objects: ObjectName
  We should use interfaces when it is possible, in other cases use types.
  When this convention causes naming collision, use Interface or Type suffix.
- functions, consts etc.: camelCase,
- file naming:
    - component - complex-name.component.tsx
    - interface - complex-name.interface.ts
    - if css file - complex-name.module.scss to provide style encapsulation
    - separate enums - complex-name.enum.ts
### Project Files Structure
In order to provide clean code structure, that will remain easy to maintain we agreed to the following:
- single file per component
- interfaces in separate files
- components: feature based folder structure
- sharable content should be place in structure:
    - **core/feature/** feature could be, for example, "projects" or "annotations". Should include interfaces
    - **core/feature/services** all code connected to api should be stored, like getting list of projects
    - **core/feature/dtos** contains interfaces of what is received from api calls
### Preferred Tools / Libraries
*---to be done---*
### CSS Styling Guidelines
- do not use inline-styling
### Strong Typing Approach
- do not use `any` type
- use interfaces instead of types
- use types for merging multiple interfaces only
### Utilities

### Unit Testing
## Definition of Done
- always run eslint before commit
- no errors and warnings in console
- no console log left
