import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"

export default function ClaimForm() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit a Claim</CardTitle>
        <CardDescription>Fill out the form below to submit your claim request.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="claim-type">Select Claim Type</Label>
          <Select>
            <SelectTrigger id="claim-type">
              <SelectValue placeholder="Select claim type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" placeholder="0.00" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Please provide details about your claim" className="min-h-[100px]" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">Attach Document</Label>
          <div className="border border-input rounded-md">
            <label
              htmlFor="document-upload"
              className="flex flex-col items-center justify-center gap-1 py-4 cursor-pointer text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-6 w-6" />
              <span className="text-sm">Click to upload file</span>
              <input id="document-upload" type="file" className="sr-only" />
            </label>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Submit Claim</Button>
      </CardFooter>
    </Card>
  )
}

