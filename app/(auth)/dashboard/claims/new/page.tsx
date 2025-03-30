import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"

export default function ClaimForm() {
    return (
      <Card className="w-full max-w-2xl mx-auto p-6">
        <CardHeader>
          <CardTitle className="text-xl">Submit a Claim</CardTitle>
          <CardDescription>Fill out the form below to submit your claim request.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Claim Type Row */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="claim-type" className="w-1/3">Claim Type</Label>
            <Select className="w-2/3">
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
  
          {/* Amount Row */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="amount" className="w-1/3">Amount</Label>
            <Input id="amount" type="number" placeholder="0.00" className="w-2/3" />
          </div>
  
          {/* Description Row */}
          <div className="flex items-start space-x-4">
            <Label htmlFor="description" className="w-1/3">Description</Label>
            <Textarea id="description" placeholder="Enter details" className="w-2/3 min-h-[120px]" />
          </div>
  
          {/* Attach Document Row */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="document-upload" className="w-1/3">Attach Document</Label>
            <div className="w-2/3 border border-input rounded-md p-2">
              <label
                htmlFor="document-upload"
                className="flex flex-col items-center justify-center gap-1 py-4 cursor-pointer text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-2 w-6" />
                <span className="text-sm">Click to upload file</span>
                <input id="document-upload" type="file" className="sr-only" />
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full text-lg py-3">Submit Claim</Button>
        </CardFooter>
      </Card>
    )
  }
  