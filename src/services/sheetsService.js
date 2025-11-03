/**
 * Google Sheets Service
 * Handles intelligent column mapping and data insertion
 */

let sheetsClient = null;

/**
 * Initialize Google Sheets client
 */
async function initSheetsClient(credentials) {
  if (sheetsClient) return sheetsClient;

  try {
    // Dynamically import googleapis only when needed
    const { google } = await import('googleapis');
    
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (error) {
    throw new Error(`Failed to initialize Google Sheets client: ${error.message}`);
  }
}

/**
 * Get header row from sheet and map columns intelligently
 */
async function getColumnMapping(spreadsheetId, credentials) {
  const sheets = await initSheetsClient(credentials);
  
  try {
    // Get the first sheet
    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    const sheetName = sheetMetadata.data.sheets[0].properties.title;
    
    // Get first row (headers)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });

    const headers = response.data.values?.[0] || [];
    
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

    return { sheetName, columnMap, headers };
  } catch (error) {
    throw new Error(`Failed to get column mapping: ${error.message}`);
  }
}

/**
 * Find column index by matching keywords
 * (Exported for use in other services)
 */
export function findColumn(headers, keywords) {
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i]).toLowerCase().trim();
    if (keywords.some(keyword => header.includes(keyword))) {
      return i;
    }
  }
  // If not found, return null to append new column
  return null;
}

/**
 * Save extracted data to Google Sheets with intelligent column mapping
 */
export async function saveToGoogleSheets(data, config) {
  const { spreadsheetId, credentials } = config;

  if (!spreadsheetId || !credentials) {
    throw new Error('Google Sheets configuration is incomplete');
  }

  try {
    const { sheetName, columnMap, headers } = await getColumnMapping(spreadsheetId, credentials);
    const sheets = await initSheetsClient(credentials);

    // Prepare row data
    const rowData = [];
    
    // Map data to columns (existing or new)
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
    let maxColIndex = headers.length - 1;
    
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
        
        // Update header if needed (only if we're adding new columns)
        if (headers.length <= maxColIndex) {
          const headerName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
          headers[maxColIndex] = headerName;
        }
      }
    });

    // If we added new columns, update headers first
    if (headers.length > columnMap.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!1:1`,
        valueInputOption: 'RAW',
        resource: {
          values: [headers],
        },
      });
    }

    // Append the new row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [rowData],
      },
    });

    return { success: true, message: 'Data saved successfully' };
  } catch (error) {
    throw new Error(`Failed to save to Google Sheets: ${error.message}`);
  }
}

