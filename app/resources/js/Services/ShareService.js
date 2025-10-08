import axios from 'axios';
class ShareService {
    static async shareTable(shareData) {
        try {
            await axios.post(route('tableShare'), shareData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            return { success: true };
        } catch (error) {
            if (error.response) {
                throw new Error(
                    error.response.data.message ||
                    `Ошибка при предоставлении доступа (код: ${error.response.status})`
                );
            } else {
                throw new Error('Не удалось предоставить доступ. Проверьте соединение.');
            }
        }
    }
}
export default ShareService;
