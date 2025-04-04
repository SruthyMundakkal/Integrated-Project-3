// TODO: Report is generated on the page and be exportable to CSV format
// TODO: Available to admins and super admins
// TODO: Saved in database

"use client"

import { fetchReportData } from "@/lib/actions";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportData } from "@/lib/definitions";

interface ReportProps {
  isAdmin: boolean;
  user: User;
}

export default function CategoryBarChart({ isAdmin, user }: ReportProps) {

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 5)
  const startMonth = sixMonthsAgo.toLocaleString('default', { month: 'long' });
  const endMonth = today.toLocaleString('default', { month: 'long' });
  const dateRange = `${startMonth} ${sixMonthsAgo.getFullYear()} - ${endMonth} ${today.getFullYear()}`; 

  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadReportData() {
      try {
        const data = await fetchReportData();
        setReportData(data || []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    
    loadReportData();
  }, []);

  if (loading) {
    return <div>Loading report data...</div>;
  }

  if (error) {
    return <div>Error loading report data. Please try again later.</div>;
  }

  const barColor = "#3498db";

  // const saveReport = () => {
  //   saveReportToDB(chartData);
  // }

  // function saveReportToDB(reportData) {

  // }
  
  return (
    <Card className="bg-background p-4 rounded-lg mt-6">
      <CardHeader>
        <CardTitle>Total Claim Amounts per Category</CardTitle>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={reportData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }} 
              layout="vertical"
              >
              <CartesianGrid strokeDasharray={"3 3"} horizontal={false} vertical={true} />
              <XAxis type="number" tickFormatter={(value) => `$${value}`} />
              <YAxis 
                type="category" 
                dataKey="category_name" 
                width={120}
                tick={{ fontSize: 12 }}
                />
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend />
              <Bar 
                dataKey="total_amount" 
                fill={barColor} 
                name="Total Amount" 
                radius={[0, 4, 4, 0]}
                >
                <LabelList 
                  dataKey="total_amount" 
                  position="right" 
                  formatter={(value: number) => `$${value}`}
                  />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm">
        <div className="leading-none text-muted-foreground">
          Showing category totals from the last 6 months
        </div>
        {/* <Button onClick={saveReport}>Export Data as CSV</Button> */}
      </CardFooter>
    </Card>
  );
}
