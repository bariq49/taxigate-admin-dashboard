import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { data } from "./data";
import { DriverDetails } from "@/lib/types/driver.types";

interface ProjectsProps {
  driver?: DriverDetails;
}

export default function Projects({ driver }: ProjectsProps) {
  // For now, use default data. In the future, you could map driver.vehicles or driver.walletTransactions to projects
  return (
    <DataTable
      data={data}
      columns={columns}
    />
  );
}




