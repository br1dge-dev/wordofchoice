# Word of Choice Contributing Guide

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code (white-space, formatting, etc) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding missing tests or correcting existing tests |
| `chore` | Changes to the build process or auxiliary tools |
| `revert` | Revert a previous commit |

### Scopes

| Scope | Description |
|-------|-------------|
| `frontend` | Frontend changes (HTML, CSS, JS) |
| `contracts` | Smart Contract changes |
| `config` | Configuration changes |
| `deps` | Dependency updates |

### Examples

```
feat(frontend): add new mint confirmation modal
fix(contracts): resolve reentrancy vulnerability in withdraw
docs: update deployment instructions
chore(deps): update @openzeppelin/contracts to v5.3.0
refactor(frontend): simplify expression loading logic
```

## Branch Naming

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feature/<issue>-<short-description>` | `feature/42-add-marquee-component` |
| Bug Fix | `fix/<issue>-<short-description>` | `fix/15-resolve-loading-timeout` |
| Hotfix | `hotfix/<description>` | `hotfix/security-patch` |
| Release | `release/v<version>` | `release/v1.1.0` |

## Workflow

1. **Create a branch** from `main`
2. **Make changes** following code style
3. **Commit** using conventional format
4. **Push** to remote
5. **Create Pull Request** against `main`
6. **Review & Merge** after approval

## Code Style

- Frontend: Vanilla JS, CSS custom properties
- Contracts: Solidity with slither-friendly patterns
- All: Prettier for formatting (where applicable)

## Testing

- Smart Contracts: Hardhat tests required
- Frontend: Manual testing for UI changes
- Run `npm run test` before committing

## Questions?

Open an issue for discussion.
