import { notFound } from 'next/navigation';
import { getEmployee } from '@/lib/db';
import { EmployeeDetail } from '@/components/employee/EmployeeDetail';
import { Topbar } from '@/components/layout/Topbar';

export default async function EmployeePage({ params }: { params: { id: string } }) {
  const emp = getEmployee(params.id);
  if (!emp) notFound();

  return (
    <div className="flex flex-col h-full">
      <Topbar title={emp.name} subtitle={emp.title || undefined} />
      <div className="flex-1 overflow-y-auto p-5">
        <EmployeeDetail emp={emp} />
      </div>
    </div>
  );
}
