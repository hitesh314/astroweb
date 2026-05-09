import "server-only";

import Zavudev from "@zavudev/sdk";

/** Server-only Zavu client — never import from client components. */
export function getZavudevClient() {
  return new Zavudev();
}
