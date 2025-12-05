"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

const DocumentsPage = () => {
  return (
    <div className="pt-6">
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No driver selected
            </p>
            <p className="text-sm text-muted-foreground">
              Please select a driver to view their documents.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;