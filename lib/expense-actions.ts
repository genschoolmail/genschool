'use server';

export async function getVendors() {
    try {
        // Placeholder implementation
        return [
            { id: '1', name: 'ABC Supplies', contact: '123-456-7890' },
            { id: '2', name: 'XYZ Services', contact: '098-765-4321' }
        ];
    } catch (error) {
        return [];
    }
}