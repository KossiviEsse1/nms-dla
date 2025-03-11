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

        //32. FOB Point, can have several
        //Assuming 'DELIVER FOB:' only shows up once per page
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

        //33. FOB City -- Not an RFQ requirement, default to blank, look to website for conditions
        //34. FOB State/Province -- Not an RFQ requirement, default to blank, look to website for conditions
        //35. FOB Country -- Not an RFQ requirement, default to blank, look to website for conditions

        //36. Inspection Point Code, can have several
        const inspectionPointRegex = /INSPECTION POINT:\s+(\S+)/g;
        const inspectionPointsArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const inspectionPoint = pageTextContent.match(inspectionPointRegex);
            if(inspectionPoint != null) {
                inspectionPointsArray.push(inspectionPoint[0].includes("ORIGIN") ? "O" : "D");
            }
        }
        //currently only supports one Inspection Point
        csvObject.inspectionCodePoint = inspectionPointsArray[0];

        //37. Place of Government Inspection - Packaging CAGE code - Not an RFQ requirement, default to blank, look to website for conditions
        //38. Place of Government Inspection - Supplies CAGE code - Not an RFQ requirement, default to blank, look to website for conditions
        //39. Reserved -- Not an RFQ requirement, default to N
        //40- 43 Blank

        //44. Solicitation Line Number -- Not explicitly an RFQ requirement, but from RFQ, equivalent to number of FOB Points if multiple requisition numbers, otherwise 0001
        const solicitationLineNumbers = getSolicitationLineNumber(fobPointsArray);
        console.log("Solicitation Line Numbers: ", solicitationLineNumbers);
        
        //45. RESERVED -- Not an RFQ requirement, default to blank

        //46. Purchase Request Number -- written to support many PR Nos, but focused on one for now
        const purchaseRequestNumberRegex = /REQUISITION\/PURCHASE REQUEST NO\.\s+(\S+)/;
        const purchaseRequestNo = page1Text.match(purchaseRequestNumberRegex)[1];
        if(purchaseRequestNo == "See") {
            //Suggests multiple PR Nos, need to find them in the text on other pages
            const purchaseRequestNumbers = [];
            const prNumberRegex = /PR:\s+(\S+)/;
            for(let i = 2; i<pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const pageText = await page.getTextContent();
                const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
                const purchaseNumber = pageTextContent.match(prNumberRegex);
                if(purchaseNumber != null) {
                    purchaseRequestNumbers.push(purchaseNumber[1]);
                }
            }
            const uniquePurchaseRequestNumbers = [...new Set(purchaseRequestNumbers)];
            console.log("Purchase Request Numbers: ", uniquePurchaseRequestNumbers);
        } else {
            csvObject.purchaseRequestNumber = purchaseRequestNo;
        }

        //47. National Stock Number / Part Number -- Will match "NSN/MATERIAL: " Can have multiple, focusing on one for now
        const nsnRegex = /NSN\/MATERIAL:(\S+)/;
        const nationalStockNumbers = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const nsn = pageTextContent.match(nsnRegex);
            if(nsn != null) {
                console.log("National Stock Number: ", nsn);
                nationalStockNumbers.push(nsn[1]);
            }
        }
        const uniqueNationalStockNumbers = [...new Set(nationalStockNumbers)];
        if(uniqueNationalStockNumbers.length > 1) {
            console.log("Multiple National Stock Numbers: ", uniqueNationalStockNumbers);
        } else {
            csvObject.nationalStockNumber = uniqueNationalStockNumbers[0];
        }

        //48. Unit of Issue -- can have several line items, using regex to find them, assuming for one
        const unitOfIssueRegex = /(?<=PRICE \.).*?(?=NSN\/MATERIAL)/;
        let allText = page1Text;
        const lineItems: lineItem[] = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const unitOfIssue = pageTextContent.match(unitOfIssueRegex);
            if(unitOfIssue != null) {
                const lineItemArray = unitOfIssue[0].trim().split(" ");
                console.log("Line Item Array: ", lineItemArray);
                if(lineItemArray.length == 7) {
                    lineItems.push({
                        CLIN: lineItemArray[0],
                        PR: lineItemArray[1],
                        PRLI: lineItemArray[2],
                        UI: lineItemArray[3],
                        QUANTITY: lineItemArray[4],
                        UNIT_PRICE: lineItemArray[5],
                        TOTAL_PRICE: lineItemArray[6],
                    })
                } else {
                    lineItems.push({
                        CLIN: lineItemArray[0],
                        PR: lineItemArray[1],
                        PRLI: lineItemArray[2],
                        UI: lineItemArray[3],
                        QUANTITY: lineItemArray[4],
                        UNIT_PRICE: '',
                        TOTAL_PRICE: '',
                    });
                }
            }
            allText += pageTextContent;
        }
        if(lineItems.length > 1 || lineItems.length == 0) {
            console.log("Multiple Line Items: ", lineItems);
        } else {
            csvObject.unitOfIssue = lineItems[0].UI;
        //49. Quantity -- Leveraging line items to get the quantity
            csvObject.quantity = lineItems[0].QUANTITY;
        }

        //50. Unit Price -- Not an RFQ requirement, default to blank, enter ourselves

        //51. Delivery Days -- follows "Delivery (in days):" in RFQ
        const deliveryDaysRegex = /DELIVERY \(IN DAYS\):(\S+)/;
        const deliveryDaysArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const deliveryDays = pageTextContent.match(deliveryDaysRegex);
            if(deliveryDays != null) {
                deliveryDaysArray.push(deliveryDays[1]);
            }
        }
        if(deliveryDaysArray.length > 1) {
            console.log("Multiple Delivery Days: ", deliveryDaysArray);
        } else {
            csvObject.deliveryDays = deliveryDaysArray[0];
        }

        //52. Guaranteed Minimum -- Identified with "Guaranteed Contract Minimum Quantity:" otherwise blank, there may be multiple, focusing on one for now
        const guaranteedMinimumRegex = /Guaranteed Contract Minimum Quantity:\s+(\S+)/;
        const guaranteedMinimumArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const guaranteedMinimum = pageTextContent.match(guaranteedMinimumRegex);
            if(guaranteedMinimum != null) {
                guaranteedMinimumArray.push(guaranteedMinimum[1]);
            }
        }
        if(guaranteedMinimumArray.length > 1 || guaranteedMinimumArray.length == 0) {
            console.log("Multiple Guaranteed Minimums: ", guaranteedMinimumArray);  
        } else {
            csvObject.guaranteedMinimum = guaranteedMinimumArray[0];
        }

        //53. DO Minimum -- If 56 is yes, leave blank, else "Minimum Delivery Order Quantity: "
        const doMinimumRegex = /Minimum Delivery Order Quantity:\s+(\S+)/;
        const doMinimumArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const doMinimum = pageTextContent.match(doMinimumRegex);
            if(doMinimum != null) {
                doMinimumArray.push(doMinimum[1]);
            }
        }
        if(doMinimumArray.length > 1 || doMinimumArray.length == 0) {
            console.log("Multiple DO Minimums: ", doMinimumArray);
        } else {
            csvObject.doMinimum = doMinimumArray[0];
        }

        //54. Contract Maximum -- Can be found with "Contract Maximum Value:  " leave blank if 52 and 53 blank
        const contractMaximumRegex = /Contract Maximum Value: \$(\S+)/;
        const contractMaximumArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const contractMaximum = pageTextContent.match(contractMaximumRegex);
            if(contractMaximum != null) {
                contractMaximumArray.push(contractMaximum[1]);
            }
        }
        if(contractMaximumArray.length > 1 || contractMaximumArray.length == 0) {
            console.log("Multiple Contract Maximums: ", contractMaximumArray);
        } else {
            csvObject.contractMaximum = contractMaximumArray[0];
        }

        //55. Annual Frequency of Buys (AFB) -- Can be found with "Estimated Number of orders: " if no gauranteed Minimum, leave blank
        const afbRegex = /Estimated Number of orders: (\S+)/;
        const afbArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const afb = pageTextContent.match(afbRegex);
            if(afb != null) {
                afbArray.push(afb[1]);
            }
        }
        if(afbArray.length > 1 || afbArray.length == 0) {
            console.log("Multiple AFBs: ", afbArray);
        } else {
            csvObject.annualFrequencyOfBuys = afbArray[0];
        }
        
        //56. No DO Minimum Quantity? -- Not an RFQ requirement, default to blank

        //57. HUBZone Preference Indicator -- If "FAR 52.219-4 Notice of Price Evaluation Preference for HUBZone Small Business Concerns" is in the text, Y, else N
        const hubZonePreferenceIndicatorRegex = /FAR 52\.219-4 Notice of Price Evaluation Preference for HUBZone Small Business Concerns/;
        const hubZonePreferenceIndicatorArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const hubZonePreferenceIndicator = pageTextContent.match(hubZonePreferenceIndicatorRegex);
            if(hubZonePreferenceIndicator != null) {
                hubZonePreferenceIndicatorArray.push("Y");
                break;
            }
        }
        if(hubZonePreferenceIndicatorArray.length == 0) {
            //Don't think it's possible to have multiple, so just default to N
            csvObject.hubZonePreferenceIndicator = "N";
        } else {
            csvObject.hubZonePreferenceIndicator = hubZonePreferenceIndicatorArray[0];
        }

        //58. Waiver of HUBZone Preference -- Not an RFQ requirement, default to blank
        //59. Immediate Shipment Price -- Not an RFQ requirement, default to blank
        //60. Immediate Shipment Delivery Days -- Not an RFQ requirement, default to blank
        //61. RESERVED, default to blank

        //62. Trade Agreements Indicator -- Need to fix condition for I
        const tradeAgreementsIndicatorRegex1 = /DFARS 252\.225-7020 TRADE AGREEMENTS CERTIFICATE AND DFARS 252\.225-7021 TRADE AGREEMENTS APPLIES/;
        const tradeAgreementsIndicatorRegex2 = /FOR GOVERNMENT USE ONLY/i;
        const tradeAgreementsIndicatorArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const tradeAgreementsIndicator = pageTextContent.match(tradeAgreementsIndicatorRegex1);
            const tradeAgreementsIndicator2 = pageTextContent.match(tradeAgreementsIndicatorRegex2);
            console.log("Trade Agreements Indicator: ", tradeAgreementsIndicator2);
            if(tradeAgreementsIndicator != null) {
                tradeAgreementsIndicatorArray.push("Y");
                break;
            } else if(tradeAgreementsIndicator2 != null) {
                tradeAgreementsIndicatorArray.push("I");
                break;
            }
        }
        if(tradeAgreementsIndicatorArray.length == 0) {
            csvObject.tradeAgreementsIndicator = "N";
        } else {
            csvObject.tradeAgreementsIndicator = tradeAgreementsIndicatorArray[0];
        }
        
        //63. Source of Supply Cage Code -- Not an RFQ requirement, default to blank
        //64. First Article Waiver Code -- Not an RFQ requirement, default to blank
        //65. Hazardous Material Identification and Material Safety Data -- Not an RFQ requirement, default to blank
        //66. Hazardous Warning Labels -- Not an RFQ requirement, default to blank
        //67. Material Requirements -- Not an RFQ requirement, default to blank

        //68. Buy American Indicator
        if(csvObject.tradeAgreementsIndicator == "I") {
            csvObject.buyAmericanIndicator = "I";
        } else {
            //I don't actually know what identifies if this should be Y or N
            const buyAmericanIndicatorRegex = /DFARS 252\.225-7001, BUY AMERICAN AND BALANCE OF PAYMENTS PROGRAM/;
            const buyAmericanIndicatorArray = [];
            for(let i = 2; i<pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const pageText = await page.getTextContent();
                const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
                const buyAmericanIndicator = pageTextContent.match(buyAmericanIndicatorRegex);
                if(buyAmericanIndicator != null) {
                    buyAmericanIndicatorArray.push("Y");
                    break;
                }
            }
            if(buyAmericanIndicatorArray.length == 0) {
                csvObject.buyAmericanIndicator = "N";
            } else {
                csvObject.buyAmericanIndicator = buyAmericanIndicatorArray[0];
            }
        }

        //69. Free Trade Agreements Indicator
        if(csvObject.buyAmericanIndicator == "I") {
            csvObject.freeTradeAgreementsIndicator = "I";
        } else {
            const freeTradeAgreementsIndicatorRegexB = /DFARS 252\.225-7036 ALTERNATE IV, BUY AMERICAN--FREE TRADE/;
            //Not sure how to identify A
            //const freeTradeAgreementsIndicatorRegexA = /DFARS 252\.225-7036 ALTERNATE IV, BUY AMERICAN--FREE TRADE/;
            const freeTradeAgreementsIndicatorRegexY = /DFARS 252\.225-7036, BUY AMERICAN--FREE TRADE AGREEMENTS--BALANCE/;
            const freeTradeAgreementsIndicatorArray = [];
            for(let i = 2; i<pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const pageText = await page.getTextContent();
                const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
                const freeTradeAgreementsIndicatorB = pageTextContent.match(freeTradeAgreementsIndicatorRegexB);
                //const freeTradeAgreementsIndicatorA = pageTextContent.match(freeTradeAgreementsIndicatorRegexA);
                const freeTradeAgreementsIndicatorY = pageTextContent.match(freeTradeAgreementsIndicatorRegexY);
                if(freeTradeAgreementsIndicatorB != null) {
                    freeTradeAgreementsIndicatorArray.push("B");
                    break;
                } 
                // else if(freeTradeAgreementsIndicatorA != null) {
                //     freeTradeAgreementsIndicatorArray.push("A");
                //     break;
                // } 
                else if(freeTradeAgreementsIndicatorY != null) {
                    freeTradeAgreementsIndicatorArray.push("Y");
                    break;
                }
            }
            if(freeTradeAgreementsIndicatorArray.length == 0) {
                csvObject.freeTradeAgreementsIndicator = "N";
            } else {
                csvObject.freeTradeAgreementsIndicator = freeTradeAgreementsIndicatorArray[0];
            }
        }

        //70. Buy American/Free Trade/Trade Agreements End Product -- Not an RFQ requirement, default to blank
        //71. Buy American/ Free Trade Agreements/Trade Agreements Country of Origin Code -- Not an RFQ requirement, default to blank
        //72. Buy American / Free Trade / Trade Agreements Country Code -- Not an RFQ requirement, default to blank
        //73. Duty Free Entry Requested -- N Default, Not an RFQ requirement
        //74. Duty Free Entry Requested/Foreign Supplies in US Code -- Not an RFQ requirement, default to blank
        //75. Duty Free Entry Requested/Duty Paid Code -- Not an RFQ requirement, default to blank
        //76. Duty Free Entry Requested/Duty Paid Amount -- Not an RFQ requirement, default to blank

        //77. Price Breaks Solicited Indicator -- if contains "Please provide the following price breaks" then Y, else N, don't leave blank
        const priceBreaksSolicitedIndicatorRegex = /Please provide the following price breaks/;
        const priceBreaksSolicitedIndicatorArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const priceBreaksSolicitedIndicator = pageTextContent.match(priceBreaksSolicitedIndicatorRegex);
            if(priceBreaksSolicitedIndicator != null) {
                priceBreaksSolicitedIndicatorArray.push("Y");
                break;
            }
        }
        if(priceBreaksSolicitedIndicatorArray.length == 0) {
            csvObject.priceBreaksSolicitedIndicator = "N";
        } else {
            csvObject.priceBreaksSolicitedIndicator = priceBreaksSolicitedIndicatorArray[0];
        }

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
        const itemDescriptionIndicatorRegex1 = /SOURCE CONTROL DATA/; //B
        const itemDescriptionIndicatorRegex2 = /QML or QPL Item/; //Q
        const itemDescriptionIndicatorRegex3 = /DETAILED DRAWING/; //D
        const itemDescriptionIndicatorRegex4 = /FULL AND OPEN COMPETITION APPLY/; //D
        const itemDescriptionIndicatorArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const itemDescriptionIndicator = pageTextContent.match(itemDescriptionIndicatorRegex1);
            const itemDescriptionIndicator2 = pageTextContent.match(itemDescriptionIndicatorRegex2);
            const itemDescriptionIndicator3 = pageTextContent.match(itemDescriptionIndicatorRegex3);
            const itemDescriptionIndicator4 = pageTextContent.match(itemDescriptionIndicatorRegex4);
            if(itemDescriptionIndicator != null) {
                itemDescriptionIndicatorArray.push("B");
                break;
            } else if(itemDescriptionIndicator2 != null) {
                itemDescriptionIndicatorArray.push("Q");
                break;
            } else if(itemDescriptionIndicator3 != null || itemDescriptionIndicator4 != null) {
                itemDescriptionIndicatorArray.push("D");
                break;
            }
        }
        if(itemDescriptionIndicatorArray.length == 0) {
            csvObject.itemDescriptionIndicator = "N";
        } else {
            csvObject.itemDescriptionIndicator = itemDescriptionIndicatorArray[0];
        }

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
        const higherLevelQualityIndicatorRegex1 = /Non-Tailored Higher-Level Quality Requirements \(ISO 9001:2015\)/; //7
        const higherLevelQualityIndicatorRegex2 = /MINIMUM MUST COMPLY WITH SAE AS9003 OR ISO 9001/; //6
        const higherLevelQualityIndicatorRegex3 = /MANAGEMENT SYSTEM MUST COMPLY WITH SAE AS9100/; //8
        const higherLevelQualityIndicatorArray = [];
        for(let i = 2; i<pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageTextContent = pageText.items.filter((item) => item.str != " ").map((item) => item.str).join(" ");
            const higherLevelQualityIndicator = pageTextContent.match(higherLevelQualityIndicatorRegex1);
            const higherLevelQualityIndicator2 = pageTextContent.match(higherLevelQualityIndicatorRegex2);
            const higherLevelQualityIndicator3 = pageTextContent.match(higherLevelQualityIndicatorRegex3);
            if(higherLevelQualityIndicator != null) {
                higherLevelQualityIndicatorArray.push("7");
                break;
            } else if(higherLevelQualityIndicator2 != null) {
                higherLevelQualityIndicatorArray.push("6");
                break;
            } else if(higherLevelQualityIndicator3 != null) {
                higherLevelQualityIndicatorArray.push("8");
                break;
            }
        }
        if(higherLevelQualityIndicatorArray.length == 0) {
            csvObject.higherLevelQualityIndicator = "N";
        } else {
            csvObject.higherLevelQualityIndicator = higherLevelQualityIndicatorArray[0];
        }

        //118. Higher-Level Quality Code -- enter yourself, conditions on website, can be blank
        //119. Higher-Level Quality Remarks -- enter yourself, conditions on website, can be blank
        //120. Child Labor Certification Code -- enter yourself, conditions on website, must be N, can't be blank
        //121. Quote Remarks -- enter yourself, conditions on website, can be left blank


        
        



        console.log(csvObject);
        /*
        There can be multiple NSN's per document, meaning we need to find values for all distinct NSN's
        May be worth doing a first round of elimination, if we won't have the NSNs, no point in processing the rest of the document
        */
        return NextResponse.json({ response: allText });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function getSolicitationLineNumber(fobPointsArray: []): [] {
    const solicitationLineNumbers = [];
    for(let i = 1; i <= fobPointsArray.length; i++) {
        solicitationLineNumbers.push(i.toString().padStart(4, '0'));
    }
    return solicitationLineNumbers;
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
