'use client';

import { useEffect } from 'react';

export default function PostHogProvider() {
  useEffect(() => {
    import('posthog-js').then((posthog) => {
      posthog.default.init(
        'phc_RdD2Quf2gsHL3NK1CdXwWMXBho4WqkFve6UbYXzBgtc',
        {
          api_host: 'https://eu.posthog.com',
          autocapture: false,
        }
      );

      if (localStorage.getItem('is_owner') === 'true') {
        posthog.default.register({ is_owner: true });
      }
    });
  }, []);

  return null;
}
