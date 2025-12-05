"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import React from 'react';
import { DriverDetails } from '@/lib/types/driver.types';

interface ProfileProgressProps {
  driver?: DriverDetails;
}

const ProfileProgress = ({ driver }: ProfileProgressProps) => {
  const progressPercentage = driver?.documentsStatus
    ? Math.round((driver.documentsStatus.uploadedCount / driver.documentsStatus.totalCount) * 100)
    : 62;

  return (
  <Card>
    <CardHeader className="border-none mb-0">
      <CardTitle className="text-lg font-medium text-default-800">
        {driver ? "Documents Status" : "Complete Your Profile"}
      </CardTitle>
    </CardHeader>
    <CardContent className="px-4">
    <div className="flex flex-col items-end gap-1">
        <Label className="text-sm font-medium text-default-700">
          {progressPercentage}% Complete
          {driver && ` (${driver.documentsStatus?.uploadedCount || 0}/${driver.documentsStatus?.totalCount || 0} documents)`}
        </Label>
        <Progress value={progressPercentage}  color="primary" isStripe className="w-full"  />
      </div>
    </CardContent>
  </Card>
  );
};

export default ProfileProgress;