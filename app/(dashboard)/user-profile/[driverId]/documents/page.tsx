"use client";

import { useQuery } from "@tanstack/react-query";
import { getDriverDetails } from "@/lib/api/drivers";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBlock from "@/components/error-block";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const DriverDocumentsPage = () => {
  const params = useParams();
  const driverId = params?.driverId as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["driver-details", driverId],
    queryFn: async () => {
      if (!driverId) throw new Error("Driver ID is required");
      return getDriverDetails(driverId);
    },
    enabled: !!driverId,
    staleTime: 30000,
  });

  const driver = data?.driver;

  if (error) {
    return (
      <div className="pt-6">
        <ErrorBlock />
      </div>
    );
  }

  if (isLoading || !driver) {
    return (
      <div className="pt-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const documents = driver.documents || {};
  const documentStatus = driver.documentsStatus?.details || [];

  // Document labels mapping
  const documentLabels: Record<string, string> = {
    documentFrontImage: "Document Front",
    documentBackImage: "Document Back",
    driverLicenseFront: "Driver License Front",
    driverLicenseBack: "Driver License Back",
    driverPassFront: "Driver Pass Front",
    driverPassBack: "Driver Pass Back",
    kiwaPermit: "Kiwa Permit",
    insurancePolicy: "Insurance Policy",
    bankpass: "Bank Pass",
    kvkUittreksel: "KVK Uittreksel",
  };

  return (
    <div className="pt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Driver Documents</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge color={driver.documentsStatus?.complete ? "success" : "secondary"}>
              {driver.documentsStatus?.uploadedCount || 0} / {driver.documentsStatus?.totalCount || 0} Documents
            </Badge>
            {driver.documentsStatus?.complete && (
              <Badge color="success">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentStatus.map((docStatus) => {
              const docKey = docStatus.name as keyof typeof documents;
              const docUrl = documents[docKey] || docStatus.url;
              const label = documentLabels[docStatus.name] || docStatus.name;

              return (
                <Card key={docStatus.name} className="overflow-hidden group hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-sm font-medium flex-1">{label}</CardTitle>
                      {docStatus.uploaded ? (
                        <Badge color="success" variant="soft" className="flex items-center gap-1 whitespace-nowrap">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Uploaded</span>
                        </Badge>
                      ) : (
                        <Badge color="destructive" variant="soft" className="flex items-center gap-1 whitespace-nowrap">
                          <XCircle className="h-3 w-3" />
                          <span>Missing</span>
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {docStatus.uploaded && docUrl ? (
                      <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden group/image">
                        <img
                          src={docUrl}
                          alt={label}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200"
                        >
                          <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
                            <Eye className="h-6 w-6 text-gray-900" />
                          </div>
                        </a>
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <XCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Document not uploaded</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDocumentsPage;

