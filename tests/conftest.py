"""
conftest.py - Configuration and common fixtures for pytest.

This file contains shared fixtures and configurations to make testing
the photography pipeline easier.
"""
import os
import sys
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Ensure the project root is in the Python path
def pytest_configure(config):
    """Add the project root to the Python path."""
    # Find the project root
    current_dir = Path.cwd()

    if (current_dir / 'assets' / 'js').exists():
        project_root = current_dir
    elif (current_dir.parent / 'assets' / 'js').exists():
        project_root = current_dir.parent
    else:
        project_root = current_dir

    # Add to sys.path if not already there
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

    # Store for later use
    config.project_root = project_root

@pytest.fixture
def project_root(request):
    """Get the project root directory."""
    return getattr(request.config, 'project_root', Path.cwd())

# Mock PIL since we don't want to actually process images in tests
@pytest.fixture(autouse=True)
def mock_pil():
    """Mock the PIL Image module for all tests."""
    with patch('PIL.Image') as mock_image:
        # Set up the mock to return a consistent image object
        mock_img = MagicMock()
        mock_img.copy.return_value = mock_img
        mock_image.open.return_value.__enter__.return_value = mock_img

        yield mock_image

@pytest.fixture
def suppress_logging():
    """Temporarily suppress logging output during tests."""
    import logging

    # Store original logging level
    loggers = [logging.getLogger()]
    original_levels = [logger.level for logger in loggers]

    # Set log level to ERROR to suppress INFO and DEBUG messages
    for logger in loggers:
        logger.setLevel(logging.ERROR)

    yield

    # Restore original logging levels
    for logger, level in zip(loggers, original_levels):
        logger.setLevel(level)

# Add selenium option
def pytest_addoption(parser):
    parser.addoption("--run-selenium", action="store_true", default=False,
                     help="Run selenium tests")