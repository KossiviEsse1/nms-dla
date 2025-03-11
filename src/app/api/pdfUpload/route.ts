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

interface lineItem {
    CLIN: string,
    PR: string,
    PRLI: string,
    UI: string,
    QUANTITY: string,
    UNIT_PRICE: string,
    TOTAL_PRICE: string,
}

const emptyLineItem = (): lineItem => ({
    CLIN: '',
    PR: '',
    PRLI: '',
    UI: '',
    QUANTITY: '',
    UNIT_PRICE: '',
    TOTAL_PRICE: '',
})

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

        let allTextPages = page1Text;
        for(let i = 2; i<=pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            allTextPages += pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
        }

        //1. Solicitation Number
        csvObject.solicitationNumber = getSolicitationNumber(page1Text);

        //2. Solicitation Type Indicator
        csvObject.solicitationTypeIndicator = getSolicitationTypeIndicator(allTextPages);

        //3. Small Business Set-Aside Indicator
        csvObject.smallBusinessSetAsideIndicator = getSmallBusinessSetAsideIndicator(allTextPages);

        //4. Additional Clause Fill-In Indicators, unsure what identifies a Y
        csvObject.additionalClauseFillInsIndicator = "N";

        //5. RFQ Return By Date
        csvObject.rfqReturnByDate = getReturnByDate(page1Text);

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

        //32. FOB Point, can have several
        const fobPointsArray = getFOBPoint(allTextPages);
        csvObject.fobPoint = fobPointsArray[0];

        //33. FOB City -- Not an RFQ requirement, default to blank, look to website for conditions
        //34. FOB State/Province -- Not an RFQ requirement, default to blank, look to website for conditions
        //35. FOB Country -- Not an RFQ requirement, default to blank, look to website for conditions

        //36. Inspection Point Code, can have several
        //currently only supports one Inspection Point
        csvObject.inspectionCodePoint = getInspectionPoint(allTextPages);

        //37. Place of Government Inspection - Packaging CAGE code - Not an RFQ requirement, default to blank, look to website for conditions
        //38. Place of Government Inspection - Supplies CAGE code - Not an RFQ requirement, default to blank, look to website for conditions
        //39. Reserved -- Not an RFQ requirement, default to N
        //40- 43 Blank

        //44. Solicitation Line Number -- Not explicitly an RFQ requirement, but from RFQ, equivalent to number of FOB Points if multiple requisition numbers, otherwise 0001
        const solicitationLineNumbers = getSolicitationLineNumber(fobPointsArray);
        
        //45. RESERVED -- Not an RFQ requirement, default to blank

        //46. Purchase Request Number -- written to support many PR Nos, but focused on one for now
        csvObject.purchaseRequestNumber = getPurchaseRequestNumber(page1Text, allTextPages)[0];

        //47. National Stock Number / Part Number -- Will match "NSN/MATERIAL: " Can have multiple, focusing on one for now
        csvObject.nationalStockNumber = getNationalStockNumber(allTextPages)[0];

        //48. Unit of Issue -- can have several line items, using regex to find them, assuming for one
        const unitOfIssueArray = getUnitOfIssue(allTextPages);
        csvObject.unitOfIssue = unitOfIssueArray[0].UI;
        //49. Quantity -- Leveraging line items to get the quantity
        csvObject.quantity = unitOfIssueArray[0].QUANTITY;

        //50. Unit Price -- Not an RFQ requirement, default to blank, enter ourselves

        //51. Delivery Days -- follows "Delivery (in days):" in RFQ
        csvObject.deliveryDays = getDeliveryDays(allTextPages)[0];
        
        //52. Guaranteed Minimum -- Identified with "Guaranteed Contract Minimum Quantity:" otherwise blank, there may be multiple, focusing on one for now
        const guaranteedMinimum = getGuaranteedMinimum(allTextPages);
        if(guaranteedMinimum.length != 0) {
            //Assuming only one guaranteed minimum per RFQ
            csvObject.guaranteedMinimum = guaranteedMinimum[0];
        }

        //53. DO Minimum -- If 56 is yes, leave blank, else "Minimum Delivery Order Quantity: "
        const doMinimum = getDOMinimum(allTextPages);
        if(doMinimum.length != 0) {
            csvObject.doMinimum = doMinimum[0];
        }

        //54. Contract Maximum -- Can be found with "Contract Maximum Value:  " leave blank if 52 and 53 blank
        const contractMaximum = getContractMaximum(allTextPages);
        if(contractMaximum.length != 0) {
            csvObject.contractMaximum = contractMaximum[0];
        }

        //55. Annual Frequency of Buys (AFB) -- Can be found with "Estimated Number of orders: " if no gauranteed Minimum, leave blank
        const annualFrequencyOfBuys = getAnnualFrequencyOfBuys(allTextPages);
        if(annualFrequencyOfBuys.length != 0) {
            csvObject.annualFrequencyOfBuys = annualFrequencyOfBuys[0];
        }
        
        //56. No DO Minimum Quantity? -- Not an RFQ requirement, default to blank

        //57. HUBZone Preference Indicator -- If "FAR 52.219-4 Notice of Price Evaluation Preference for HUBZone Small Business Concerns" is in the text, Y, else N
        csvObject.hubZonePreferenceIndicator = getHubZonePreferenceIndicator(allTextPages);

        //58. Waiver of HUBZone Preference -- Not an RFQ requirement, default to blank
        //59. Immediate Shipment Price -- Not an RFQ requirement, default to blank
        //60. Immediate Shipment Delivery Days -- Not an RFQ requirement, default to blank
        //61. RESERVED, default to blank

        //62. Trade Agreements Indicator -- Need to fix condition for I
        csvObject.tradeAgreementsIndicator = getTradeAgreementsIndicator(allTextPages);
        
        //63. Source of Supply Cage Code -- Not an RFQ requirement, default to blank
        //64. First Article Waiver Code -- Not an RFQ requirement, default to blank
        //65. Hazardous Material Identification and Material Safety Data -- Not an RFQ requirement, default to blank
        //66. Hazardous Warning Labels -- Not an RFQ requirement, default to blank
        //67. Material Requirements -- Not an RFQ requirement, default to blank

        //68. Buy American Indicator
        csvObject.buyAmericanIndicator = getBuyAmericanIndicator(allTextPages, csvObject);

        //69. Free Trade Agreements Indicator
        csvObject.freeTradeAgreementsIndicator = getFreeTradeAgreementsIndicator(allTextPages, csvObject);

        //70. Buy American/Free Trade/Trade Agreements End Product -- Not an RFQ requirement, default to blank
        //71. Buy American/ Free Trade Agreements/Trade Agreements Country of Origin Code -- Not an RFQ requirement, default to blank
        //72. Buy American / Free Trade / Trade Agreements Country Code -- Not an RFQ requirement, default to blank
        //73. Duty Free Entry Requested -- N Default, Not an RFQ requirement
        //74. Duty Free Entry Requested/Foreign Supplies in US Code -- Not an RFQ requirement, default to blank
        //75. Duty Free Entry Requested/Duty Paid Code -- Not an RFQ requirement, default to blank
        //76. Duty Free Entry Requested/Duty Paid Amount -- Not an RFQ requirement, default to blank

        //77. Price Breaks Solicited Indicator -- if contains "Please provide the following price breaks" then Y, else N, don't leave blank
        csvObject.priceBreaksSolicitedIndicator = getPriceBreaksSolicitedIndicator(allTextPages);        

        //SPE7M225Q0426 has some edge cases for many values
        //78 - 95, are quantities taken from RFQ if 77 is Y, currently not going to bother
        //96. Quantity Variance Plus -- Not an RFQ requirement, but gathered from RFQ, skipping for now
        //97. Quantity Variance Minus -- Not an RFQ requirement, but gathered from RFQ, skipping for now
        //98. Minimum Order Quantity Code -- Not an RFQ requirement, default to N, look at website to see conditions
        //99. Minimum Order Maximum Quantity -- Not an RFQ requirement, default to blank, if 98 is Y, must enter value, else blank
        //100. Immediate Shipment Available -- Not an RFQ requirement, default to N, look at website for conditions
        //101. Immediate Shipment Quantity -- Not an RFQ requirement, default to blank, conditions on answering in the website
        //102. Manufacturer/Dealer -- Not an RFQ requirement, You enter value based on conditions
        //103. Actual Manufacturing/Production Source CAGE code -- Not an RFQ requirement, conditions for entering on website, default blank
        //104. Actual Manufacturing/Production Source Name and Address -- Not an RFQ requirement, A self entered text, conditions for entering on the website, default blank

        //105. Item Description Indicator, Certain for B, Q, N, unsure about D, P, and S
        csvObject.itemDescriptionIndicator = getItemDescriptionIndicator(allTextPages);    

        //106. Part Number Offered Code -- Not an RFQ requirement, base is blank, enter yourself, conditions on website
        //107. Part Number Offered CAGE code -- Not an RFQ requirement, enter yourself, conditions on website, can be blank
        //108. Part Number Offered - Part Number -- Not an RFQ requirement, enter yourself, conditions on website, can be blank
        //109. Part Number Offered Remarks -- Not an RFQ requirement, enter yourself, conditions on website, can be blank
        //110. Supplies Offered -- Not an RFQ requirement, conditions on website, can be blank
        //111. Supplies Offered Remarks -- Not an RFQ requirement, enter yourself, conditions on website, can be blank
        //112. Qualification Requirements MFG CAGE -- Not an RFQ requirement, enter yourself, conditions on website, can be blank
        //113. Qualification Requirements Source CAGE -- Not an RFQ requirement, enter yourself, conditions on website, can be blank
        //114. Qualification Requirements Item Name -- enter yourself, conditions on website, can be blank
        //115. Qualification Requirements Service Identification -- enter yourself, conditions on website, can be blank
        //116. Qualification Requirements Test Number -- enter yourself, conditions on website, can be blank

        //117. Higher-Level Quality Indicator
        csvObject.higherLevelQualityIndicator = getHigherLevelQualityIndicator(allTextPages);

        //118. Higher-Level Quality Code -- enter yourself, conditions on website, can be blank
        //119. Higher-Level Quality Remarks -- enter yourself, conditions on website, can be blank
        //120. Child Labor Certification Code -- enter yourself, conditions on website, must be N, can't be blank
        //121. Quote Remarks -- enter yourself, conditions on website, can be left blank

        /*
        There can be multiple NSN's per document, meaning we need to find values for all distinct NSN's
        May be worth doing a first round of elimination, if we won't have the NSNs, no point in processing the rest of the document
        */
        const csvString = rfqRequirementsToCsv(csvObject);
        return NextResponse.json({ response: csvString });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function getSolicitationNumber(text: string): string {
    const solicitationNumberRegex: RegExp = /REQUEST NO\.\s+(\S+)/;
    return text.match(solicitationNumberRegex)[1];
}

function getSolicitationTypeIndicator(text: string): string {
    if(text.includes("UNILATERAL IDC")) {
        return "I"
    }
    return "P";
}

function getSmallBusinessSetAsideIndicator(text: string): string {
    if(text.includes("FAR 52.219-6 Notice of Total Small Business Set-Aside")) {
        return "Y";
    } else if(text.includes("FAR 52.219-3 Notice of HUBZone Set-Aside or Sole Source Award")){
        return "H"
    } else if(text.includes("FAR 52.219-27 Notice of Service-Disabled Veteran-Owned Small Business Set-Aside")){
        return "R"
    } else if(text.includes("FAR 52.219-30 Notice of Set-aside for, or Sole Source Award to Women-Owned Small Business Concerns")){
        return "L"
    } 
    //Need text to identify A, 8a Set-Aside and E, EDWOSB Set-Aside
    else {
        return "N";
    }
}

function getReturnByDate(text: string): string {
    const returnByDateRegex = /\d{4}\s+[A-Z]{3}\s+\d{1,2}/g;
    const returnByDate = text.match(returnByDateRegex)[1];
    return convertDateFormat(returnByDate);
}

function getFOBPoint(text: string): string[] {
    //currently only supports one FOB Point
    //Assuming 'DELIVER FOB:' only shows up once per page
    const fobPointRegex = /DELIVER FOB:\s+(\S+)/g;
    const fobPointsMatch = text.match(fobPointRegex);
    if(fobPointsMatch != null) {
        const fobPointsArray = fobPointsMatch.map((point) => point.includes("ORIGIN") ? "O" : "D");
        return fobPointsArray;
    } else {
        return [""];
    }
}

function getInspectionPoint(text: string): string {
    //currently only supports one FOB Point
    const inspectionPointRegex = /INSPECTION POINT:\s+(\S+)/g;
    const inspectionPointMatch = text.match(inspectionPointRegex);
    if(inspectionPointMatch != null) {
        const inspectionPointsArray = inspectionPointMatch.map((point) => point.includes("ORIGIN") ? "O" : "D");
        return inspectionPointsArray[0];
    } else {
        return "";
    }
}

function getPurchaseRequestNumber(text1: string, text2: string): string[] {
    const purchaseRequestNumberRegex = /REQUISITION\/PURCHASE REQUEST NO\.\s+(\S+)/;
    const purchaseRequestNo = text1.match(purchaseRequestNumberRegex)[1];
    if(purchaseRequestNo == "See") {
        //There are multiple PR Numbers
        const prNumberRegex = /PR:\s+(\S+)/g;
        const purchaseRequestNumbers = text2.match(prNumberRegex).map((number) => number.substring(4));
        const uniquePurchaseRequestNumbers = [...new Set(purchaseRequestNumbers)];
        return uniquePurchaseRequestNumbers;
    } else {
        return [purchaseRequestNo];
    }
}

function getNationalStockNumber(text: string): string[] {
    const nsnRegex = /NSN\/MATERIAL:(\S+)/g;
    const nsnMatch = text.match(nsnRegex);
    if(nsnMatch != null) {
        const nsns = nsnMatch.map((nsn) => nsn.substring(13));
        const uniqueNationalStockNumbers = [...new Set(nsns)];
        return uniqueNationalStockNumbers;
    } else {
        return [""];
    }
}

function getUnitOfIssue(text: string): lineItem[] {
    const unitOfIssueRegex = /(?<=PRICE \.).*?(?=NSN\/MATERIAL)/g;
    const unitOfIssueMatch = text.match(unitOfIssueRegex);
    if(unitOfIssueMatch != null) {
        const unitOfIssueArray = unitOfIssueMatch.map((unit) => unit.trim().split(" "));
        const lineItems: lineItem[] = unitOfIssueArray.map((unit) => {
            if(unit.length == 7) {
                return {
                    CLIN: unit[0],
                    PR: unit[1],
                    PRLI: unit[2],
                    UI: unit[3],
                    QUANTITY: unit[4],
                    UNIT_PRICE: unit[5],
                    TOTAL_PRICE: unit[6],
                }
            } else {
                return {
                    CLIN: unit[0],
                    PR: unit[1],
                    PRLI: unit[2],
                    UI: unit[3],
                    QUANTITY: unit[4],
                    UNIT_PRICE: '',
                    TOTAL_PRICE: '',
                }
            }
        });
        return lineItems;
    } else {
        return [emptyLineItem()];
    }
}

function getDeliveryDays(text: string): string[] {
    const deliveryDaysRegex = /DELIVERY \(IN DAYS\):(\S+)/g;
    const deliveryDaysMatch = text.match(deliveryDaysRegex);
    if(deliveryDaysMatch != null) {
        const deliveryDays = deliveryDaysMatch.map((day) => day.substring(19));
        return deliveryDays;
    } else {
        return [""];
    }
}

function getGuaranteedMinimum(text: string): string[] {
    //Assuming only one guaranteed minimum per RFQ
    const guaranteedMinimumRegex = /Guaranteed Contract Minimum Quantity:\s+(\S+)/g;
    const guaranteedMinMatch = text.match(guaranteedMinimumRegex);
    if(guaranteedMinMatch != null) {
        const guaranteedMinimum = guaranteedMinMatch.map((day) => day.substring(38));
        return guaranteedMinimum;
    } else {
        return [""];
    }
}

function getDOMinimum(text: string): string[] {
    const doMinimumRegex = /Minimum Delivery Order Quantity:\s+(\S+)/;
    const doMinimumMatch = text.match(doMinimumRegex);
    if(doMinimumMatch != null) {
        const doMinimum = doMinimumMatch.map((day) => day.substring(33)).filter((day) => day != "");
        return doMinimum;
    } else {
        return [""];
    }
}

function getContractMaximum(text: string): string[] {
    const contractMaximumRegex = /Contract Maximum Value: \$(\S+)/;
    const contractMaximumMatch = text.match(contractMaximumRegex);
    if(contractMaximumMatch != null) {
        const contractMaximum = contractMaximumMatch.map((day) => day.substring(25)).filter((day) => day != "");
        return contractMaximum;
    } else {
        return [""];
    }
}

function getAnnualFrequencyOfBuys(text: string): string[] {
    const annualFrequencyOfBuysRegex = /Estimated Number of orders: (\S+)/;
    const annualFrequencyOfBuysMatch = text.match(annualFrequencyOfBuysRegex);
    if(annualFrequencyOfBuysMatch != null) {
        const annualFrequencyOfBuys = annualFrequencyOfBuysMatch.map((day) => day.substring(28)).filter((day) => day != "");
        return annualFrequencyOfBuys;
    } else {
        return [""];
    }
}

function getHubZonePreferenceIndicator(text: string): string {
    const hubZonePreferenceIndicatorRegex = /FAR 52\.219-4 Notice of Price Evaluation Preference for HUBZone Small Business Concerns/;
    const hubZonePreferenceIndicator = text.match(hubZonePreferenceIndicatorRegex);
    if(hubZonePreferenceIndicator != null) {
        return "Y";
    } else {
        return "N";
    }
}

function getSolicitationLineNumber(fobPointsArray: string[]): string[] {
    const solicitationLineNumbers = [];
    for(let i = 1; i <= fobPointsArray.length; i++) {
        solicitationLineNumbers.push(i.toString().padStart(4, '0'));
    }
    return solicitationLineNumbers;
}

function getTradeAgreementsIndicator(text: string): string {
    const tradeAgreementsIndicatorRegex1 = /DFARS 252\.225-7020 TRADE AGREEMENTS CERTIFICATE AND DFARS 252\.225-7021 TRADE AGREEMENTS APPLIES/;
    const tradeAgreementsIndicatorRegex2 = /FOR GOVERNMENT USE ONLY/i;
    const tradeAgreementsIndicator = text.match(tradeAgreementsIndicatorRegex1);
    const tradeAgreementsIndicator2 = text.match(tradeAgreementsIndicatorRegex2);
    if(tradeAgreementsIndicator != null) {
        return "Y";
    } else if(tradeAgreementsIndicator2 != null) {
        return "I";
    } else {
        return "N";
    }
}

function getFreeTradeAgreementsIndicator(text: string, csvObject: RFQRequirements): string {
    if(csvObject.buyAmericanIndicator == "I") {
        return "I";
    } else {
        const freeTradeAgreementsIndicatorRegexB = /DFARS 252\.225-7036 ALTERNATE IV, BUY AMERICAN--FREE TRADE/;
        const freeTradeAgreementsIndicatorRegexY = /DFARS 252\.225-7036, BUY AMERICAN--FREE TRADE AGREEMENTS--BALANCE/;
        if(text.match(freeTradeAgreementsIndicatorRegexB) != null) {
            return "B";
        } else if(text.match(freeTradeAgreementsIndicatorRegexY) != null) {
            return "Y";
        }
        //Need the logic for finding A
        // else if(freeTradeAgreementsIndicatorA != null) {
        //     freeTradeAgreementsIndicatorArray.push("A");
        //     break;
        // } 
        else {
            return "N";
        }
    }
}

function getPriceBreaksSolicitedIndicator(text: string): string {
    const priceBreaksSolicitedIndicatorRegex = /Please provide the following price breaks/;
    const priceBreaksSolicitedIndicator = text.match(priceBreaksSolicitedIndicatorRegex);
    if(priceBreaksSolicitedIndicator != null) {
        return "Y";
    } else {
        return "N";
    }
}

function getBuyAmericanIndicator(text: string, csvObject: RFQRequirements): string {
    if(csvObject.tradeAgreementsIndicator == "I") {
        return "I";
    } else {
        const buyAmericanIndicatorRegex = /DFARS 252\.225-7001, BUY AMERICAN AND BALANCE OF PAYMENTS PROGRAM/;
        const buyAmericanIndicator = text.match(buyAmericanIndicatorRegex);
        if(buyAmericanIndicator != null) {
            return "Y";
        } else {
            return "N";
        }
    }
}

function getItemDescriptionIndicator(text: string): string {
    const itemDescriptionIndicatorRegex1 = /SOURCE CONTROL DATA/; //B
    const itemDescriptionIndicatorRegex2 = /QML or QPL Item/; //Q
    const itemDescriptionIndicatorRegex3 = /DETAILED DRAWING/; //D
    const itemDescriptionIndicatorRegex4 = /FULL AND OPEN COMPETITION APPLY/; //D
    const itemDescriptionIndicator = text.match(itemDescriptionIndicatorRegex1);
    const itemDescriptionIndicator2 = text.match(itemDescriptionIndicatorRegex2);
    const itemDescriptionIndicator3 = text.match(itemDescriptionIndicatorRegex3);
    const itemDescriptionIndicator4 = text.match(itemDescriptionIndicatorRegex4);
    if(itemDescriptionIndicator != null) {
        return "B";
    } else if(itemDescriptionIndicator2 != null) {
        return "Q";
    } else if(itemDescriptionIndicator3 != null || itemDescriptionIndicator4 != null) {
        return "D";
    } else {
        return "N";
    }
}

function getHigherLevelQualityIndicator(text: string): string {
    const higherLevelQualityIndicatorRegex1 = /Non-Tailored Higher-Level Quality Requirements \(ISO 9001:2015\)/; //7
    const higherLevelQualityIndicatorRegex2 = /MINIMUM MUST COMPLY WITH SAE AS9003 OR ISO 9001/; //6
    const higherLevelQualityIndicatorRegex3 = /MANAGEMENT SYSTEM MUST COMPLY WITH SAE AS9100/; //8
    const higherLevelQualityIndicator = text.match(higherLevelQualityIndicatorRegex1);
    const higherLevelQualityIndicator2 = text.match(higherLevelQualityIndicatorRegex2);
    const higherLevelQualityIndicator3 = text.match(higherLevelQualityIndicatorRegex3);
    if(higherLevelQualityIndicator != null) {
        return "7";
    } else if(higherLevelQualityIndicator2 != null) {
        return "6";
    } else if(higherLevelQualityIndicator3 != null) {
        return "8";
    } else {
        return "N";
    }
}

function rfqRequirementsToCsv(data: RFQRequirements): string {
    let value = "";
    for(const key in data) {
        value += `"${data[key]}"` + ",";
    }
    value = value.slice(0, -1);
    return value;
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
