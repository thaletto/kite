import { Globe } from "lucide-react";

interface Props {
  className?: string;
}
export function LogoIpsum({ className }: Props) {
  return (
   <Globe className={className}/>
  );
}
