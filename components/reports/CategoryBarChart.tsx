"use client"

import { fetchReportData } from "@/lib/actions";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportData } from "@/lib/definitions";
import { createClient } from "@/utils/supabase/client";

interface ReportProps {
  isAdmin: boolean;
  user: User;
}

function generateCsv(data: ReportData[]): string {
  if (!data || data.length === 0) {
    return '';
  }
  const headers = ['Category Name', 'Total Amount'];
  const rows = data.map(item => [
    `"${item.category_name.replace(/"/g, '""')}"`,
    item.total_amount.toFixed(2)
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

function downloadCsv(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
      alert("CSV download not supported in this browser.");
  }
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
  const [fetchError, setFetchError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadReportData() {
      setLoading(true);
      setFetchError(false);
      try {
        const data = await fetchReportData();
        setReportData(data || []);
      } catch (err) {
        console.error("Error fetching report data:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }

    loadReportData();
  }, []);

  const handleDownloadCsv = () => {
    const csvString = generateCsv(reportData);
    if (csvString) {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCsv(csvString, `claims-report-${timestamp}.csv`);
    } else {
      alert('No data available to download.');
    }
  };

  const handleUploadToStorage = async () => {
    setUploadMessage(null);
    setUploadError(null);
    setIsUploading(true);

    const csvString = generateCsv(reportData);
    if (!csvString) {
      alert('No data available to upload.');
      setIsUploading(false);
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `claims-report-${timestamp}.csv`;
    const filePath = `private/claims-reports/${filename}`;
    const file = new File([csvString], filename, { type: 'text/csv' });

    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('Upload successful:', data);
      setUploadMessage(`Report successfully uploaded to bucket 'reports' at: ${filePath}`);

    } catch (error: any) {
      console.error('Error uploading to storage:', error);
      setUploadError(error.message || 'An unknown error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading report data...</div>;
  }

  if (fetchError) {
    return <div className="p-4 text-center text-red-600">Error loading report data. Please try again later.</div>;
  }

  const barColor = "#3498db";

  return (
    <Card className="bg-background p-4 rounded-lg mt-6 w-full">
      <CardHeader>
        <CardTitle>Total Claim Amounts per Category</CardTitle>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent>
        {reportData.length > 0 ? (
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData}
                margin={{ top: 20, right: 50, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray={"3 3"} horizontal={false} vertical={true} />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis
                  type="category"
                  dataKey="category_name"
                  width={120}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <Tooltip formatter={(value: number) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                <Bar
                  dataKey="total_amount"
                  fill={barColor}
                  name="Total Amount"
                  radius={[0, 4, 4, 0]}
                >
                  <LabelList
                    dataKey="total_amount"
                    position="right"
                    formatter={(value: number) => `$${Number(value).toFixed(2)}`}
                    style={{ fill: 'black', fontSize: 12 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
            <p className="text-center text-muted-foreground">No claim data found for the last 6 months.</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center text-sm gap-4 pt-4">
         <div className="w-full sm:w-auto text-center sm:text-left">
            {uploadMessage && <p className="text-green-600">{uploadMessage}</p>}
            {uploadError && <p className="text-red-600">{uploadError}</p>}
         </div>

        <div className="flex gap-2">
          <Button
            onClick={handleDownloadCsv}
            disabled={reportData.length === 0 || isUploading}
            variant="default"
            size="sm"
          >
            Download CSV
          </Button>
          <Button
            onClick={handleUploadToStorage}
            disabled={reportData.length === 0 || isUploading || loading}
            variant="default"
            size="sm"
          >
            {isUploading ? 'Uploading...' : 'Save Report to Database'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}