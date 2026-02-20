import { Page } from '@playwright/test';

const BOOK_MOCK = {
  id: '1',
  title: 'Pride and Prejudice',
  description: 'A classic novel',
  url_librivox: 'https://librivox.org/test',
  language: 'English',
  copyright_year: '1813',
  num_sections: '5',
  totaltimesecs: 36000,
  totaltime: '10:00:00',
  authors: [{ id: '1', first_name: 'Jane', last_name: 'Austen' }],
  genres: [{ id: '1', name: 'Fiction' }],
  sections: [
    {
      id: '1',
      title: 'Chapter 1',
      section_number: '1',
      listen_url: 'https://test.mp3',
      playtime: '00:30:00',
      readers: [{ display_name: 'Test Reader' }],
    },
    {
      id: '2',
      title: 'Chapter 2',
      section_number: '2',
      listen_url: 'https://test2.mp3',
      playtime: '00:25:00',
      readers: [{ display_name: 'Test Reader' }],
    },
  ],
};

/**
 * Intercept LibriVox API calls and return mock data.
 * The app routes requests through a CORS proxy at api.codetabs.com,
 * so we intercept both the direct URL and the proxied URL.
 */
export async function mockLibriVoxAPI(page: Page) {
  const handler = (route: import('@playwright/test').Route) => {
    const url = decodeURIComponent(route.request().url());
    if (url.includes('id=')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ books: [BOOK_MOCK] }),
      });
    } else {
      const books = Array.from({ length: 12 }, (_, i) => ({
        ...BOOK_MOCK,
        id: String(i + 1),
        title: `Book ${i + 1}`,
      }));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ books }),
      });
    }
  };

  // Match direct LibriVox API calls
  await page.route('**/librivox.org/api/feed/audiobooks**', handler);
  // Match CORS-proxied calls (the app uses api.codetabs.com/v1/proxy/)
  await page.route('**/api.codetabs.com/v1/proxy/**', handler);
}

/**
 * Dismiss the onboarding overlay if it appears.
 * The app shows a welcome dialog on first visit (no localStorage key).
 */
export async function dismissOnboarding(page: Page) {
  const onboardingBtn = page.locator('.onboarding-btn');
  if (await onboardingBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await onboardingBtn.click();
  }
}
