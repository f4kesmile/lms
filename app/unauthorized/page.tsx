import { Suspense } from "react";

import UnauthorizedClient from "./UnauthorizedClient";

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={null}>
      <UnauthorizedClient />
    </Suspense>
  );
}
