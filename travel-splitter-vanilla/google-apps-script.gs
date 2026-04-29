/**
 * Travel Splitter - Google Apps Script Backend
 * This script receives data from the vanilla JS app and stores it in Google Sheets
 */

// Configuration - Change this to your sheet name
const SHEET_NAME = 'Travel Expenses';

/**
 * Web App entry point - handles POST requests
 */
function doPost(e) {
  try {
    const action = e.parameter.action || 'sync';
    
    if (action === 'sync') {
      return handleSync(e);
    }
    
    return jsonResponse({ success: false, message: 'Unknown action' });
  } catch (error) {
    console.error('Error in doPost:', error);
    return jsonResponse({ success: false, message: error.toString() });
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return jsonResponse({ 
    success: true, 
    message: 'Travel Splitter API is running',
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle sync request from the app
 */
function handleSync(e) {
  // Get data from form parameters
  const timestamp = e.parameter.timestamp || new Date().toISOString();
  const currency = e.parameter.currency || 'JPY';
  const membersJson = e.parameter.members || '[]';
  const expensesJson = e.parameter.expenses || '[]';
  const settlementsJson = e.parameter.settlements || '[]';
  
  // Parse JSON data
  const members = JSON.parse(membersJson);
  const expenses = JSON.parse(expensesJson);
  const settlements = JSON.parse(settlementsJson);
  
  // Get or create spreadsheet
  const spreadsheet = getOrCreateSpreadsheet();
  const sheet = getOrCreateSheet(spreadsheet, SHEET_NAME);
  
  // Clear existing data and write new data
  writeDataToSheet(sheet, timestamp, currency, members, expenses, settlements);
  
  return jsonResponse({ 
    success: true, 
    message: 'Data synced successfully',
    timestamp: timestamp,
    stats: {
      members: members.length,
      expenses: expenses.length,
      settlements: settlements.length
    }
  });
}

/**
 * Get or create the spreadsheet
 */
function getOrCreateSpreadsheet() {
  // Try to get existing spreadsheet by ID (you can set this in script properties)
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  
  if (spreadsheetId) {
    try {
      return SpreadsheetApp.openById(spreadsheetId);
    } catch (e) {
      console.log('Could not open existing spreadsheet, creating new one');
    }
  }
  
  // Create new spreadsheet
  const spreadsheet = SpreadsheetApp.create('Travel Splitter - Expense Tracker');
  props.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  
  return spreadsheet;
}

/**
 * Get or create a sheet with the given name
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  return sheet;
}

/**
 * Write all data to the sheet
 */
function writeDataToSheet(sheet, timestamp, currency, members, expenses, settlements) {
  // Clear existing content
  sheet.clear();
  
  let row = 1;
  
  // ===== HEADER SECTION =====
  sheet.getRange(row, 1).setValue('Travel Splitter - Expense Report');
  sheet.getRange(row, 1).setFontSize(16).setFontWeight('bold');
  row += 2;
  
  // Metadata
  sheet.getRange(row, 1).setValue('Sync Time:');
  sheet.getRange(row, 2).setValue(new Date(timestamp));
  sheet.getRange(row, 2).setNumberFormat('yyyy-MM-dd HH:mm:ss');
  row++;
  
  sheet.getRange(row, 1).setValue('Display Currency:');
  sheet.getRange(row, 2).setValue(currency);
  row += 2;
  
  // ===== MEMBERS SECTION =====
  sheet.getRange(row, 1).setValue('MEMBERS');
  sheet.getRange(row, 1).setFontSize(14).setFontWeight('bold').setBackground('#E8F0FE');
  row++;
  
  if (members.length > 0) {
    // Headers
    sheet.getRange(row, 1).setValue('Name');
    sheet.getRange(row, 2).setValue('ID');
    sheet.getRange(row, 1, 1, 2).setFontWeight('bold').setBackground('#F1F3F4');
    row++;
    
    // Data
    members.forEach(member => {
      sheet.getRange(row, 1).setValue(member.name);
      sheet.getRange(row, 2).setValue(member.id);
      row++;
    });
  } else {
    sheet.getRange(row, 1).setValue('No members');
    row++;
  }
  row++;
  
  // ===== EXPENSES SECTION =====
  sheet.getRange(row, 1).setValue('EXPENSES');
  sheet.getRange(row, 1).setFontSize(14).setFontWeight('bold').setBackground('#E8F0FE');
  row++;
  
  if (expenses.length > 0) {
    // Create member map for lookup
    const memberMap = {};
    members.forEach(m => memberMap[m.id] = m.name);
    
    // Headers
    const expenseHeaders = ['Date', 'Description', 'Category', 'Amount', 'Currency', 'Paid By', 'Split Among', 'Split Count'];
    expenseHeaders.forEach((header, i) => {
      sheet.getRange(row, i + 1).setValue(header);
    });
    sheet.getRange(row, 1, 1, expenseHeaders.length).setFontWeight('bold').setBackground('#F1F3F4');
    row++;
    
    // Category mapping
    const categoryMap = {
      food: '餐飲',
      transport: '交通',
      hotel: '住宿',
      ticket: '門票',
      shopping: '購物',
      other: '其他'
    };
    
    // Data
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      sheet.getRange(row, 1).setValue(date);
      sheet.getRange(row, 1).setNumberFormat('yyyy-MM-dd');
      
      sheet.getRange(row, 2).setValue(expense.description);
      sheet.getRange(row, 3).setValue(categoryMap[expense.category] || expense.category);
      sheet.getRange(row, 4).setValue(expense.amount);
      sheet.getRange(row, 5).setValue(expense.currency);
      sheet.getRange(row, 6).setValue(memberMap[expense.paidBy] || expense.paidBy);
      
      const splitNames = expense.splitAmong.map(id => memberMap[id] || id).join(', ');
      sheet.getRange(row, 7).setValue(splitNames);
      sheet.getRange(row, 8).setValue(expense.splitAmong.length);
      
      row++;
    });
    
    // Add totals
    row++;
    sheet.getRange(row, 1).setValue('TOTALS BY CURRENCY:');
    sheet.getRange(row, 1).setFontWeight('bold');
    row++;
    
    const totals = calculateTotals(expenses);
    Object.entries(totals).forEach(([curr, amount]) => {
      sheet.getRange(row, 1).setValue(curr + ':');
      sheet.getRange(row, 2).setValue(amount);
      sheet.getRange(row, 2).setNumberFormat(curr === 'JPY' ? '#,##0' : '#,##0.00');
      row++;
    });
  } else {
    sheet.getRange(row, 1).setValue('No expenses');
    row++;
  }
  row++;
  
  // ===== SETTLEMENTS SECTION =====
  sheet.getRange(row, 1).setValue('SETTLEMENTS');
  sheet.getRange(row, 1).setFontSize(14).setFontWeight('bold').setBackground('#E8F0FE');
  row++;
  
  if (settlements.length > 0) {
    // Create member map for lookup
    const memberMap = {};
    members.forEach(m => memberMap[m.id] = m.name);
    
    // Headers
    sheet.getRange(row, 1).setValue('From');
    sheet.getRange(row, 2).setValue('To');
    sheet.getRange(row, 3).setValue('Amount (' + currency + ')');
    sheet.getRange(row, 1, 1, 3).setFontWeight('bold').setBackground('#F1F3F4');
    row++;
    
    // Data
    settlements.forEach(s => {
      sheet.getRange(row, 1).setValue(memberMap[s.from] || s.from);
      sheet.getRange(row, 2).setValue(memberMap[s.to] || s.to);
      sheet.getRange(row, 3).setValue(s.amount);
      sheet.getRange(row, 3).setNumberFormat(currency === 'JPY' ? '#,##0' : '#,##0.00');
      row++;
    });
    
    row++;
    sheet.getRange(row, 1).setValue('Total transfers needed: ' + settlements.length);
  } else {
    sheet.getRange(row, 1).setValue('All settled! No transfers needed.');
    row++;
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 8);
  
  // Add borders to data sections
  if (members.length > 0) {
    const memberEndRow = 4 + members.length;
    sheet.getRange(5, 1, members.length, 2).setBorder(true, true, true, true, true, true);
  }
}

/**
 * Calculate totals by currency
 */
function calculateTotals(expenses) {
  const totals = {};
  expenses.forEach(e => {
    totals[e.currency] = (totals[e.currency] || 0) + e.amount;
  });
  return totals;
}

/**
 * Create JSON response with CORS headers
 */
function jsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // For CORS
  return output;
}

/**
 * Test function - run this to verify the script works
 */
function testSync() {
  const testData = {
    parameter: {
      action: 'sync',
      timestamp: new Date().toISOString(),
      currency: 'JPY',
      members: JSON.stringify([
        { id: 'm1', name: 'Alice' },
        { id: 'm2', name: 'Bob' }
      ]),
      expenses: JSON.stringify([
        {
          id: 'e1',
          description: 'Test Expense',
          amount: 1000,
          currency: 'JPY',
          paidBy: 'm1',
          splitAmong: ['m1', 'm2'],
          category: 'food',
          date: new Date().toISOString()
        }
      ]),
      settlements: JSON.stringify([
        { from: 'm2', to: 'm1', amount: 500 }
      ])
    }
  };
  
  const result = doPost(testData);
  console.log(result.getContent());
}

/**
 * Setup function - run this once to initialize
 */
function setup() {
  const spreadsheet = getOrCreateSpreadsheet();
  console.log('Spreadsheet created/opened: ' + spreadsheet.getUrl());
  console.log('Spreadsheet ID: ' + spreadsheet.getId());
  
  // Save the ID for future use
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', spreadsheet.getId());
  
  return 'Setup complete! Spreadsheet URL: ' + spreadsheet.getUrl();
}
