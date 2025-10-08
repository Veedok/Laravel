import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import PayTable from '@/Components/PayTable.jsx';
import CarouselButtons from "@/Components/CarouselButtons.jsx";
import React from "react";
import LoadingSpinner from '@/Components/UI/LoadingSpinner.jsx';
import ErrorMessage from '@/Components/UI/ErrorMessage.jsx';
import NoTablesMessage from '@/Components/UI/NoTablesMessage.jsx';
import PasswordPrompt from '@/Components/Crypto/PasswordPrompt.jsx';
import TableContainer from '@/Components/UI/TableContainer.jsx';
import useTableData from "@/hooks/useTableData.js";
import useEncryption from "@/hooks/useEncryption.js";

export default function Dashboard({ theme, tables: initialTables, auth }) {
    const {
        data,
        loading,
        error,
        tables,
        activeTableId,
        fetchTransactions,
        handleItemClick,
        handleAddItem,
        handleRetry
    } = useTableData(initialTables);

    const {
        isTableEncrypted,
        isTableLocked,
        unlockLoading,
        unlockError,
        handleEncryptionChange,
        handleUnlockData,
        handleLockTable,
        handleClearUnlockError
    } = useEncryption(activeTableId, auth.user.id, fetchTransactions);
    const hasTables = Object.keys(tables).length > 0;
    const renderContent = () => {
        if (!hasTables) {
            return <NoTablesMessage onAddTable={handleAddItem} />;
        }
        if (loading) {
            return <LoadingSpinner />;
        }
        if (error) {
            return <ErrorMessage message={error} onRetry={handleRetry} />;
        }
        if (isTableEncrypted && isTableLocked) {
            return (
                <PasswordPrompt
                    theme={theme}
                    onUnlock={handleUnlockData}
                    loading={unlockLoading}
                    error={unlockError}
                    onClearError={handleClearUnlockError}
                />
            );
        }
        return (
            <PayTable
                data={data.transactions}
                activeTableId={activeTableId}
                permissions={data.permission}
                theme={theme}
                userTags={data.userTags}
                isEncrypted={isTableEncrypted}
                isLocked={isTableLocked}
                onLockTable={handleLockTable}
            />
        );
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Таблица баланса
                </h2>
            }
        >
            <Head title="Таблица Баланса" />
            <CarouselButtons
                items={tables}
                onItemClick={handleItemClick}
                onAddItem={handleAddItem}
                theme={theme}
                activeTableId={activeTableId}
            />
            <TableContainer>
                {renderContent()}
            </TableContainer>
        </AuthenticatedLayout>
    );
}
