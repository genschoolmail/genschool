// Driver Module Translations - Hindi and English

export type Language = 'en' | 'hi';

export const driverTranslations = {
    // Dashboard
    hello: { en: 'Hello', hi: 'नमस्ते' },
    readyForTrip: { en: 'Ready for the trip?', hi: 'यात्रा के लिए तैयार?' },
    startTrip: { en: 'Start Trip', hi: 'यात्रा शुरू करें' },
    endTrip: { en: 'End Trip', hi: 'यात्रा खत्म करें' },
    noRouteAssigned: { en: 'No route assigned to you.', hi: 'आपको कोई रूट असाइन नहीं है।' },

    // Stats
    total: { en: 'Total', hi: 'कुल' },
    picked: { en: 'Picked', hi: 'पिक हुए' },
    dropped: { en: 'Dropped', hi: 'ड्रॉप हुए' },
    students: { en: 'Students', hi: 'छात्र' },
    todayStatus: { en: "Today's Status", hi: 'आज की स्थिति' },

    // Quick Actions
    studentsLabel: { en: 'Students', hi: 'छात्र' },
    pickupDrop: { en: 'Pickup & Drop', hi: 'पिक और ड्रॉप' },
    routeMap: { en: 'Route Map', hi: 'रूट मैप' },
    viewStops: { en: 'View Stops', hi: 'स्टॉप देखें' },
    qrScan: { en: 'QR Scan', hi: 'QR स्कैन' },
    quickMark: { en: 'Quick Mark', hi: 'जल्दी मार्क करें' },

    // Route Stops
    routeStops: { en: 'Route Stops', hi: 'रूट स्टॉप' },
    noTime: { en: 'No time', hi: 'समय नहीं' },
    pickup: { en: 'Pickup', hi: 'पिक' },
    drop: { en: 'Drop', hi: 'ड्रॉप' },

    // Student List
    myStudents: { en: 'My Students', hi: 'मेरे छात्र' },
    route: { en: 'Route', hi: 'रूट' },
    loadingStudents: { en: 'Loading students...', hi: 'छात्र लोड हो रहे हैं...' },
    noStudentsAssigned: { en: 'No students assigned to this route', hi: 'इस रूट पर कोई छात्र नहीं है' },
    studentsByStop: { en: 'Students by Stop', hi: 'स्टॉप के अनुसार छात्र' },
    searchStudent: { en: 'Search student', hi: 'छात्र खोजें' },
    allStudents: { en: 'All Students', hi: 'सभी छात्र' },
    onBus: { en: 'On Bus', hi: 'बस में' },
    noStudentsFound: { en: 'No students found', hi: 'कोई छात्र नहीं मिला' },

    // Actions
    pickupBtn: { en: 'Pickup', hi: 'पिक करें' },
    dropBtn: { en: 'Drop', hi: 'ड्रॉप करें' },
    done: { en: 'Done', hi: 'हो गया' },
    confirm: { en: 'Confirm', hi: 'कन्फर्म करें' },
    cancel: { en: 'Cancel', hi: 'रद्द करें' },
    processing: { en: 'Processing...', hi: 'प्रोसेसिंग...' },

    // Scan Page
    scanQR: { en: 'Scan QR', hi: 'QR स्कैन करें' },
    scanWithBackCamera: { en: 'Scan with back camera', hi: 'बैक कैमरा से स्कैन करें' },
    readyToScan: { en: 'Ready to scan', hi: 'स्कैन के लिए तैयार' },
    scanStudentQR: { en: "Scan student's ID card QR", hi: 'छात्र के ID कार्ड पर QR स्कैन करें' },
    startPickupScan: { en: 'Start Pickup Scan', hi: 'Pickup स्कैन शुरू करें' },
    startDropScan: { en: 'Start Drop Scan', hi: 'Drop स्कैन शुरू करें' },
    bringQRToBox: { en: 'Bring QR code to the box', hi: 'QR कोड को बॉक्स में लाएं' },
    pickupMarked: { en: 'Will be marked as Pickup', hi: 'Pickup मार्क होगा' },
    dropMarked: { en: 'Will be marked as Drop', hi: 'Drop मार्क होगा' },
    confirmPickup: { en: 'Confirm Pickup', hi: 'Pickup कन्फर्म करें' },
    confirmDrop: { en: 'Confirm Drop', hi: 'Drop कन्फर्म करें' },
    pickupDone: { en: 'Pickup Done!', hi: 'Pickup हो गया!' },
    dropDone: { en: 'Drop Done!', hi: 'Drop हो गया!' },
    scanNextStudent: { en: 'Scan next student', hi: 'अगला छात्र स्कैन करें' },
    orManualMark: { en: 'or mark manually', hi: 'या मैन्युअल रूप से मार्क करें' },

    // Status Messages
    studentFound: { en: 'Student found!', hi: 'छात्र मिल गया!' },
    studentNotFound: { en: 'Student not found', hi: 'छात्र नहीं मिला' },
    alreadyPickedUp: { en: 'Already picked up', hi: 'पहले से पिक हो चुका है' },
    needsPickupFirst: { en: 'Needs pickup first', hi: 'पहले पिक करना होगा' },
    alreadyDropped: { en: 'Already dropped', hi: 'पहले से ड्रॉप हो चुका है' },
    pickupSuccess: { en: 'picked up!', hi: 'को पिक किया!' },
    dropSuccess: { en: 'dropped off!', hi: 'को ड्रॉप किया!' },
    pickupFailed: { en: 'Failed to mark pickup', hi: 'पिक मार्क नहीं हो पाया' },
    dropFailed: { en: 'Failed to mark drop', hi: 'ड्रॉप मार्क नहीं हो पाया' },
    transportNotAssigned: { en: "Student's transport not assigned", hi: 'छात्र का transport असाइन नहीं है' },
    somethingWentWrong: { en: 'Something went wrong', hi: 'कुछ गलत हो गया' },
    qrProcessFailed: { en: 'QR code process failed', hi: 'QR कोड प्रोसेस नहीं हो पाया' },
    cameraAccessDenied: { en: 'Camera access denied. Please grant camera permission.', hi: 'कैमरा एक्सेस नहीं मिला। कृपया कैमरा परमिशन दें।' },

    // Picked Students List
    pickedStudents: { en: 'Picked Students', hi: 'पिक हुए छात्र' },
    noStudentsPicked: { en: 'No students picked yet', hi: 'अभी कोई छात्र पिक नहीं हुआ' },
    currentlyOnBus: { en: 'Currently on bus', hi: 'अभी बस में हैं' },

    // Profile
    myProfile: { en: 'My Profile', hi: 'मेरी प्रोफाइल' },
    driverDetails: { en: 'Driver Details', hi: 'ड्राइवर विवरण' },
    name: { en: 'Name', hi: 'नाम' },
    email: { en: 'Email', hi: 'ईमेल' },
    phone: { en: 'Phone', hi: 'फोन' },
    role: { en: 'Role', hi: 'भूमिका' },
    license: { en: 'License No', hi: 'लाइसेंस नंबर' },
    vehicle: { en: 'Vehicle', hi: 'वाहन' },
    routeInfo: { en: 'Route Info', hi: 'रूट जानकारी' },
    language: { en: 'Language', hi: 'भाषा' },
    english: { en: 'English', hi: 'अंग्रेज़ी' },
    hindi: { en: 'Hindi', hi: 'हिंदी' },
    signOut: { en: 'Sign Out', hi: 'साइन आउट' },
    settings: { en: 'Settings', hi: 'सेटिंग्स' },

    // Bottom Nav
    home: { en: 'Home', hi: 'होम' },
    map: { en: 'Map', hi: 'मैप' },
    scan: { en: 'Scan', hi: 'स्कैन' },
    profile: { en: 'Profile', hi: 'प्रोफाइल' },

    // Emergency
    emergency: { en: 'Emergency', hi: 'आपातकाल' }
};

// Helper function to get translation
export function t(key: keyof typeof driverTranslations, lang: Language): string {
    return driverTranslations[key]?.[lang] || driverTranslations[key]?.['en'] || key;
}
