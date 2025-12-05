"use client"
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineDot,
  TimelineConnector,
  TimelineSeparator,
} from "@/components/ui/timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import banana from "@/public/images/all-img/banana.jpg";
import headphone from "@/public/images/all-img/headphone.png";
import baby from "@/public/images/all-img/baby.jpg";
import busket from "@/public/images/all-img/busket.jpg";
import mic from "@/public/images/all-img/mic.jpg";
import orange from "@/public/images/all-img/orange.jpg";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DriverDetails } from "@/lib/types/driver.types";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface RecentActivityProps {
  driver?: DriverDetails;
}

const RecentActivity = ({ driver }: RecentActivityProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      
      return format(date, "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };
  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center mb-3 border-none">
        <CardTitle className="text-lg font-medium text-default-800">Recent Activity</CardTitle>
        <Button
          size="icon"
          className="w-6 h-6 bg-default-100 dark:bg-default-50 text-default-500  hover:bg-default-100"
        >
          <Icon icon="heroicons:ellipsis-vertical" className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Timeline>
          {driver && driver.walletTransactions && driver.walletTransactions.length > 0 ? (
            driver.walletTransactions.slice(0, 5).map((transaction, index) => (
              <TimelineItem key={transaction.id} className="pb-9">
                <TimelineSeparator>
                  <TimelineDot color={transaction.type === "credit" ? "primary" : "info"} />
                  {index < driver.walletTransactions.length - 1 && <TimelineConnector />}
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
                      {transaction.bookingDetails.from_location} → {transaction.bookingDetails.to_location}
                    </div>
                  )}
                  <div className="text-xs text-default-400 mt-1">
                    Balance after: {transaction.balanceAfter} {driver.currency || "EUR"}
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))
          ) : (
            <>
          <TimelineItem className="pb-9">
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className="md:flex gap-4">
                <div className="grow">
                  <h5 className="font-medium text-sm text-default-600 ">
                    User Photo Changed
                  </h5>
                </div>
                <div className="text-default-400 text-xs md:min-w-[90px] md:max-w-[120px] md:text-right">
                  12 minutes ago
                </div>
              </div>
              <p className="text-sm text-default-500  mt-1">
                Jone Doe changed his avatar photo
              </p>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem className="pb-9">
            <TimelineSeparator>
              <TimelineDot color="primary" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className="tm-content">
                <div className="md:flex gap-4">
                  <div className="grow">
                    <h5 className="font-medium text-sm text-default-600 ">
                      Video Added
                    </h5>
                  </div>
                  <div className="text-default-400 text-xs md:min-w-[90px] md:max-w-[120px] md:text-right">
                    1 hour ago
                  </div>
                </div>
                <p className="text-sm text-default-500  mt-1 mb-4">
                  Mores Clarke added new video
                </p>
              </div>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem className="pb-9">
            <TimelineSeparator>
              <TimelineDot color="info" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className="tm-content">
                <div className="md:flex gap-4">
                  <div className="grow">
                    <h5 className="font-medium text-sm text-default-600 ">
                      Image Added
                    </h5>
                  </div>
                  <div className="text-default-400 text-xs md:min-w-[90px] md:max-w-[120px] md:text-right">
                    9 hours ago
                  </div>
                </div>
                <p className="text-sm text-default-500  mt-1 mb-4">
                  Mores Clarke added new video
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-[260px]">
                  <div className="w-20 h-12">
                    <Image
                      src={banana}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="w-20 h-12">
                    <Image
                      src={headphone}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="w-20 h-12">
                    <Image
                      src={baby}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="w-20 h-12">
                    <Image
                      src={busket}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="w-20 h-12">
                    <Image
                      src={mic}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="w-20 h-12">
                    <Image
                      src={orange}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem className="pb-9">
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color="primary" />
            </TimelineSeparator>
            <TimelineContent>
              <div className="tm-content">
                <div className="md:flex gap-4">
                  <div className="grow">
                    <h5 className="font-medium text-sm text-default-600 ">
                      Video Added
                    </h5>
                  </div>
                  <div className="text-default-400 text-xs md:min-w-[90px] md:max-w-[120px] md:text-right">
                    1 hour ago
                  </div>
                </div>
                <p className="text-sm text-default-500  mt-1 mb-4">
                  Mores Clarke added new video
                </p>
              </div>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem className="pb-9">
            <TimelineContent>
              <div className="tm-content">
                <div className="md:flex gap-4">
                  <div className="grow">
                    <h5 className="font-medium text-sm text-default-600 ">
                      Portfolio Added
                    </h5>
                  </div>
                  <div className="text-default-400 text-xs md:min-w-[90px] md:max-w-[120px] md:text-right">
                    9 hours ago
                  </div>
                </div>
                <p className="text-sm text-default-500  mt-1 mb-4">
                  Mores Clarke added new video
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-[260px]">
                  <div className="w-20 h-12">
                    <Image
                      src={banana}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="w-20 h-12">
                    <Image
                      src={headphone}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="w-20 h-12">
                    <Image
                      src={baby}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="w-20 h-12">
                    <Image
                      src={busket}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>

                  <div className="w-20 h-12">
                    <Image
                      src={mic}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="w-20 h-12">
                    <Image
                      src={orange}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </div>
                </div>
              </div>
            </TimelineContent>
          </TimelineItem>
          </>
          )}
        </Timeline>
        <div className="flex justify-center">
          {driver ? (
            <Link href={`/user-profile/${driver.id}/activity`} className="text-sm font-semibold text-primary">
              View All Transactions ({driver.transactionCount || 0})
            </Link>
          ) : (
            <Link href="/" className="text-sm font-semibold text-primary">View All Activity</Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
