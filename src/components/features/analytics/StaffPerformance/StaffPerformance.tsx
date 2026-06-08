"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { StaffPerformanceProps } from "./types";

export function StaffPerformance({ data }: StaffPerformanceProps) {
  return (
    <div className="card">
      <h3 className="text-ink font-semibold mb-4">Staff Performance</h3>
      {data.length === 0 ? (
        <p className="text-ink-muted text-sm">No data for this period</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cashier</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Transactions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.cashierId}>
                <TableCell className="text-ink">{row.name}</TableCell>
                <TableCell className="text-ink">
                  {formatCurrency(row.revenue)}
                </TableCell>
                <TableCell className="text-ink">{row.transactions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
