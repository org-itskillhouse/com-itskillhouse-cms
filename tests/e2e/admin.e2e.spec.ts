import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test('shows Entra sign-in entrypoint', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login')
    const signInButton = page.getByRole('button', { name: /sign in with microsoft entra id/i })
    await expect(signInButton).toBeVisible()
  })

  test('redirects root to admin', async ({ page }) => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const pageTitle = page.locator('h1')
    await expect(pageTitle).toBeVisible()
  })
})
