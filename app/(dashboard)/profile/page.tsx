'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Image as ImageIcon, Mail, Calendar, Shield, Phone, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
    profileImage: string | null;
    createdAt: string;
    lastLogin: string | null;
}

export default function ProfilePage() {
    const { toast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Profile update form
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
    });

    // Password change form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Profile image
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setProfileForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phone: data.phone || '',
                    email: data.email,
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load profile data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully',
                });
                fetchProfile();
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to update profile',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while updating',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: 'Error',
                description: 'New passwords do not match',
                variant: 'destructive',
            });
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            toast({
                title: 'Error',
                description: 'Password must be at least 8 characters',
                variant: 'destructive',
            });
            return;
        }

        setUpdating(true);

        try {
            const response = await fetch('/api/profile/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Password changed successfully',
                });
                setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Current password is incorrect',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while changing password',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'Error',
                    description: 'Image size must be less than 5MB',
                    variant: 'destructive',
                });
                return;
            }

            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedImage) return;

        setUpdating(true);
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await fetch('/api/profile/image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Profile image updated successfully',
                });
                setSelectedImage(null);
                setImagePreview(null);
                fetchProfile();
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to upload image',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while uploading image',
                variant: 'destructive',
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="w-96">
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Failed to load profile data</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || profile.email[0].toUpperCase();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Card */}
                <Card className="shadow-lg border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 ring-4 ring-primary/20 transition-all group-hover:ring-primary/40">
                                    <AvatarImage src={imagePreview || profile.profileImage || undefined} />
                                    <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/80 text-white">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-md">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                                    {profile.firstName && profile.lastName
                                        ? `${profile.firstName} ${profile.lastName}`
                                        : profile.email}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span className="font-medium">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                                        <Shield className="h-3.5 w-3.5" />
                                        <span className="font-medium">{profile.role === 'ADMIN' ? 'Administrator' : profile.role}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="profile" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md p-1">
                        <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Personal Info</span>
                            <span className="sm:hidden">Info</span>
                        </TabsTrigger>
                        <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                            <Lock className="h-4 w-4" />
                            <span className="hidden sm:inline">Password</span>
                            <span className="sm:hidden">Password</span>
                        </TabsTrigger>
                        <TabsTrigger value="image" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                            <ImageIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Profile Picture</span>
                            <span className="sm:hidden">Picture</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card className="shadow-lg border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Edit2 className="h-5 w-5 text-primary" />
                                    <CardTitle>Personal Information</CardTitle>
                                </div>
                                <CardDescription>Update your personal information here</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                                            <Input
                                                id="firstName"
                                                value={profileForm.firstName}
                                                onChange={(e) =>
                                                    setProfileForm({ ...profileForm, firstName: e.target.value })
                                                }
                                                placeholder="Enter first name"
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                value={profileForm.lastName}
                                                onChange={(e) =>
                                                    setProfileForm({ ...profileForm, lastName: e.target.value })
                                                }
                                                placeholder="Enter last name"
                                                className="h-11"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) =>
                                                    setProfileForm({ ...profileForm, email: e.target.value })
                                                }
                                                placeholder="example@domain.com"
                                                className="h-11 pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) =>
                                                    setProfileForm({ ...profileForm, phone: e.target.value })
                                                }
                                                placeholder="+20 123 456 7890"
                                                className="h-11 pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                                            <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>{new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                                            <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {profile.lastLogin
                                                        ? new Date(profile.lastLogin).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })
                                                        : 'Never logged in'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={updating} className="px-8 h-11">
                                            {updating ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Password Tab */}
                    <TabsContent value="password">
                        <Card className="shadow-lg border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-primary" />
                                    <CardTitle>Change Password</CardTitle>
                                </div>
                                <CardDescription>Update your password. Must be at least 8 characters long.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) =>
                                                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                                            }
                                            placeholder="Enter current password"
                                            className="h-11"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) =>
                                                setPasswordForm({ ...profileForm, newPassword: e.target.value })
                                            }
                                            placeholder="Enter new password"
                                            className="h-11"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                                            }
                                            placeholder="Re-enter new password"
                                            className="h-11"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={updating} className="px-8 h-11">
                                            {updating ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Image Tab */}
                    <TabsContent value="image">
                        <Card className="shadow-lg border-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-primary" />
                                    <CardTitle>Profile Picture</CardTitle>
                                </div>
                                <CardDescription>Upload a new profile picture. Maximum size 5MB.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative group">
                                        <Avatar className="h-40 w-40 ring-4 ring-primary/20 transition-all group-hover:ring-primary/40 shadow-xl">
                                            <AvatarImage src={imagePreview || profile.profileImage || undefined} />
                                            <AvatarFallback className="text-5xl bg-gradient-to-br from-primary to-primary/80 text-white">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="w-full max-w-md space-y-4">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="cursor-pointer h-11"
                                        />
                                        {selectedImage && (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleImageUpload}
                                                    disabled={updating}
                                                    className="flex-1 h-11"
                                                >
                                                    {updating ? 'Uploading...' : 'Upload Image'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedImage(null);
                                                        setImagePreview(null);
                                                    }}
                                                    className="h-11"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
