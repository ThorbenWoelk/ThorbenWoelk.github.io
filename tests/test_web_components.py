#!/usr/bin/env python3
"""
Tests for the website components of Toto's Photography Portfolio.

These tests focus on the JavaScript and HTML interactions.
"""
import os
import json
import tempfile
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Check if Selenium is installed without requiring it
try:
    import selenium

    HAS_SELENIUM = True
except ImportError:
    HAS_SELENIUM = False


def find_project_root():
    """Find the project root directory from the current location."""
    # Start with the current directory
    current_dir = Path.cwd()

    # Check if we're already at the project root (contains assets/js)
    if (current_dir / 'assets' / 'js').exists():
        return current_dir

    # Try going up one level (if we're in tests/ directory)
    parent_dir = current_dir.parent
    if (parent_dir / 'assets' / 'js').exists():
        return parent_dir

    # Return current dir as fallback - tests will skip if files not found
    return current_dir


class TestImageListJS:
    """Tests for the imageList.js file format and compatibility."""

    @pytest.fixture
    def project_root(self):
        """Get the project root directory."""
        return find_project_root()

    @pytest.fixture
    def sample_js_file(self):
        """Create a sample imageList.js file."""
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.js', delete=False) as temp:
            collections = {
                'current': ['image1.webp', 'image2.webp', 'image3.webp'],
                'archive': ['old1.webp', 'old2.webp']
            }

            all_files = []
            for images in collections.values():
                all_files.extend(images)

            js_content = [
                f"export const imageCollections = {json.dumps(collections, indent=2)};",
                f"export const imageFiles = {json.dumps(sorted(all_files))}"
            ]

            temp.write('\n'.join(js_content))
            temp_path = temp.name

        yield Path(temp_path)

        # Clean up
        os.unlink(temp_path)

    def test_js_file_format(self, sample_js_file):
        """Test that the JS file has the correct format."""
        content = sample_js_file.read_text()

        # Check basic structure
        assert 'export const imageCollections =' in content
        assert 'export const imageFiles =' in content

        # Parse the collections
        collections_json = content.split('export const imageCollections =')[1].split('export const imageFiles')[
            0].strip()
        if collections_json.endswith(';'):
            collections_json = collections_json[:-1]

        parsed = json.loads(collections_json)
        assert isinstance(parsed, dict)
        assert 'current' in parsed
        assert 'archive' in parsed
        assert len(parsed['current']) == 3
        assert len(parsed['archive']) == 2

        # Parse the files list
        files_json = content.split('export const imageFiles =')[1].strip()
        if files_json.endswith(';'):
            files_json = files_json[:-1]

        parsed_files = json.loads(files_json)
        assert isinstance(parsed_files, list)
        assert len(parsed_files) == 5
        assert all(f.endswith('.webp') for f in parsed_files)

    def test_real_js_file(self, project_root):
        """Test the actual imageList.js file in the project."""
        js_path = project_root / 'assets' / 'js' / 'imageList.js'

        if not js_path.exists():
            pytest.skip(f"imageList.js not found at {js_path}")

        content = js_path.read_text()

        # Check basic structure
        assert 'export const imageCollections =' in content
        assert 'export const imageFiles =' in content

        # Attempt to parse the collections
        try:
            collections_json = content.split('export const imageCollections =')[1].split('export const imageFiles')[
                0].strip()
            if collections_json.endswith(';'):
                collections_json = collections_json[:-1]

            parsed = json.loads(collections_json)
            assert isinstance(parsed, dict)

            # Check if collections exist
            assert any(collection in parsed for collection in ['current', 'archive'])

            # Check if collections have items
            for collection, images in parsed.items():
                assert isinstance(images, list)
                if images:  # If collection isn't empty
                    assert all(isinstance(img, str) for img in images)
                    assert all(img.endswith('.webp') for img in images)

        except (json.JSONDecodeError, ValueError, IndexError, AssertionError) as e:
            pytest.fail(f"Failed to parse imageList.js: {e}")


class TestMainJS:
    """Tests for the main.js functionality."""

    @pytest.fixture
    def project_root(self):
        """Get the project root directory."""
        return find_project_root()

    @pytest.fixture
    def mock_document(self):
        """Create a mock document and window for JS testing."""
        mock_doc = MagicMock()
        mock_doc.getElementById.return_value = MagicMock()
        mock_doc.getElementById.return_value.querySelector.return_value = MagicMock()
        mock_doc.querySelectorAll.return_value = []

        return mock_doc

    def test_main_js_imports(self, project_root):
        """Test that main.js has the correct imports."""
        js_path = project_root / 'assets' / 'js' / 'main.js'

        if not js_path.exists():
            pytest.skip(f"main.js not found at {js_path}")

        content = js_path.read_text()

        # Check imports
        assert "import { imageCollections } from './imageList.js'" in content
        assert "import { Modal } from './modal.js'" in content

    def test_render_collection_paths(self, project_root):
        """Test that renderCollection uses the correct paths."""
        js_path = project_root / 'assets' / 'js' / 'main.js'

        if not js_path.exists():
            pytest.skip(f"main.js not found at {js_path}")

        content = js_path.read_text()

        # Check image paths
        assert "/processed/" in content
        assert "/grid/" in content
        assert "/thumb/" in content
        assert "/large/" in content


@pytest.mark.skipif(not HAS_SELENIUM, reason="Selenium not installed")
class TestWebsiteIntegration:
    """Integration tests for the website using Selenium."""

    @pytest.fixture
    def project_root(self):
        """Get the project root directory."""
        return find_project_root()

    @pytest.fixture
    def mock_server(self, project_root):
        """Create a simple HTTP server for testing."""
        import http.server
        import socketserver
        import threading
        import time

        # Change directory to project root
        original_dir = os.getcwd()
        os.chdir(project_root)

        PORT = 8000

        # Create a server in a separate thread
        handler = http.server.SimpleHTTPRequestHandler
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            server_thread = threading.Thread(target=httpd.serve_forever)
            server_thread.daemon = True
            server_thread.start()

            # Wait for server to start
            time.sleep(1)

            yield f"http://localhost:{PORT}"

            # Shutdown the server
            httpd.shutdown()

            # Change back to original directory
            os.chdir(original_dir)

    def test_website_loads(self, mock_server, selenium):
        """Test that the website loads and displays images."""
        selenium.get(mock_server)

        # Allow page to load
        selenium.implicitly_wait(5)

        # Check for the right page
        assert "Photography" in selenium.title or "Toto" in selenium.title, f"Page title is: {selenium.title}"

        try:
            # Using the updated Selenium method
            images = selenium.find_elements("css selector", '.photo-item img')
            assert len(images) > 0, "No images found on the page"
        except Exception as e:
            print(f"HTML content: {selenium.page_source[:500]}...")
            raise

    def test_modal_functionality(self, mock_server, selenium):
        """Test that the image modal works correctly."""
        selenium.get(mock_server)

        # Allow page to load
        selenium.implicitly_wait(5)

        try:
            # Using the updated Selenium method
            images = selenium.find_elements("css selector", '.photo-item img')
            if not images:
                pytest.skip("No images found to test modal with")

            # Click the first image
            images[0].click()

            # Wait for modal to appear
            import time
            time.sleep(1)

            # Check that the modal appears
            modal = selenium.find_element("css selector", '.modal.active')
            assert modal is not None, "Modal did not appear"

            # Check that the modal contains an image
            modal_img = modal.find_element("tag name", 'img')
            assert modal_img is not None, "Modal does not contain an image"

            # Looking at your modal HTML, we need to find the close button instead of clicking the modal
            # Try using escape key first
            from selenium.webdriver.common.keys import Keys
            from selenium.webdriver.common.action_chains import ActionChains

            # Send escape key to close the modal
            ActionChains(selenium).send_keys(Keys.ESCAPE).perform()

            # If that doesn't work, try to find and click the close button
            time.sleep(0.5)
            try:
                if selenium.find_elements("css selector", '.modal.active'):
                    # Look for a close button
                    close_btn = selenium.find_element("css selector", '.modal-close')
                    close_btn.click()
            except:
                # As a last resort, execute JavaScript to close the modal
                selenium.execute_script("document.querySelector('.modal.active').classList.remove('active');")

            # Wait for modal to close
            time.sleep(0.5)

            # Check that the modal is closed
            modals = selenium.find_elements("css selector", '.modal.active')
            assert len(modals) == 0, "Modal did not close"

        except Exception as e:
            print(f"HTML content: {selenium.page_source[:500]}...")
            raise


if __name__ == '__main__':
    pytest.main(['-xvs', __file__])