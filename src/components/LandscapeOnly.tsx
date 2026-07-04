/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function LandscapeOnly({ children }: { children: React.ReactNode }) {
  // Directly render children since we are now fully portrait-optimized!
  return <>{children}</>;
}

