declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type: string, quality: number };
    html2canvas?: any;
    jsPDF?: any;
  }

  function html2pdf(): {
    from: (element: HTMLElement) => {
      save: (options?: Html2PdfOptions) => void;
      outputPdf: (options?: Html2PdfOptions) => string;
    }
  }

  export = html2pdf;
}
