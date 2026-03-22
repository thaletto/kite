import { useComponent } from "@copilotkit/react-core/v2";
import z from "zod";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "#/lib/utils";

export function useButton() {
  const buttonParams = z.object({
    text: z.string(),
    className: z.string(),
    variant: z
      .enum(["default", "destructive", "outline", "ghost", "link", "secondary"])
      .optional(),
    size: z
      .enum([
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ])
      .optional(),
  });
  return useComponent({
    name: "Button",
    description: "shadcn Button",
    parameters: buttonParams,
    render: (props) => (
      <Button
        className={props.className}
        variant={props.variant}
        size={props.size}
      >
        {props.text}
      </Button>
    ),
  });
}

export function useCard() {
  const cardParams = z.object({
    title: z.string(),
    description: z.string(),
    content: z.string(),
    footer: z.string(),
    className: z.string(),
  });
  return useComponent({
    name: "Card",
    description: "shadcn Card",
    parameters: cardParams,
    render: (props) => (
      <Card className={props.className}>
        <CardHeader>
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{props.content}</p>
        </CardContent>
        <CardFooter>
          <p>{props.footer}</p>
        </CardFooter>
      </Card>
    ),
  });
}

export function useInput() {
  const inputParams = z.object({
    placeholder: z.string(),
    className: z.string(),
  });
  return useComponent({
    name: "Input",
    description: "shadcn Input",
    parameters: inputParams,
    render: (props) => (
      <Input placeholder={props.placeholder} className={props.className} />
    ),
  });
}

export function useCheckbox() {
  const checkboxParams = z.object({
    label: z.string(),
    checked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    className: z.string().optional(),
  });
  return useComponent({
    name: "Checkbox",
    description: "shadcn Checkbox with label",
    parameters: checkboxParams,
    render: (props) => {
      const id = `checkbox-${crypto.randomUUID().slice(0, 8)}`;
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={id}
            checked={props.checked}
            disabled={props.disabled}
            className={props.className}
          />
          <label htmlFor={id} className="text-xs">
            {props.label}
          </label>
        </div>
      );
    },
  });
}

export function useSelect() {
  const selectParams = z.object({
    placeholder: z.string().optional(),
    options: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    ),
    className: z.string().optional(),
  });
  return useComponent({
    name: "Select",
    description: "shadcn Select dropdown",
    parameters: selectParams,
    render: (props) => (
      <Select>
        <SelectTrigger className={props.className}>
          <SelectValue placeholder={props.placeholder ?? "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {props.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    ),
  });
}

export function useTable() {
  const tableParams = z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    caption: z.string().optional(),
    className: z.string().optional(),
  });
  return useComponent({
    name: "Table",
    description: "shadcn Table",
    parameters: tableParams,
    render: (props) => (
      <Table className={props.className}>
        {props.caption && <TableCaption>{props.caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {props.headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.rows.map((row) => (
            <TableRow key={row.join("|")}>
              {row.map((cell) => (
                <TableCell key={cell}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ),
  });
}

export function useTabs() {
  const tabsParams = z.object({
    tabs: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        content: z.string(),
      }),
    ),
    defaultValue: z.string().optional(),
    className: z.string().optional(),
  });
  return useComponent({
    name: "Tabs",
    description: "shadcn Tabs",
    parameters: tabsParams,
    render: (props) => (
      <Tabs
        defaultValue={props.defaultValue ?? props.tabs[0]?.value}
        className={props.className}
      >
        <TabsList>
          {props.tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {props.tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    ),
  });
}

export function useSwitch() {
  const switchParams = z.object({
    label: z.string(),
    checked: z.boolean().optional(),
    disabled: z.boolean().optional(),
    size: z.enum(["sm", "default"]).optional(),
    className: z.string().optional(),
  });
  return useComponent({
    name: "Switch",
    description: "shadcn Switch toggle",
    parameters: switchParams,
    render: (props) => {
      const id = `switch-${crypto.randomUUID().slice(0, 8)}`;
      return (
        <div className="flex items-center gap-2">
          <Switch
            id={id}
            checked={props.checked}
            disabled={props.disabled}
            size={props.size}
            className={props.className}
          />
          <label htmlFor={id} className="text-xs">
            {props.label}
          </label>
        </div>
      );
    },
  });
}

export function useSeparator() {
  const separatorParams = z.object({
    orientation: z.enum(["horizontal", "vertical"]).optional(),
    className: z.string().optional(),
  });
  return useComponent({
    name: "Separator",
    description: "shadcn Separator",
    parameters: separatorParams,
    render: (props) => (
      <Separator orientation={props.orientation} className={props.className} />
    ),
  });
}

export function useRow() {
  const rowParams = z.object({
    alignment: z.enum(["start", "center", "end", "stretch"]).optional(),
    distribution: z
      .enum([
        "start",
        "center",
        "end",
        "spaceBetween",
        "spaceAround",
        "spaceEvenly",
      ])
      .optional(),
    className: z.string().optional(),
    children: z.array(z.any()),
  });

  return useComponent({
    name: "Row",
    description: "Layout component to wrap other shadcn components in a row",
    parameters: rowParams,
    render: (props) => (
      <div
        className={cn(
          "flex flex-row",
          {
            "items-start": props.alignment === "start",
            "items-center": props.alignment === "center",
            "items-end": props.alignment === "end",
            "items-stretch": props.alignment === "stretch",
            "justify-start": props.distribution === "start",
            "justify-center": props.distribution === "center",
            "justify-end": props.distribution === "end",
            "justify-between": props.distribution === "spaceBetween",
            "justify-around": props.distribution === "spaceAround",
            "justify-evenly": props.distribution === "spaceEvenly",
          },
          props.className,
        )}
      >
        {props.children.map((child, index) => (
          <span key={index}>{child}</span>
        ))}
      </div>
    ),
  });
}
