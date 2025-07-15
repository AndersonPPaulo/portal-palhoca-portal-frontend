import Portals from "../../cards/portals/portals";
import TableWhatsapp from "@/components/tables/whatsapp-group/page";

export interface TabConfig {
  value: string;
  label: string;
  name: string;
  title: string;
  description: string;
  component: React.ReactElement;
  path: string;
}

export const tabPortalsConfigurations: TabConfig[] = [
  {
    value: "portals",
    label: "Portais",
    name: "Portal",
    title: "Portais",
    description: "Gerencie, edite e monitore os Portais cadastrados do seu site.",
    component: <Portals />,
    path: "/portais/criar",
  },
  {
    value: "whatsapp_links",
    label: "Grupos de WhatsApp",
    name: "Grupos de WhatsApp",
    title: "Grupos de WhatsApp",
    description: "Gerencie e monitore os links de WhatsApp para contato direto.",
    component: <TableWhatsapp />,
    path: "/portais/whatsapp/criar",
  },
];