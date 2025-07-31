import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head} from '@inertiajs/react';
import PayTable from '@/Components/PayTable.jsx'

export default function Dashboard({ transactions }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Таблица баланса
                </h2>
            }
        >
            <Head title="Таблица Баланса"/>

            <PayTable
                data={transactions}
            />
        </AuthenticatedLayout>
    );
}
