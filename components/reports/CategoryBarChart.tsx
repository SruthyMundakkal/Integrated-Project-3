"use client"

import { fetchEmployees, fetchReportData } from "@/lib/actions";
import { Profile, ReportData, ReportProps, StorageFileObject } from "@/lib/definitions";
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
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";

/**
 * Generates a CSV string from report data
 * 
 * @param {ReportData[]} data - The report data to convert to CSV
 * @param {string} dateRange - The date range string to include in the CSV header
 * @param {string} [employeeName] - Optional employee name for filtered reports
 * @returns {string} A formatted CSV string containing the report data
 */
function generateCsv(data: ReportData[], dateRange: string, employeeName?: string): string {
    if (!data || data.length === 0) {
        return '';
    }
    const dateRangeRow = `"Report Date Range:","${dateRange.replace(/"/g, '""')}"`;
    const employeeRow = `"Employee Filter:","${employeeName ? employeeName.replace(/"/g, '""') : 'All Employees'}"`;
    const headers = ['Category Name', 'Total Amount'];
    const headerRow = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
    const dataRows = data.map(item => [
        `"${item.category_name.replace(/"/g, '""')}"`,
        item.total_amount.toFixed(2)
    ].join(','));
    return [dateRangeRow, employeeRow, headerRow, ...dataRows].join('\n');
}

/**
 * Downloads a file to the user's device
 * 
 * @param {string | Blob} content - The content to download as a file
 * @param {string} filename - The name to give to the downloaded file
 * @param {string} [type='text/csv;charset=utf-8;'] - The MIME type of the file
 */
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
const ALL_EMPLOYEES_VALUE = "all";

/**
 * CategoryBarChart Component
 * 
 *  A data visualization component that displays claim totals per category as a bar chart.
 * Allows filtering by employee, downloading reports as CSV, and managing saved reports.
 * Administrators can save reports to storage for future reference.
 * 
 * @param {ReportProps} props - Component props
 * @param {boolean} props.isAdmin - Flag indicating whether the user has admin privileges
 * @param {User} props.user - The currently authenticated user object
 * 
 * @returns A data visualization component with interactive controls for report management
 */
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

  const [employees, setEmployees] = useState<Profile[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(ALL_EMPLOYEES_VALUE);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [fetchEmployeesError, setFetchEmployeesError] = useState(false);


  const supabase = createClient();

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(today.getMonth() - 5)
  const startMonth = sixMonthsAgo.toLocaleString('default', { month: 'long' });
  const endMonth = today.toLocaleString('default', { month: 'long' });
  const dateRange = `${startMonth} ${sixMonthsAgo.getFullYear()} - ${endMonth} ${today.getFullYear()}`;

  /**
   * Loads available reports from storage
   */
  async function loadAvailableReports() {
      setIsLoadingList(true);
      setFetchListError(null);
      setSelectedReportName(null);
      try {
        const { data: files, error } = await supabase.storage
          .from('reports')
          .list(REPORTS_STORAGE_PATH, {
            limit: 100, offset: 0, sortBy: { column: 'updated_at', order: 'desc' },
          });
        if (error) throw error;
        const validFiles = files?.filter(f => f.name !== '.emptyFolderPlaceholder') || [];
        setAvailableReports(validFiles);
        if (validFiles.length > 0) setSelectedReportName(validFiles[0].name);
      } catch (err: any) {
        console.error("Error fetching available reports:", err);
        setFetchListError(`Failed to load report list: ${err.message}`);
      } finally {
        setIsLoadingList(false);
      }
  }

  /**
   * Loads report data filtered by employee ID
   * 
   * @param {string | null} employeeFilterId - Optional employee ID to filter the report data
   */
   async function loadReportData(employeeFilterId: string | null) {
      setLoadingLiveData(true);
      setFetchLiveError(false);
      try {
        const data = await fetchReportData(employeeFilterId);
        setReportData(data || []);
      } catch (err) {
        console.error("Error fetching live report data:", err);
        setFetchLiveError(true);
      } finally {
        setLoadingLiveData(false);
      }
  }

  /**
   * Loads the list of employees from the database
   */
  async function loadEmployees() {
      setLoadingEmployees(true);
      setFetchEmployeesError(false);
      try {
          const data = await fetchEmployees();
          setEmployees(data || []);
      } catch(err) {
          console.error("Error fetching employees:", err);
          setFetchEmployeesError(true);
      } finally {
          setLoadingEmployees(false);
      }
  }

  useEffect(() => {
    loadEmployees();
    loadAvailableReports();
  }, []);

  useEffect(() => {
      const filterId = selectedEmployeeId === ALL_EMPLOYEES_VALUE ? null : selectedEmployeeId;
      loadReportData(filterId);
  }, [selectedEmployeeId]);

  /**
   * Handles uploading the current report data to storage
   */
  const handleUploadToStorage = async () => {
    setUploadMessage(null);
    setUploadError(null);
    setIsUploading(true);

    const currentEmployee = employees.find(e => e.id === selectedEmployeeId);
    const employeeName = currentEmployee ? `${currentEmployee.first_name} ${currentEmployee.last_name ?? ''}`.trim() : undefined;
    const csvString = generateCsv(reportData, dateRange, employeeName);

    if (!csvString) {
      alert('No live data available to upload.');
      setIsUploading(false); return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filenameSuffix = selectedEmployeeId === ALL_EMPLOYEES_VALUE ? '' : `-${selectedEmployeeId.substring(0, 8)}`;
    const filename = `claims-report-${timestamp}${filenameSuffix}.csv`;
    const filePath = `${REPORTS_STORAGE_PATH}${filename}`;
    const file = new File([csvString], filename, { type: 'text/csv' });

    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
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

  /**
   * Handles downloading the current live data as a CSV file
   */
  const handleDownloadLiveDataCsv = () => {
    const currentEmployee = employees.find(e => e.id === selectedEmployeeId);
    const employeeName = currentEmployee ? `${currentEmployee.first_name} ${currentEmployee.last_name ?? ''}`.trim() : undefined;
    const csvString = generateCsv(reportData, dateRange, employeeName);

    if (csvString) {
      const timestamp = new Date().toISOString().split('T')[0];
      const filenameSuffix = selectedEmployeeId === ALL_EMPLOYEES_VALUE ? '' : `-${selectedEmployeeId.substring(0, 8)}`;
      downloadFile(csvString, `live-claims-report-${timestamp}${filenameSuffix}.csv`);
    } else {
      alert('No live data available to download.');
    }
  };

  /**
   * Handles downloading a selected report from storage
   */
  const handleDownloadSelectedReport = async () => {
    if (!selectedReportName) {
      alert("Please select a report to download."); return;
    }
    setIsDownloadingSelected(true);
    setDownloadSelectedError(null);
    const fullPath = `${REPORTS_STORAGE_PATH}${selectedReportName}`;
    try {
       const { data: blob, error } = await supabase.storage.from('reports').download(fullPath);
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

  const selectedEmployeeName = selectedEmployeeId === ALL_EMPLOYEES_VALUE
    ? "All Employees"
    : employees.find(e => e.id === selectedEmployeeId)?.first_name + ' ' + (employees.find(e => e.id === selectedEmployeeId)?.last_name ?? '');
  const cardTitle = `Claim Totals per Category (Last 6 Months)`;
  const cardDescription = `Filtering by: ${selectedEmployeeName}. Date Range: ${dateRange}`;

  const showChart = !loadingLiveData && !fetchLiveError && reportData.length > 0;
  const showNoLiveDataMessage = !loadingLiveData && !fetchLiveError && reportData.length === 0;
  const showLiveError = !loadingLiveData && fetchLiveError;

  return (
    <Card className="bg-background p-4 rounded-lg mt-6 w-full">
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <div className="pt-2">
            <Label htmlFor="employee-filter-select" className="text-sm font-medium">Filter by Employee:</Label>
            {loadingEmployees ? <p className="text-sm text-muted-foreground">Loading employees...</p> :
             fetchEmployeesError ? <p className="text-sm text-red-600">Error loading employees.</p> : (
                <Select
                    value={selectedEmployeeId}
                    onValueChange={(value) => setSelectedEmployeeId(value)}
                    disabled={loadingEmployees || employees.length === 0}
                >
                    <SelectTrigger id="employee-filter-select" className="w-full sm:w-[280px] mt-1">
                    <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value={ALL_EMPLOYEES_VALUE}>All Employees</SelectItem>
                    {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name ?? ''} ({employee.email})
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            )}
        </div>
        <CardDescription className="pt-2">{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingLiveData && <p className="text-center">Loading filtered report data...</p>}
        {showLiveError && <p className="text-center text-red-600">Error loading report data.</p>}
        {showNoLiveDataMessage && <p className="text-center text-muted-foreground">No claim data found for the selected filter in the last 6 months.</p>}
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
                  <Bar dataKey="total_amount" fill="#3498db" name="Total Amount" radius={[0, 4, 4, 0]}>
                      <LabelList
                          dataKey="total_amount" position="right"
                          formatter={(value: number) => `$${Number(value).toFixed(2)}`}
                          style={{ fill: 'black', fontSize: 12 }} />
                  </Bar>
              </BarChart>
            </ResponsiveContainer>
           </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center text-sm gap-4 pt-4">
         <div className="w-full sm:w-auto text-center sm:text-left flex-grow min-h-[20px]">
            {uploadMessage && <p className="text-green-600">{uploadMessage}</p>}
            {uploadError && <p className="text-red-600">{uploadError}</p>}
         </div>
        <div className="flex flex-wrap gap-2 flex-shrink-0 justify-center sm:justify-end">
          <Button
            onClick={handleDownloadLiveDataCsv}
            disabled={reportData.length === 0 || loadingLiveData}
            variant="default" size="sm"
            title="Download the current filtered live data shown in the chart">
            Download Live CSV
          </Button>
          <Button
            onClick={handleUploadToStorage}
            disabled={reportData.length === 0 || isUploading || loadingLiveData}
            variant="default" size="sm"
            title="Save the current filtered live data to storage">
            {isUploading ? 'Saving...' : 'Save Live Report'}
          </Button>
        </div>
      </CardFooter>

      <Separator className="my-6" />

      <div className="px-4 pb-4">
        <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Historical Reports</h3>
        {isLoadingList && <p className="text-center sm:text-left">Loading report list...</p>}
        {fetchListError && <p className="text-red-600 text-center sm:text-left">{fetchListError}</p>}
        {!isLoadingList && !fetchListError && (
          availableReports.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <div className="flex-grow w-full sm:w-auto">
                 <Label htmlFor="report-select" className="mb-1 block text-sm font-medium">Select Report:</Label>
                 <Select
                    value={selectedReportName ?? ''}
                    onValueChange={(value) => setSelectedReportName(value)}
                    disabled={availableReports.length === 0}>
                    <SelectTrigger id="report-select" className="w-full">
                      <SelectValue placeholder="Select a saved report" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReports.map((report) => (
                        <SelectItem key={report.id ?? report.name} value={report.name}>
                          {report.name} ({((report.metadata?.size ?? 0) / 1024).toFixed(1)} KB)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div className="w-full sm:w-auto flex-shrink-0 pt-1 sm:pt-5">
                <Button
                    onClick={handleDownloadSelectedReport}
                    disabled={!selectedReportName || isDownloadingSelected}
                    variant="default" size="sm" className="w-full">
                    {isDownloadingSelected ? 'Downloading...' : 'Download Selected'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center sm:text-left">No historical reports found in storage.</p>
          )
        )}
        {downloadSelectedError && <p className="text-red-600 text-xs mt-2 text-center sm:text-left">{downloadSelectedError}</p>}
      </div>
    </Card>
  );
}