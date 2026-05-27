import { test, expect } from "@playwright/test";

test.describe("Onboarding flow", () => {
  test("completes 3-step onboarding and redirects to dashboard", async ({ page }) => {
    // Start at signup (mock auth in test env)
    await page.goto("/onboarding");

    // Step 1: Investment amount
    await expect(page.getByText("¿Cuánto quieres invertir?")).toBeVisible();
    await page.getByRole("button", { name: "$100" }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Step 2: Risk profile
    await expect(page.getByText("Perfil de riesgo")).toBeVisible();
    await page.getByRole("button", { name: /Moderado/i }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();

    // Step 3: Goal
    await expect(page.getByText("Tu objetivo")).toBeVisible();
    await page.getByText("Crecer a largo plazo").click();
    await page.getByRole("button", { name: "Empezar a invertir" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("Landing page", () => {
  test("shows hero and CTA buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Empieza gratis/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Iniciar sesión/i })).toBeVisible();
  });
});
