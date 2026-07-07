"use server";

import { SYSTEM_PROMPT } from "../config/systemPrompt";

export interface ReasoningResult {
  detectedLanguage: string;
  queryUnderstanding: string;
  serviceMatch: string;
  plainExplanation: string;
  actionSteps: string[];
  disclaimer: string;
  isMocked?: boolean;
}

// Fallback high-quality mock database for offline/demo robustness
const MOCK_SCENARIOS: {
  keywords: string[];
  english: ReasoningResult;
  hindi: ReasoningResult;
}[] = [
  {
    keywords: ["aadhaar", "aadhar", "uidai", "आधार"],
    english: {
      detectedLanguage: "English",
      queryUnderstanding: "The citizen wants to update or correct their details on their Aadhaar Card.",
      serviceMatch: "UIDAI (Unique Identification Authority of India) - myAadhaar Portal",
      plainExplanation: "Aadhaar details like address, name, or phone number can be updated online or at a local Aadhaar Seva Kendra by submitting valid identity and address proofs.",
      actionSteps: [
        "Step 1: Check if your mobile number is linked to Aadhaar. If yes, you can use the online myAadhaar (ssup.uidai.gov.in) portal.",
        "Step 2: Prepare proof documents (e.g., Passport, Voter ID, Bank Statement for Address). Keep color scans ready.",
        "Step 3: Log in using OTP, select 'Address Update', upload documents, and pay the ₹50 fee online. Track using the URN.",
        "Step 4: For biometric, photo, or mobile number changes, locate the nearest Aadhaar Seva Kendra and book an appointment online to avoid queues."
      ],
      disclaimer: "Please note that all updates are subject to verification by UIDAI officials. Check official status at uidai.gov.in."
    },
    hindi: {
      detectedLanguage: "Hindi (हिंदी)",
      queryUnderstanding: "नागरिक अपने आधार कार्ड में सुधार या जानकारी अपडेट करना चाहते हैं।",
      serviceMatch: "यूआईडीएआई (UIDAI) - माईआधार (myAadhaar) पोर्टल",
      plainExplanation: "आधार में नाम, पता या मोबाइल नंबर सुधारने के लिए मान्य पहचान पत्र के साथ ऑनलाइन या नजदीकी आधार केंद्र पर जाकर आवेदन किया जा सकता है।",
      actionSteps: [
        "चरण 1: सुनिश्चित करें कि आपका मोबाइल नंबर आधार से लिंक है। यदि हां, तो आप ssup.uidai.gov.in पर ऑनलाइन सुधार कर सकते हैं।",
        "चरण 2: आवश्यक दस्तावेज तैयार रखें (जैसे पते के लिए वोटर आईडी, बैंक स्टेटमेंट या पासपोर्ट)।",
        "चरण 3: पोर्टल पर लॉगिन करें, 'पता अपडेट करें' चुनें, दस्तावेज अपलोड करें और ₹50 का ऑनलाइन शुल्क भुगतान करें।",
        "चरण 4: मोबाइल नंबर या बायोमेट्रिक्स बदलने के लिए आपको नजदीकी आधार सेवा केंद्र पर ही जाना होगा।"
      ],
      disclaimer: "कृपया ध्यान दें कि सभी सुधार यूआईडीएआई के सत्यापन के अधीन हैं। आधिकारिक जानकारी uidai.gov.in पर देखें।"
    }
  },
  {
    keywords: ["ration", "ration card", "खाद्य", "राशन"],
    english: {
      detectedLanguage: "English",
      queryUnderstanding: "The citizen is asking how to apply for a new Ration Card or update family member details.",
      serviceMatch: "State Food and Civil Supplies Department (PDS Portal)",
      plainExplanation: "Ration cards are issued by state governments based on household income, requiring Aadhaar documents and income certificates.",
      actionSteps: [
        "Step 1: Obtain the application form online from your state's Food & Civil Supplies portal or offline from the Circle Office/Ration office.",
        "Step 2: Gather Aadhaar cards of all family members, passport-size photo of the head of family (typically female), and a valid income certificate.",
        "Step 3: Submit the completed form along with copies of documents. Obtain a physical acknowledgement receipt.",
        "Step 4: A Food Security Inspector will conduct a physical verification of your household before the card is issued (usually takes 15-30 days)."
      ],
      disclaimer: "Ration card categories (APL/BPL/AAY) depend strictly on state-level income criteria. Verify on your state's official PDS portal."
    },
    hindi: {
      detectedLanguage: "Hindi (हिंदी)",
      queryUnderstanding: "नागरिक नए राशन कार्ड के आवेदन या परिवार के सदस्य का नाम जोड़ने के बारे में पूछ रहे हैं।",
      serviceMatch: "राज्य खाद्य एवं नागरिक आपूर्ति विभाग (PDS पोर्टल)",
      plainExplanation: "राशन कार्ड राज्य सरकार द्वारा पारिवारिक आय के आधार पर जारी किए जाते हैं, जिसके लिए आधार कार्ड और आय प्रमाण पत्र आवश्यक हैं।",
      actionSteps: [
        "चरण 1: अपने राज्य के खाद्य आपूर्ति पोर्टल से या नजदीकी राशन कार्यालय से आवेदन फॉर्म प्राप्त करें।",
        "चरण 2: परिवार के सभी सदस्यों के आधार कार्ड, मुखिया (आमतौर पर महिला) की फोटो और आय प्रमाण पत्र एकत्रित करें।",
        "चरण 3: भरे हुए फॉर्म को सर्कल कार्यालय में जमा करें और रसीद अवश्य लें।",
        "चरण 4: खाद्य सुरक्षा निरीक्षक द्वारा आपके निवास का भौतिक सत्यापन किया जाएगा, जिसके बाद 15-30 दिनों में राशन कार्ड जारी होगा।"
      ],
      disclaimer: "राशन पात्रता श्रेणियां राज्य के नियमों पर निर्भर करती हैं। अपने राज्य के आधिकारिक खाद्य पोर्टल पर जांच करें।"
    }
  },
  {
    keywords: ["birth", "birth certificate", "जन्म", "जन्म प्रमाण"],
    english: {
      detectedLanguage: "English",
      queryUnderstanding: "The citizen wants to register a birth or obtain a birth certificate.",
      serviceMatch: "Local Municipal Corporation (e.g. MCD, BBMP) / Gram Panchayat",
      plainExplanation: "A birth must be registered within 21 days at the local municipality or panchayat office to obtain a free birth certificate.",
      actionSteps: [
        "Step 1: Retrieve the 'Birth Slip' or discharge summary from the hospital where the child was born.",
        "Step 2: Visit the local municipal office (urban) or Gram Panchayat (rural) where the birth occurred within 21 days.",
        "Step 3: Submit ID proofs of both parents (Aadhaar, Voter ID) and fill Form 1. Registration is free within the 21-day window.",
        "Step 4: If late (after 21 days), a small fee is charged, and you will require an affidavit verified by a Magistrate."
      ],
      disclaimer: "Late registrations require judicial order. Verify the process at your state's civil registration portal (crsorgi.gov.in)."
    },
    hindi: {
      detectedLanguage: "Hindi (हिंदी)",
      queryUnderstanding: "नागरिक जन्म पंजीकरण कराने या जन्म प्रमाण पत्र प्राप्त करने के बारे में जानना चाहते हैं।",
      serviceMatch: "स्थानीय नगर निगम (नगर पालिका) / ग्राम पंचायत कार्यालय",
      plainExplanation: "निःशुल्क जन्म प्रमाण पत्र प्राप्त करने के लिए जन्म के 21 दिनों के भीतर स्थानीय नगर निकाय या पंचायत में पंजीकरण कराना आवश्यक है।",
      actionSteps: [
        "चरण 1: उस अस्पताल से जन्म पर्ची (डिस्चार्ज समरी) प्राप्त करें जहां बच्चे का जन्म हुआ है।",
        "चरण 2: 21 दिनों के भीतर जन्म स्थान वाले क्षेत्र के नगर निगम कार्यालय या ग्राम पंचायत से संपर्क करें।",
        "चरण 3: माता-पिता दोनों के आधार कार्ड और फॉर्म 1 भरकर जमा करें। 21 दिनों में यह प्रक्रिया बिल्कुल मुफ्त है।",
        "चरण 4: 21 दिनों के बाद पंजीकरण कराने पर हलफनामा (एफिडेविट) और विलंब शुल्क की आवश्यकता होगी।"
      ],
      disclaimer: "देरी से पंजीकरण के लिए मजिस्ट्रेट की अनुमति अनिवार्य है। राज्य के crsorgi.gov.in पोर्टल पर विवरण देखें।"
    }
  },
  {
    keywords: ["rti", "right to information", "सूचना का अधिकार", "आरटीआई"],
    english: {
      detectedLanguage: "English",
      queryUnderstanding: "The citizen wants to file an RTI application to fetch information from a government department.",
      serviceMatch: "RTI Online Portal (rtionline.gov.in) / Public Information Officer (PIO)",
      plainExplanation: "Any citizen can file an RTI application online or via post to get official information, paying a base fee of ₹10.",
      actionSteps: [
        "Step 1: Identify the exact government department (Public Authority) holding the information you need.",
        "Step 2: Draft clear, specific questions. Avoid asking opinions; ask for records, documents, or data.",
        "Step 3: File online at rtionline.gov.in and pay the ₹10 fee via net banking/UPI (fee waived for BPL cardholders).",
        "Step 4: Alternatively, send a physical letter to the Public Information Officer (PIO) with a ₹10 Postal Order. The PIO must respond within 30 days."
      ],
      disclaimer: "RTI queries cannot violate national security exemptions (Section 8 of RTI Act). Read instructions carefully on rtionline.gov.in."
    },
    hindi: {
      detectedLanguage: "Hindi (हिंदी)",
      queryUnderstanding: "नागरिक किसी सरकारी विभाग से जानकारी प्राप्त करने के लिए आरटीआई (सूचना का अधिकार) आवेदन दर्ज करना चाहते हैं।",
      serviceMatch: "आरटीआई ऑनलाइन पोर्टल (rtionline.gov.in) / जन सूचना अधिकारी (PIO)",
      plainExplanation: "कोई भी नागरिक ₹10 का मामूली शुल्क देकर ऑनलाइन या डाक के माध्यम से आरटीआई दर्ज करके सरकारी रिकॉर्ड प्राप्त कर सकता है।",
      actionSteps: [
        "चरण 1: उस विभाग या सार्वजनिक प्राधिकरण की पहचान करें जिससे आपको जानकारी चाहिए।",
        "चरण 2: स्पष्ट और संक्षिप्त प्रश्न लिखें। केवल दस्तावेज या विशिष्ट डेटा की मांग करें, राय न मांगें।",
        "चरण 3: rtionline.gov.in पर जाएं, फॉर्म भरें और ₹10 का भुगतान करें (बीपीएल कार्डधारकों के लिए निःशुल्क)।",
        "चरण 4: शारीरिक रूप से आवेदन भेजने के लिए जन सूचना अधिकारी (PIO) को संबोधित पत्र के साथ ₹10 का पोस्टल आर्डर भेजें। उत्तर 30 दिन में मिलना अनिवार्य है।"
      ],
      disclaimer: "राष्ट्रीय सुरक्षा से जुड़े संवेदनशील विवरण आरटीआई के तहत नहीं दिए जा सकते। rtionline.gov.in पर दिशा-निर्देश देखें।"
    }
  },
  {
    keywords: ["pothole", "road", "street", "सड़क", "गड्ढा", "नाला"],
    english: {
      detectedLanguage: "English",
      queryUnderstanding: "The citizen is asking how to report a broken road, pothole, or public infrastructure issue in their neighborhood.",
      serviceMatch: "Local Municipal Corporation / Central PG Portal (pgportal.gov.in)",
      plainExplanation: "Civic issues like potholes are handled by municipal engineering divisions and can be reported online through public grievance cells.",
      actionSteps: [
        "Step 1: Take clear photos of the pothole or damaged road, preferably with recognizable landmarks in the background.",
        "Step 2: Note down the exact location, landmark, and ward number of the area.",
        "Step 3: Lodge a complaint on your local Municipal app (like MCD App, BBMP Sahaya, or BMC portal) or use pgportal.gov.in.",
        "Step 4: Keep the grievance number for tracking. If unresolved in 15 days, escalate to the Ward Commissioner."
      ],
      disclaimer: "Road ownership varies (National Highways vs Municipal roads). Check jurisdictional details on pgportal.gov.in."
    },
    hindi: {
      detectedLanguage: "Hindi (हिंदी)",
      queryUnderstanding: "नागरिक अपने क्षेत्र में सड़क के गड्ढों या खराब नागरिक अवसंरचना की शिकायत करने के बारे में पूछ रहे हैं।",
      serviceMatch: "स्थानीय नगर निगम / केंद्रीय लोक शिकायत पोर्टल (pgportal.gov.in)",
      plainExplanation: "सड़क के गड्ढों जैसी समस्याओं का निवारण स्थानीय नगर निगम करता है, जिसे ऑनलाइन या स्थानीय लोक शिकायत प्रकोष्ठ के माध्यम से रिपोर्ट किया जा सकता है।",
      actionSteps: [
        "चरण 1: खराब सड़क या गड्ढे की साफ तस्वीरें लें, जिसमें आसपास का कोई लैंडमार्क भी दिख रहा हो।",
        "चरण 2: सही पता, लैंडमार्क और अपने वार्ड नंबर की जानकारी नोट करें।",
        "चरण 3: अपने स्थानीय नगर निगम के ऐप या वेबसाइट पर शिकायत दर्ज करें या pgportal.gov.in का उपयोग करें।",
        "चरण 4: शिकायत क्रमांक सुरक्षित रखें। यदि 15 दिनों में सुनवाई न हो, तो वार्ड पार्षद या कमिश्नर को शिकायत करें।"
      ],
      disclaimer: "सड़कों का स्वामित्व अलग हो सकता है (जैसे एनएचएआई बनाम नगर निगम)। आधिकारिक पोर्टल pgportal.gov.in पर विवरण देखें।"
    }
  },
  {
    keywords: ["water", "supply", "dirty water", "drinking water", "पानी", "जल"],
    english: {
      detectedLanguage: "English",
      queryUnderstanding: "The citizen is facing water supply shortage, dirty water, or water pipe leaks.",
      serviceMatch: "State Jal Board / Public Health Engineering Department (PHED)",
      plainExplanation: "Municipal water supply complaints are logged with the state's Jal Board (Water Authority) using the consumer account number.",
      actionSteps: [
        "Step 1: Locate your latest water bill and note down your Consumer Connection Number (CAN / K-No).",
        "Step 2: Identify the type of issue: No supply, low pressure, or contaminated/dirty water.",
        "Step 3: Call the official toll-free helpline of your state Jal Board (e.g., Delhi Jal Board, DJB App) or register on their website.",
        "Step 4: For contaminated water, gather community signatures from neighbors to escalate the complaint quickly to the Assistant Engineer."
      ],
      disclaimer: "Verify municipal supply timings and connection status. Contact your local Jal Board office for direct support."
    },
    hindi: {
      detectedLanguage: "Hindi (हिंदी)",
      queryUnderstanding: "नागरिक पानी की कमी, गंदे पानी की आपूर्ति या पानी के पाइप लीक होने से परेशान हैं।",
      serviceMatch: "राज्य जल बोर्ड / जन स्वास्थ्य अभियांत्रिकी विभाग (PHED)",
      plainExplanation: "पानी की आपूर्ति से जुड़ी शिकायतों को उपभोक्ता कनेक्शन संख्या (CAN) का उपयोग करके सीधे राज्य जल बोर्ड में दर्ज किया जाता है।",
      actionSteps: [
        "चरण 1: अपने जल बिल से उपभोक्ता कनेक्शन संख्या (CAN या के-नंबर) ढूंढकर नोट करें।",
        "चरण 2: समस्या स्पष्ट करें: बिल्कुल पानी न आना, कम दबाव या गंदा/दूषित पानी आना।",
        "चरण 3: अपने राज्य के जल बोर्ड (जैसे दिल्ली जल बोर्ड) के हेल्पलाइन पर कॉल करें या ऑनलाइन पोर्टल पर शिकायत दर्ज करें।",
        "चरण 4: यदि पूरा मोहल्ला गंदे पानी से त्रस्त है, तो वार्ड के सहायक अभियंता को लिखित सामुदायिक शिकायत सौंपें।"
      ],
      disclaimer: "पेयजल गुणवत्ता और आपूर्ति समय की जानकारी के लिए अपने स्थानीय जल विभाग के आधिकारिक पोर्टल पर जाएं।"
    }
  },
  {
    keywords: ["pan", "aadhaar link", "pân", "पैन", "पैन कार्ड"],
    english: {
      detectedLanguage: "English",
      queryUnderstanding: "The citizen wants to know how to link their PAN card with their Aadhaar Card.",
      serviceMatch: "Income Tax e-Filing Portal (incometax.gov.in)",
      plainExplanation: "PAN-Aadhaar linking is mandatory for all taxpayers and must be completed online via the Income Tax portal after paying a ₹1000 fee.",
      actionSteps: [
        "Step 1: Visit the official Income Tax e-filing portal: incometax.gov.in.",
        "Step 2: Under Quick Links, click on 'Link Aadhaar'. Enter your PAN and Aadhaar number.",
        "Step 3: Pay the non-refundable fee of ₹1000 under Challan No. ITNS 280 (Major Head 0021, Minor Head 500) via e-pay Tax.",
        "Step 4: After payment, wait 48 hours, return to the portal, and submit the linking request. Check the status online to confirm."
      ],
      disclaimer: "Ensure your name, date of birth, and gender match exactly on both cards, otherwise the linking request will fail. Details at incometax.gov.in."
    },
    hindi: {
      detectedLanguage: "Hindi (हिंदी)",
      queryUnderstanding: "नागरिक अपने पैन कार्ड को आधार कार्ड से लिंक करने की प्रक्रिया जानना चाहते हैं।",
      serviceMatch: "आयकर विभाग ई-फाइलिंग पोर्टल (incometax.gov.in)",
      plainExplanation: "आयकर दाताओं के लिए पैन को आधार से जोड़ना अनिवार्य है, जो आयकर पोर्टल पर ₹1000 का विलंब शुल्क देकर किया जा सकता है।",
      actionSteps: [
        "चरण 1: आयकर विभाग की आधिकारिक वेबसाइट incometax.gov.in पर जाएं।",
        "चरण 2: 'क्विक लिंक्स' के तहत 'लिंक आधार' विकल्प पर क्लिक करें। अपना पैन और आधार नंबर डालें।",
        "चरण 3: ₹1000 के चालान का ई-पे टैक्स के माध्यम से ऑनलाइन भुगतान करें।",
        "चरण 4: भुगतान के 4-5 कार्य दिवसों के बाद, पुनः पोर्टल पर जाकर लिंकिंग सबमिट करें और स्टेटस चेक करें।"
      ],
      disclaimer: "सुनिश्चित करें कि दोनों दस्तावेजों पर आपका नाम और जन्मतिथि समान हो, अन्यथा आवेदन निरस्त हो जाएगा। incometax.gov.in पर देखें।"
    }
  },
  {
    keywords: ["pension", "old age", "widow", "पेंशन"],
    english: {
      detectedLanguage: "English",
      queryUnderstanding: "The citizen is asking about eligibility or application steps for Old Age, Widow, or Disability Pension.",
      serviceMatch: "Social Welfare Department / National Social Assistance Programme (NSAP)",
      plainExplanation: "Pensions are welfare schemes for senior citizens, widows, and disabled individuals, applied for via e-District portals with age and income verification.",
      actionSteps: [
        "Step 1: Check eligibility (e.g., Old Age usually requires age 60+ and family income below state-specific poverty limit).",
        "Step 2: Gather documents: Aadhaar card, Age Proof (Birth Certificate/School certificate), Bank Passbook copy, and Income Certificate.",
        "Step 3: Fill out the application form on your state's e-District portal or physically at the Block Development Office (BDO) / Tehsil office.",
        "Step 4: Ensure bank account is seeded with Aadhaar, as payments are sent directly via Direct Benefit Transfer (DBT)."
      ],
      disclaimer: "Pensions are state-funded and quotas vary. Verify latest rules at nsap.nic.in or your state's Social Welfare portal."
    },
    hindi: {
      detectedLanguage: "Hindi (हिंदी)",
      queryUnderstanding: "नागरिक वृद्धावस्था, विधवा या दिव्यांग पेंशन योजना के आवेदन और पात्रता के बारे में पूछ रहे हैं।",
      serviceMatch: "समाज कल्याण विभाग / राष्ट्रीय सामाजिक सहायता कार्यक्रम (NSAP)",
      plainExplanation: "पेंशन योजनाएं बुजुर्गों और असहाय महिलाओं के लिए हैं, जिनका आवेदन ई-डिस्ट्रिक्ट पोर्टल या ब्लॉक कार्यालय के जरिए किया जाता है।",
      actionSteps: [
        "चरण 1: पात्रता जांचें (जैसे वृद्धावस्था पेंशन के लिए न्यूनतम आयु 60 वर्ष और आय गरीबी रेखा से नीचे होनी चाहिए)।",
        "चरण 2: दस्तावेज तैयार रखें: आधार कार्ड, आयु प्रमाण पत्र, बैंक पासबुक और आय प्रमाण पत्र।",
        "चरण 3: अपने राज्य के ई-डिस्ट्रिक्ट पोर्टल पर आवेदन करें या तहसील/ब्लॉक कार्यालय में फॉर्म जमा करें।",
        "चरण 4: बैंक खाते को आधार से लिंक होना अनिवार्य है ताकि पेंशन राशि सीधे खाते (DBT) में आ सके।"
      ],
      disclaimer: "विभिन्न राज्यों में पेंशन राशि और पात्रता भिन्न हो सकती है। समाज कल्याण विभाग की आधिकारिक वेबसाइट nsap.nic.in पर जांच करें।"
    }
  }
];

// Helper to extract keywords and run mock analysis
function runMockAnalysis(query: string, langHint: "hi" | "en" = "en"): ReasoningResult {
  const lowercaseQuery = query.toLowerCase();
  
  // Find matching mock scenario
  const matched = MOCK_SCENARIOS.find(s => 
    s.keywords.some(keyword => lowercaseQuery.includes(keyword))
  );

  if (matched) {
    // If query has Hindi script or explicitly requested, or if matched keyword was Hindi
    const isHindi = /[\u0900-\u097F]/.test(query) || matched.keywords.some(k => /[\u0900-\u097F]/.test(k) && lowercaseQuery.includes(k)) || langHint === "hi";
    return {
      ...(isHindi ? matched.hindi : matched.english),
      isMocked: true
    };
  }

  // Fallback default response if no keyword matched
  const isHindiInput = /[\u0900-\u097F]/.test(query) || langHint === "hi";
  if (isHindiInput) {
    return {
      detectedLanguage: "Hindi (हिंदी)",
      queryUnderstanding: `नागरिक ने शिकायत या सेवा के संबंध में पूछा है: "${query.substring(0, 50)}..."`,
      serviceMatch: "स्थानीय जिला प्रशासन एवं जन शिकायत विभाग",
      plainExplanation: "नागरिक सेवाओं से जुड़ी विस्तृत जानकारी प्राप्त करने के लिए सही सरकारी विभाग और आवश्यक दस्तावेजों का होना अनिवार्य है।",
      actionSteps: [
        "चरण 1: अपनी समस्या या सेवा से संबंधित आवश्यक दस्तावेज (जैसे आधार कार्ड, निवास प्रमाण पत्र) तैयार करें।",
        "चरण 2: अपने राज्य के आधिकारिक ई-डिस्ट्रिक्ट (e-District) पोर्टल पर जाएं या नजदीकी जन सेवा केंद्र (CSC) से संपर्क करें।",
        "चरण 3: यदि यह कोई शिकायत है, तो केंद्रीय लोक शिकायत निवारण पोर्टल pgportal.gov.in पर अपनी शिकायत दर्ज करें और रसीद रखें।"
      ],
      disclaimer: "यह जानकारी सामान्य मार्गदर्शन के लिए है। कृपया आधिकारिक सरकारी वेबसाइट पर नियमों की पुष्टि करें।",
      isMocked: true
    };
  } else {
    return {
      detectedLanguage: "English",
      queryUnderstanding: `The citizen is querying about a general civic service or issue: "${query.substring(0, 50)}..."`,
      serviceMatch: "District Administration & Public Grievance Department",
      plainExplanation: "To navigate this civic service or lodge a complaint, you will need to map it to the respective state portal or local authority.",
      actionSteps: [
        "Step 1: Gather primary identity documents (Aadhaar, PAN, Voter ID) and proof of address.",
        "Step 2: Log in to your state's online e-District portal or visit a Common Service Centre (CSC) for offline filing.",
        "Step 3: For grievance complaints, use the centralized portal pgportal.gov.in or contact your local municipal body directly."
      ],
      disclaimer: "This guidance is educational. Please verify steps at the official state/central government website.",
      isMocked: true
    };
  }
}

export async function queryNagrikMitra(
  query: string,
  langHint: "hi" | "en" = "en"
): Promise<ReasoningResult> {
  // Ensure query is not empty
  if (!query || query.trim() === "") {
    throw new Error("Query cannot be empty");
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // Try real API calls if keys are present
  try {
    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: SYSTEM_PROMPT },
                  { text: `User Query: "${query}" (Language hint preference: ${langHint === "hi" ? "Hindi" : "English"})` }
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json"
            }
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return parsed as ReasoningResult;
        }
      }
    }

    if (openaiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `User Query: "${query}" (Language hint preference: ${langHint === "hi" ? "Hindi" : "English"})` },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return parsed as ReasoningResult;
        }
      }
    }

    if (anthropicKey) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 1024,
          system: SYSTEM_PROMPT + "\nNote: You MUST respond in valid JSON format only.",
          messages: [
            { role: "user", content: `User Query: "${query}" (Language hint preference: ${langHint === "hi" ? "Hindi" : "English"})` },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.content?.[0]?.text;
        if (content) {
          const parsed = JSON.parse(content);
          return parsed as ReasoningResult;
        }
      }
    }
  } catch (error) {
    console.error("LLM API error, falling back to mock database:", error);
  }

  // Fallback to high-quality matching mock system
  return runMockAnalysis(query, langHint);
}
