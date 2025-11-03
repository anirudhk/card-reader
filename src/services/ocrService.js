import { createWorker } from 'tesseract.js';

/**
 * Main OCR service - Uses Google Vision API if available, falls back to Tesseract
 */
export async function extractCardData(imageFile, options = {}) {
  const { visionApiKey } = options;
  
  // Try Google Vision API first if API key is provided
  if (visionApiKey) {
    try {
      const data = await extractWithGoogleVision(imageFile, visionApiKey);
      if (data && data.rawText && data.rawText.length > 10) {
        return data;
      }
    } catch (error) {
      console.warn('Google Vision API failed, falling back to Tesseract:', error);
      // Fall through to Tesseract
    }
  }
  
  // Fallback to Tesseract (or use if no API key)
  return await extractWithTesseract(imageFile);
}

/**
 * Extract text using Google Cloud Vision API (More Accurate)
 */
async function extractWithGoogleVision(imageFile, apiKey) {
  // Convert image to base64
  const base64Image = await fileToBase64(imageFile);
  
  // Remove data URL prefix if present
  const imageData = base64Image.includes(',') 
    ? base64Image.split(',')[1] 
    : base64Image;
  
  // Call Google Vision API
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageData
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              },
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Google Vision API error');
  }

  const result = await response.json();
  
  // Extract text from the best result (DOCUMENT_TEXT_DETECTION is more accurate)
  const annotations = result.responses?.[0];
  let text = '';
  
  if (annotations?.fullTextAnnotation?.text) {
    text = annotations.fullTextAnnotation.text;
  } else if (annotations?.textAnnotations?.[0]?.description) {
    text = annotations.textAnnotations[0].description;
  }
  
  if (!text || text.length < 5) {
    throw new Error('No text detected in image');
  }
  
  // Extract structured information
  const extractedData = parseCardText(text);
  extractedData.rawText = text;
  extractedData.ocrMethod = 'Google Vision API';
  
  return extractedData;
}

/**
 * Extract text using Tesseract.js (Fallback / Offline option)
 */
async function extractWithTesseract(imageFile) {
  const worker = await createWorker('eng');
  
  try {
    const { data: { text } } = await worker.recognize(imageFile);
    
    if (!text || text.length < 5) {
      throw new Error('No text detected in image');
    }
    
    const extractedData = parseCardText(text);
    extractedData.rawText = text;
    extractedData.ocrMethod = 'Tesseract.js (Offline)';
    
    return extractedData;
  } finally {
    await worker.terminate();
  }
}

/**
 * Convert file to base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Intelligently parses OCR text to extract contact information
 * Enhanced with better pattern matching and AI-like understanding
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

  // Phone extraction (various formats - improved patterns)
  const phoneRegex = /(?:\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}|\d{7,15}/g;
  const phones = text.match(phoneRegex) || [];
  
  // Filter and clean phone numbers
  const validPhones = phones
    .map(p => p.replace(/[-.\s()]/g, ''))
    .filter(p => p.length >= 7 && p.length <= 15 && /^\d+$/.test(p));
  
  if (validPhones.length > 0) {
    let phone = validPhones[0];
    if (phone.length === 10) {
      phone = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    } else if (phone.length === 11 && phone.startsWith('1')) {
      phone = `+1 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7)}`;
    }
    data.phone = phone;
  }

  // LinkedIn extraction (improved patterns)
  const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/|linkedin\.com\/profile\/|@)([a-zA-Z0-9-]+)/gi;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch && linkedinMatch.length > 0) {
    let linkedinUrl = linkedinMatch[0];
    if (!linkedinUrl.startsWith('http')) {
      if (linkedinUrl.startsWith('@')) {
        linkedinUrl = `https://www.linkedin.com/in/${linkedinUrl.substring(1)}`;
      } else if (linkedinUrl.startsWith('linkedin.com')) {
        linkedinUrl = `https://www.${linkedinUrl}`;
      }
    }
    data.linkedin = linkedinUrl;
  }

  // Website extraction (improved - better filtering)
  const websiteRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.(?:com|org|net|io|co|ai|dev|tech|app|online|website|info|biz|us|uk|ca|au|in|de|fr|es|it|jp|cn|ru|br|mx)[a-zA-Z0-9\/-]*)/gi;
  const websites = text.match(websiteRegex) || [];
  
  if (websites.length > 0) {
    const website = websites.find(w => {
      const lowerW = w.toLowerCase();
      return !lowerW.includes('@') && 
             !lowerW.includes('linkedin') &&
             !lowerW.includes('facebook') &&
             !lowerW.includes('twitter') &&
             !lowerW.includes('instagram') &&
             !lowerW.includes('github') &&
             !lowerW.includes('gmail') &&
             !lowerW.includes('yahoo') &&
             !lowerW.includes('outlook');
    });
    if (website) {
      data.website = website.startsWith('http') ? website : `https://${website}`;
    }
  }

  // Clean lines for name/company/title extraction
  const cleanLines = lines.map(line => {
    let cleanLine = line;
    if (data.email) cleanLine = cleanLine.replace(data.email, '');
    if (data.phone) cleanLine = cleanLine.replace(data.phone.replace(/[-()+\s]/g, ''), '');
    if (data.linkedin) cleanLine = cleanLine.replace(data.linkedin, '');
    if (data.website) cleanLine = cleanLine.replace(data.website, '');
    return cleanLine.trim();
  }).filter(line => {
    return line.length > 1 && 
           !line.match(/^[^a-zA-Z]*$/) &&
           !line.match(/^[0-9\s\-\.\(\)]+$/); // Not just numbers/symbols
  });

  // Name extraction (improved heuristics)
  if (cleanLines.length > 0) {
    // Look for name patterns: 2-4 words, proper capitalization, not company keywords
    const nameLine = cleanLines.find(line => {
      const words = line.split(/\s+/).filter(w => w.length > 0);
      const hasNamePattern = words.length >= 2 && words.length <= 4;
      const hasProperCase = words.some(w => /^[A-Z][a-z]+$/.test(w));
      const notCompany = !line.toLowerCase().match(/\b(inc|ltd|llc|corp|company|co|group|technologies|solutions|systems|services)\b/);
      const notAllCaps = !line.match(/^[A-Z\s]+$/);
      
      return hasNamePattern && (hasProperCase || notAllCaps) && notCompany;
    }) || cleanLines.find(line => {
      // Fallback: first line that's not too long and has letters
      return line.length > 3 && line.length < 50 && /[A-Za-z]/.test(line);
    });
    
    if (nameLine && nameLine.length > 2 && nameLine.length < 60) {
      data.name = nameLine;
    }
  }

  // Company extraction (improved)
  const companyKeywords = ['inc', 'ltd', 'llc', 'corp', 'corporation', 'company', 'co', 'group', 
                          'technologies', 'tech', 'solutions', 'systems', 'services', 'consulting',
                          'associates', 'partners', 'ventures', 'capital'];
  
  const companyLine = cleanLines.find(line => {
    const lowerLine = line.toLowerCase();
    const hasKeyword = companyKeywords.some(keyword => 
      new RegExp(`\\b${keyword}\\b`).test(lowerLine)
    );
    const reasonableLength = line.length > 3 && line.length < 60;
    const notName = line !== data.name;
    
    return (hasKeyword || (reasonableLength && line.match(/^[A-Z\s&.,]+$/))) && notName;
  });
  
  if (companyLine) {
    data.company = companyLine;
  }

  // Job title extraction (enhanced keywords)
  const titleKeywords = [
    'ceo', 'chief executive', 'cto', 'chief technology', 'cfo', 'chief financial',
    'president', 'founder', 'co-founder', 'director', 'manager', 'lead',
    'engineer', 'developer', 'designer', 'consultant', 'specialist',
    'executive', 'vp', 'vice president', 'head of', 'senior', 'junior',
    'principal', 'architect', 'analyst', 'coordinator', 'administrator',
    'supervisor', 'coordinator', 'officer', 'associate', 'assistant'
  ];
  
  const titleLine = cleanLines.find(line => {
    const lowerLine = line.toLowerCase();
    return titleKeywords.some(keyword => lowerLine.includes(keyword)) &&
           line !== data.name && 
           line !== data.company &&
           line.length < 50;
  });
  
  if (titleLine) {
    data.jobTitle = titleLine;
  }

  // Address extraction (improved patterns)
  const addressPatterns = [
    /\d+\s+[A-Za-z0-9\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Suite|Ste|Unit|Apt)[\s,]+[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?/gi,
    /\d+\s+[A-Za-z\s]+,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s+\d{5}/gi,
    /\d{1,5}\s+\w+\s+(?:street|st|avenue|ave|road|rd|drive|dr)\s*,?\s*[a-z\s]+,?\s*[a-z]{2}\s+\d{5}/gi
  ];
  
  for (const pattern of addressPatterns) {
    const addressMatch = text.match(pattern);
    if (addressMatch && addressMatch.length > 0) {
      data.address = addressMatch[0].trim();
      break;
    }
  }

  // Clean up extracted data
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      data[key] = data[key].trim().replace(/\s+/g, ' ');
    }
  });

  return data;
}
