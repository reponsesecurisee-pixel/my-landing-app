'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export default function PostHogProvider() {
  useEffect(() => {
    posthog.init('phc_RdD2Quf2gsHL3NK1CdXwWMXBho4WqkFve6UbYXzBgtc', {
      api_host: 'https://eu.posthog.com',
      autocapture: false,
    });

    if (localStorage.getItem('is_owner') === 'true') {
      posthog.register({ is_owner: true });
    }
  }, []);

  return null;
}
