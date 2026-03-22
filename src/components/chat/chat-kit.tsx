import { s } from "@hashbrownai/core";
import { exposeComponent, exposeMarkdown, useUiKit } from "@hashbrownai/react";
import { Card } from "#/components/ui/card";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Badge } from "#/components/ui/badge";
import { Row, Column } from "#/components/ui/layout";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Spinner } from "#/components/ui/spinner";

function FallBack() {
  return <Spinner />;
}

export function useChatKit() {
  return useUiKit({
    components: [
      exposeMarkdown(),
      exposeComponent(Card, {
        name: "card",
        description:
          "Card to wrap generative UI content. Don't use for text-only.",
        fallback: () => <FallBack />,
        children: "any",
      }),
      exposeComponent(Row, {
        name: "row",
        description: "Horizontal row for side-by-side layouts (2 cols max).",
        fallback: () => <FallBack />,
        props: {
          gap: s.string("Gap size: '2', '4', '6'") as any,
          align: s.string("Items: 'start', 'center', 'end', 'stretch'") as any,
          justify: s.string("Justify: 'start', 'center', 'end', 'between'") as any,
        },
        children: "any",
      }),
      exposeComponent(Column, {
        name: "column",
        description: "Vertical column for stacking children.",
        fallback: () => <FallBack />,
        props: {
          gap: s.string("Gap size: '2', '4', '6'") as any,
          align: s.string("Items: 'start', 'center', 'end', 'stretch'") as any,
          justify: s.string("Justify: 'start', 'center', 'end', 'between'") as any,
        },
        children: "any",
      }),
      exposeComponent(Button, {
        name: "button",
        description: "A clickable button. Use variant to control style.",
        fallback: () => <FallBack />,
        props: {
          variant: s.enumeration("Button style", [
            "default",
            "destructive",
            "outline",
            "secondary",
            "ghost",
            "link",
          ] as const) as any,
          size: s.enumeration("Button size", [
            "default",
            "sm",
            "lg",
            "icon",
          ] as const) as any,
        },
        children: "text",
      }),
      exposeComponent(Input, {
        name: "input",
        description: "A text input field for forms.",
        fallback: () => <FallBack />,
        props: {
          placeholder: s.string("Placeholder text shown when empty") as any,
          type: s.string(
            "Input type: 'text', 'email', 'password', 'number', 'url'",
          ) as any,
        },
        children: false,
      }),
      exposeComponent(Label, {
        name: "label",
        description: "A form label.",
        fallback: () => <FallBack />,
        children: "text",
      }),
      exposeComponent(Badge, {
        name: "badge",
        description: "A small status or label badge.",
        fallback: () => <FallBack />,
        props: {
          variant: s.enumeration("Style", [
            "default",
            "secondary",
            "outline",
            "destructive",
          ] as const) as any,
        },
        children: "text",
      }),
      exposeComponent(Alert, {
        name: "alert",
        description: "An alert message box.",
        fallback: () => <FallBack />,
        props: {
          variant: s.enumeration("Style", [
            "default",
            "destructive",
          ] as const) as any,
        },
        children: "any",
      }),
      exposeComponent(AlertTitle, {
        name: "alert_title",
        description: "Title for alert.",
        fallback: () => <FallBack />,
        children: "text",
      }),
      exposeComponent(AlertDescription, {
        name: "alert_description",
        description: "Description for alert.",
        fallback: () => <FallBack />,
        children: "any",
      }),
    ],
  });
}
