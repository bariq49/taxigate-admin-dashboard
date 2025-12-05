"use client";

import { useQuery } from "@tanstack/react-query";
import { getDriverDetails } from "@/lib/api/drivers";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBlock from "@/components/error-block";
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineDot,
  TimelineConnector,
  TimelineSeparator,
} from "@/components/ui/timeline";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const DriverActivityPage = () => {
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return format(date, "dd MMM yyyy, HH:mm");
    } catch {
      return dateString;
    }
  };

  if (error) {
    return (
      <div className="pt-6">
        <ErrorBlock />
      </div>
    );
  }

  if (isLoading || !driver) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const transactions = driver.walletTransactions || [];

  return (
    <Card className="mt-6">
      <CardHeader className="flex-row flex-wrap items-center gap-4 border-none mb-0">
        <CardTitle className="flex-1 text-2xl font-medium text-default-900 whitespace-nowrap">
          Wallet Transactions
        </CardTitle>
        <InputGroup merged className="flex-none max-w-[248px]">
          <InputGroupText>
            <Icon icon="heroicons:magnifying-glass" />
          </InputGroupText>
          <Input type="text" placeholder="Search.." />
        </InputGroup>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <Timeline>
            {transactions.map((transaction, index) => (
              <TimelineItem key={transaction.id} className="pb-9">
                <TimelineSeparator>
                  <TimelineDot color={transaction.type === "credit" ? "primary" : "info"} />
                  {index < transactions.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <div className="md:flex gap-4">
                    <div className="grow">
                      <h5 className="font-medium text-sm text-default-600 flex items-center gap-2">
                        {transaction.type === "credit" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        {transaction.type === "credit" ? "Credit" : "Debit"}: {transaction.amount} {driver.currency || "EUR"}
                      </h5>
                    </div>
                    <div className="text-default-400 text-xs md:min-w-[90px] md:max-w-[120px] md:text-right">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm text-default-500 mt-1">
                    {transaction.description}
                  </p>
                  {transaction.bookingDetails && (
                    <div className="text-xs text-default-400 mt-1">
                      <strong>Route:</strong> {transaction.bookingDetails.from_location} → {transaction.bookingDetails.to_location}
                    </div>
                  )}
                  <div className="text-xs text-default-400 mt-1">
                    <strong>Balance after:</strong> {transaction.balanceAfter} {driver.currency || "EUR"}
                  </div>
                  {transaction.bookingId && (
                    <div className="text-xs text-default-400 mt-1">
                      <strong>Booking ID:</strong> {transaction.bookingId}
                    </div>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions found</p>
          </div>
        )}
        {transactions.length > 0 && (
          <div className="flex justify-center mt-9">
            <Button color="secondary">
              <Plus className="h-4 w-4 ltr:mr-1 rtl:ml-1" /> Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverActivityPage;

