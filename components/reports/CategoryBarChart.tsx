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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportData } from "@/lib/definitions";
import { createClient } from "@/utils/supabase/client";

interface ReportProps {
  isAdmin: boolean;
  user: User;
}

interface StorageFileObject {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: Record<string, any> | null;
}

function generateCsv(data: ReportData[], dateRange: string): string {
    if (!data || data.length === 0) {
        return '';
    }
    const dateRangeRow = `"Report Date Range:","${dateRange.replace(/"/g, '""')}"`;
    const headers = ['Category Name', 'Total Amount'];
    const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
    const dataRows = data.map(item => [
        `"${item.category_name.replace(/"/g, '""')}"`,
        item.total_amount.toFixed(2)
    ].join(','));
    return [dateRangeRow, headerRow, ...dataRows].join('\n');
}

function downloadFile(content: string | Blob, filename: string, type = 'text/csv;charset=utf-8;') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
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
    alert("File download not supported in this browser.");
  }
}

const REPORTS_STORAGE_PATH = 'private/claims-reports/';

export default function CategoryBarChart({ isAdmin, user }: ReportProps) {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loadingLiveData, setLoadingLiveData] = useState(true);
  const [fetchLiveError, setFetchLiveError] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [availableReports, setAvailableReports] = useState<StorageFileObject[]>([]);
  const [selectedReportName, setSelectedReportName] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [fetchListError, setFetchListError] = useState<string | null>(null);
  const [isDownloadingSelected, setIsDownloadingSelected] = useState(false);
  const [downloadSelectedError, setDownloadSelectedError] = useState<string | null>(null);

  const supabase = createClient();

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 5)
  const startMonth = sixMonthsAgo.toLocaleString('default', { month: 'long' });
  const endMonth = today.toLocaleString('default', { month: 'long' });
  const dateRange = `${startMonth} ${sixMonthsAgo.getFullYear()} - ${endMonth} ${today.getFullYear()}`;

  async function loadAvailableReports() {
      setIsLoadingList(true);
      setFetchListError(null);
      setSelectedReportName(null);
      try {
        const { data: files, error } = await supabase.storage
          .from('reports')
          .list(REPORTS_STORAGE_PATH, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'updated_at', order: 'desc' },
          });

        if (error) throw error;

        const validFiles = files?.filter(file => file.name !== '.emptyFolderPlaceholder') || [];
        setAvailableReports(validFiles);

        if (validFiles.length > 0) {
          setSelectedReportName(validFiles[0].name);
        }

      } catch (err: any) {
        console.error("Error fetching available reports:", err);
        setFetchListError(`Failed to load report list: ${err.message}`);
      } finally {
        setIsLoadingList(false);
      }
    }

  useEffect(() => {
    async function loadReportData() {
      setLoadingLiveData(true);
      setFetchLiveError(false);
      try {
        const data = await fetchReportData();
        setReportData(data || []);
      } catch (err) {
        console.error("Error fetching live report data:", err);
        setFetchLiveError(true);
      } finally {
        setLoadingLiveData(false);
      }
    }
    loadReportData();
  }, []);

  useEffect(() => {
    loadAvailableReports();
  }, []);

  const handleUploadToStorage = async () => {
    setUploadMessage(null);
    setUploadError(null);
    setIsUploading(true);

    const csvString = generateCsv(reportData, dateRange);
    if (!csvString) {
      alert('No live data available to upload.');
      setIsUploading(false);
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `claims-report-${timestamp}.csv`;
    const filePath = `${REPORTS_STORAGE_PATH}${filename}`;

    const file = new File([csvString], filename, { type: 'text/csv' });

    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      console.log('Upload successful:', data);
      setUploadMessage(`Report successfully uploaded: ${filename}`);
       await loadAvailableReports();

    } catch (error: any) {
      console.error('Error uploading to storage:', error);
      setUploadError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

   const handleDownloadLiveDataCsv = () => {
    const csvString = generateCsv(reportData, dateRange);
    if (csvString) {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadFile(csvString, `live-claims-report-${timestamp}.csv`);
    } else {
      alert('No live data available to download.');
    }
  };

  const handleDownloadSelectedReport = async () => {
    if (!selectedReportName) {
      alert("Please select a report to download.");
      return;
    }
    setIsDownloadingSelected(true);
    setDownloadSelectedError(null);

    const fullPath = `${REPORTS_STORAGE_PATH}${selectedReportName}`;

    try {
       const { data: blob, error } = await supabase.storage
          .from('reports')
          .download(fullPath);

       if (error) throw error;
       if (!blob) throw new Error("Downloaded file data is empty.");

       downloadFile(blob, selectedReportName, blob.type);

    } catch (error: any) {
        console.error('Error downloading selected report:', error);
        setDownloadSelectedError(`Download failed: ${error.message}`);
    } finally {
        setIsDownloadingSelected(false);
    }
  };

  const showChart = !loadingLiveData && !fetchLiveError && reportData.length > 0;
  const showNoLiveDataMessage = !loadingLiveData && !fetchLiveError && reportData.length === 0;
  const showLiveError = !loadingLiveData && fetchLiveError;

  return (
    <Card className="bg-background p-4 rounded-lg mt-6 w-full">
      <CardHeader>
        <CardTitle>Live Claim Totals per Category (Last 6 Months)</CardTitle>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingLiveData && <p className="text-center">Loading live data chart...</p>}
        {showLiveError && <p className="text-center text-red-600">Error loading live data.</p>}
        {showNoLiveDataMessage && <p className="text-center text-muted-foreground">No live claim data found for the last 6 months.</p>}
        {showChart && (
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 20, right: 50, left: 20, bottom: 5 }} layout="vertical">
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
                      fill="#3498db"
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
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center text-sm gap-4 pt-4 border-t mt-4">
         <div className="w-full sm:w-auto text-center sm:text-left flex-grow">
            {uploadMessage && <p className="text-green-600">{uploadMessage}</p>}
            {uploadError && <p className="text-red-600">{uploadError}</p>}
         </div>

        <div className="flex gap-2 flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold mb-3">Historical Reports</h3>
          {isLoadingList && <p>Loading report list...</p>}
          {fetchListError && <p className="text-red-600">{fetchListError}</p>}

          {!isLoadingList && !fetchListError && (
            availableReports.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-auto">
                  <Label htmlFor="report-select">Select Report:</Label>
                  <Select
                      value={selectedReportName ?? ''}
                      onValueChange={(value) => setSelectedReportName(value)}
                      disabled={availableReports.length === 0}
                    >
                      <SelectTrigger id="report-select" className="w-full sm:w-[250px]">
                        <SelectValue placeholder="Select a saved report" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableReports.map((report) => (
                          <SelectItem key={report.id} value={report.name}>
                            {report.name} ({(report.metadata?.size / 1024).toFixed(1)} KB)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <Button
                    onClick={handleDownloadSelectedReport}
                    disabled={!selectedReportName || isDownloadingSelected}
                    variant="default"
                    size="sm"
                    className="w-full sm:w-auto"
                >
                    {isDownloadingSelected ? 'Downloading...' : 'Download Selected Report'}
                </Button>
                {downloadSelectedError && <p className="text-red-600 text-xs mt-1">{downloadSelectedError}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground">No historical reports found in storage.</p>
            )
          )}
        </div>
          <Button
            onClick={handleDownloadLiveDataCsv}
            disabled={reportData.length === 0 || loadingLiveData}
            variant="default"
            size="sm"
            title="Download the current live data shown in the chart"
          >
            Download as CSV
          </Button>
          <Button
            onClick={handleUploadToStorage}
            disabled={reportData.length === 0 || isUploading || loadingLiveData}
            variant="default"
            size="sm"
            title="Save the current live data to storage (overwrites if same day)"
          >
            {isUploading ? 'Saving...' : 'Upload Live Report'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}