"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDriverDetails, approveOrRejectDriver } from "@/lib/api/drivers";
import { useParams } from "next/navigation";
import ProfileProgress from '../overview/profile-progress';
import UserInfo from '../overview/user-info';
import About from "../overview/about"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBlock from "@/components/error-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Wallet, Car, TrendingUp, Star, CheckCircle2, XCircle, AlertTriangle, CheckCircle, X, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Link from "next/link";

const DriverProfilePage = () => {
  const params = useParams();
  const driverId = params?.driverId as string;
  const queryClient = useQueryClient();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

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

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!driverId) throw new Error("Driver ID is required");
      return approveOrRejectDriver({
        driverId,
        status: "Approved",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-details", driverId] });
      toast.success("Driver approved successfully!");
      setApproveDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve driver");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!driverId) throw new Error("Driver ID is required");
      return approveOrRejectDriver({
        driverId,
        status: "Rejected",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-details", driverId] });
      toast.success("Driver rejected successfully!");
      setRejectDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject driver");
    },
  });

  if (error) {
    return (
      <div className="pt-6">
        <ErrorBlock />
      </div>
    );
  }

  if (isLoading || !driver) {
    return (
      <div className="pt-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold mt-1">
                  {driver.stats?.totalEarnings || 0} {driver.currency || "EUR"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Rides</p>
                <p className="text-2xl font-bold mt-1">
                  {driver.stats?.completedRides || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Car className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold mt-1">
                  {driver.walletBalance || 0} {driver.currency || "EUR"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold mt-1">
                  {driver.stats?.averageRating ? driver.stats.averageRating.toFixed(1) : "N/A"}
                </p>
                {driver.stats?.totalRatings && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {driver.stats.totalRatings} ratings
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ProfileProgress driver={driver} />
          <UserInfo driver={driver} />
        </div>
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <About driver={driver} />
          
          {/* Pending Approval Card */}
          {driver.status === "Pending" && (
            <Card className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-default-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Driver Approval Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                    Important: Review All Documents
                  </AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300 mt-2">
                    Please carefully review all driver documents before approving or rejecting this driver.
                    Make sure all required documents are uploaded and verified.
                    <Link 
                      href={`/user-profile/${driver.id}/documents`}
                      className="ml-1 underline font-semibold hover:text-yellow-900 dark:hover:text-yellow-100"
                    >
                      View Documents →
                    </Link>
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => setApproveDialogOpen(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Driver
                  </Button>
                  <Button
                    onClick={() => setRejectDialogOpen(true)}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Driver
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transactions Summary */}
          {driver.walletTransactions && driver.walletTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-default-800">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {driver.walletTransactions.slice(0, 3).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            transaction.type === "credit"
                              ? "bg-green-500/10"
                              : "bg-red-500/10"
                          }`}
                        >
                          {transaction.type === "credit" ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {transaction.type === "credit" ? "Credit" : "Debit"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            transaction.type === "credit"
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {transaction.amount} {driver.currency || "EUR"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balance: {transaction.balanceAfter} {driver.currency || "EUR"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {driver.walletTransactions.length > 3 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      +{driver.walletTransactions.length - 3} more transactions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this driver? Please confirm that you have:
              <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                <li>Reviewed all required documents</li>
                <li>Verified document authenticity</li>
                <li>Checked all information is correct</li>
              </ul>
              <p className="mt-3 font-semibold">
                This action will approve the driver and allow them to use the platform.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                "Yes, Approve Driver"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this driver? Please confirm that you have:
              <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                <li>Reviewed all documents</li>
                <li>Identified issues or missing information</li>
                <li>Verified the reason for rejection</li>
              </ul>
              <p className="mt-3 font-semibold text-destructive">
                This action will reject the driver and prevent them from using the platform.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Yes, Reject Driver"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DriverProfilePage;

