---
title: Git Workflow
category: git
tags: [branching, commits, collaboration, rebase]
version: 1.0.0
---

Git branching strategies, commit conventions, and collaboration patterns.
Use when setting up repository workflows, writing commit messages, or
resolving merge conflicts. Covers conventional commits, branch naming,
and common Git operations.

## Branch Naming Convention

```
feature/ABC-123-short-description
bugfix/ABC-456-fix-login-issue
hotfix/ABC-789-security-patch
release/v1.2.0
chore/update-dependencies
```

## Conventional Commits

Format: `<type>(<scope>): <description>`

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons
- `refactor`: Code change that neither fixes nor adds
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

### Examples
```
feat(auth): add OAuth2 login support
fix(api): handle null response in user endpoint
docs(readme): update installation instructions
refactor(utils): extract validation logic to separate module
perf(query): add index for user lookup
```

## Common Operations

### Interactive Rebase
```bash
# Squash last 3 commits
git rebase -i HEAD~3

# Rebase onto main
git rebase main

# Abort if things go wrong
git rebase --abort
```

### Cherry Pick
```bash
# Pick specific commit
git cherry-pick <commit-sha>

# Pick without committing
git cherry-pick -n <commit-sha>
```

### Stash Operations
```bash
# Stash with message
git stash push -m "WIP: feature X"

# List stashes
git stash list

# Apply specific stash
git stash apply stash@{2}

# Pop and apply
git stash pop
```

### Undo Operations
```bash
# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, unstage changes
git reset HEAD~1

# Discard all changes (DANGEROUS)
git reset --hard HEAD~1

# Revert a commit (creates new commit)
git revert <commit-sha>
```

## Merge vs Rebase

### Use Merge When:
- Working on shared branches
- Preserving feature branch history matters
- Multiple people on same branch

### Use Rebase When:
- Cleaning up local commits before PR
- Updating feature branch with main
- Linear history is preferred

## Pull Request Checklist

- [ ] Branch is up to date with target
- [ ] All tests pass
- [ ] Code is reviewed
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] Documentation updated if needed
