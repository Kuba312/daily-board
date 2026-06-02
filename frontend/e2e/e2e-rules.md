# E2E Testing Rules

- Use `getByRole`, `getByLabel`, and `getByText` as primary locators.
- Fall back to `getByTestId` only when accessibility attributes are ambiguous.
- Never use CSS selectors, XPath, or DOM structure for locating elements.
- Each test must be independently runnable with its own setup, action, assertion, and cleanup.
- Never use `page.waitForTimeout()`. Wait for specific states with `toBeVisible()`, `waitForURL()`, `waitForResponse()`, or Playwright web-first assertions.
- Assert the business outcome, not implementation details.
- Use unique identifiers for test data to avoid collisions in parallel runs.
- Use `storageState` for authentication. Do not log in through the UI in individual tests.
