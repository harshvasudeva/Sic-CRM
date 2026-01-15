const ExcelJS = require('exceljs');

const exportToExcel = async (data, filename, sheetName) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.columns = headers.map(header => ({ header, key: header }));

      data.forEach(row => {
        worksheet.addRow(row);
      });

      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
      });

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    }

    const filepath = `./uploads/${filename}.xlsx`;
    await workbook.xlsx.writeFile(filepath);

    return filepath;
  } catch (error) {
    throw error;
  }
};

const exportToCSV = async (data, filename) => {
  try {
    if (data.length === 0) {
      const filepath = `./uploads/${filename}.csv`;
      require('fs').writeFileSync(filepath, '');
      return filepath;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        const stringValue = value === null || value === undefined ? '' : String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(','))
    ].join('\n');

    const filepath = `./uploads/${filename}.csv`;
    require('fs').writeFileSync(filepath, csvContent);

    return filepath;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  exportToExcel,
  exportToCSV,
};
