import { createWorker } from 'tesseract.js';

/**
 * Extracts structured data from a business card image using OCR and NLP
 */
export async function extractCardData(imageFile) {
  // Initialize Tesseract worker
  const worker = await createWorker('eng');
  
  try {
    // Perform OCR
    const { data: { text } } = await worker.recognize(imageFile);
    
    // Extract structured information
    const extractedData = parseCardText(text);
    extractedData.rawText = text;
    
    return extractedData;
  } finally {
    await worker.terminate();
  }
}

/**
 * Intelligently parses OCR text to extract contact information
 */
function parseCardText(text) {
  const data = {
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    company: '',
    jobTitle: '',
    website: '',
    address: ''
  };

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Email extraction (regex)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  if (emails && emails.length > 0) {
    data.email = emails[0];
  }

  // Phone extraction (various formats)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g;
  const phones = text.match(phoneRegex);
  if (phones && phones.length > 0) {
    // Clean and format phone number
    let phone = phones[0].replace(/[-.\s()]/g, '');
    if (phone.length === 10) {
      phone = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    data.phone = phone;
  }

  // LinkedIn extraction
  const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/|@)([a-zA-Z0-9-]+)/gi;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch && linkedinMatch.length > 0) {
    const linkedinUrl = linkedinMatch[0].startsWith('linkedin.com') 
      ? `https://www.${linkedinMatch[0]}`
      : linkedinMatch[0].startsWith('@')
      ? `https://www.linkedin.com/in/${linkedinMatch[0].substring(1)}`
      : `https://www.${linkedinMatch[0]}`;
    data.linkedin = linkedinUrl;
  }

  // Website extraction
  const websiteRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/g;
  const websites = text.match(websiteRegex);
  if (websites && websites.length > 0) {
    // Filter out emails and LinkedIn URLs
    const website = websites.find(w => 
      !w.includes('@') && 
      !w.includes('linkedin.com') &&
      !w.includes('facebook.com') &&
      !w.includes('twitter.com')
    );
    if (website) {
      data.website = website.startsWith('http') ? website : `https://${website}`;
    }
  }

  // Name extraction (usually first line or line with title-like words)
  // Remove extracted emails, phones, URLs from lines
  const cleanLines = lines.map(line => {
    let cleanLine = line;
    if (data.email) cleanLine = cleanLine.replace(data.email, '');
    if (data.phone) cleanLine = cleanLine.replace(data.phone.replace(/[-()]/g, ''), '');
    if (data.linkedin) cleanLine = cleanLine.replace(data.linkedin, '');
    if (data.website) cleanLine = cleanLine.replace(data.website, '');
    return cleanLine.trim();
  }).filter(line => line.length > 1 && !line.match(/^[^a-zA-Z]*$/));

  if (cleanLines.length > 0) {
    // First substantial line is often the name
    const nameLine = cleanLines.find(line => 
      line.split(' ').length <= 4 && 
      line.split(' ').every(word => word.length > 1) &&
      !line.toLowerCase().includes('inc') &&
      !line.toLowerCase().includes('ltd') &&
      !line.toLowerCase().includes('llc')
    ) || cleanLines[0];
    
    if (nameLine) {
      data.name = nameLine;
    }
  }

  // Company extraction (look for lines with business suffixes)
  const companyKeywords = ['inc', 'ltd', 'llc', 'corp', 'company', 'co', 'group', 'technologies', 'solutions'];
  const companyLine = cleanLines.find(line => {
    const lowerLine = line.toLowerCase();
    return companyKeywords.some(keyword => lowerLine.includes(keyword)) ||
           (line.length > 5 && line.length < 50 && line.split(' ').length <= 5);
  });
  
  if (companyLine && companyLine !== data.name) {
    data.company = companyLine;
  }

  // Job title extraction (common titles)
  const titleKeywords = [
    'ceo', 'cto', 'cfo', 'president', 'director', 'manager', 
    'engineer', 'developer', 'designer', 'consultant', 'founder',
    'executive', 'vp', 'vice president', 'head of', 'lead', 'senior'
  ];
  const titleLine = cleanLines.find(line => {
    const lowerLine = line.toLowerCase();
    return titleKeywords.some(keyword => lowerLine.includes(keyword));
  });
  
  if (titleLine && titleLine !== data.name && titleLine !== data.company) {
    data.jobTitle = titleLine;
  }

  // Address extraction (look for patterns like street numbers, zip codes)
  const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Suite|Ste)[\s,]+[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/gi;
  const addressMatch = text.match(addressRegex);
  if (addressMatch && addressMatch.length > 0) {
    data.address = addressMatch[0].trim();
  }

  // Clean up extracted data
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      data[key] = data[key].trim();
    }
  });

  return data;
}

