import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import sharp from 'sharp';
// @ts-ignore
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.min.mjs';

// const groq = new Groq({
//     apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
//     dangerouslyAllowBrowser: true  // Enable browser usage
// });
interface RFQRequirements {
    solicitationNumber: string,
    solicitationTypeIndicator: string,
    smallBusinessSetAsideIndicator: string,
    additionalClauseFillInsIndicator: string,
    rfqReturnByDate: string,
    fobPoint: string,
    inspectionCodePoint: string,
    purchaseRequestNumber: string,
    nationalStockNumber: string,
    unitOfIssue: string,
    quantity: string,
    deliveryDays: string,
    guaranteedMinimum: string,
    doMinimum: string,
    contractMaximum: string,
    annualFrequencyOfBuys: string,
    hubZonePreferenceIndicator: string,
    tradeAgreementsIndicator: string,
    buyAmericanIndicator: string,
    freeTradeAgreementsIndicator: string,
    priceBreaksSolicitedIndicator: string,
    itemDescriptionIndicator: string,
    higherLevelQualityIndicator: string,
}

const emptyRFQRequirements = (): RFQRequirements => ({
    solicitationNumber: '',
    solicitationTypeIndicator: '',
    smallBusinessSetAsideIndicator: '',
    additionalClauseFillInsIndicator: '',
    rfqReturnByDate: '',
    fobPoint: '',
    inspectionCodePoint: '',
    purchaseRequestNumber: '',
    nationalStockNumber: '',
    unitOfIssue: '',
    quantity: '',
    deliveryDays: '',
    guaranteedMinimum: '',
    doMinimum: '',
    contractMaximum: '',
    annualFrequencyOfBuys: '',
    hubZonePreferenceIndicator: '',
    tradeAgreementsIndicator: '',
    buyAmericanIndicator: '',
    freeTradeAgreementsIndicator: '',
    priceBreaksSolicitedIndicator: '',
    itemDescriptionIndicator: '',
    higherLevelQualityIndicator: ''
})

export async function POST(req: Request) {
    try {
        // @ts-ignore
        await import('pdfjs-dist/build/pdf.worker.mjs');

        const formData = await req.formData();
        const file = formData.get("file");
        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Write the uploaded file to temp directory
        const arrayBuffer = await (file as File).arrayBuffer();
        //const buffer = Buffer.from(arrayBuffer);
        const uint8ArrayBuffer : Uint8Array = new Uint8Array(arrayBuffer);
        const pdf = await pdfjs.getDocument({data: uint8ArrayBuffer}).promise;

        const csvObject = emptyRFQRequirements();

        //Get Page 1 fields
        const page1 = await pdf.getPage(1);
        const page1TextContent = await page1.getTextContent();
        const page1Text = page1TextContent.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
        const page2 = await pdf.getPage(2);
        const page2TextContent = await page2.getTextContent();
        const page2Text = page2TextContent.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");

        //1. Solicitation Number
        const solicitationNumberRegex = /REQUEST NO\.\s+(\S+)/;
        csvObject.solicitationNumber = page1Text.match(solicitationNumberRegex)[1];

        //2. Solicitation Type Indicator
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            if(pageTextContent.includes("UNILATERAL IDC")) {
                csvObject.solicitationTypeIndicator = "I";
                break;
            }
            //Need to check for conditions that get F or P
        }

        //3. Small Business Set-Aside Indicator
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            if(pageTextContent.includes("FAR 52.219-6 Notice of Total Small Business Set-Aside")) {
                csvObject.smallBusinessSetAsideIndicator = "Y";
                break;
            } else if(pageTextContent.includes("FAR 52.219-3 Notice of HUBZone Set-Aside or Sole Source Award")){
                csvObject.smallBusinessSetAsideIndicator = "H";
                break;
            } else if(pageTextContent.includes("FAR 52.219-27 Notice of Service-Disabled Veteran-Owned Small Business Set-Aside")){
                csvObject.smallBusinessSetAsideIndicator = "R";
                break;
            } else if(pageTextContent.includes("FAR 52.219-30 Notice of Set-aside for, or Sole Source Award to Women-Owned Small Business Concerns")){
                csvObject.smallBusinessSetAsideIndicator = "L";
                break;
            } 
            //Need text to identify A, 8a Set-Aside and E, EDWOSB Set-Aside
            else {
                csvObject.smallBusinessSetAsideIndicator = "N";
            }
        }

        //4. Additional Clause Fill-In Indicators, unsure what identifies a Y
        csvObject.additionalClauseFillInsIndicator = "N";

        //5. RFQ Return By Date
        const returnByDateRegex = /\d{4}\s+[A-Z]{3}\s+\d{1,2}/g;
        const returnByDate = page1Text.match(returnByDateRegex)[1];
        csvObject.rfqReturnByDate = convertDateFormat(returnByDate);

        //6. Quoter Cage Code, not an RFQ requirement, default to blank, look to website for conditions
        //7. Quote for Cage Code, not an RFQ requirement, default to blank, look to website for conditions
        //8 - 12 Blank
        //13. Small Business and Other Contractor Representations Code, not an RFQ requirement, default to blank, look to website for conditions
        //14 - 17 Blank
        //18. Joint Venture -- Not an RFQ requirement, default to blank, look to website for conditions
        //19. Joint Venture Remarks -- Not an RFQ requirement, default to blank, look to website for conditions
        //20. Blank
        //21. Affirmative Action Compliance Code -- Not an RFQ requirement, default to blank, look to website for conditions
        //22. Previous Contracts and Compliance Reports Code -- Not an RFQ requirement, default to blank, look to website for conditions
        //23. Alternate Disputes Resolution -- Not an RFQ requirement, default to blank, look to website for conditions
        //24. Bid Type Code -- Not an RFQ requirement, default to BI, look to website for conditions
        //25. Prompt Payment Discount Terms Code -- Not an RFQ requirement, default to 1, look to website for conditions
        //26. Vendor Quote Number -- Not an RFQ requirement, default to blank, self entered
        //27. Days Quote Valid -- Not an RFQ requirement, default to 90, self entered, implications for 24
        //28. Meets Packaging Requirement -- Not an RFQ requirement, default to blank, look to website for conditions, self entered
        //29. Basic Ordering Agreement (BOA)/ Federal Supply Schedule (FSS)/Blanket Purchase Agreement (BPA). -- Not an RFQ Requirement, default to NAP, look to website for conditions
        //30. BOA/FSS/BPA Contract Number -- Not an RFQ Requirement, default to blank, look to website for conditions
        //31. BOA/FSS/BPA Contract Expiration Date -- Not an RFQ Requirement, default to blank, look to website for conditions

        //32. FOB Point either DELIVER FOB: ORIGIN or DELIVER FOB: DESTINATION, can have several
        //Assuming deliver FOB only shows up once per page
        const fobPointRegex = /DELIVER FOB:\s+(\S+)/g;
        const fobPointsArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const fobPoint = pageTextContent.match(fobPointRegex);
            if(fobPoint != null) {
                fobPointsArray.push(fobPoint[0].includes("ORIGIN") ? "O" : "D");
            }
        }
        //currently only supports one FOB Point
        csvObject.fobPoint = fobPointsArray[0];
        console.log(csvObject);
        
        const prNoRegex = /REQUISITION\/PURCHASE REQUEST NO\.\s+(\S+)/;
        //If PR No is See, then there are multiple PR Nos and we'll have to find them in the text on other pages
        console.log("PR No: ", page1Text.match(prNoRegex)[1]);
        //21 RFQ Requirements to extract
        //Goal for Today, Extract all the RFQ requirements from a document with only 1 NSN and 1 requisistion number
        /*
        32. FOB Point -- DELIVER FOB: ORIGIN for O or DESTINATION for D, if O 33, 34, 35 are required, just don't know which city, Acceptance Point: also seems to give answer
        33, 34, 35 -- If 32 is O, these are required, don't know which city
        36. Inspection Point Code -- D for Destination O for Origin, if different from RFQ requirement, change 24 to BW or AB, found in Section B
        37. Place of Government Inspection - Packaging CAGE code -- if 36 is D, this is blank, if O this is required, what is the packaging CAGE code, where to find it?
        38. Place of Government Inspection - Supplies CAGE code -- if 36 is D, this is blank, if O this is required, what is the supplies CAGE code, where to find it?
        39. "N" in the sample document, but blank on the website, unclear
        40 - 43 -- Blank
        44. Solicitation Line Number -- CLIN, if Request No. is "See", there may be multiple PRLIs, need to find them in the text, otherwise, it's 0001
        45. Blank
        46. Purchase Request Number -- if Request No. is "See", there may be multiple, otherwise just find the one, should follow "PR: "
        47. National Stock Number / Part Number -- Will match "NSN/MATERIAL: "
        48. Unit of Issue -- UI in the table in section B
        49. Quantity -- Quantity value in the table in Section B
        50. Unit Price -- I think we enter it
        51. Delivery Days -- follows "Delivery (in days):" in RFQ
        52. Guaranteed Minimum -- Found with "Guaranteed Contract Minimum Quantity:" otherwise blank
        53. DO Minimum -- If 56 is yes, leave blank, else "Minimum Delivery Order Quantity: "
        54. Contract Maximum -- Can be found with "Contract Maximum Value:  " leave blank if 52 and 53 blank
        55. Annual Frequency of Buys (AFB) -- Can be found with "Estimated Number of orders: " if no gauranteed Minimum, leave blank
        56. No DO Minimum Quantity? -- If 2 != I, leave blank, if 2 == I, must be Y or N
        57. HUBZone Preference Indicator -- If "FAR 52.219-4 Notice of Price Evaluation Preference for HUBZone Small Business Concerns" is in the text, Y, else N
        58. Waiver of HUBZone Preference -- If 57 is N, leave blank, if 57 is Y && 13 is 'B' or 'M', then choose Y or N, if small business not certified choose NA, otherwise blank
        59. Immediate Shipment Price -- if 100 is N leave blank, else enter
        60. Immediate Shipment Delivery Days -- if 100 is N leave blank, else enter
        61. Blank
        62. Trade Agreements Indicator -- if "DFARS 252.225-7020 TRADE AGREEMENTS CERTIFICATE AND DFARS 252.225-7021 TRADE AGREEMENTS APPLIES" then Y, if "FREIGHT SHIPPING ADDRESS: " has a non US address I, else N
        63. Source of Supply Cage Code -- if 102 is QD enter, else blank
        64. First Article Waiver Code -- if 15 is 0001S00000052 or 0001S00000053, must be Y or N, else blank
        65. Hazardous Material Identification and Material Safety Data -- Something to do with FAR 52.223 - 3, but can be left blank, will just leave blank, not a RFQ requirement
        66. Hazardous Warning Labels -- Can be blank or you enter 1 - 7
        67. Material Requirements -- can be 0-4, if 2 is I and this is 4, then 24 must be BW or AB
        68. Buy American Indicator -- if "DFARS 252.225-7001, BUY AMERICAN AND BALANCE OF PAYMENTS PROGRAM" then Y, else if delivering international I, else N
        69. Free Trade Agreements Indicator -- if 68 is I, then I, else seems N, not sure how to determine the other letters
        70. Buy American/Free Trade/Trade Agreements End Product -- Self entered, lots of rules
        71. Buy American/ Free Trade Agreements/Trade Agreements Country of Origin Code -- Self entered, lots of rules
        72. Buy American / Free Trade / Trade Agreements Country Code -- Self entered, lots of rules
        73. Duty Free Entry Requested -- N Default, if 68 is I then blank, else Y or N
        74. Duty Free Entry Requested/Foreign Supplies in US Code -- if 68 is I then blank, only if 73 is Y, enter Y or N
        75. Duty Free Entry Requested/Duty Paid Code -- if 68 is I then blank, else only if 74 is Y, enter Y or N
        76. Duty Free Entry Requested/Duty Paid Amount -- if 68 is I or 75 is not N leave blank, else enter
        77. Price Breaks Solicited Indicator -- if contains "Please provide the following price breaks" then Y, else N, don't leave blank
        78. Quantity Price Breaks - Range 1 Lower Quantity, if 2 is F or P, enter a value, first value under "QTY Range From"
        79. Quantity Price Breaks - Range 1 Upper Quantity, if 2 is F or P, enter a value, first value under "QTY Range To"
        80. Quantity Price Breaks - Range 1 Unit Price -- first value under "Price"
        81. Quantity Price Breaks - Range 2 Lower Quantity, if 2 is F or P, enter a value, second value under "QTY Range From"
        82. Quantity Price Breaks - Range 2 Upper Quantity, if 2 is F or P, enter a value, second value under "QTY Range To"
        83. Quantity Price Breaks - Range 2 Unit Price -- second value under "Price"
        84 - 95, is 78 - 80 repeated for many other line items
        96. Quantity Variance Plus -- base is 0, 0-10 value entered by user, not from RFQ, look for other conditions
        97. Quantity Variance Minus -- base is 0, 0-10 value entered by user, not from RFQ, look for other conditions
        98. Minimum Order Quantity Code -- base is N, look at website to see conditions, base value is N
        99. Minimum Order Maximum Quantity -- if 98 is Y, must enter value, else blank
        100. Immediate Shipment Available -- Y or N value, base value is N, look at website for conditions
        101. Immediate Shipment Quantity -- Number value, conditions on answering in the website
        102. Manufacturer/Dealer -- You enter value based on conditions
        103. Actual Manufacturing/Production Source CAGE code -- A self entered cage code, conditions for entering on website, default blank
        104. Actual Manufacturing/Production Source Name and Address -- A self entered text, conditions for entering on the website, default blank
        105. Item Description Indicator -- RFQ Requirement -- if "SOURCE CONTROL DATA" then B, not sure about P, if "QML or QPL Item" then Q, if "DETAILED DRAWING" or "FULL AND OPEN COMPETITION APPLY" lots of items to identify D, will come back to try to identify this or ask them to
        106. Part Number Offered Code -- base is blank, enter yourself, conditions on website
        107. Part Number Offered CAGE code -- enter yourself, conditions on website, can be blank
        108. Part Number Offered - Part Number -- enter yourself, conditions on website, can be blank
        109. Part Number Offered Remarks -- enter yourself, conditions on website, can be blank
        110. Supplies Offered -- enter yourself, conditions on website, can be blank
        111. Supplies Offered Remarks -- enter yourself, conditions on website, can be blank
        112. Qualification Requirements MFG CAGE -- enter yourself, conditions on website, can be blank
        113. Qualification Requirements Source CAGE -- enter yourself, conditions on website, can be blank
        114. Qualification Requirements Item Name -- enter yourself, conditions on website, can be blank
        115. Qualification Requirements Service Identification -- enter yourself, conditions on website, can be blank
        116. Qualification Requirements Test Number -- enter yourself, conditions on website, can be blank
        117. Higher-Level Quality Indicator -- RFQ -- if "Non-Tailored Higher-Level Quality Requirements (ISO 9001:2015)" for NSN then 7, if "MINIMUM MUST COMPLY WITH SAE AS9003 OR ISO 9001" then 6, if "MANAGEMENT SYSTEM MUST COMPLY WITH SAE AS9100" then 8, else N
        118. Higher-Level Quality Code -- enter yourself, conditions on website, can be blank
        119. Higher-Level Quality Remarks -- enter yourself, conditions on website, can be blank
        120. Child Labor Certification Code -- enter yourself, conditions on website, must be N, can't be blank
        121. Quote Remarks -- enter yourself, conditions on website, can be left blank


        There can be multiple NSN's per document, meaning we need to find values for all distinct NSN's
        May be worth doing a first round of elimination, if we won't have the NSNs, no point in processing the rest of the document
      */
        return NextResponse.json({ response: page1Text + page2Text });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function convertDateFormat(dateStr: string): string {
    // Create a map for month abbreviations to numbers
    const monthMap: { [key: string]: string } = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };

    // Split the date string into parts
    const [year, month, day] = dateStr.trim().split(' ');
    
    // Pad the day with leading zero if needed
    const paddedDay = day.padStart(2, '0');
    
    // Get month number from map
    const monthNum = monthMap[month.toUpperCase()];

    // Return formatted date
    return `${monthNum}/${paddedDay}/${year}`;
}
