'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { initRecaptcha, sendPhoneOTP } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getDocuments, COLLECTIONS, whereClause, limitClause } from '@/lib/firebase/firestore';
import type { ConfirmationResult } from 'firebase/auth';

interface PhoneLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhoneLoginDialog({ open, onOpenChange }: PhoneLoginDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const verifierInitialized = useRef(false);

  const cleanedPhone = useMemo(() => phone.replace(/\D/g, ''), [phone]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep('phone');
      setPhone('');
      setOtp('');
      setConfirmationResult(null);
      verifierInitialized.current = false;
    }
  }, [open]);

  const handleSendOtp = async () => {
    if (!cleanedPhone || cleanedPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    const finalPhone = '+91' + cleanedPhone;

    try {
      setLoading(true);
      if (!verifierInitialized.current) {
        initRecaptcha('phone-recaptcha-container');
        verifierInitialized.current = true;
      }
      const result = await sendPhoneOTP(finalPhone);
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent successfully!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to send OTP';
      toast.error(msg);
      verifierInitialized.current = false; // Reset recaptcha on error
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    try {
      setLoading(true);
      const result = await confirmationResult!.confirm(otp);
      const firebaseUser = result.user;

      // Normalize for matching: grab only the last 10 digits
      const getTenDigits = (s: string) => s.replace(/\D/g, '').slice(-10);
      const lookupPhoneDigits = getTenDigits(firebaseUser.phoneNumber || cleanedPhone);

      const users = await getDocuments<{ role: string; fullName: string; email: string; phone: string }>(
        COLLECTIONS.USERS,
        [whereClause('role', 'in', ['teacher', 'mentor', 'both', 'principal']), limitClause(500)]
      );

      const matchedUser = users.find(u => getTenDigits(u.phone || '') === lookupPhoneDigits);

      if (!matchedUser) {
        toast.error('No account found with this phone number. Please register first.');
        await auth.signOut();
        return;
      }

      const idToken = await firebaseUser.getIdToken();

      const sessionRes = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        toast.error('Failed to create session');
        return;
      }

      const { role } = await sessionRes.json();

      toast.success(`Welcome back, ${matchedUser.fullName || 'User'}!`);
      onOpenChange(false);
      router.push(`/${role}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Invalid OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'otp' && (
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Smartphone className="h-4 w-4 text-primary" />
            Login with Phone
          </DialogTitle>
          <DialogDescription>
            {step === 'phone'
              ? 'Enter your registered phone number to receive an OTP'
              : `Enter the OTP sent to ${cleanedPhone}`}
          </DialogDescription>
        </DialogHeader>

        <div id="phone-recaptcha-container" ref={recaptchaRef} />

        {step === 'phone' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Phone Number</Label>
              <div className="flex gap-2">
                <div className="flex items-center justify-center rounded-xl border border-input bg-muted/50 px-4 text-sm font-medium text-muted-foreground">
                  +91
                </div>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="rounded-xl bg-background/50 h-11 text-base flex-1"
                  disabled={loading}
                  maxLength={10}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleSendOtp}
                disabled={loading || cleanedPhone.length < 10}
                className="rounded-xl gap-2 gradient-primary border-0 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send OTP
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Smartphone className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Enter OTP</Label>
              <Input
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                className="rounded-xl bg-background/50 h-12 text-center text-lg tracking-[8px]"
                maxLength={6}
                disabled={loading}
              />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Resend OTP
              </button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 4}
                className="rounded-xl gap-2 gradient-primary border-0 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Verify
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
