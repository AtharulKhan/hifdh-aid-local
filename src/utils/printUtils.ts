
export const printComponent = (componentHTML: string, title: string = 'Document') => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              margin: 20px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .text-center {
              text-align: center;
            }
            .mb-6 {
              margin-bottom: 1.5rem;
            }
            .mb-2 {
              margin-bottom: 0.5rem;
            }
            .mt-6 {
              margin-top: 1.5rem;
            }
            .text-2xl {
              font-size: 1.5rem;
            }
            .font-bold {
              font-weight: bold;
            }
            .text-gray-600 {
              color: #6b7280;
            }
            .text-sm {
              font-size: 0.875rem;
            }
            .bg-green-100 {
              background-color: #dcfce7;
            }
            .text-green-800 {
              color: #166534;
            }
            .bg-red-100 {
              background-color: #fee2e2;
            }
            .text-red-800 {
              color: #991b1b;
            }
            .bg-yellow-100 {
              background-color: #fef3c7;
            }
            .text-yellow-800 {
              color: #92400e;
            }
            .px-2 {
              padding-left: 0.5rem;
              padding-right: 0.5rem;
            }
            .py-1 {
              padding-top: 0.25rem;
              padding-bottom: 0.25rem;
            }
            .rounded {
              border-radius: 0.25rem;
            }
            .text-xs {
              font-size: 0.75rem;
            }
            @media print {
              body {
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${componentHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

export const downloadAsPDF = (componentHTML: string, filename: string = 'document.pdf') => {
  // For now, we'll use the print functionality
  // In a real-world scenario, you might want to use a library like jsPDF or Puppeteer
  printComponent(componentHTML, filename.replace('.pdf', ''));
};
