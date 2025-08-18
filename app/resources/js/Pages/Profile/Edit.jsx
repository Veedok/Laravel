import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status, theme = 'light' }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className={`text-xl font-semibold leading-tight ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    Profile
                </h2>
            }
            theme={theme}
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className={`p-4 shadow sm:rounded-lg sm:p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                            theme={theme}
                        />
                    </div>

                    <div className={`p-4 shadow sm:rounded-lg sm:p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <UpdatePasswordForm
                            className="max-w-xl"
                            theme={theme}
                        />
                    </div>

                    <div className={`p-4 shadow sm:rounded-lg sm:p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        <DeleteUserForm
                            className="max-w-xl"
                            theme={theme}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
