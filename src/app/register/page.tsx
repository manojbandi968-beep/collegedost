'use client';

// ============================================
// CollegeDost — Teacher/Mentor Registration Page
// ============================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  UserPlus,
  ArrowLeft,
  Sun,
  Moon,
  CheckCircle2,
  Mail,
  Phone,
  User,
  BookOpen,
  GraduationCap,
  Briefcase,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, type RegistrationInput } from '@/lib/validations';
import { DEFAULT_SUBJECTS } from '@/lib/constants';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState<'form' | 'pending'>('form');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      role: 'teacher',
    },
  });

  const selectedStream = useWatch({ control, name: 'stream' });

  const filteredSubjects = DEFAULT_SUBJECTS.filter(
    (s) => !selectedStream || s.streams.includes(selectedStream)
  );


  const onSubmit = async (data: RegistrationInput) => {
    try {
      setLoading(true);

      // Create user record with pending status
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setStep('pending');
        toast.success('Registration submitted!');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'pending') {
    return (
      <div className="auth-bg pattern-dots flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="w-full max-w-md"
        >
          <Card className="glass-card border-0 shadow-2xl">
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10"
              >
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </motion.div>
              <h2 className="text-2xl font-bold">Registration Submitted!</h2>
              <p className="text-center text-muted-foreground">
                Your account is pending approval by the Principal. You will be notified once
                approved.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="mt-4 gradient-primary border-0 text-white"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-bg pattern-dots relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute right-4 top-4 z-50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="glass h-10 w-10 rounded-xl"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </motion.div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute left-4 top-4 z-50"
      >
        <Button variant="ghost" onClick={() => router.push('/')} className="glass gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </motion.div>

      {/* Registration Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-lg"
      >
        <Card className="glass-card border-0 shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25"
              whileHover={{ rotate: [0, -5, 5, 0] }}
            >
              <UserPlus className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>Register as a Teacher or Mentor</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="Dr. Ramesh Kumar"
                  {...register('fullName')}
                  className="h-11 rounded-xl bg-background/50"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@email.com"
                  {...register('email')}
                  className="h-11 rounded-xl bg-background/50"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  {...register('password')}
                  className="h-11 rounded-xl bg-background/50"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  {...register('phone')}
                  className="h-11 rounded-xl bg-background/50"
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  Role
                </Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="h-11 rounded-xl bg-background/50">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="mentor">Mentor</SelectItem>
                        <SelectItem value="both">Both (Teacher & Mentor)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-xs text-destructive">{errors.role.message}</p>
                )}
              </div>

              {/* Stream */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                  Stream
                </Label>
                <Controller
                  name="stream"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="h-11 rounded-xl bg-background/50">
                        <SelectValue placeholder="Select stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MPC">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            MPC — IIT-JEE
                          </span>
                        </SelectItem>
                        <SelectItem value="BiPC">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            BiPC — NEET
                          </span>
                        </SelectItem>
                        <SelectItem value="CEC">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            CEC — Commerce
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.stream && (
                  <p className="text-xs text-destructive">{errors.stream.message}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Subject
                </Label>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="h-11 rounded-xl bg-background/50">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubjects.map((subject) => (
                          <SelectItem key={subject.code} value={subject.code}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subject && (
                  <p className="text-xs text-destructive">{errors.subject.message}</p>
                )}
              </div>


              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl gradient-primary border-0 text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting...
                  </div>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
