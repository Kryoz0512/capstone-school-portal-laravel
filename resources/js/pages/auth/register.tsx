import { Form, Head, usePage, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

type PageProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

export default function Register() {
    const { flash } = usePage<PageProps>().props;
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success('Success!', {
                description: flash.success,
                duration: 4000,
            });
        }
        if (flash?.error) {
            toast.error('Error', {
                description: flash.error,
                duration: 4000,
            });
        }
    }, [flash]);

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        router.visit(login());
    };

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            
            {/* Success Modal */}
            <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle className="h-12 w-12 text-green-600" />
                            </div>
                        </div>
                        <AlertDialogTitle className="text-center text-2xl">
                            Account Created Successfully!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-base">
                            Your account has been created successfully. You can now log in with your credentials.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                        <AlertDialogAction
                            onClick={handleSuccessModalClose}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                        >
                            Continue to Login
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
                onSuccess={() => {
                    setShowSuccessModal(true);
                }}
                onError={(errors) => {
                    // Show validation errors as toast
                    const errorMessages = Object.values(errors).flat();
                    if (errorMessages.length > 0) {
                        toast.error('Validation Error', {
                            description: errorMessages[0] as string,
                            duration: 5000,
                        });
                    }
                }}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
