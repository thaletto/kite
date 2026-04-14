"use client";

import { type ReactNode } from "react";
import {
  Renderer,
  type ComponentRenderer,
  type Spec,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
} from "@json-render/react";

import { registry, Fallback } from "./registry";

// =============================================================================
// ExplorerRenderer
// =============================================================================

interface ExplorerRendererProps {
  spec: Spec | null;
  loading?: boolean;
}

const fallback: ComponentRenderer = ({ element }) => (
  <Fallback type={element.type} />
);

export function ExplorerRenderer({
  spec,
  loading,
}: ExplorerRendererProps): ReactNode {
  if (!spec) return null;

  return (
    <StateProvider initialState={spec.state ?? {}}>
      <VisibilityProvider>
        <ActionProvider>
          <Renderer
            spec={spec}
            registry={registry}
            fallback={fallback}
            loading={loading}
          />
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}
