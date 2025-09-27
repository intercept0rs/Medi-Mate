import React, { useState, useEffect } from 'react';
import { Medicine, Appointment, TranslationSet } from '../types';

interface AddEditScreenProps {
    addMedicine: (med: Omit<Medicine, 'id'>) => void;
    addAppointment: (app: Omit<Appointment, 'id'>) => void;
    t: TranslationSet;
    editingMedicine: Medicine | null;
    updateMedicine: (med: Medicine) => void;
    cancelEdit: () => void;
}

const AddEditScreen: React.FC<AddEditScreenProps> = ({ addMedicine, addAppointment, t, editingMedicine, updateMedicine, cancelEdit }) => {
    const [activeTab, setActiveTab] = useState<'medicine' | 'appointment'>(editingMedicine ? 'medicine' : 'medicine');

    // Medicine form state
    const [medName, setMedName] = useState('');
    const [dosage, setDosage] = useState('');
    const [medTime, setMedTime] = useState('08:00');
    const [stock, setStock] = useState('');
    const [stockThreshold, setStockThreshold] = useState('');

    // Appointment form state
    const [docName, setDocName] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [appDate, setAppDate] = useState(new Date().toISOString().split('T')[0]);
    const [appTime, setAppTime] = useState('10:00');
    
    useEffect(() => {
        if(editingMedicine) {
            setMedName(editingMedicine.name);
            setDosage(editingMedicine.dosage);
            setMedTime(editingMedicine.time);
            setStock(String(editingMedicine.stock));
            setStockThreshold(String(editingMedicine.stockThreshold));
            setActiveTab('medicine');
        } else {
            // Reset form when not in edit mode
            setMedName('');
            setDosage('');
            setMedTime('08:00');
            setStock('');
            setStockThreshold('');
        }
    }, [editingMedicine]);

    const handleMedSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const medData = {
            name: medName,
            dosage,
            time: medTime,
            stock: parseInt(stock, 10),
            stockThreshold: parseInt(stockThreshold, 10),
        };

        if(editingMedicine) {
            updateMedicine({ ...medData, id: editingMedicine.id });
        } else {
            addMedicine(medData);
        }
    };
    
    const handleAppSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addAppointment({
            doctor: docName,
            clinic: clinicName,
            date: appDate,
            time: appTime,
        });
    };

    const inputBaseClass = "w-full p-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0C8346] bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100";
    const labelBaseClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

    return (
        <div className="space-y-6">
            <div>
                <div className="flex border-b border-slate-200 dark:border-gray-700">
                    <button onClick={() => setActiveTab('medicine')} className={`flex-1 py-3 font-semibold text-center transition-colors ${activeTab === 'medicine' ? 'border-b-2 border-[#0C8346] text-[#0C8346] dark:text-[#92D050]' : 'text-slate-500 dark:text-slate-400'}`}>
                        {t.addMedicine}
                    </button>
                    <button onClick={() => setActiveTab('appointment')} className={`flex-1 py-3 font-semibold text-center transition-colors ${activeTab === 'appointment' ? 'border-b-2 border-[#0C8346] text-[#0C8346] dark:text-[#92D050]' : 'text-slate-500 dark:text-slate-400'}`}>
                        {t.addAppointment}
                    </button>
                </div>
            </div>

            {activeTab === 'medicine' && (
                <form onSubmit={handleMedSubmit} className="space-y-4 animate-fade-in">
                    <div>
                        <label htmlFor="medName" className={labelBaseClass}>{t.medicineName}</label>
                        <input id="medName" type="text" value={medName} onChange={e => setMedName(e.target.value)} className={inputBaseClass} required />
                    </div>
                    <div>
                        <label htmlFor="dosage" className={labelBaseClass}>{t.dosage}</label>
                        <input id="dosage" type="text" value={dosage} onChange={e => setDosage(e.target.value)} className={inputBaseClass} required />
                    </div>
                     <div>
                        <label htmlFor="medTime" className={labelBaseClass}>{t.time}</label>
                        <input id="medTime" type="time" value={medTime} onChange={e => setMedTime(e.target.value)} className={inputBaseClass} required />
                    </div>
                     <div>
                        <label htmlFor="stock" className={labelBaseClass}>{t.currentStock}</label>
                        <input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} className={inputBaseClass} required />
                    </div>
                     <div>
                        <label htmlFor="stockThreshold" className={labelBaseClass}>{t.stockThreshold}</label>
                        <input id="stockThreshold" type="number" value={stockThreshold} onChange={e => setStockThreshold(e.target.value)} className={inputBaseClass} required />
                    </div>
                    <div className="flex gap-3 pt-2">
                        {editingMedicine && <button type="button" onClick={cancelEdit} className="w-full bg-slate-200 dark:bg-gray-600 text-slate-800 dark:text-slate-100 p-3 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-gray-500 transition">{t.cancel}</button>}
                        <button type="submit" className="w-full bg-[#0C8346] text-white p-3 font-semibold rounded-lg hover:bg-green-800 transition">{editingMedicine ? t.updateMedicine : t.saveMedicine}</button>
                    </div>
                </form>
            )}

            {activeTab === 'appointment' && (
                <form onSubmit={handleAppSubmit} className="space-y-4 animate-fade-in">
                    <div>
                        <label htmlFor="docName" className={labelBaseClass}>{t.doctorName}</label>
                        <input id="docName" type="text" value={docName} onChange={e => setDocName(e.target.value)} className={inputBaseClass} required />
                    </div>
                     <div>
                        <label htmlFor="clinicName" className={labelBaseClass}>{t.clinicName}</label>
                        <input id="clinicName" type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} className={inputBaseClass} required />
                    </div>
                     <div>
                        <label htmlFor="appDate" className={labelBaseClass}>{t.date}</label>
                        <input id="appDate" type="date" value={appDate} onChange={e => setAppDate(e.target.value)} className={inputBaseClass} required />
                    </div>
                     <div>
                        <label htmlFor="appTime" className={labelBaseClass}>{t.time}</label>
                        <input id="appTime" type="time" value={appTime} onChange={e => setAppTime(e.target.value)} className={inputBaseClass} required />
                    </div>
                    <button type="submit" className="w-full bg-[#0C8346] text-white p-3 font-semibold rounded-lg hover:bg-green-800 transition mt-2">{t.saveAppointment}</button>
                </form>
            )}
        </div>
    );
};

export default AddEditScreen;
