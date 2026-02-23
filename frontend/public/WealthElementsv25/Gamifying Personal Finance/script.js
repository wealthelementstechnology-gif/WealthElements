// Game Configuration
const POINTS_CONFIG = {
    SIP_TOPUP: 50,
    CORPUS_REACHED: 100,
    QUIZ_CORRECT: 25
};

// Reward Configuration
const REWARDS = {
    100: {
        type: 'standard',
        icon: '🎁',
        name: 'Welcome Bonus',
        desc: '₹50 Amazon Voucher',
        code: 'AMZN50WELCOME'
    },
    200: {
        type: 'standard',
        icon: '🎧',
        name: 'BoAt Reward',
        desc: '10% Off Coupon',
        code: 'BOAT10OFF'
    },
    300: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🍔', name: 'Swiggy Voucher', desc: '₹100 Off', code: 'SWIGGY100' },
            { icon: '🎮', name: 'Steam Gaming', desc: '15% Off', code: 'STEAM15' }
        ]
    },
    400: {
        type: 'standard',
        icon: '✈️',
        name: 'MakeMyTrip',
        desc: '₹200 Off Coupon',
        code: 'MMT200OFF'
    },
    500: {
        type: 'cashback',
        icon: '💵',
        name: 'Cashback!',
        desc: '1% of Monthly SIP'
    },
    600: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '☕', name: 'Starbucks', desc: '₹150 Voucher', code: 'SBUX150' },
            { icon: '🍕', name: 'Dominos Pizza', desc: '₹200 Off', code: 'DOMINOS200' }
        ]
    },
    700: {
        type: 'standard',
        icon: '🍿',
        name: 'BookMyShow',
        desc: 'Movie Voucher ₹300',
        code: 'BMS300'
    },
    800: {
        type: 'standard',
        icon: '🛍️',
        name: 'Flipkart',
        desc: '₹250 Voucher',
        code: 'FLIP250'
    },
    900: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🏋️', name: 'CultFit', desc: '1 Month Membership', code: 'CULT1M' },
            { icon: '📚', name: 'Audible', desc: '3 Months Free', code: 'AUDIBLE3M' }
        ]
    },
    1000: {
        type: 'cashback',
        icon: '💵',
        name: 'Cashback!',
        desc: '1% of Monthly SIP'
    },
    1100: {
        type: 'standard',
        icon: '🛒',
        name: 'BigBasket',
        desc: '₹300 Grocery Voucher',
        code: 'BIGBASK300'
    },
    1200: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🎧', name: 'Spotify Premium', desc: '6 Months Free', code: 'SPOTIFY6M' },
            { icon: '📺', name: 'Netflix', desc: '2 Months Free', code: 'NETFLIX2M' }
        ]
    },
    1300: {
        type: 'standard',
        icon: '🚗',
        name: 'Uber',
        desc: '₹400 Ride Credits',
        code: 'UBER400'
    },
    1400: {
        type: 'standard',
        icon: '👟',
        name: 'Nike',
        desc: '20% Off Coupon',
        code: 'NIKE20OFF'
    },
    1500: {
        type: 'cashback',
        icon: '💵',
        name: 'Cashback!',
        desc: '1.5% of Monthly SIP'
    },
    1600: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '📱', name: 'Jio Recharge', desc: '₹300 Cashback', code: 'JIO300' },
            { icon: '⚡', name: 'Electricity Bill', desc: '₹250 Off', code: 'ELEC250' }
        ]
    },
    1700: {
        type: 'standard',
        icon: '🏨',
        name: 'OYO Rooms',
        desc: '₹500 Off Booking',
        code: 'OYO500OFF'
    },
    1800: {
        type: 'standard',
        icon: '📖',
        name: 'Amazon Kindle',
        desc: '3 Free Books',
        code: 'KINDLE3'
    },
    1900: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🍽️', name: 'Zomato Gold', desc: '2 Months Free', code: 'ZOMATO2M' },
            { icon: '🚴', name: 'Rapido', desc: '₹200 Credits', code: 'RAPIDO200' }
        ]
    },
    2000: {
        type: 'cashback',
        icon: '💵',
        name: 'Big Cashback!',
        desc: '1.5% of Monthly SIP'
    },
    2100: {
        type: 'standard',
        icon: '💻',
        name: 'Microsoft Store',
        desc: '₹600 Voucher',
        code: 'MS600'
    },
    2200: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🎮', name: 'PlayStation Plus', desc: '3 Months', code: 'PS3M' },
            { icon: '🎯', name: 'Xbox Game Pass', desc: '3 Months', code: 'XBOX3M' }
        ]
    },
    2300: {
        type: 'standard',
        icon: '✈️',
        name: 'Cleartrip',
        desc: '₹700 Flight Voucher',
        code: 'CLEAR700'
    },
    2400: {
        type: 'standard',
        icon: '🛍️',
        name: 'Myntra',
        desc: '₹500 Fashion Voucher',
        code: 'MYNTRA500'
    },
    2500: {
        type: 'cashback',
        icon: '💵',
        name: 'Mega Cashback!',
        desc: '2% of Monthly SIP'
    },
    2600: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🏋️', name: 'HealthifyMe Pro', desc: '6 Months', code: 'HEALTH6M' },
            { icon: '🧘', name: 'Yoga Classes', desc: '3 Months Free', code: 'YOGA3M' }
        ]
    },
    2700: {
        type: 'standard',
        icon: '🎬',
        name: 'Disney+ Hotstar',
        desc: '1 Year Subscription',
        code: 'DISNEY1Y'
    },
    2800: {
        type: 'standard',
        icon: '🍔',
        name: 'McDonald\'s',
        desc: '₹400 Meal Voucher',
        code: 'MCD400'
    },
    2900: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '☕', name: 'Cafe Coffee Day', desc: '₹500 Voucher', code: 'CCD500' },
            { icon: '🍰', name: 'Baskin Robbins', desc: '₹300 Voucher', code: 'BR300' }
        ]
    },
    3000: {
        type: 'cashback',
        icon: '💵',
        name: 'Super Cashback!',
        desc: '2% of Monthly SIP'
    },
    3100: {
        type: 'standard',
        icon: '🎨',
        name: 'Adobe Creative',
        desc: '1 Month Subscription',
        code: 'ADOBE1M'
    },
    3200: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '📚', name: 'Coursera Plus', desc: '3 Months Access', code: 'COURSERA3M' },
            { icon: '💡', name: 'Udemy Courses', desc: '₹1000 Credit', code: 'UDEMY1000' }
        ]
    },
    3300: {
        type: 'standard',
        icon: '⌚',
        name: 'Titan',
        desc: '25% Off Watches',
        code: 'TITAN25'
    },
    3400: {
        type: 'standard',
        icon: '🛍️',
        name: 'Nykaa',
        desc: '₹700 Beauty Voucher',
        code: 'NYKAA700'
    },
    3500: {
        type: 'cashback',
        icon: '💵',
        name: 'Ultra Cashback!',
        desc: '2.5% of Monthly SIP'
    },
    3600: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🎵', name: 'Apple Music', desc: '6 Months Free', code: 'APPLE6M' },
            { icon: '🎧', name: 'JioSaavn Pro', desc: '1 Year Free', code: 'SAAVN1Y' }
        ]
    },
    3700: {
        type: 'standard',
        icon: '🏃',
        name: 'Decathlon',
        desc: '₹800 Sports Voucher',
        code: 'DECA800'
    },
    3800: {
        type: 'standard',
        icon: '📱',
        name: 'Croma',
        desc: '₹1000 Electronics',
        code: 'CROMA1000'
    },
    3900: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🚖', name: 'Ola Cabs', desc: '₹600 Credits', code: 'OLA600' },
            { icon: '🛵', name: 'Bounce Bikes', desc: '₹400 Credits', code: 'BOUNCE400' }
        ]
    },
    4000: {
        type: 'cashback',
        icon: '💵',
        name: 'Mega Cashback!',
        desc: '2.5% of Monthly SIP'
    },
    4100: {
        type: 'standard',
        icon: '🍽️',
        name: 'Barbeque Nation',
        desc: '₹800 Dining Voucher',
        code: 'BBQ800'
    },
    4200: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🏠', name: 'Urban Company', desc: '₹700 Service Credit', code: 'UC700' },
            { icon: '🧹', name: 'Housejoy', desc: '₹500 Credit', code: 'HJ500' }
        ]
    },
    4300: {
        type: 'standard',
        icon: '📸',
        name: 'Canon Store',
        desc: '₹1200 Photo Voucher',
        code: 'CANON1200'
    },
    4400: {
        type: 'standard',
        icon: '🎁',
        name: 'Ferns N Petals',
        desc: '₹600 Gift Voucher',
        code: 'FNP600'
    },
    4500: {
        type: 'cashback',
        icon: '💵',
        name: 'Premium Cashback!',
        desc: '3% of Monthly SIP'
    },
    4600: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '📚', name: 'LinkedIn Learning', desc: '6 Months Free', code: 'LINKEDIN6M' },
            { icon: '💼', name: 'Grammarly Premium', desc: '1 Year Free', code: 'GRAM1Y' }
        ]
    },
    4700: {
        type: 'standard',
        icon: '🏨',
        name: 'Airbnb',
        desc: '₹1500 Stay Credit',
        code: 'AIR1500'
    },
    4800: {
        type: 'standard',
        icon: '🛍️',
        name: 'Tata CLiQ',
        desc: '₹1000 Shopping',
        code: 'TATA1000'
    },
    4900: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🎮', name: 'Epic Games', desc: '₹1000 Credit', code: 'EPIC1000' },
            { icon: '🎯', name: 'Google Play', desc: '₹800 Credit', code: 'PLAY800' }
        ]
    },
    5000: {
        type: 'cashback',
        icon: '💵',
        name: 'Ultimate Cashback!',
        desc: '3% of Monthly SIP'
    },
    // Extended rewards up to 25000 points
    5500: {
        type: 'standard',
        icon: '🎵',
        name: 'Concert Tickets',
        desc: '₹2000 Live Show',
        code: 'CONCERT2K'
    },
    6000: {
        type: 'cashback',
        icon: '💵',
        name: 'Elite Cashback!',
        desc: '3.5% of Monthly SIP'
    },
    6500: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🎮', name: 'Nintendo Switch', desc: '₹1500 Discount', code: 'NINTENDO1500' },
            { icon: '📱', name: 'Apple Store', desc: '₹1500 Credit', code: 'APPLE1500' }
        ]
    },
    7000: {
        type: 'standard',
        icon: '✈️',
        name: 'International Flight',
        desc: '₹3000 Off',
        code: 'INTL3K'
    },
    7500: {
        type: 'cashback',
        icon: '💵',
        name: 'Premium Cashback!',
        desc: '4% of Monthly SIP'
    },
    8000: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🏋️', name: 'Gym Membership', desc: '1 Year Free', code: 'GYM1Y' },
            { icon: '🧘', name: 'Meditation App', desc: 'Lifetime Access', code: 'MEDITATE' }
        ]
    },
    8500: {
        type: 'standard',
        icon: '💻',
        name: 'Laptop Upgrade',
        desc: '₹5000 Off',
        code: 'LAPTOP5K'
    },
    9000: {
        type: 'cashback',
        icon: '💵',
        name: 'Super Elite Cashback!',
        desc: '4.5% of Monthly SIP'
    },
    9500: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🎬', name: 'Video Editing Suite', desc: '6 Months Pro', code: 'VIDEOEDIT6M' },
            { icon: '🎨', name: 'Design Software', desc: '1 Year License', code: 'DESIGN1Y' }
        ]
    },
    10000: {
        type: 'cashback',
        icon: '💵',
        name: 'Mega Elite Cashback!',
        desc: '5% of Monthly SIP'
    },
    11000: {
        type: 'standard',
        icon: '🏨',
        name: 'Luxury Hotel Stay',
        desc: '₹8000 Voucher',
        code: 'LUXURY8K'
    },
    12000: {
        type: 'cashback',
        icon: '💵',
        name: 'Champion Cashback!',
        desc: '5.5% of Monthly SIP'
    },
    13000: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🚗', name: 'Car Rental', desc: '₹10000 Credit', code: 'CARRENT10K' },
            { icon: '✈️', name: 'Travel Package', desc: '₹10000 Off', code: 'TRAVEL10K' }
        ]
    },
    14000: {
        type: 'standard',
        icon: '📱',
        name: 'Smartphone',
        desc: '₹15000 Off',
        code: 'PHONE15K'
    },
    15000: {
        type: 'cashback',
        icon: '💵',
        name: 'Master Cashback!',
        desc: '6% of Monthly SIP'
    },
    16000: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🎮', name: 'Gaming Console', desc: '₹12000 Off', code: 'CONSOLE12K' },
            { icon: '📺', name: 'Smart TV', desc: '₹12000 Off', code: 'TV12K' }
        ]
    },
    17000: {
        type: 'standard',
        icon: '⌚',
        name: 'Smartwatch Premium',
        desc: '₹18000 Off',
        code: 'WATCH18K'
    },
    18000: {
        type: 'cashback',
        icon: '💵',
        name: 'Legend Cashback!',
        desc: '7% of Monthly SIP'
    },
    19000: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🏠', name: 'Home Appliances', desc: '₹20000 Off', code: 'HOME20K' },
            { icon: '🛋️', name: 'Furniture', desc: '₹20000 Voucher', code: 'FURNITURE20K' }
        ]
    },
    20000: {
        type: 'cashback',
        icon: '💵',
        name: 'Epic Cashback!',
        desc: '8% of Monthly SIP'
    },
    21000: {
        type: 'standard',
        icon: '💍',
        name: 'Jewelry Voucher',
        desc: '₹25000 Off',
        code: 'JEWEL25K'
    },
    22000: {
        type: 'cashback',
        icon: '💵',
        name: 'Platinum Cashback!',
        desc: '9% of Monthly SIP'
    },
    23000: {
        type: 'choice',
        icon: '🎲',
        name: 'Choose Your Reward',
        desc: 'Pick 1 of 2',
        options: [
            { icon: '🏖️', name: 'Vacation Package', desc: '₹30000 Off', code: 'VACATION30K' },
            { icon: '🚢', name: 'Cruise Trip', desc: '₹30000 Off', code: 'CRUISE30K' }
        ]
    },
    24000: {
        type: 'standard',
        icon: '💎',
        name: 'Premium Experience',
        desc: '₹35000 Voucher',
        code: 'PREMIUM35K'
    },
    25000: {
        type: 'cashback',
        icon: '💵',
        name: 'Diamond Cashback!',
        desc: '10% of Monthly SIP'
    }
};

// Personal Finance Quiz Questions
const QUIZ_QUESTIONS = [
    {
        question: "What is the 50/30/20 budgeting rule?",
        options: [
            "50% needs, 30% wants, 20% savings",
            "50% savings, 30% needs, 20% wants",
            "50% wants, 30% savings, 20% needs",
            "50% investments, 30% needs, 20% wants"
        ],
        correct: 0,
        explanation: "The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings and debt repayment."
    },
    {
        question: "What does SIP stand for in investing?",
        options: [
            "Simple Interest Plan",
            "Systematic Investment Plan",
            "Special Investment Product",
            "Stock Investment Portfolio"
        ],
        correct: 1,
        explanation: "SIP stands for Systematic Investment Plan, allowing regular investments in mutual funds."
    },
    {
        question: "What is an emergency fund typically recommended to cover?",
        options: [
            "1-2 months of expenses",
            "3-6 months of expenses",
            "1 year of expenses",
            "2 years of expenses"
        ],
        correct: 1,
        explanation: "Financial experts recommend maintaining 3-6 months of living expenses in an emergency fund."
    },
    {
        question: "What is the power of compounding?",
        options: [
            "Earning interest on interest over time",
            "Doubling your investment annually",
            "Getting tax benefits on investments",
            "Investing in multiple funds"
        ],
        correct: 0,
        explanation: "Compounding is earning returns on both your principal and accumulated interest over time."
    },
    {
        question: "What does diversification mean in investing?",
        options: [
            "Investing all money in one stock",
            "Spreading investments across different assets",
            "Only investing in mutual funds",
            "Keeping money in savings account"
        ],
        correct: 1,
        explanation: "Diversification means spreading investments across different assets to reduce risk."
    },
    {
        question: "What is a good debt-to-income ratio?",
        options: [
            "Above 50%",
            "36% or lower",
            "Exactly 100%",
            "No specific ratio matters"
        ],
        correct: 1,
        explanation: "A debt-to-income ratio of 36% or lower is generally considered healthy."
    },
    {
        question: "What is the primary purpose of term insurance?",
        options: [
            "Investment returns",
            "Tax savings",
            "Financial protection for dependents",
            "Retirement planning"
        ],
        correct: 2,
        explanation: "Term insurance provides financial protection to your dependents in case of your death."
    },
    {
        question: "What is equity in financial terms?",
        options: [
            "Fixed deposit returns",
            "Ownership in a company through stocks",
            "Government bonds",
            "Real estate property"
        ],
        correct: 1,
        explanation: "Equity represents ownership in a company, typically through purchasing stocks."
    },
    {
        question: "What is the lock-in period for ELSS mutual funds?",
        options: [
            "1 year",
            "2 years",
            "3 years",
            "5 years"
        ],
        correct: 2,
        explanation: "ELSS (Equity Linked Savings Scheme) funds have a mandatory lock-in period of 3 years."
    },
    {
        question: "What is inflation?",
        options: [
            "Decrease in prices over time",
            "Increase in general price levels over time",
            "Interest rate on loans",
            "Tax on investments"
        ],
        correct: 1,
        explanation: "Inflation is the rate at which the general level of prices for goods and services rises."
    },
    {
        question: "What is the primary benefit of a PPF account?",
        options: [
            "High liquidity",
            "Tax-free returns with government backing",
            "Stock market exposure",
            "Short-term gains"
        ],
        correct: 1,
        explanation: "PPF offers tax-free returns with government backing, making it a safe long-term investment."
    },
    {
        question: "What is a mutual fund NAV?",
        options: [
            "Number of Available Ventures",
            "Net Asset Value per unit",
            "New Account Verification",
            "National Average Value"
        ],
        correct: 1,
        explanation: "NAV (Net Asset Value) is the per-unit price of a mutual fund."
    },
    {
        question: "What is the ideal investment horizon for equity mutual funds?",
        options: [
            "Less than 1 year",
            "1-3 years",
            "3-5 years",
            "5+ years"
        ],
        correct: 3,
        explanation: "Equity mutual funds are best suited for long-term investments of 5+ years to ride out market volatility."
    },
    {
        question: "What does ROI stand for?",
        options: [
            "Rate of Income",
            "Return on Investment",
            "Risk of Investment",
            "Range of Interest"
        ],
        correct: 1,
        explanation: "ROI (Return on Investment) measures the profitability of an investment."
    },
    {
        question: "What is a credit score?",
        options: [
            "Amount of debt you have",
            "Numerical representation of creditworthiness",
            "Your bank balance",
            "Number of credit cards owned"
        ],
        correct: 1,
        explanation: "A credit score is a numerical representation of your creditworthiness based on credit history."
    },
    {
        question: "What is asset allocation?",
        options: [
            "Buying only stocks",
            "Distributing investments across different asset classes",
            "Keeping all money in savings",
            "Investing only in real estate"
        ],
        correct: 1,
        explanation: "Asset allocation is distributing investments across different asset classes like stocks, bonds, and cash."
    },
    {
        question: "What is a corpus in financial planning?",
        options: [
            "Monthly investment amount",
            "Target accumulated wealth",
            "Annual income",
            "Total debt amount"
        ],
        correct: 1,
        explanation: "A corpus is the target amount of wealth you aim to accumulate for a specific financial goal."
    },
    {
        question: "What is the difference between saving and investing?",
        options: [
            "No difference, they're the same",
            "Saving is for short-term, investing for long-term growth",
            "Saving is risky, investing is safe",
            "Investing is only for wealthy people"
        ],
        correct: 1,
        explanation: "Saving typically involves low-risk preservation of money, while investing aims for long-term growth with some risk."
    },
    {
        question: "What is a good practice before taking a loan?",
        options: [
            "Borrow maximum amount available",
            "Check EMI affordability and compare interest rates",
            "Never read terms and conditions",
            "Take loan from first lender"
        ],
        correct: 1,
        explanation: "Always check EMI affordability, compare interest rates, and read terms before taking a loan."
    },
    {
        question: "What is the primary advantage of starting investments early?",
        options: [
            "Guaranteed high returns",
            "Benefit from compounding over longer period",
            "Avoid all market risks",
            "Get better tax benefits"
        ],
        correct: 1,
        explanation: "Starting early allows you to benefit from the power of compounding over a longer period."
    }
];

// ROTATING MONTHLY OBJECTIVES - Each week has different objectives
// Uses week of month (1-4) to determine which set to show
// This creates a 4-week rotation cycle for variety

// Helper function to get week of month (1-4)
function getWeekOfMonth() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    return Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
}

// Weekly Daily Objectives Configuration with 4-week rotation
const WEEKLY_OBJECTIVES = {
    // MONDAY - Week 1
    '0-1': {
        microInvest: {
            id: 'microInvest',
            name: 'Monday Micro Investment',
            desc: 'Start the week by investing ₹100',
            icon: '💰',
            points: 50,
            target: 1,
            type: 'count'
        },
        weeklyPlan: {
            id: 'weeklyPlan',
            name: 'Weekly Budget Plan',
            desc: 'Set your budget goals for the week',
            icon: '📋',
            points: 60,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Monday Quiz Challenge',
            desc: 'Complete 3 finance quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Wisdom of the Week',
            desc: 'Read weekly finance tip',
            icon: '💡',
            points: 20,
            target: 1,
            type: 'count'
        },
        portfolioCheck: {
            id: 'portfolioCheck',
            name: 'Portfolio Review',
            desc: 'Review your portfolio performance',
            icon: '📊',
            points: 40,
            target: 1,
            type: 'count'
        }
    },
    // MONDAY - Week 2
    '0-2': {
        microInvest: {
            id: 'microInvest',
            name: 'Monday Micro Investment',
            desc: 'Start the week by investing ₹100',
            icon: '💰',
            points: 50,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Monday Quiz Challenge',
            desc: 'Complete 3 finance quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        taxPlanning: {
            id: 'taxPlanning',
            name: 'Tax Planning Basics',
            desc: 'Learn about tax-saving investments',
            icon: '💼',
            points: 40,
            target: 1,
            type: 'count'
        },
        financialCalculator: {
            id: 'financialCalculator',
            name: 'Financial Calculator',
            desc: 'Use EMI/SIP calculator',
            icon: '🧮',
            points: 30,
            target: 1,
            type: 'count'
        },
        portfolioCheck: {
            id: 'portfolioCheck',
            name: 'Portfolio Review',
            desc: 'Review your portfolio performance',
            icon: '📊',
            points: 40,
            target: 1,
            type: 'count'
        }
    },
    // MONDAY - Week 3
    '0-3': {
        weeklyPlan: {
            id: 'weeklyPlan',
            name: 'Weekly Budget Plan',
            desc: 'Set your budget goals for the week',
            icon: '📋',
            points: 60,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Monday Quiz Challenge',
            desc: 'Complete 3 finance quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        debtManagement: {
            id: 'debtManagement',
            name: 'Debt Management',
            desc: 'Learn debt reduction strategies',
            icon: '💳',
            points: 50,
            target: 1,
            type: 'count'
        },
        savingsRate: {
            id: 'savingsRate',
            name: 'Monthly Savings Rate',
            desc: 'Calculate your savings percentage',
            icon: '📈',
            points: 40,
            target: 1,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Wisdom of the Week',
            desc: 'Read weekly finance tip',
            icon: '💡',
            points: 20,
            target: 1,
            type: 'count'
        }
    },
    // MONDAY - Week 4
    '0-4': {
        microInvest: {
            id: 'microInvest',
            name: 'Monday Micro Investment',
            desc: 'Start the week by investing ₹100',
            icon: '💰',
            points: 50,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Monday Quiz Challenge',
            desc: 'Complete 3 finance quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        insuranceBasics: {
            id: 'insuranceBasics',
            name: 'Insurance 101',
            desc: 'Understand life & health insurance',
            icon: '🛡️',
            points: 50,
            target: 1,
            type: 'count'
        },
        diversificationCheck: {
            id: 'diversificationCheck',
            name: 'Diversification Check',
            desc: 'Review asset mix balance',
            icon: '⚖️',
            points: 45,
            target: 1,
            type: 'count'
        },
        portfolioCheck: {
            id: 'portfolioCheck',
            name: 'Portfolio Review',
            desc: 'Review your portfolio performance',
            icon: '📊',
            points: 40,
            target: 1,
            type: 'count'
        }
    },
    // TUESDAY - Week 1
    '1-1': {
        watchVideo: {
            id: 'watchVideo',
            name: 'Tuesday Tutorial',
            desc: 'Watch 2 finance videos',
            icon: '🎥',
            points: 50,
            target: 2,
            type: 'count'
        },
        readArticle: {
            id: 'readArticle',
            name: 'Article Explorer',
            desc: 'Read 2 financial articles',
            icon: '📰',
            points: 45,
            target: 2,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Knowledge Test',
            desc: 'Complete 4 finance quizzes',
            icon: '🧠',
            points: 70,
            target: 4,
            type: 'count'
        },
        marketTrends: {
            id: 'marketTrends',
            name: 'Market Trends',
            desc: 'Check today\'s market trends',
            icon: '📈',
            points: 30,
            target: 1,
            type: 'count'
        },
        investmentTip: {
            id: 'investmentTip',
            name: 'Investment Insight',
            desc: 'Learn 1 investment strategy',
            icon: '💡',
            points: 25,
            target: 1,
            type: 'count'
        }
    },
    // TUESDAY - Week 2
    '1-2': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Knowledge Test',
            desc: 'Complete 4 finance quizzes',
            icon: '🧠',
            points: 70,
            target: 4,
            type: 'count'
        },
        readArticle: {
            id: 'readArticle',
            name: 'Article Explorer',
            desc: 'Read 2 financial articles',
            icon: '📰',
            points: 45,
            target: 2,
            type: 'count'
        },
        diversificationCheck: {
            id: 'diversificationCheck',
            name: 'Diversification Check',
            desc: 'Review asset mix balance',
            icon: '⚖️',
            points: 45,
            target: 1,
            type: 'count'
        },
        financialCalculator: {
            id: 'financialCalculator',
            name: 'Financial Calculator',
            desc: 'Use EMI/SIP calculator',
            icon: '🧮',
            points: 30,
            target: 1,
            type: 'count'
        },
        marketTrends: {
            id: 'marketTrends',
            name: 'Market Trends',
            desc: 'Check today\'s market trends',
            icon: '📈',
            points: 30,
            target: 1,
            type: 'count'
        }
    },
    // TUESDAY - Week 3
    '1-3': {
        watchVideo: {
            id: 'watchVideo',
            name: 'Tuesday Tutorial',
            desc: 'Watch 2 finance videos',
            icon: '🎥',
            points: 50,
            target: 2,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Knowledge Test',
            desc: 'Complete 4 finance quizzes',
            icon: '🧠',
            points: 70,
            target: 4,
            type: 'count'
        },
        taxPlanning: {
            id: 'taxPlanning',
            name: 'Tax Planning Basics',
            desc: 'Learn about tax-saving investments',
            icon: '💼',
            points: 40,
            target: 1,
            type: 'count'
        },
        investmentTip: {
            id: 'investmentTip',
            name: 'Investment Insight',
            desc: 'Learn 1 investment strategy',
            icon: '💡',
            points: 25,
            target: 1,
            type: 'count'
        },
        readArticle: {
            id: 'readArticle',
            name: 'Article Explorer',
            desc: 'Read 2 financial articles',
            icon: '📰',
            points: 45,
            target: 2,
            type: 'count'
        }
    },
    // TUESDAY - Week 4
    '1-4': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Knowledge Test',
            desc: 'Complete 4 finance quizzes',
            icon: '🧠',
            points: 70,
            target: 4,
            type: 'count'
        },
        podcast: {
            id: 'podcast',
            name: 'Finance Podcast',
            desc: 'Listen to 1 finance podcast',
            icon: '🎧',
            points: 40,
            target: 1,
            type: 'count'
        },
        readArticle: {
            id: 'readArticle',
            name: 'Article Explorer',
            desc: 'Read 2 financial articles',
            icon: '📰',
            points: 45,
            target: 2,
            type: 'count'
        },
        marketTrends: {
            id: 'marketTrends',
            name: 'Market Trends',
            desc: 'Check today\'s market trends',
            icon: '📈',
            points: 30,
            target: 1,
            type: 'count'
        },
        insuranceBasics: {
            id: 'insuranceBasics',
            name: 'Insurance 101',
            desc: 'Understand life & health insurance',
            icon: '🛡️',
            points: 50,
            target: 1,
            type: 'count'
        }
    },
    // WEDNESDAY - Week 1
    '3-1': {
        savingsBoost: {
            id: 'savingsBoost',
            name: 'Midweek Savings',
            desc: 'Add ₹100 to your savings',
            icon: '🎯',
            points: 60,
            target: 1,
            type: 'count'
        },
        expenseTracker: {
            id: 'expenseTracker',
            name: 'Track Expenses',
            desc: 'Log 5 expenses from this week',
            icon: '📝',
            points: 40,
            target: 5,
            type: 'count'
        },
        marketNews: {
            id: 'marketNews',
            name: 'News Digest',
            desc: 'Read 4 market news updates',
            icon: '📰',
            points: 50,
            target: 4,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Wednesday Wisdom',
            desc: 'Complete 3 quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Wisdom of the Week',
            desc: 'Read weekly finance tip',
            icon: '💡',
            points: 20,
            target: 1,
            type: 'count'
        }
    },
    // WEDNESDAY - Week 2
    '3-2': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Wednesday Wisdom',
            desc: 'Complete 3 quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        marketNews: {
            id: 'marketNews',
            name: 'News Digest',
            desc: 'Read 4 market news updates',
            icon: '📰',
            points: 50,
            target: 4,
            type: 'count'
        },
        expenseTracker: {
            id: 'expenseTracker',
            name: 'Track Expenses',
            desc: 'Log 5 expenses from this week',
            icon: '📝',
            points: 40,
            target: 5,
            type: 'count'
        },
        debtManagement: {
            id: 'debtManagement',
            name: 'Debt Management',
            desc: 'Learn debt reduction strategies',
            icon: '💳',
            points: 50,
            target: 1,
            type: 'count'
        },
        portfolioCheck: {
            id: 'portfolioCheck',
            name: 'Portfolio Review',
            desc: 'Review your portfolio performance',
            icon: '📊',
            points: 40,
            target: 1,
            type: 'count'
        }
    },
    // WEDNESDAY - Week 3
    '3-3': {
        savingsBoost: {
            id: 'savingsBoost',
            name: 'Midweek Savings',
            desc: 'Add ₹100 to your savings',
            icon: '🎯',
            points: 60,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Wednesday Wisdom',
            desc: 'Complete 3 quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        marketNews: {
            id: 'marketNews',
            name: 'News Digest',
            desc: 'Read 4 market news updates',
            icon: '📰',
            points: 50,
            target: 4,
            type: 'count'
        },
        savingsRate: {
            id: 'savingsRate',
            name: 'Monthly Savings Rate',
            desc: 'Calculate your savings percentage',
            icon: '📈',
            points: 40,
            target: 1,
            type: 'count'
        },
        expenseTracker: {
            id: 'expenseTracker',
            name: 'Track Expenses',
            desc: 'Log 5 expenses from this week',
            icon: '📝',
            points: 40,
            target: 5,
            type: 'count'
        }
    },
    // WEDNESDAY - Week 4
    '3-4': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Wednesday Wisdom',
            desc: 'Complete 3 quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        expenseTracker: {
            id: 'expenseTracker',
            name: 'Track Expenses',
            desc: 'Log 5 expenses from this week',
            icon: '📝',
            points: 40,
            target: 5,
            type: 'count'
        },
        marketNews: {
            id: 'marketNews',
            name: 'News Digest',
            desc: 'Read 4 market news updates',
            icon: '📰',
            points: 50,
            target: 4,
            type: 'count'
        },
        financialCalculator: {
            id: 'financialCalculator',
            name: 'Financial Calculator',
            desc: 'Use EMI/SIP calculator',
            icon: '🧮',
            points: 30,
            target: 1,
            type: 'count'
        },
        emergencyFund: {
            id: 'emergencyFund',
            name: 'Emergency Fund Check',
            desc: 'Review emergency fund status',
            icon: '🆘',
            points: 35,
            target: 1,
            type: 'count'
        }
    },
    // THURSDAY - Week 1
    '4-1': {
        microInvest: {
            id: 'microInvest',
            name: 'Growth Investment',
            desc: 'Invest ₹150 in equity fund',
            icon: '💹',
            points: 65,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Thursday Challenge',
            desc: 'Complete 6 finance quizzes',
            icon: '🏆',
            points: 85,
            target: 6,
            type: 'count'
        },
        portfolioAnalysis: {
            id: 'portfolioAnalysis',
            name: 'Portfolio Deep Dive',
            desc: 'Analyze your asset allocation',
            icon: '📊',
            points: 50,
            target: 1,
            type: 'count'
        },
        financialGoal: {
            id: 'financialGoal',
            name: 'Goal Tracker',
            desc: 'Update 1 financial goal',
            icon: '🎯',
            points: 40,
            target: 1,
            type: 'count'
        },
        watchVideo: {
            id: 'watchVideo',
            name: 'Growth Strategy Video',
            desc: 'Watch 1 investment strategy video',
            icon: '🎥',
            points: 35,
            target: 1,
            type: 'count'
        }
    },
    // THURSDAY - Week 2
    '4-2': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Thursday Challenge',
            desc: 'Complete 6 finance quizzes',
            icon: '🏆',
            points: 85,
            target: 6,
            type: 'count'
        },
        portfolioAnalysis: {
            id: 'portfolioAnalysis',
            name: 'Portfolio Deep Dive',
            desc: 'Analyze your asset allocation',
            icon: '📊',
            points: 50,
            target: 1,
            type: 'count'
        },
        financialGoal: {
            id: 'financialGoal',
            name: 'Goal Tracker',
            desc: 'Update 1 financial goal',
            icon: '🎯',
            points: 40,
            target: 1,
            type: 'count'
        },
        watchVideo: {
            id: 'watchVideo',
            name: 'Growth Strategy Video',
            desc: 'Watch 1 investment strategy video',
            icon: '🎥',
            points: 35,
            target: 1,
            type: 'count'
        },
        readArticle: {
            id: 'readArticle',
            name: 'Article Explorer',
            desc: 'Read 2 financial articles',
            icon: '📰',
            points: 45,
            target: 2,
            type: 'count'
        }
    },
    // THURSDAY - Week 3
    '4-3': {
        microInvest: {
            id: 'microInvest',
            name: 'Growth Investment',
            desc: 'Invest ₹150 in equity fund',
            icon: '💹',
            points: 65,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Thursday Challenge',
            desc: 'Complete 6 finance quizzes',
            icon: '🏆',
            points: 85,
            target: 6,
            type: 'count'
        },
        diversificationCheck: {
            id: 'diversificationCheck',
            name: 'Diversification Check',
            desc: 'Review asset mix balance',
            icon: '⚖️',
            points: 45,
            target: 1,
            type: 'count'
        },
        watchVideo: {
            id: 'watchVideo',
            name: 'Growth Strategy Video',
            desc: 'Watch 1 investment strategy video',
            icon: '🎥',
            points: 35,
            target: 1,
            type: 'count'
        },
        financialGoal: {
            id: 'financialGoal',
            name: 'Goal Tracker',
            desc: 'Update 1 financial goal',
            icon: '🎯',
            points: 40,
            target: 1,
            type: 'count'
        }
    },
    // THURSDAY - Week 4
    '4-4': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Thursday Challenge',
            desc: 'Complete 6 finance quizzes',
            icon: '🏆',
            points: 85,
            target: 6,
            type: 'count'
        },
        portfolioAnalysis: {
            id: 'portfolioAnalysis',
            name: 'Portfolio Deep Dive',
            desc: 'Analyze your asset allocation',
            icon: '📊',
            points: 50,
            target: 1,
            type: 'count'
        },
        taxPlanning: {
            id: 'taxPlanning',
            name: 'Tax Planning Basics',
            desc: 'Learn about tax-saving investments',
            icon: '💼',
            points: 40,
            target: 1,
            type: 'count'
        },
        financialGoal: {
            id: 'financialGoal',
            name: 'Goal Tracker',
            desc: 'Update 1 financial goal',
            icon: '🎯',
            points: 40,
            target: 1,
            type: 'count'
        },
        watchVideo: {
            id: 'watchVideo',
            name: 'Growth Strategy Video',
            desc: 'Watch 1 investment strategy video',
            icon: '🎥',
            points: 35,
            target: 1,
            type: 'count'
        }
    },
    // FRIDAY - Week 1
    '5-1': {
        weeklyReview: {
            id: 'weeklyReview',
            name: 'Weekly Review',
            desc: 'Review this week\'s investments',
            icon: '📋',
            points: 55,
            target: 1,
            type: 'count'
        },
        savingsGoal: {
            id: 'savingsGoal',
            name: 'Friday Savings',
            desc: 'Add ₹75 to emergency fund',
            icon: '🏦',
            points: 50,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Friday Quiz Fest',
            desc: 'Complete 5 quizzes',
            icon: '📚',
            points: 75,
            target: 5,
            type: 'count'
        },
        marketNews: {
            id: 'marketNews',
            name: 'Week\'s Market Recap',
            desc: 'Read 3 market summary articles',
            icon: '📰',
            points: 45,
            target: 3,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Weekend Wisdom',
            desc: 'Read weekend finance tip',
            icon: '💡',
            points: 25,
            target: 1,
            type: 'count'
        }
    },
    // FRIDAY - Week 2
    '5-2': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Friday Quiz Fest',
            desc: 'Complete 5 quizzes',
            icon: '📚',
            points: 75,
            target: 5,
            type: 'count'
        },
        marketNews: {
            id: 'marketNews',
            name: 'Week\'s Market Recap',
            desc: 'Read 3 market summary articles',
            icon: '📰',
            points: 45,
            target: 3,
            type: 'count'
        },
        weeklyReview: {
            id: 'weeklyReview',
            name: 'Weekly Review',
            desc: 'Review this week\'s investments',
            icon: '📋',
            points: 55,
            target: 1,
            type: 'count'
        },
        portfolioCheck: {
            id: 'portfolioCheck',
            name: 'Portfolio Review',
            desc: 'Review your portfolio performance',
            icon: '📊',
            points: 40,
            target: 1,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Weekend Wisdom',
            desc: 'Read weekend finance tip',
            icon: '💡',
            points: 25,
            target: 1,
            type: 'count'
        }
    },
    // FRIDAY - Week 3
    '5-3': {
        savingsGoal: {
            id: 'savingsGoal',
            name: 'Friday Savings',
            desc: 'Add ₹75 to emergency fund',
            icon: '🏦',
            points: 50,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Friday Quiz Fest',
            desc: 'Complete 5 quizzes',
            icon: '📚',
            points: 75,
            target: 5,
            type: 'count'
        },
        marketNews: {
            id: 'marketNews',
            name: 'Week\'s Market Recap',
            desc: 'Read 3 market summary articles',
            icon: '📰',
            points: 45,
            target: 3,
            type: 'count'
        },
        weeklyReview: {
            id: 'weeklyReview',
            name: 'Weekly Review',
            desc: 'Review this week\'s investments',
            icon: '📋',
            points: 55,
            target: 1,
            type: 'count'
        },
        debtManagement: {
            id: 'debtManagement',
            name: 'Debt Management',
            desc: 'Learn debt reduction strategies',
            icon: '💳',
            points: 50,
            target: 1,
            type: 'count'
        }
    },
    // FRIDAY - Week 4
    '5-4': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Friday Quiz Fest',
            desc: 'Complete 5 quizzes',
            icon: '📚',
            points: 75,
            target: 5,
            type: 'count'
        },
        marketNews: {
            id: 'marketNews',
            name: 'Week\'s Market Recap',
            desc: 'Read 3 market summary articles',
            icon: '📰',
            points: 45,
            target: 3,
            type: 'count'
        },
        weeklyReview: {
            id: 'weeklyReview',
            name: 'Weekly Review',
            desc: 'Review this week\'s investments',
            icon: '📋',
            points: 55,
            target: 1,
            type: 'count'
        },
        financialGoal: {
            id: 'financialGoal',
            name: 'Goal Tracker',
            desc: 'Update 1 financial goal',
            icon: '🎯',
            points: 40,
            target: 1,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Weekend Wisdom',
            desc: 'Read weekend finance tip',
            icon: '💡',
            points: 25,
            target: 1,
            type: 'count'
        }
    },
    // SATURDAY - Week 1
    '6-1': {
        readArticle: {
            id: 'readArticle',
            name: 'Weekend Reading',
            desc: 'Read 3 finance articles',
            icon: '📚',
            points: 60,
            target: 3,
            type: 'count'
        },
        watchVideo: {
            id: 'watchVideo',
            name: 'Saturday Video Marathon',
            desc: 'Watch 3 educational videos',
            icon: '🎬',
            points: 70,
            target: 3,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Weekend Quiz Master',
            desc: 'Complete 4 quizzes',
            icon: '🧠',
            points: 65,
            target: 4,
            type: 'count'
        },
        podcast: {
            id: 'podcast',
            name: 'Finance Podcast',
            desc: 'Listen to 1 finance podcast',
            icon: '🎧',
            points: 40,
            target: 1,
            type: 'count'
        },
        netWorth: {
            id: 'netWorth',
            name: 'Net Worth Update',
            desc: 'Calculate your net worth',
            icon: '💼',
            points: 45,
            target: 1,
            type: 'count'
        }
    },
    // SATURDAY - Week 2
    '6-2': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Weekend Quiz Master',
            desc: 'Complete 4 quizzes',
            icon: '🧠',
            points: 65,
            target: 4,
            type: 'count'
        },
        watchVideo: {
            id: 'watchVideo',
            name: 'Saturday Video Marathon',
            desc: 'Watch 3 educational videos',
            icon: '🎬',
            points: 70,
            target: 3,
            type: 'count'
        },
        readArticle: {
            id: 'readArticle',
            name: 'Weekend Reading',
            desc: 'Read 3 finance articles',
            icon: '📚',
            points: 60,
            target: 3,
            type: 'count'
        },
        portfolioCheck: {
            id: 'portfolioCheck',
            name: 'Portfolio Review',
            desc: 'Review your portfolio performance',
            icon: '📊',
            points: 40,
            target: 1,
            type: 'count'
        },
        podcast: {
            id: 'podcast',
            name: 'Finance Podcast',
            desc: 'Listen to 1 finance podcast',
            icon: '🎧',
            points: 40,
            target: 1,
            type: 'count'
        }
    },
    // SATURDAY - Week 3
    '6-3': {
        watchVideo: {
            id: 'watchVideo',
            name: 'Saturday Video Marathon',
            desc: 'Watch 3 educational videos',
            icon: '🎬',
            points: 70,
            target: 3,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Weekend Quiz Master',
            desc: 'Complete 4 quizzes',
            icon: '🧠',
            points: 65,
            target: 4,
            type: 'count'
        },
        readArticle: {
            id: 'readArticle',
            name: 'Weekend Reading',
            desc: 'Read 3 finance articles',
            icon: '📚',
            points: 60,
            target: 3,
            type: 'count'
        },
        netWorth: {
            id: 'netWorth',
            name: 'Net Worth Update',
            desc: 'Calculate your net worth',
            icon: '💼',
            points: 45,
            target: 1,
            type: 'count'
        },
        diversificationCheck: {
            id: 'diversificationCheck',
            name: 'Diversification Check',
            desc: 'Review asset mix balance',
            icon: '⚖️',
            points: 45,
            target: 1,
            type: 'count'
        }
    },
    // SATURDAY - Week 4
    '6-4': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Weekend Quiz Master',
            desc: 'Complete 4 quizzes',
            icon: '🧠',
            points: 65,
            target: 4,
            type: 'count'
        },
        readArticle: {
            id: 'readArticle',
            name: 'Weekend Reading',
            desc: 'Read 3 finance articles',
            icon: '📚',
            points: 60,
            target: 3,
            type: 'count'
        },
        watchVideo: {
            id: 'watchVideo',
            name: 'Saturday Video Marathon',
            desc: 'Watch 3 educational videos',
            icon: '🎬',
            points: 70,
            target: 3,
            type: 'count'
        },
        podcast: {
            id: 'podcast',
            name: 'Finance Podcast',
            desc: 'Listen to 1 finance podcast',
            icon: '🎧',
            points: 40,
            target: 1,
            type: 'count'
        },
        taxPlanning: {
            id: 'taxPlanning',
            name: 'Tax Planning Basics',
            desc: 'Learn about tax-saving investments',
            icon: '💼',
            points: 40,
            target: 1,
            type: 'count'
        }
    },
    // SUNDAY - Week 1
    '2-1': {
        sundayPrep: {
            id: 'sundayPrep',
            name: 'Sunday Planning',
            desc: 'Set goals for next week',
            icon: '🗓️',
            points: 50,
            target: 1,
            type: 'count'
        },
        budgetReview: {
            id: 'budgetReview',
            name: 'Budget Review',
            desc: 'Review last week\'s spending',
            icon: '💰',
            points: 55,
            target: 1,
            type: 'count'
        },
        savingsGoal: {
            id: 'savingsGoal',
            name: 'Sunday Savings',
            desc: 'Add ₹50 to savings',
            icon: '🎯',
            points: 45,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Sunday Knowledge',
            desc: 'Complete 3 quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Sunday Wisdom',
            desc: 'Read motivational tip',
            icon: '💡',
            points: 20,
            target: 1,
            type: 'count'
        }
    },
    // SUNDAY - Week 2
    '2-2': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Sunday Knowledge',
            desc: 'Complete 3 quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        budgetReview: {
            id: 'budgetReview',
            name: 'Budget Review',
            desc: 'Review last week\'s spending',
            icon: '💰',
            points: 55,
            target: 1,
            type: 'count'
        },
        sundayPrep: {
            id: 'sundayPrep',
            name: 'Sunday Planning',
            desc: 'Set goals for next week',
            icon: '🗓️',
            points: 50,
            target: 1,
            type: 'count'
        },
        emergencyFund: {
            id: 'emergencyFund',
            name: 'Emergency Fund Check',
            desc: 'Review emergency fund status',
            icon: '🆘',
            points: 35,
            target: 1,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Sunday Wisdom',
            desc: 'Read motivational tip',
            icon: '💡',
            points: 20,
            target: 1,
            type: 'count'
        }
    },
    // SUNDAY - Week 3
    '2-3': {
        savingsGoal: {
            id: 'savingsGoal',
            name: 'Sunday Savings',
            desc: 'Add ₹50 to savings',
            icon: '🎯',
            points: 45,
            target: 1,
            type: 'count'
        },
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Sunday Knowledge',
            desc: 'Complete 3 quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        sundayPrep: {
            id: 'sundayPrep',
            name: 'Sunday Planning',
            desc: 'Set goals for next week',
            icon: '🗓️',
            points: 50,
            target: 1,
            type: 'count'
        },
        budgetReview: {
            id: 'budgetReview',
            name: 'Budget Review',
            desc: 'Review last week\'s spending',
            icon: '💰',
            points: 55,
            target: 1,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Sunday Wisdom',
            desc: 'Read motivational tip',
            icon: '💡',
            points: 20,
            target: 1,
            type: 'count'
        }
    },
    // SUNDAY - Week 4
    '2-4': {
        completeQuizzes: {
            id: 'completeQuizzes',
            name: 'Sunday Knowledge',
            desc: 'Complete 3 quizzes',
            icon: '📚',
            points: 55,
            target: 3,
            type: 'count'
        },
        sundayPrep: {
            id: 'sundayPrep',
            name: 'Sunday Planning',
            desc: 'Set goals for next week',
            icon: '🗓️',
            points: 50,
            target: 1,
            type: 'count'
        },
        budgetReview: {
            id: 'budgetReview',
            name: 'Budget Review',
            desc: 'Review last week\'s spending',
            icon: '💰',
            points: 55,
            target: 1,
            type: 'count'
        },
        emergencyFund: {
            id: 'emergencyFund',
            name: 'Emergency Fund Check',
            desc: 'Review emergency fund status',
            icon: '🆘',
            points: 35,
            target: 1,
            type: 'count'
        },
        financeTip: {
            id: 'financeTip',
            name: 'Sunday Wisdom',
            desc: 'Read motivational tip',
            icon: '💡',
            points: 20,
            target: 1,
            type: 'count'
        }
    }
};

// Helper function to get current day's objectives with weekly rotation
function getTodaysObjectives() {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const week = getWeekOfMonth(); // 1-4

    // Try to get week-specific objectives first (e.g., '0-1', '0-2', etc.)
    const weeklyKey = `${today}-${week}`;
    if (WEEKLY_OBJECTIVES[weeklyKey]) {
        return WEEKLY_OBJECTIVES[weeklyKey];
    }

    // Fallback to default day objectives if week-specific not found
    return WEEKLY_OBJECTIVES[today] || WEEKLY_OBJECTIVES['0-1'];
}

// Game State
// MONTHLY REWARD LIMIT SYSTEM:
// - Users can only claim 10 TOTAL rewards per month (includes cashback, standard, and choice)
// - Users can only claim ONE cashback reward per month
// - Automatically resets on the 1st of each month
// - After reaching 10 rewards or 1 cashback, remaining rewards are locked until next month
let gameState = {
    totalPoints: 0,
    monthlySIP: 5000,
    claimedRewards: [],
    usedQuestions: [],
    activityHistory: [],
    lastCashbackClaim: null, // Timestamp of last cashback claim
    cashbackClaimedThisMonth: false, // Boolean flag for current month
    monthlyRewardsClaimed: 0, // Count of rewards claimed this month (max 10)
    lastMonthlyReset: null, // Last time monthly limits were reset
    dailyObjectives: {}, // Track daily objective progress
    lastDailyReset: null // Last time daily objectives were reset
};

// Initialize Game
function initGame() {
    loadGameState();
    checkMonthlyReset(); // Check if we need to reset monthly cashback
    checkDailyReset(); // Check if we need to reset daily objectives
    renderChoiceRewards(); // Render both options for choice rewards
    renderDailyObjectives(); // Render daily objectives
    updateUI();
    updateCashbackAmounts();
    startResetTimer(); // Start countdown timer for daily reset
    console.log('Finance Ladder initialized!');
}

// Start Reset Timer
function startResetTimer() {
    updateResetTimer();
    setInterval(updateResetTimer, 1000); // Update every second
}

// Update Reset Timer
function updateResetTimer() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const timerElement = document.getElementById('resetTimer');
    if (timerElement) {
        timerElement.textContent = `Resets in: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Check Daily Reset for Objectives (handles weekly cycle)
function checkDailyReset() {
    if (!gameState.lastDailyReset) {
        // First time user, initialize with today's objectives
        resetDailyObjectives();
        return;
    }

    const lastReset = new Date(gameState.lastDailyReset);
    const now = new Date();

    // Check if it's a different day (day of week change triggers new objectives)
    if (lastReset.getDate() !== now.getDate() ||
        lastReset.getMonth() !== now.getMonth() ||
        lastReset.getFullYear() !== now.getFullYear()) {
        // New day! Reset daily objectives with new day's objectives
        // This automatically handles the weekly cycle (Monday -> Tuesday -> ... -> Sunday -> Monday)
        resetDailyObjectives();
    }
}

// Reset Daily Objectives (based on current day of week)
function resetDailyObjectives() {
    gameState.dailyObjectives = {};
    const todaysObjectives = getTodaysObjectives();
    Object.keys(todaysObjectives).forEach(id => {
        gameState.dailyObjectives[id] = {
            progress: 0,
            completed: false
        };
    });
    gameState.lastDailyReset = new Date().toISOString();
    saveGameState();
}

// Update Daily Objective Progress
function updateDailyObjective(objectiveId, increment = 1) {
    const todaysObjectives = getTodaysObjectives();
    const objective = todaysObjectives[objectiveId];
    if (!objective) {
        console.error('Objective not found:', objectiveId);
        return;
    }

    // Initialize if not exists
    if (!gameState.dailyObjectives[objectiveId]) {
        gameState.dailyObjectives[objectiveId] = {
            progress: 0,
            completed: false
        };
    }

    const progress = gameState.dailyObjectives[objectiveId];
    if (progress.completed) {
        console.log('Objective already completed:', objectiveId);
        return; // Already completed today
    }

    progress.progress += increment;

    if (progress.progress >= objective.target) {
        progress.progress = objective.target;
        progress.completed = true;
        addPoints(objective.points, `Completed: ${objective.name}`);
    }

    saveGameState();
    updateDailyObjectivesUI();
}

// Render Daily Objectives (shows today's objectives based on day of week)
function renderDailyObjectives() {
    const container = document.getElementById('dailyObjectivesContainer');
    if (!container) return;

    container.innerHTML = '';

    const todaysObjectives = getTodaysObjectives();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();

    // Add day indicator
    const dayHeader = document.createElement('div');
    dayHeader.className = 'daily-objectives-day-header';
    dayHeader.innerHTML = `📅 ${dayNames[today]}'s Objectives`;
    container.appendChild(dayHeader);

    Object.values(todaysObjectives).forEach(objective => {
        const progress = gameState.dailyObjectives[objective.id] || { progress: 0, completed: false };
        const progressPercent = Math.min((progress.progress / objective.target) * 100, 100);

        const objectiveCard = document.createElement('div');
        objectiveCard.className = `daily-objective-card ${progress.completed ? 'completed' : ''}`;
        objectiveCard.innerHTML = `
            <div class="objective-header">
                <div class="objective-icon">${objective.icon}</div>
                <div class="objective-info">
                    <div class="objective-name">${objective.name}</div>
                    <div class="objective-desc">${objective.desc}</div>
                </div>
                <div class="objective-points">+${objective.points}</div>
            </div>
            <div class="objective-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="progress-text">${progress.progress}/${objective.target}</div>
            </div>
            ${progress.completed ? '<div class="completed-badge">✓ Completed</div>' : '<button class="simulate-btn" onclick="updateDailyObjective(\'' + objective.id + '\')">Simulate Progress</button>'}
        `;

        container.appendChild(objectiveCard);
    });
}

// Update Daily Objectives UI
function updateDailyObjectivesUI() {
    renderDailyObjectives();
}

// Render Choice Rewards with Both Options
function renderChoiceRewards() {
    Object.keys(REWARDS).forEach(points => {
        const reward = REWARDS[points];
        if (reward.type === 'choice') {
            const rewardBox = document.getElementById(`reward-${points}`);
            const rewardContent = rewardBox.querySelector('.reward-content');

            // Build HTML with both options
            const choiceHTML = `
                <div class="reward-name">Choose Your Reward</div>
                <div class="reward-desc">Pick 1 of 2</div>
                <div class="choice-options">
                    <div class="choice-option" data-option="0">
                        <div class="choice-option-icon">${reward.options[0].icon}</div>
                        <div class="choice-option-name">${reward.options[0].name}</div>
                        <div class="choice-option-desc">${reward.options[0].desc}</div>
                    </div>
                    <div class="choice-option" data-option="1">
                        <div class="choice-option-icon">${reward.options[1].icon}</div>
                        <div class="choice-option-name">${reward.options[1].name}</div>
                        <div class="choice-option-desc">${reward.options[1].desc}</div>
                    </div>
                </div>
            `;

            rewardContent.innerHTML = choiceHTML;

            // Add click handlers to each option
            const options = rewardContent.querySelectorAll('.choice-option');
            options.forEach((optionEl, index) => {
                optionEl.onclick = (e) => {
                    e.stopPropagation();
                    // CRITICAL: Check points requirement, not claimed, and not locked
                    if (gameState.totalPoints >= parseInt(points) &&
                        !rewardContent.classList.contains('locked') &&
                        !gameState.claimedRewards.includes(parseInt(points))) {
                        selectRewardChoice(parseInt(points), reward.options[index]);
                    } else if (gameState.totalPoints < parseInt(points)) {
                        // Show insufficient points alert
                        alert('🔒 Insufficient Points!\n\nYou need ' + points + ' points to claim this reward. You currently have ' + gameState.totalPoints + ' points.');
                    }
                };
            });
        }
    });
}

// Check Monthly Reset for All Rewards (Cashback + Total Reward Limit)
function checkMonthlyReset() {
    const now = new Date();

    // Initialize if first time
    if (!gameState.lastMonthlyReset) {
        gameState.lastMonthlyReset = now.toISOString();
        gameState.cashbackClaimedThisMonth = false;
        gameState.monthlyRewardsClaimed = 0;
        saveGameState();
        return;
    }

    const lastReset = new Date(gameState.lastMonthlyReset);

    // Check if it's a different month or year
    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
        // New month! Reset ALL monthly limits
        gameState.cashbackClaimedThisMonth = false;
        gameState.monthlyRewardsClaimed = 0;
        gameState.lastMonthlyReset = now.toISOString();
        saveGameState();
        console.log('Monthly reward limits reset! You can now claim up to 10 rewards this month.');
    }
}

// Check if cashback can be claimed this month
function canClaimCashback() {
    if (!gameState.lastCashbackClaim) {
        // Never claimed before, can claim
        return true;
    }

    const lastClaim = new Date(gameState.lastCashbackClaim);
    const now = new Date();

    // Check if it's a different month or year
    if (lastClaim.getMonth() !== now.getMonth() || lastClaim.getFullYear() !== now.getFullYear()) {
        return true;
    }

    // Same month, check if already claimed
    return !gameState.cashbackClaimedThisMonth;
}

// Save/Load Game State
function saveGameState() {
    localStorage.setItem('financeLadderState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('financeLadderState');
    if (saved) {
        gameState = JSON.parse(saved);
        document.getElementById('monthlySIP').value = gameState.monthlySIP;
    }
}

// Update SIP Amount
function updateSIPAmount() {
    const newSIP = parseInt(document.getElementById('monthlySIP').value);
    if (newSIP >= 1000) {
        gameState.monthlySIP = newSIP;
        updateCashbackAmounts();
        saveGameState();
    }
}

// Update Cashback Amounts
function updateCashbackAmounts() {
    // Update all cashback elements based on their percentage
    const cashbackElements = {
        500: 0.01,   // 1%
        1000: 0.01,  // 1%
        1500: 0.015, // 1.5%
        2000: 0.015, // 1.5%
        2500: 0.02,  // 2%
        3000: 0.02,  // 2%
        3500: 0.025, // 2.5%
        4000: 0.025, // 2.5%
        4500: 0.03,  // 3%
        5000: 0.03,  // 3%
        6000: 0.035, // 3.5%
        7500: 0.04,  // 4%
        9000: 0.045, // 4.5%
        10000: 0.05, // 5%
        12000: 0.055, // 5.5%
        15000: 0.06,  // 6%
        18000: 0.07,  // 7%
        20000: 0.08,  // 8%
        22000: 0.09,  // 9%
        25000: 0.10   // 10%
    };

    Object.keys(cashbackElements).forEach(points => {
        const element = document.getElementById(`cashback-${points}`);
        if (element) {
            const cashbackAmount = Math.floor(gameState.monthlySIP * cashbackElements[points]);
            element.textContent = `₹${cashbackAmount}`;
        }
    });
}

// Update UI
function updateUI() {
    // Update total points
    document.getElementById('totalPoints').textContent = gameState.totalPoints;

    // Update monthly rewards counter
    const counterElement = document.getElementById('monthlyRewardsCounter');
    const remainingRewards = 10 - gameState.monthlyRewardsClaimed;
    counterElement.textContent = `${gameState.monthlyRewardsClaimed}/10`;

    // Change color based on remaining rewards
    if (gameState.monthlyRewardsClaimed >= 10) {
        counterElement.style.color = '#dc2626'; // Red when limit reached
    } else if (gameState.monthlyRewardsClaimed >= 7) {
        counterElement.style.color = '#f59e0b'; // Orange when close to limit
    } else {
        counterElement.style.color = 'var(--accent-secondary)'; // Default blue
    }

    // Update progress bar and player position
    const maxPoints = 25000;
    const progressPercentage = Math.min((gameState.totalPoints / maxPoints) * 100, 100);
    document.getElementById('progressFill').style.height = progressPercentage + '%';
    document.getElementById('playerIndicator').style.bottom = progressPercentage + '%';

    // Update reward boxes
    updateRewardBoxes();
}

// Update Reward Boxes
function updateRewardBoxes() {
    Object.keys(REWARDS).forEach(points => {
        const rewardBox = document.getElementById(`reward-${points}`);
        const rewardContent = rewardBox.querySelector('.reward-content');
        const reward = REWARDS[points];

        if (gameState.totalPoints >= parseInt(points)) {
            // Unlocked
            rewardContent.classList.remove('locked');
            rewardContent.classList.add('unlocked');

            // Check if claimed
            if (gameState.claimedRewards.includes(parseInt(points))) {
                rewardContent.classList.add('claimed');
                rewardBox.style.pointerEvents = 'none';
                rewardBox.style.cursor = 'default';
            } else if (gameState.monthlyRewardsClaimed >= 10) {
                // Monthly limit reached - lock all remaining rewards
                rewardContent.classList.add('unavailable');
                rewardBox.style.pointerEvents = 'none';
                rewardBox.style.cursor = 'not-allowed';
                rewardBox.title = 'Monthly reward limit reached (10/10). Come back next month!';
            } else {
                // Check if it's a cashback reward and if it can be claimed this month
                if (reward.type === 'cashback' && !canClaimCashback()) {
                    // Cashback already claimed this month
                    rewardContent.classList.add('unavailable');
                    rewardBox.style.pointerEvents = 'none';
                    rewardBox.style.cursor = 'not-allowed';
                    rewardBox.title = 'Cashback already claimed this month. Come back next month!';
                } else if (reward.type === 'choice') {
                    // Choice rewards handle clicks on individual options, not the box
                    rewardContent.classList.remove('unavailable');
                    rewardBox.style.pointerEvents = 'auto';
                    rewardBox.style.cursor = 'default';
                    rewardBox.onclick = null;
                    rewardBox.title = '';
                } else {
                    // Can be claimed (standard/cashback)
                    rewardContent.classList.remove('unavailable');
                    rewardBox.style.pointerEvents = 'auto';
                    rewardBox.style.cursor = 'pointer';
                    rewardBox.onclick = () => claimReward(parseInt(points));
                    rewardBox.title = '';
                }
            }
        } else {
            // Still locked
            rewardContent.classList.add('locked');
            rewardContent.classList.remove('unlocked');
            rewardBox.style.pointerEvents = 'none';
            rewardBox.style.cursor = 'default';
        }
    });

    // Re-attach click handlers for choice rewards after updating states
    renderChoiceRewards();
}

// Claim Reward
function claimReward(points) {
    // CRITICAL: Check if user has enough points first
    if (gameState.totalPoints < points) {
        alert('🔒 Insufficient Points!\n\nYou need ' + points + ' points to claim this reward. You currently have ' + gameState.totalPoints + ' points.');
        return;
    }

    if (gameState.claimedRewards.includes(points)) {
        return; // Already claimed
    }

    const reward = REWARDS[points];

    // Check if monthly reward limit reached (10 rewards max per month)
    if (gameState.monthlyRewardsClaimed >= 10) {
        alert('🔒 Monthly Reward Limit Reached!\n\nYou have claimed 10 rewards this month. Please come back next month to claim more rewards!');
        return;
    }

    // Check if it's a cashback reward and validate monthly eligibility
    if (reward.type === 'cashback') {
        if (!canClaimCashback()) {
            alert('You have already claimed a cashback reward this month. Please try again next month!');
            return;
        }
    }

    // Choice rewards are handled by selectRewardChoice() directly via option clicks
    if (reward.type === 'cashback') {
        // Direct cashback - calculate based on the specific percentage
        const cashbackPercentages = {
            500: 0.01,   // 1%
            1000: 0.01,  // 1%
            1500: 0.015, // 1.5%
            2000: 0.015, // 1.5%
            2500: 0.02,  // 2%
            3000: 0.02,  // 2%
            3500: 0.025, // 2.5%
            4000: 0.025, // 2.5%
            4500: 0.03,  // 3%
            5000: 0.03,  // 3%
            6000: 0.035, // 3.5%
            7500: 0.04,  // 4%
            9000: 0.045, // 4.5%
            10000: 0.05, // 5%
            12000: 0.055, // 5.5%
            15000: 0.06,  // 6%
            18000: 0.07,  // 7%
            20000: 0.08,  // 8%
            22000: 0.09,  // 9%
            25000: 0.10   // 10%
        };

        const percentage = cashbackPercentages[points] || 0.01;
        const cashbackAmount = Math.floor(gameState.monthlySIP * percentage);

        // Mark this reward as claimed
        gameState.claimedRewards.push(points);

        // Update cashback tracking for monthly limit
        gameState.lastCashbackClaim = new Date().toISOString();
        gameState.cashbackClaimedThisMonth = true;

        // Increment monthly reward counter
        gameState.monthlyRewardsClaimed++;

        saveGameState();
        updateRewardBoxes();
        showRewardClaimModal(reward.icon, reward.name, `You received ₹${cashbackAmount} cashback!`, `CASHBACK-₹${cashbackAmount}`);
        addActivity(`Claimed ${reward.name}`, 0, 'reward');
    } else {
        // Standard reward
        gameState.claimedRewards.push(points);

        // Increment monthly reward counter
        gameState.monthlyRewardsClaimed++;

        saveGameState();
        updateRewardBoxes();
        showRewardClaimModal(reward.icon, reward.name, reward.desc, reward.code);
        addActivity(`Claimed ${reward.name}`, 0, 'reward');
    }
}

// Show Reward Choice Modal
function showRewardChoiceModal(points, reward) {
    const modal = document.getElementById('rewardChoiceModal');
    const choicesContainer = document.getElementById('rewardChoices');

    choicesContainer.innerHTML = '';

    reward.options.forEach((option, index) => {
        const choiceCard = document.createElement('div');
        choiceCard.className = 'choice-card';
        choiceCard.innerHTML = `
            <div class="reward-icon">${option.icon}</div>
            <div class="reward-name">${option.name}</div>
            <div class="reward-desc">${option.desc}</div>
        `;
        choiceCard.onclick = () => selectRewardChoice(points, option);
        choicesContainer.appendChild(choiceCard);
    });

    modal.classList.add('show');
}

// Select Reward Choice
function selectRewardChoice(points, selectedReward) {
    // CRITICAL: Check if user has enough points first
    if (gameState.totalPoints < points) {
        alert('🔒 Insufficient Points!\n\nYou need ' + points + ' points to claim this reward. You currently have ' + gameState.totalPoints + ' points.');
        return;
    }

    // Check if already claimed
    if (gameState.claimedRewards.includes(points)) {
        return;
    }

    // Check if monthly reward limit reached (10 rewards max per month)
    if (gameState.monthlyRewardsClaimed >= 10) {
        alert('🔒 Monthly Reward Limit Reached!\n\nYou have claimed 10 rewards this month. Please come back next month to claim more rewards!');
        return;
    }

    // No need to close modal since we're not using one anymore
    gameState.claimedRewards.push(points);

    // Increment monthly reward counter
    gameState.monthlyRewardsClaimed++;

    saveGameState();
    updateRewardBoxes();
    showRewardClaimModal(selectedReward.icon, selectedReward.name, selectedReward.desc, selectedReward.code);
    addActivity(`Claimed ${selectedReward.name}`, 0, 'reward');
}

// Close Reward Choice Modal
function closeRewardChoice() {
    document.getElementById('rewardChoiceModal').classList.remove('show');
}

// Show Reward Claim Modal
function showRewardClaimModal(icon, title, message, code) {
    document.getElementById('rewardIcon').textContent = icon;
    document.getElementById('rewardTitle').textContent = title;
    document.getElementById('rewardMessage').textContent = message;
    document.getElementById('rewardCode').textContent = code;

    document.getElementById('rewardClaimModal').classList.add('show');
}

// Close Reward Claim Modal
function closeRewardClaim() {
    document.getElementById('rewardClaimModal').classList.remove('show');
}

// Add Points
function addPoints(points, activity) {
    gameState.totalPoints += points;
    saveGameState();
    updateUI();
    addActivity(activity, points, 'positive');
    showCelebration(activity, points);
}

// Add Activity to Log
function addActivity(activity, points, type = 'positive') {
    const activityLog = document.getElementById('activityLog');
    const activityItem = document.createElement('div');
    activityItem.className = `activity-item ${type}`;

    const icons = {
        'SIP Topped Up': '💰',
        'Corpus Target Reached': '🎯',
        'Quiz Correct': '📚',
        'Quiz Incorrect': '❌',
        'Daily Login Streak': '📅',
        'Daily Finance Tip': '💡',
        'Daily Challenge Completed': '🎮',
        'Checked Leaderboard': '🏆',
        'Read Financial Article': '📰',
        'Watched Finance Video': '🎥',
        'Listened to Podcast': '🎧',
        'Set New Financial Goal': '🎯',
        'Emergency Fund Check': '🆘',
        'Updated Net Worth': '💼',
        'Celebrated Milestone': '🎊',
        'Increased SIP Amount': '📈',
        'Set Auto-Investment': '🤖',
        'Portfolio Positive Returns': '📊',
        'Beat Benchmark': '🥇',
        'Referred a Friend': '👥',
        'Participated in Discussion': '💬',
        'Helped Answer Question': '🙋',
        'Weekly Challenge Completed': '🏁',
        'Enabled Push Notifications': '🔔',
        'Enabled WhatsApp Updates': '💬',
        'Set Email Preferences': '✉️',
        'Set Market Alert': '📲',
        'Acknowledged Payment Reminder': '⏰',
        'Zero SIP Bounce - 3 Months': '✅',
        'Zero SIP Bounce - 6 Months': '🎖️',
        'No Redemption - 1 Year': '🔒',
        'SIP Continued During Market Fall': '💪',
        'Increased SIP During Dip': '🎯',
        'Gave Feedback': '📝',
        'Submitted Feature Request': '💭',
        'Reported Bug': '🐛',
        'Badge Unlocked': '🏅'
    };

    const icon = icons[activity] || '🎁';

    activityItem.innerHTML = `
        <span class="activity-icon">${icon}</span>
        <span class="activity-text">${activity} ${points > 0 ? `+${points} points` : ''}</span>
        <span class="activity-time">Just now</span>
    `;

    if (activityLog.firstChild) {
        activityLog.insertBefore(activityItem, activityLog.firstChild);
    } else {
        activityLog.appendChild(activityItem);
    }

    // Keep only last 10 activities
    while (activityLog.children.length > 10) {
        activityLog.removeChild(activityLog.lastChild);
    }
}

// Action Name Mapping for Earn Points
const ACTION_NAMES = {
    dailyLogin: 'Daily Login Streak',
    dailyTip: 'Daily Finance Tip',
    dailyChallenge: 'Daily Challenge Completed',
    leaderboard: 'Checked Leaderboard',
    readArticle: 'Read Financial Article',
    watchVideo: 'Watched Finance Video',
    podcast: 'Listened to Podcast',
    newGoal: 'Set New Financial Goal',
    emergencyFund: 'Emergency Fund Check',
    netWorth: 'Updated Net Worth',
    milestone: 'Celebrated Milestone',
    increasedSIP: 'Increased SIP Amount',
    autoInvest: 'Set Auto-Investment',
    positiveReturns: 'Portfolio Positive Returns',
    beatBenchmark: 'Beat Benchmark',
    referFriend: 'Referred a Friend',
    discussion: 'Participated in Discussion',
    helpAnswer: 'Helped Answer Question',
    weeklyChallenge: 'Weekly Challenge Completed',
    pushNotif: 'Enabled Push Notifications',
    whatsapp: 'Enabled WhatsApp Updates',
    emailPref: 'Set Email Preferences',
    marketAlert: 'Set Market Alert',
    paymentReminder: 'Acknowledged Payment Reminder',
    zeroBounce3m: 'Zero SIP Bounce - 3 Months',
    zeroBounce6m: 'Zero SIP Bounce - 6 Months',
    noRedemption: 'No Redemption - 1 Year',
    marketFall: 'SIP Continued During Market Fall',
    sipDip: 'Increased SIP During Dip',
    feedback: 'Gave Feedback',
    featureRequest: 'Submitted Feature Request',
    bugReport: 'Reported Bug',
    badgeUnlock: 'Badge Unlocked'
};

// Generic Earn Points Function
function earnPoints(actionType, points) {
    const actionName = ACTION_NAMES[actionType] || 'Completed Action';
    addPoints(points, actionName);
}

// Simulate SIP Topup
function simulateSIPTopup() {
    addPoints(POINTS_CONFIG.SIP_TOPUP, 'SIP Topped Up');
}

// Simulate Corpus Reached
function simulateCorpusReached() {
    addPoints(POINTS_CONFIG.CORPUS_REACHED, 'Corpus Target Reached');
}

// Quiz Functions
function openQuiz() {
    if (gameState.usedQuestions.length >= QUIZ_QUESTIONS.length) {
        gameState.usedQuestions = [];
        saveGameState();
    }

    const availableQuestions = QUIZ_QUESTIONS.filter((_, index) => !gameState.usedQuestions.includes(index));
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    const originalIndex = QUIZ_QUESTIONS.indexOf(question);

    window.currentQuestion = {
        data: question,
        index: originalIndex
    };

    document.getElementById('quizQuestion').textContent = question.question;
    document.getElementById('questionNumber').textContent = gameState.usedQuestions.length + 1;
    document.getElementById('totalQuestions').textContent = QUIZ_QUESTIONS.length;

    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(button);
    });

    const feedback = document.getElementById('quizFeedback');
    feedback.className = 'quiz-feedback';
    feedback.textContent = '';

    document.getElementById('quizModal').classList.add('show');
}

function selectAnswer(selectedIndex) {
    const question = window.currentQuestion.data;
    const isCorrect = selectedIndex === question.correct;

    gameState.usedQuestions.push(window.currentQuestion.index);
    saveGameState();

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === question.correct) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    const feedback = document.getElementById('quizFeedback');
    feedback.classList.add('show');

    if (isCorrect) {
        feedback.classList.add('correct');
        feedback.innerHTML = `<strong>✅ Correct!</strong><br>${question.explanation}`;
        addPoints(POINTS_CONFIG.QUIZ_CORRECT, 'Quiz Correct');

        setTimeout(() => {
            closeQuiz();
        }, 2000);
    } else {
        feedback.classList.add('incorrect');
        feedback.innerHTML = `<strong>❌ Incorrect!</strong><br>${question.explanation}`;
        addActivity('Quiz Incorrect', 0, 'positive');

        setTimeout(() => {
            closeQuiz();
        }, 3000);
    }
}

function closeQuiz() {
    document.getElementById('quizModal').classList.remove('show');
}

// Celebration Modal
function showCelebration(activity, points) {
    const modal = document.getElementById('celebrationModal');
    const icons = {
        'SIP Topped Up': '💰',
        'Corpus Target Reached': '🎯',
        'Quiz Correct': '📚'
    };

    const titles = {
        'SIP Topped Up': 'Great Investment!',
        'Corpus Target Reached': 'Goal Achieved!',
        'Quiz Correct': 'Smart Move!'
    };

    document.getElementById('celebrationIcon').textContent = icons[activity] || '🎉';
    document.getElementById('celebrationTitle').textContent = titles[activity] || 'Awesome!';
    document.getElementById('celebrationMessage').textContent = activity;
    document.getElementById('pointsEarned').textContent = `+${points}`;

    modal.classList.add('show');

    setTimeout(() => {
        closeCelebration();
    }, 2000);
}

function closeCelebration() {
    document.getElementById('celebrationModal').classList.remove('show');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const quizModal = document.getElementById('quizModal');
    const celebrationModal = document.getElementById('celebrationModal');
    const rewardChoiceModal = document.getElementById('rewardChoiceModal');
    const rewardClaimModal = document.getElementById('rewardClaimModal');

    if (event.target === quizModal) {
        closeQuiz();
    }
    if (event.target === celebrationModal) {
        closeCelebration();
    }
    if (event.target === rewardChoiceModal) {
        closeRewardChoice();
    }
    if (event.target === rewardClaimModal) {
        closeRewardClaim();
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initGame);
