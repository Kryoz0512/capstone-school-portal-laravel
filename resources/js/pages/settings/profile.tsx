import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit(),
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your password. Name and email cannot be changed."
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full bg-gray-50"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500">Your name cannot be changed</p>

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full bg-gray-50"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500">Your email cannot be changed</p>

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="current_password">Current Password</Label>

                                            <Input
                                                id="current_password"
                                                type="password"
                                                className="mt-1 block w-full"
                                                name="current_password"
                                                autoComplete="current-password"
                                                placeholder="Enter current password"
                                            />

                                            <InputError
                                                className="mt-2"
                                                message={errors.current_password}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">New Password</Label>

                                            <Input
                                                id="password"
                                                type="password"
                                                className="mt-1 block w-full"
                                                name="password"
                                                autoComplete="new-password"
                                                placeholder="Enter new password"
                                            />
                                            <p className="text-xs text-gray-500">Minimum 8 characters</p>

                                            <InputError
                                                className="mt-2"
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">Confirm New Password</Label>

                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                className="mt-1 block w-full"
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                                placeholder="Confirm new password"
                                            />

                                            <InputError
                                                className="mt-2"
                                                message={errors.password_confirmation}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save Changes
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600">
                                            Password updated successfully
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
