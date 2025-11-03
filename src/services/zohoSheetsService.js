/**
 * Zoho Sheets Service
 * Handles intelligent column mapping and data insertion to Zoho Sheets
 */

const ZOHO_API_BASE = 'https://sheet.zoho.com/api/v2';

/**
 * Common function to find column index by matching keywords
 */
function findColumn(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i]).toLowerCase().trim();
    if (keywords.some(keyword => header.includes(keyword))) {
      return i;
    }
  }
  return null;
}

/**
 * Get header row from Zoho sheet and map columns intelligently
 */
async function getColumnMapping(spreadsheetId, accessToken) {
  try {
    // Zoho Sheets API: Get sheet names first
    const sheetsResponse = await fetch(
      `${ZOHO_API_BASE}/worksheets?workbook_id=${spreadsheetId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!sheetsResponse.ok) {
      const errorText = await sheetsResponse.text();
      throw new Error(`Failed to get sheets: ${errorText}`);
    }

    const sheetsData = await sheetsResponse.json();
    const sheetName = sheetsData.data?.[0]?.sheet_name || 'Sheet1';
    const sheetId = sheetsData.data?.[0]?.sheet_id || 0;

    // Get first row (headers) - Zoho uses 0-based indexing
    const headersResponse = await fetch(
      `${ZOHO_API_BASE}/worksheets/${sheetId}/cells?workbook_id=${spreadsheetId}&range=A1:Z1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!headersResponse.ok) {
      const errorText = await headersResponse.text();
      throw new Error(`Failed to get headers: ${errorText}`);
    }

    const headersData = await headersResponse.json();
    // Zoho API returns cells in various formats, handle both
    let headers = [];
    if (headersData.data && headersData.data.length > 0) {
      if (headersData.data[0].cells && Array.isArray(headersData.data[0].cells)) {
        // Format: { data: [{ cells: [{ value: ... }, ...] }] }
        headers = headersData.data[0].cells.map(cell => cell.value || '');
      } else if (Array.isArray(headersData.data[0])) {
        // Format: { data: [[{ value: ... }, ...]] }
        headers = headersData.data[0].map(cell => (cell.value || cell || ''));
      } else {
        // Try to extract from response structure
        const firstRow = headersData.data[0];
        if (firstRow.row_index === 1 || firstRow.row_index === 0) {
          headers = (firstRow.cells || []).map(cell => cell.value || '');
        }
      }
    }
    
    // Fallback: if headers are empty, create default headers
    if (headers.length === 0) {
      headers = [];
    }

    // Intelligent column mapping
    const columnMap = {
      name: findColumn(headers, ['name', 'full name', 'person', 'contact name']),
      email: findColumn(headers, ['email', 'e-mail', 'email address', 'mail']),
      phone: findColumn(headers, ['phone', 'telephone', 'mobile', 'cell', 'phone number']),
      linkedin: findColumn(headers, ['linkedin', 'linkedin profile', 'linkedin url', 'linked in']),
      company: findColumn(headers, ['company', 'organization', 'org', 'firm', 'business']),
      jobTitle: findColumn(headers, ['title', 'job title', 'position', 'role', 'designation']),
      website: findColumn(headers, ['website', 'url', 'web', 'site']),
      address: findColumn(headers, ['address', 'location', 'street', 'office']),
    };

    return { sheetName, sheetId, columnMap, headers };
  } catch (error) {
    throw new Error(`Failed to get column mapping: ${error.message}`);
  }
}

/**
 * Convert column index to Zoho column letter (0 -> A, 1 -> B, etc.)
 */
function getColumnLetter(index) {
  let result = '';
  while (index >= 0) {
    result = String.fromCharCode(65 + (index % 26)) + result;
    index = Math.floor(index / 26) - 1;
  }
  return result;
}

/**
 * Save extracted data to Zoho Sheets with intelligent column mapping
 */
export async function saveToZohoSheets(data, config) {
  const { spreadsheetId, accessToken } = config;

  if (!spreadsheetId || !accessToken) {
    throw new Error('Zoho Sheets configuration is incomplete');
  }

  try {
    const { sheetName, sheetId, columnMap, headers } = await getColumnMapping(spreadsheetId, accessToken);

    // Prepare row data
    const rowData = [];
    const fieldMapping = {
      name: 'name',
      email: 'email',
      phone: 'phone',
      linkedin: 'linkedin',
      company: 'company',
      jobTitle: 'jobTitle',
      website: 'website',
      address: 'address',
    };

    // Find maximum column index
    let maxColIndex = headers.length > 0 ? headers.length - 1 : -1;
    const newHeaders = [...headers];

    // Process each field
    Object.entries(fieldMapping).forEach(([key, dataKey]) => {
      const colIndex = columnMap[key];
      if (colIndex !== null && colIndex !== undefined) {
        // Column exists, use it
        rowData[colIndex] = data[dataKey] || '';
      } else {
        // Column doesn't exist, append it
        maxColIndex++;
        rowData[maxColIndex] = data[dataKey] || '';

        // Update header if needed
        if (newHeaders.length <= maxColIndex) {
          const headerName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
          newHeaders[maxColIndex] = headerName;
        }
      }
    });

    // Find the last row to append after it
    const lastRowResponse = await fetch(
      `${ZOHO_API_BASE}/worksheets/${sheetId}/cells?workbook_id=${spreadsheetId}&range=A2:A1000`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let nextRow = 2; // Start from row 2 (row 1 is headers)
    if (lastRowResponse.ok) {
      try {
        const lastRowData = await lastRowResponse.json();
        const rows = lastRowData.data || [];
        if (rows.length > 0) {
          // Find the last non-empty row
          let maxRow = 1;
          rows.forEach(row => {
            // Zoho uses 1-based indexing for rows
            const rowIndex = row.row_index || row.row || 1;
            if (rowIndex > maxRow) {
              maxRow = rowIndex;
            }
          });
          nextRow = maxRow + 1;
        }
      } catch (e) {
        // If we can't parse, default to row 2
        console.warn('Could not determine last row, defaulting to row 2');
      }
    }

    // Update headers if new columns were added
    if (newHeaders.length > headers.length) {
      const headerCells = newHeaders.map((header, index) => ({
        cell_address: `${getColumnLetter(index)}1`,
        value: header || ''
      }));

      await fetch(
        `${ZOHO_API_BASE}/worksheets/${sheetId}/cells?workbook_id=${spreadsheetId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Zoho-oauthtoken ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cells: headerCells
          })
        }
      );
    }

    // Prepare cells for the new row - only include non-empty values and at least the first column
    const cells = [];
    rowData.forEach((value, index) => {
      const cellAddress = `${getColumnLetter(index)}${nextRow}`;
      // Always include first column, include others if they have values
      const valueStr = (value || '').toString().trim();
      if (index === 0 || valueStr !== '') {
        cells.push({
          cell_address: cellAddress,
          value: valueStr
        });
      }
    });

    // Insert the new row
    const insertResponse = await fetch(
      `${ZOHO_API_BASE}/worksheets/${sheetId}/cells?workbook_id=${spreadsheetId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cells: cells
        })
      }
    );

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Failed to insert data: ${errorText}`);
    }

    return { success: true, message: 'Data saved successfully' };
  } catch (error) {
    throw new Error(`Failed to save to Zoho Sheets: ${error.message}`);
  }
}

