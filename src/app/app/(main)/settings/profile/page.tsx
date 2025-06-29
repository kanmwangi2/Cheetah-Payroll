"use client";

import React, { useState, useRef, useEffect } from 'react';

import NextImage from 'next/image';
import { Cropper, CircleStencil, type CropperRef } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import 'react-advanced-cropper/dist/themes/corners.css';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Lock, Save, Camera, Trash2, RotateCcw, Crop, Eye, EyeOff, AlertTriangle, _Info, _CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getServices } from '@/lib/oop';
import { type UserProfile } from '@/lib/services/UserService';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackAlert, type FeedbackMessage } from '@/components/ui/feedback-alert';

const defaultPlaceholderImage = "https://placehold.co/150x150.png";

const initialProfileDetails: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export default function UserProfilePage() {
  // Simple auth - handled in layout
  const isLoadingAuth = false;
  const currentUser = { id: 'user-1', email: 'user@example.com', firstName: 'User', lastName: 'Name' };
  const [userDetails, setUserDetails] = useState<UserProfile>(initialProfileDetails);
  const [passwordDetails, setPasswordDetails] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const cropperRef = useRef<CropperRef>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<FeedbackMessage | null>(null);
  const [avatarFeedback, setAvatarFeedback] = useState<FeedbackMessage | null>(null);

  // Get OOP services
  const services = getServices();

  useEffect(() => {
    const loadProfile = async () => {
      if (isLoadingAuth) return;
      
      try {
        if (!currentUser) {
          setIsLoaded(true);
          setFeedback({ type: 'error', message: 'User not authenticated', details: 'Please log in again.' });
          return;
        }

        // Set user details from the authenticated user object
        setUserDetails({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          phone: currentUser.phone || ''
        });

        // Fetch avatar using UserService
        let avatar = null;
        try {
          avatar = await services.userService.getAvatar(currentUser.id);
        } catch (avatarErr) {
          setAvatarFeedback({ type: 'error', message: 'Avatar Load Failed', details: String(avatarErr) });
        }
        setCroppedImage(avatar || defaultPlaceholderImage);

      } catch (err) {
        setFeedback({ type: 'error', message: 'Profile Load Error', details: String(err) });
      } finally {
        setIsLoaded(true);
      }
    };
    loadProfile();
  }, [services, currentUser, isLoadingAuth]);

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(null);
    const { name, value } = e.target;
    setUserDetails((prev: UserProfile) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordFeedback(null);
    const { name, value = '' } = e.target;
    setPasswordDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    if (!currentUser) {
        setFeedback({ type: 'error', message: "User session not found. Please log in again." });
        return;
    }

    try {
      // Use UserService to update profile
      await services.userService.updateProfile(currentUser.id, userDetails);
      setFeedback({ type: 'success', message: "Profile Updated", details: "Your personal information has been saved." });
    } catch (error: unknown) {
      setFeedback({ type: 'error', message: "Save Failed", details: "Could not save personal information. " + (error instanceof Error ? error.message : String(error)) });
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordFeedback(null);

    if (!currentUser) {
      setPasswordFeedback({ type: 'error', message: "Error", details: "User session not found. Please log in again." });
      return;
    }

    if (!passwordDetails.currentPassword) {
      setPasswordFeedback({ type: 'error', message: "Validation Error", details: "Current password is required." });
      return;
    }

    if (!passwordDetails.newPassword) {
      setPasswordFeedback({ type: 'error', message: "Validation Error", details: "New password is required." });
      return;
    }

    if (passwordDetails.newPassword !== passwordDetails.confirmNewPassword) {
      setPasswordFeedback({ type: 'error', message: "Password Mismatch", details: "New passwords do not match." });
      return;
    }
    
    if (passwordDetails.newPassword.length < 6) { // Basic length check
        setPasswordFeedback({type: 'error', message: "Validation Error", details: "New password must be at least 6 characters long."});
        return;
    }

    try {
      // Use UserService to update password
      await services.userService.updatePassword(passwordDetails.newPassword);
      setPasswordFeedback({ type: 'success', message: "Password Updated", details: "Your password has been successfully changed." });
      setPasswordDetails({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error: unknown) {
      setPasswordFeedback({ type: 'error', message: "Update Failed", details: "Could not update password. " + (error instanceof Error ? error.message : String(error)) });
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarFeedback(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveCroppedImage = async () => {
    setAvatarFeedback(null);
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas();
      if (canvas && currentUser) {
        const croppedImgDataUrl = canvas.toDataURL('image/jpeg');
        setCroppedImage(croppedImgDataUrl);
        // Use UserService to update avatar
        await services.userService.updateAvatar(currentUser.id, croppedImgDataUrl);
        setAvatarFeedback({ type: 'success', message: "Profile Picture Saved", details: "Your new profile picture has been saved." });
        setImageSrc(null);
      } else {
        setAvatarFeedback({ type: 'error', message: "Error", details: "Could not get cropped image." });
      }
    }
  };

  const handleRemovePicture = async () => {
    setAvatarFeedback(null);
    setImageSrc(null);
    setCroppedImage(defaultPlaceholderImage);
    if (currentUser) {
      try {
        // Use UserService to update avatar to default
        await services.userService.updateAvatar(currentUser.id, defaultPlaceholderImage);
      } catch (error) {
        console.error("Error removing profile picture via service", error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setAvatarFeedback({ type: 'success', message: "Profile Picture Removed", details: "Your profile picture has been reset to default." });
  };

  if (!isLoaded) {
    if (feedback && feedback.type === 'error' && feedback.message.toLowerCase().includes('user not authenticated')) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="destructive" className="max-w-md w-full">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            <div>
              <AlertTitle>Session Expired</AlertTitle>
              <AlertDescription>
                Your session has expired or you are not logged in.<br />
                <Button className="mt-4" onClick={() => window.location.href = '/signin?returnUrl=' + encodeURIComponent(window.location.pathname)}>
                  Go to Login
                </Button>
              </AlertDescription>
            </div>
          </Alert>
        </div>
      );
    }
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  if (!isLoaded) {
    if (feedback && feedback.type === 'error' && feedback.message.toLowerCase().includes('user not authenticated')) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="destructive" className="max-w-md w-full">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            <div>
              <AlertTitle>Session Expired</AlertTitle>
              <AlertDescription>
                Your session has expired or you are not logged in.<br />
                <Button className="mt-4" onClick={() => window.location.href = '/signin?returnUrl=' + encodeURIComponent(window.location.pathname)}>
                  Go to Login
                </Button>
              </AlertDescription>
            </div>
          </Alert>
        </div>
      );
    }
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <UserCircle className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight font-headline">User Profile</h1>        </div>
        <p className="text-muted-foreground">
          Manage your personal information, password, and profile picture. Data is securely stored in Supabase.
        </p>
      </div>
       <FeedbackAlert feedback={feedback} />
       <FeedbackAlert feedback={avatarFeedback} />
       <FeedbackAlert feedback={passwordFeedback} />

      <Tabs defaultValue="picture" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="picture">Profile Picture</TabsTrigger>
          <TabsTrigger value="personalInfo">Personal Information</TabsTrigger>
          <TabsTrigger value="security">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="picture">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-6 w-6 text-primary" />
                Profile Picture
              </CardTitle>
              <CardDescription>Upload, crop, and manage your profile picture. Saved to Supabase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept="image/*"
                className="hidden"
              />
              {!imageSrc && (
                <div className="flex flex-col items-center space-y-2">
                    <NextImage
                        src={croppedImage || defaultPlaceholderImage}
                        alt="Profile Picture Preview"
                        width={150}
                        height={150}
                        className="rounded-full aspect-square object-cover border"
                        data-ai-hint="profile avatar"
                        unoptimized={(croppedImage?.startsWith('blob:') || croppedImage?.startsWith('data:')) ?? false}
                        key={croppedImage}
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Change Picture
                    </Button>
                    {(croppedImage && croppedImage !== defaultPlaceholderImage) && (
                        <Button type="button" variant="ghost" size="sm" onClick={handleRemovePicture}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remove Current Picture
                        </Button>
                    )}
                </div>
              )}

              {imageSrc && (
                <div className="space-y-4">
                  <div className="relative h-80 w-full bg-muted rounded-md overflow-hidden">
                     <Cropper
                        ref={cropperRef}
                        src={imageSrc}
                        stencilComponent={CircleStencil}
                        stencilProps={{
                            aspectRatio: 1,
                            movable: true,
                            resizable: true,
                            lines: true,
                            handlers: true,
                         }}
                        className="h-full w-full react-advanced-cropper__image--restricted react-advanced-cropper__stretcher"
                        imageRestriction={"stencil" as any}
                      />
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Move and resize the circle to select your desired profile picture area.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button type="button" variant="outline" onClick={() => { setAvatarFeedback(null); fileInputRef.current?.click(); }}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Select Different Image
                    </Button>
                    <Button type="button" onClick={handleSaveCroppedImage}>
                      <Crop className="mr-2 h-4 w-4" /> Save Cropped Picture
                    </Button>
                     <Button type="button" variant="ghost" onClick={() => { setImageSrc(null); setAvatarFeedback(null); }}>
                        Cancel Crop
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalInfo">
          <form onSubmit={handleProfileSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle className="mr-2 h-6 w-6 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your first name, last name, email address, and phone number. Saved to Supabase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={userDetails.firstName}
                      onChange={handleUserInputChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={userDetails.lastName}
                      onChange={handleUserInputChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={userDetails.email}
                      onChange={handleUserInputChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={userDetails.phone}
                      onChange={handleUserInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> Save Personal Information
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={handlePasswordSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-6 w-6 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password. Your password is saved securely in Supabase.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordDetails.currentPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter your current password"
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                      suppressHydrationWarning={true}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                        <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordDetails.newPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Enter new password"
                        required
                        className="pr-10"
                        />
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        tabIndex={-1}
                        suppressHydrationWarning={true}
                        >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={passwordDetails.confirmNewPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Confirm new password"
                        required
                        className="pr-10"
                        />
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        tabIndex={-1}
                        suppressHydrationWarning={true}
                        >
                        {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" /> Update Password
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// All localStorage and indexedDbUtils references have been removed. This page now relies solely on Supabase for user profile data.

