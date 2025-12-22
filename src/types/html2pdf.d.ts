declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | number[];
        filename?: string;
        image?: {
            type?: string;
            quality?: number;
        };
        html2canvas?: {
            scale?: number;
            useCORS?: boolean;
            backgroundColor?: string;
            logging?: boolean;
            letterRendering?: boolean;
            allowTaint?: boolean;
            scrollX?: number;
            scrollY?: number;
        };
        jsPDF?: {
            unit?: string;
            format?: string | number[];
            orientation?: 'portrait' | 'landscape';
            compress?: boolean;
        };
        pagebreak?: {
            mode?: string | string[];
            before?: string | string[];
            after?: string | string[];
            avoid?: string | string[];
        };
        enableLinks?: boolean;
    }

    interface Html2PdfInstance {
        set(options: Html2PdfOptions): Html2PdfInstance;
        from(element: HTMLElement | string): Html2PdfInstance;
        save(): Promise<void>;
        toPdf(): Html2PdfInstance;
        get(type: string): Promise<any>;
        output(type: string, options?: any): Promise<any>;
        then(callback: (pdf: any) => void): Html2PdfInstance;
        catch(callback: (error: any) => void): Html2PdfInstance;
    }

    function html2pdf(): Html2PdfInstance;
    function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Html2PdfInstance;

    export = html2pdf;
}
