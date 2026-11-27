import unittest
from unittest.mock import AsyncMock

from playwright.async_api import TimeoutError
from integrations.playwright_guidance import open_public_source


class PortalTimeoutTest(unittest.IsolatedAsyncioTestCase):
    async def test_navigation_timeout_uses_catalog_fallback(self):
        page = AsyncMock()
        page.goto.side_effect = TimeoutError("fixture timeout")
        self.assertFalse(await open_public_source(page, "https://scholarships.gov.in/example"))
