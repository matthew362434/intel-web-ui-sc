# Commit Messages


Any line of the commit message cannot be longer than 100 characters.

### <a name="commit-header"></a>Commit Message Header

```
[<issue>] <type>: <short summary>
  │        │       │
  │        │       └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │        │
  │        │
  │        └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
  │
  │        
  └─⫸ Jira Issue ID (e.g., 12424)
```

#### Type

Must be one of the following:

* **build**: Changes that affect the build system or external dependencies
* **ci**: Changes to our CI configuration files and scripts
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **test**: Adding missing tests or correcting existing tests


#### Summary

Use the summary field to provide a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end

## Revert commits

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit.

The content of the commit message body should contain:

- information about the SHA of the commit being reverted in the following format: `This reverts commit <SHA>`,
- a clear description of the reason for reverting the commit message.