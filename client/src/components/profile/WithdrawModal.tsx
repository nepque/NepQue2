import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type User } from "@shared/schema";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export function WithdrawModal({ open, onClose, user }: WithdrawModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<string>("");
  const [detailsLabel, setDetailsLabel] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset form when modal is opened
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAmount(1000);
      setPaymentMethod("");
      setPaymentDetails("");
      setDetailsLabel("");
      onClose();
    }
  };

  // Update details label based on payment method
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    setPaymentDetails("");

    switch (value) {
      case "esewa":
        setDetailsLabel("eSewa ID");
        break;
      case "khalti":
        setDetailsLabel("Khalti ID");
        break;
      case "bank":
        setDetailsLabel("Bank Account Details");
        break;
      default:
        setDetailsLabel("");
    }
  };

  // Submit withdrawal request
  const withdrawMutation = useMutation({
    mutationFn: (data: {
      userId: number;
      amount: number;
      paymentMethod: string;
      paymentDetails: string;
    }) => {
      return apiRequest("/api/withdrawals", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh user data and withdrawal history
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${user.id}/withdrawals`] 
      });
      
      // Show success message
      toast({
        title: "Withdrawal request submitted",
        description: "Your withdrawal request has been submitted for processing.",
        variant: "default",
      });
      
      // Close modal
      handleOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Error submitting withdrawal request:", error);
      
      // Show error message
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    // Validate input
    if (!amount || amount < 1000) {
      toast({
        title: "Invalid amount",
        description: "Minimum withdrawal amount is 1000 points.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentDetails) {
      toast({
        title: "Payment details required",
        description: `Please provide your ${detailsLabel.toLowerCase()}.`,
        variant: "destructive",
      });
      return;
    }

    // Check if user has enough points
    if ((user.points || 0) < amount) {
      toast({
        title: "Insufficient points",
        description: `You have ${user.points} points, but requested ${amount} points.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Submit withdrawal request
    withdrawMutation.mutate({
      userId: user.id,
      amount,
      paymentMethod,
      paymentDetails,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Points</DialogTitle>
          <DialogDescription>
            Convert your earned points to cash. Minimum withdrawal is 1000 points.
            Current balance: <span className="font-bold">{user.points || 0} points</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (points)</Label>
            <Input
              id="amount"
              type="number"
              min={1000}
              max={user.points || 0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount to withdraw"
            />
            <p className="text-xs text-muted-foreground">
              Minimum: 1000 points, Maximum: {user.points} points
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Methods</SelectLabel>
                  <SelectItem value="esewa">eSewa</SelectItem>
                  <SelectItem value="khalti">Khalti</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod && (
            <div className="grid gap-2">
              <Label htmlFor="payment-details">{detailsLabel}</Label>
              <Input
                id="payment-details"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                placeholder={`Enter your ${detailsLabel.toLowerCase()}`}
              />
              {paymentMethod === "bank" && (
                <p className="text-xs text-muted-foreground">
                  Please provide your bank name, account number, and account holder name.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !paymentMethod || !paymentDetails || amount < 1000 || (user.points || 0) < amount}
          >
            {isSubmitting ? "Processing..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}