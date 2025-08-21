import ConfirmModal from "@/Components/common/ConfirmModal.jsx";

export default function ErrorModal({ isOpen, onClose, errors, theme }) {
    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onClose}
            title="Ошибка"
            message={
                <ul>
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            }
            confirmText="Закрыть"
            cancelText={null}
            theme={theme}
        />
    );
}
