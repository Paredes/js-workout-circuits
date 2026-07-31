const STORAGE_KEY = 'circuitos_v1';

export const StorageModule = {
    save(circuits){
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
        } catch (error){
            console.error('Error al guardar en localStorage', error);
        }
    },
    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data): [];
        } catch (error) {
            console.error('Error al cargar desde localStorage', error);
            return [];
        }
    }
}