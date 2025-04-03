// TODO: Report is generated on the page and be exportable to CSV format
// TODO: Available to admins and super admins
// TODO: Saved in database

"use client"

import { Claim } from "@/lib/definitions";
import { User } from "@supabase/supabase-js";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReportProps {
  isAdmin: boolean;
  user: User;
  claims: Array<Claim>;
}

export default function CategoryBarChart({ claims = [] }: ReportProps) {

  const { chartData, dateRange } = useMemo(() => {

    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    
    const recentClaims = claims.filter(claim => {
      const claimDate = new Date(claim.submitted_on);
      return claimDate >= sixMonthsAgo && claimDate <= today;
    });
    
    const categoryTotals: Record<string, number> = {};
    
    recentClaims.forEach(claim => {
      if (claim.categories?.name && claim.amount) {
        const categoryName = claim.categories.name;
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + claim.amount;
      }
    });

    const formattedData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2))
    }));
    
    formattedData.sort((a, b) => b.amount - a.amount);
    
    const startMonth = sixMonthsAgo.toLocaleString('default', { month: 'long' });
    const endMonth = today.toLocaleString('default', { month: 'long' });
    const dateRangeText = `${startMonth} - ${endMonth} ${today.getFullYear()}`;
    
    return {
      chartData: formattedData,
      dateRange: dateRangeText
    };
  }, [claims]);
  
  const barColor = "#3498db";
  
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
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }} 
              layout="vertical"
            >
              <CartesianGrid strokeDasharray={"3 3"} horizontal={false} vertical={true} />
              <XAxis type="number" tickFormatter={(value) => `$${value}`} />
              <YAxis 
                type="category" 
                dataKey="category" 
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend />
              <Bar 
                dataKey="amount" 
                fill={barColor} 
                name="Total Amount" 
                radius={[0, 4, 4, 0]}
              >
                <LabelList 
                  dataKey="amount" 
                  position="right" 
                  formatter={(value: number) => `$${value}`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Showing category totals from the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
