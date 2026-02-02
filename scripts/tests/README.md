# Scripts Tests

This directory contains tests for ORCA-OS scripts.

## Running Tests

```bash
# Run all script tests
python3 -m pytest scripts/tests/

# Run specific test
python3 -m pytest scripts/tests/test_memory_search.py
```

## Test Structure

- `test_*.py` - Test files following pytest conventions
- Each script should have a corresponding test file

## Writing Tests

1. Use pytest for Python scripts
2. Mock external dependencies (databases, APIs)
3. Test both success and error paths
