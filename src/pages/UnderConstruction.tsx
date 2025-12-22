import { Construction } from 'lucide-react';

const UnderConstruction = ({ title }: { title: string }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 bg-card rounded-lg border border-dashed border-border">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full mb-4">
                <Construction size={48} />
            </div>
            <h2 className="text-2xl font-bold text-content-primary mb-2">{title}</h2>
            <p className="text-content-secondary max-w-md">
                نحن نعمل على بناء هذه الصفحة لتكون جاهزة قريباً بجميع المميزات المطلوبة.
            </p>
        </div>
    );
};

export default UnderConstruction;

