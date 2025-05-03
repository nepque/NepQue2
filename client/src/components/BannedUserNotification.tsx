import React from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface BannedUserNotificationProps {
  onClose: () => void;
}

const BannedUserNotification = ({ onClose }: BannedUserNotificationProps) => {
  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <AlertDialogTitle className="text-xl text-center">Account Suspended</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-center text-base">
          Your account has been suspended due to a violation of our terms of service. 
          If you believe this is an error, please contact our support team for assistance.
        </AlertDialogDescription>
        <AlertDialogFooter className="flex justify-center">
          <AlertDialogAction 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700"
          >
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BannedUserNotification;