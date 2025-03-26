import { NextResponse } from "next/server";
import { getSchema } from "../nsnDBHelper";
// @ts-ignore
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.min.mjs';

interface RFQRequirements {
    solicitationNumber: string,
    solicitationTypeIndicator: string,
    smallBusinessSetAsideIndicator: string,
    additionalClauseFillInsIndicator: string,
    rfqReturnByDate: string,
    quoterForCageCode: string,
    quoteForCageCode: string,
    space8: string,
    space9: string,
    space10: string,
    space11: string,
    space12: string,
    smallBusinessRepCode: string,
    space14: string,
    space15: string,
    space16: string,
    space17: string,
    jointVenture: string,
    jointVentureRemarks: '',
    space20: string,
    aaComplianceCode: string,
    previousCandCReportsCode: string,
    alternateDisputesResolution: string,
    bidTypeCode: string,
    promptPaymentDiscountTermsCode: string,
    vendorQuoteNumber: string,
    daysQuoteValid: string,
    meetsPackagingRequirement: string,
    boaFssBpa: string,
    boaFssBpaContractNumber: string,
    boaFssBpaContractExpirationDate: string,
    fobPoint: string,
    fobCity: string,
    fobState: string,
    fobCountry: string,
    inspectionCodePoint: string,
    placeOfGovernmentInspectionPackagingCageCode: string,
    placeOfGovernmentInspectionSuppliesCageCode: string,
    space39: string,
    space40: string,
    space41: string,
    space42: string,
    space43: string,
    solicitationLineNumber: string,
    space45: string,
    purchaseRequestNumber: string,
    nationalStockNumber: string,
    unitOfIssue: string,
    quantity: string,
    unitPrice: string,
    deliveryDays: number,
    guaranteedMinimum: string,
    doMinimum: string,
    contractMaximum: string,
    annualFrequencyOfBuys: string,
    noDOMinimumQuantity: string,
    hubZonePreferenceIndicator: string,
    waiverOfHubZonePreference: string,
    immediateShipmentPrice: string,
    immediateShipmentDeliveryDays: string,
    space61: string,
    tradeAgreementsIndicator: string,
    sourceOfSupplyCageCode: string,
    firstArticleWaiverCode: string,
    hazardousMaterialIdentificationAndMaterialSafetyData: string,
    hazardousWarningLabels: string,
    materialRequirements: string,
    buyAmericanIndicator: string,
    freeTradeAgreementsIndicator: string,
    bAFtTaEndProduct: string,
    bAFtTaCountryOfOriginCode: string,
    bAFtTaCountryCode: string,
    dutyFreeEntryRequested: string,
    dutyFreeEntryRequestedForeignSuppliesInUSCode: string,
    dutyFreeEntryRequestedDutyPaidCode: string,
    dutyFreeEntryRequestedDutyPaidAmount: string,
    priceBreaksSolicitedIndicator: string,
    space78: string,
    space79: string,
    space80: string,
    space81: string,
    space82: string,
    space83: string,
    space84: string,
    space85: string,
    space86: string,
    space87: string,
    space88: string,
    space89: string,
    space90: string,
    space91: string,
    space92: string,
    space93: string,
    space94: string,
    space95: string,
    quantityVariancePlus: string,
    quantityVarianceMinus: string,
    minimumOrderQuantityCode: string,
    minimumOrderMaximumQuantity: string,
    immediateShipmentAvailable: string,
    immediateShipmentQuantity: string,
    manufacturerDealer: string,
    actualManufacturingProductionSourceCageCode: string,
    actualManufacturingProductionSourceNameAndAddress: string,
    itemDescriptionIndicator: string,
    partNumberOfferedCode: string,
    partNumberOfferedCageCode: string,
    partNumberOfferedPartNumber: string,
    partNumberOfferedRemarks: string,
    suppliesOffered: string,
    suppliesOfferedRemarks: string,
    qualificationRequirementsMfgCage: string,
    qualificationRequirementsSourceCage: string,
    qualificationRequirementsItemName: string,
    qualificationRequirementsServiceIdentification: string,
    qualificationRequirementsTestNumber: string,
    higherLevelQualityIndicator: string,
    higherLevelQualityCode: string,
    higherLevelQualityRemarks: string,
    childLaborCertificationCode: string,
    quoteRemarks: string,
    index: number,
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
    quoterForCageCode: '',
    quoteForCageCode: '',
    space8: '',
    space9: '',
    space10: '',
    space11: '',
    space12: '',
    smallBusinessRepCode: '',
    space14: '',
    space15: '',
    space16: '',
    space17: '',
    jointVenture: '',
    jointVentureRemarks: '',
    space20: '',
    aaComplianceCode: '',
    previousCandCReportsCode: '',
    alternateDisputesResolution: '',
    bidTypeCode: '',
    promptPaymentDiscountTermsCode: '',
    vendorQuoteNumber: '',
    daysQuoteValid: '',
    meetsPackagingRequirement: '',
    boaFssBpa: '',
    boaFssBpaContractNumber: '',
    boaFssBpaContractExpirationDate: '',
    fobPoint: '',
    fobCity: '',
    fobState: '',
    fobCountry: '',
    inspectionCodePoint: '',
    placeOfGovernmentInspectionPackagingCageCode: '',
    placeOfGovernmentInspectionSuppliesCageCode: '',
    space39: '',
    space40: '',
    space41: '',
    space42: '',
    space43: '',
    solicitationLineNumber: '',
    space45: '',
    purchaseRequestNumber: '',
    nationalStockNumber: '',
    unitOfIssue: '',
    quantity: '',
    unitPrice: '',
    deliveryDays: 0,
    guaranteedMinimum: '',
    doMinimum: '',
    contractMaximum: '',
    annualFrequencyOfBuys: '',
    noDOMinimumQuantity: '',
    hubZonePreferenceIndicator: '',
    waiverOfHubZonePreference: '',
    immediateShipmentPrice: '',
    immediateShipmentDeliveryDays: '',
    space61: '',
    tradeAgreementsIndicator: '',
    sourceOfSupplyCageCode: '',
    firstArticleWaiverCode: '',
    hazardousMaterialIdentificationAndMaterialSafetyData: '',
    hazardousWarningLabels: '',
    materialRequirements: '',
    buyAmericanIndicator: '',
    freeTradeAgreementsIndicator: '',
    bAFtTaEndProduct: '',
    bAFtTaCountryOfOriginCode: '',
    bAFtTaCountryCode: '',
    dutyFreeEntryRequested: '',
    dutyFreeEntryRequestedForeignSuppliesInUSCode: '',
    dutyFreeEntryRequestedDutyPaidCode: '',
    dutyFreeEntryRequestedDutyPaidAmount: '',
    priceBreaksSolicitedIndicator: '',
    space78: '',
    space79: '',
    space80: '',
    space81: '',
    space82: '',
    space83: '',
    space84: '',
    space85: '',
    space86: '',
    space87: '',
    space88: '',
    space89: '',
    space90: '',
    space91: '',
    space92: '',
    space93: '',
    space94: '',
    space95: '',
    quantityVariancePlus: '',
    quantityVarianceMinus: '',
    minimumOrderQuantityCode: '',
    minimumOrderMaximumQuantity: '',
    immediateShipmentAvailable: '',
    immediateShipmentQuantity: '',
    manufacturerDealer: '',
    actualManufacturingProductionSourceCageCode: '',
    actualManufacturingProductionSourceNameAndAddress: '',
    itemDescriptionIndicator: '',
    partNumberOfferedCode: '',
    partNumberOfferedCageCode: '',
    partNumberOfferedPartNumber: '',
    partNumberOfferedRemarks: '',
    suppliesOffered: '',
    suppliesOfferedRemarks: '',
    qualificationRequirementsMfgCage: '',
    qualificationRequirementsSourceCage: '',
    qualificationRequirementsItemName: '',
    qualificationRequirementsServiceIdentification: '',
    qualificationRequirementsTestNumber: '',
    higherLevelQualityIndicator: '',
    higherLevelQualityCode: '',
    higherLevelQualityRemarks: '',
    childLaborCertificationCode: '',
    quoteRemarks: '',
    index: 0,
})

export async function POST(req: Request) {
    try {
        // @ts-ignore
        await import('pdfjs-dist/build/pdf.worker.mjs');
        const formData = await req.formData();
        const files = formData.getAll("pdfs");
        if(!files) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }
        const nsnDBArray = await getSchema();
        if(nsnDBArray.length == 0) {
            return NextResponse.json({ error: "No NSN DB found" }, { status: 400 });
        }
        const fileArray: File[] = Array.isArray(files) ? files.map((file) => file as File) : [files as File];

        const matches = [];
        const nonMatches = [];
        const failures = [];
        await Promise.all(fileArray.map((file) => getSolicitationData(file, nsnDBArray).then(result => {
            if(result[0] == "match") {
                const match = {
                    fileName: file.name.split("/")[1],
                    nsn: result[1],
                    csvString: result[2]
                }
                matches.push(match);
            } else if(result[0] == "noMatch") {
                const nonMatch = {
                    fileName: file.name.split("/")[1],
                    nsn: result[1],
                    csvString: ""
                }
                nonMatches.push(nonMatch);
            } else {
                const failure = {
                    fileName: file.name.split("/")[1],
                    nsn: "",
                    csvString: ""
                }
                failures.push(failure);
            }
        })));
        const csvStrings = matches.map((match) => match.csvString).join("\n");
        return NextResponse.json({ response: csvStrings, matches: matches, nonMatches: nonMatches, failures: failures }, { status: 200 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

function getSolicitationNumber(text: string): string {
    const solicitationNumberRegex: RegExp = /REQUEST NO\.\s+(\S+)/;
    return text.match(solicitationNumberRegex)[1];
}

async function getSolicitationData(file: File, nsnDBArray: string[][]): Promise<string[]> {
    try {
        //Return String array 
        if (!file) {
            return ["file Could Not Be Read", ""];
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
        //console.log(allTextPages);
        const nationalStockNumberArray = getNationalStockNumber(allTextPages);
        //Only dealing with single NSN for now, excluding FAT
        if(nationalStockNumberArray.length == 0 || nationalStockNumberArray.length > 1 || nationalStockNumberArray.includes("0001S00000052") || nationalStockNumberArray.includes("0001S00000053")) {
            return ["noNSN", ""];
        }
        const nationalStockNumber = nationalStockNumberArray[0];

        //Find NSN match in nsnDBArray, NSN is the 9th column
        const prNumbers = getPurchaseRequestNumber(page1Text, allTextPages);
        //TODO Do a Part Number Match to filter
        const nsnMatches = nsnDBArray.filter((nsn) => nsn.length > 8 && nsn[8] == nationalStockNumber);
        if(nsnMatches.length == 0) {
            //Return some response identifying that no match was found
            return ["noMatch", nationalStockNumber];
        }

        //Get part numbers
        const partNumbers = getPartNumbers(allTextPages);
        const cageCodes = getCageCodes(allTextPages);

        //Matching by NSN, CAGE Code, and Part Number
        const csvObjects: RFQRequirements[] = [];
        const currentMatches = nsnMatches.filter((nsn) => partNumbers.includes(nsn[6]) && cageCodes.includes(nsn[7]));
        for(let i = 0; i < prNumbers.length; i++) {
            if(prNumbers[i].substring(0, 2) != "10") {
                const csvObject = emptyRFQRequirements();
                csvObject.purchaseRequestNumber = prNumbers[i];
                csvObject.nationalStockNumber = nationalStockNumber;
                csvObject.index = i;
                csvObject.actualManufacturingProductionSourceCageCode = currentMatches[0][7];
                csvObject.partNumberOfferedCageCode = currentMatches[0][7];
                csvObject.partNumberOfferedPartNumber = currentMatches[0][6];
                csvObject.unitPrice = currentMatches[0][19];
                csvObjects.push(csvObject);
            }
        }

        const unitOfIssueArray = getUnitOfIssue(allTextPages, nsnDBArray);

        const totalUnits = unitOfIssueArray.reduce((a, b) => a + Number(b.QUANTITY), 0);


        //1. Solicitation Number -- Finished
        const solicitationNumber = getSolicitationNumber(page1Text);
        //2. Solicitation Type Indicator -- Unfinished
        const solicitationTypeIndicator = getSolicitationTypeIndicator(allTextPages, totalUnits);
        //3. Small Business Set-Aside Indicator -- Unfinished
        const smallBusinessSetAsideIndicator = getSmallBusinessSetAsideIndicator(allTextPages);
        //4. Additional Clause Fill-In Indicators -- Unfinished
        const additionalClauseFillInsIndicator = "N";
        //5. Return By Date -- Finished
        const rfqReturnByDate = getReturnByDate(page1Text);
        //6. Quoter for Cage Code -- 1J8D2 for now
        //7. Quote for CAGE Code -- Blank for now -- Make it same as Quoter for Cage Code
        //8-12 Reserved
        //13. Small Business and Other Contractor Representations Code -- Default to M for our user, will need to update later
        //18. Joint Venture -- Defaulting to blank
        //19. Joint Venture Remarks -- Defaulting to blank
        //20. Reserved
        //21. Affirmative Action Compliance Code -- Defaulting to NA
        //22. Previous Contracts and Compliance Reports Code -- Defaulting to NA
        //23. Alternate Disputes Resolution -- Defaulting to B
        //24. Bid Type Code -- Defaulting to BI
        //25. Prompt Payment Discount Terms Code -- Defaulting to 1
        //26. Vendor Quote Number -- Defaulting to blank
        //27. Days Quote Valid -- Defaulting to 90
        //28. Meets Packaging Requirement -- Default to N
        //29. Basic Ordering Agreement (BOA)/ Federal Supply Schedule (FSS)/Blanket Purchase Agreement (BPA). -- Default to NAP
        //30. BOA/FSS/BPA Contract Number -- Default to NAP
        //31. BOA/FSS/BPA Contract Expiration Date -- Default to blank
        //32. FOB Point, can have several -- Finished
        const fobPoint = getFOBPoint(allTextPages);
        //33-35 Is information that must be collected from our customers
        //33. FOB City -- Default to blank
        //34. FOB State/Province -- Default to blank
        //35. FOB Country -- Default to blank
        //36. Inspection Point Code, can have several -- Finished
        const inspectionCodePoint = getInspectionPoint(allTextPages);
        //37. Place of Government Inspection - Packaging CAGE code - If inspection point is O, then 028F4, else blank
        //38. Place of Government Inspection - Supplies CAGE code - If inspection point is O, then 028F4, else blank
        //39 - 43 Reserved
        //44. Solicitation Line Number -- Not explicitly an RFQ requirement, but from RFQ, equivalent to number of FOB Points if multiple requisition numbers, otherwise 0001
        const solicitationLineNumbers = getSolicitationLineNumber(fobPoint);
        //45. RESERVED -- Not an RFQ requirement, default to blank
        //46. Purchase Request Number -- Already included in csvObjects
        //47. National Stock Number / Part Number -- Already included in csvObjects
        //48. Unit of Issue -- From Unit of Issue Array
        //49. Quantity -- From Unit of Issue Array
        //50. Unit Price -- From Unit of Issue Array
        //51. Delivery Days -- From Delivery Days Array
        const deliveryDays = getDeliveryDays(allTextPages)[0];
        //52. Guaranteed Minimum -- From Guaranteed Minimum Array
        const guaranteedMinimum = getGuaranteedMinimum(allTextPages).length != 0 ? getGuaranteedMinimum(allTextPages)[0] : "";
        //53. DO Minimum -- From DO Minimum Array
        const doMinimum = getDOMinimum(allTextPages).length != 0 ? getDOMinimum(allTextPages)[0] : "";
        //54. Contract Maximum -- From Contract Maximum Array
        const contractMaximum = getContractMaximum(allTextPages).length != 0 ? getContractMaximum(allTextPages)[0] : "";
        //55. Annual Frequency of Buys -- From Annual Frequency of Buys Array
        const annualFrequencyOfBuys = getAnnualFrequencyOfBuys(allTextPages).length != 0 ? getAnnualFrequencyOfBuys(allTextPages)[0] : "";
        //56. No DO Minimum Quantity? -- Not an RFQ requirement, if I, yes, else blank
        //57. HubZone Preference Indicator         
        const hubZonePreferenceIndicator = getHubZonePreferenceIndicator(allTextPages);
        //58. Waiver of HUBZone Preference -- Default to N
        //59. Immediate Shipment Price -- Not an RFQ requirement, default to blank
        //60. Immediate Shipment Delivery Days -- Not an RFQ requirement, default to blank
        //61. RESERVED, default to blank
        //62. Trade Agreements Indicator -- Need to fix condition for I
        const tradeAgreementsIndicator = getTradeAgreementsIndicator(allTextPages);
        //63. Source of Supply Cage Code -- Unfinished
        //64. First Article Waiver Code -- Default to Blank
        //65. Hazardous Material Identification and Material Safety Data -- Default to N
        //66. Hazardous Warning Labels -- Not an RFQ requirement, default to blank
        //67. Material Requirements -- Default to 0
        //68. Buy American Indicator
        const buyAmericanIndicator = getBuyAmericanIndicator(allTextPages, csvObject, totalUnits);
        //69. Free Trade Agreements Indicator -- Unfinished no default
        const freeTradeAgreementsIndicator = getFreeTradeAgreementsIndicator(allTextPages, csvObject);
        //70. Buy American/Free Trade/Trade Agreements End Product -- Todo
        //71. Buy American/ Free Trade Agreements/Trade Agreements Country of Origin Code -- Todo
        //72. Buy American / Free Trade / Trade Agreements Country Code -- Todo
        //73. Duty Free Entry Requested -- N Default
        //74. Duty Free Entry Requested/Foreign Supplies in US Code -- Default to blank
        //75. Duty Free Entry Requested/Duty Paid Code -- Default to blank
        //76. Duty Free Entry Requested/Duty Paid Amount -- Default to blank
        //77. Price Breaks Solicited Indicator -- if contains "Please provide the following price breaks" then Y, else N, don't leave blank
        const priceBreaksSolicitedIndicator = getPriceBreaksSolicitedIndicator(allTextPages);
        if(priceBreaksSolicitedIndicator == "Y") {
            return ["noMatch", nationalStockNumber];
        }
        //78 - 95 left empty, not worrying about RFQ's with price breaks
        //96. Quantity Variance Plus -- Unfinished, Default 0
        //97. Quantity Variance Minus -- Unfinished, Default 0
        //98. Minimum Order Quantity Code -- Not an RFQ requirement, Default to N
        //99. Minimum Order Maximum Quantity -- Not an RFQ requirement, default to blank
        //100. Immediate Shipment Available -- Not an RFQ requirement, default to N, look at website for conditions
        //101. Immediate Shipment Quantity -- Not an RFQ requirement, default to blank, conditions on answering in the website
        //102. Manufacturer/Dealer -- Not an RFQ requirement, Default DD
        //103. Actual Manufacturing/Production Source CAGE code -- Not an RFQ requirement, conditions for entering on website, default blank
        //104. Actual Manufacturing/Production Source Name and Address -- Not an RFQ requirement, A self entered text, conditions for entering on the website, default blank
        //105. Item Description Indicator, Certain for B, Q, N, unsure about D, P, and S, needs work
        const itemDescriptionIndicator = getItemDescriptionIndicator(allTextPages);
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
        const higherLevelQualityIndicator = getHigherLevelQualityIndicator(allTextPages);
        //118. Higher-Level Quality Code -- enter yourself, conditions on website, can be blank
        //119. Higher-Level Quality Remarks -- enter yourself, conditions on website, can be blank
        //120. Child Labor Certification Code -- enter yourself, conditions on website, default to N
        //121. Quote Remarks -- enter yourself, conditions on website, can be left blank
        
        csvObjects.forEach((csvObject) => {
            csvObject.solicitationNumber = solicitationNumber.replace(/\-/g, "");
            csvObject.solicitationTypeIndicator = solicitationTypeIndicator;
            csvObject.smallBusinessSetAsideIndicator = smallBusinessSetAsideIndicator;
            csvObject.additionalClauseFillInsIndicator = additionalClauseFillInsIndicator;
            csvObject.rfqReturnByDate = rfqReturnByDate;
            csvObject.fobPoint = csvObject.index < fobPoint.length ? fobPoint[csvObject.index] : fobPoint[0];
            csvObject.quoterForCageCode = '1J8D2';
            csvObject.smallBusinessRepCode = 'M';
            csvObject.aaComplianceCode = 'NA';
            csvObject.previousCandCReportsCode = 'NA';
            csvObject.alternateDisputesResolution = 'B';
            csvObject.bidTypeCode = 'BI';
            csvObject.promptPaymentDiscountTermsCode = '1';
            csvObject.daysQuoteValid = '90';
            csvObject.meetsPackagingRequirement = 'Y';
            csvObject.boaFssBpa = 'NAP';
            csvObject.inspectionCodePoint = inspectionCodePoint;
            csvObject.placeOfGovernmentInspectionPackagingCageCode = csvObject.inspectionCodePoint == 'O' ? '028F4' : '';
            csvObject.placeOfGovernmentInspectionSuppliesCageCode = csvObject.inspectionCodePoint == 'O' ? '028F4' : '';
            csvObject.space39 = 'N';
            csvObject.solicitationLineNumber = solicitationLineNumbers[csvObject.index];
            csvObject.unitOfIssue = unitOfIssueArray[csvObject.index].UI;
            csvObject.quantity = unitOfIssueArray[csvObject.index].QUANTITY;
            csvObject.unitPrice = unitOfIssueArray[csvObject.index].UNIT_PRICE;
            csvObject.deliveryDays = parseInt(deliveryDays, 10);
            csvObject.guaranteedMinimum = guaranteedMinimum;
            csvObject.doMinimum = doMinimum;
            csvObject.contractMaximum = contractMaximum;
            csvObject.annualFrequencyOfBuys = annualFrequencyOfBuys;
            csvObject.noDOMinimumQuantity = (csvObject.solicitationTypeIndicator == 'I') ? 'N' : '';
            csvObject.hubZonePreferenceIndicator = hubZonePreferenceIndicator;
            csvObject.waiverOfHubZonePreference = (csvObject.hubZonePreferenceIndicator == 'N') ? '' : 'N';
            csvObject.tradeAgreementsIndicator = tradeAgreementsIndicator;
            csvObject.hazardousMaterialIdentificationAndMaterialSafetyData = 'N';
            csvObject.materialRequirements = '0';
            csvObject.buyAmericanIndicator = buyAmericanIndicator;
            csvObject.freeTradeAgreementsIndicator = freeTradeAgreementsIndicator;
            csvObject.dutyFreeEntryRequested = csvObject.buyAmericanIndicator == 'I' ? '' : 'N';
            csvObject.dutyFreeEntryRequestedForeignSuppliesInUSCode = csvObject.buyAmericanIndicator == 'I' ? '' : csvObject.dutyFreeEntryRequested == 'Y' ? 'N' : '';
            csvObject.dutyFreeEntryRequestedDutyPaidCode = csvObject.buyAmericanIndicator == 'I' ? '' : csvObject.dutyFreeEntryRequestedForeignSuppliesInUSCode == 'Y' ? 'N' : '';
            csvObject.dutyFreeEntryRequestedDutyPaidAmount = csvObject.buyAmericanIndicator == 'I' ? '' : csvObject.dutyFreeEntryRequestedDutyPaidCode == 'N' ? '0' : '';
            csvObject.priceBreaksSolicitedIndicator = priceBreaksSolicitedIndicator;
            csvObject.quantityVariancePlus = '0';
            csvObject.quantityVarianceMinus = '0';
            csvObject.minimumOrderQuantityCode = 'N';
            csvObject.minimumOrderMaximumQuantity = csvObject.minimumOrderQuantityCode == 'N' ? '' : '1';
            csvObject.immediateShipmentAvailable = 'N';
            csvObject.immediateShipmentQuantity = csvObject.immediateShipmentAvailable == 'Y' ? '0' : '';
            csvObject.manufacturerDealer = 'DD';
            csvObject.itemDescriptionIndicator = itemDescriptionIndicator;
            csvObject.partNumberOfferedCode = '1';
            csvObject.partNumberOfferedCageCode = ['P','B','N'].includes(itemDescriptionIndicator) ? csvObject.partNumberOfferedCageCode : '';
            csvObject.partNumberOfferedPartNumber = ['P','B','N'].includes(itemDescriptionIndicator) ? '' : csvObject.partNumberOfferedPartNumber;
            csvObject.suppliesOffered = ['D','B','Q'].includes(itemDescriptionIndicator) ? '1' : '';
            csvObject.higherLevelQualityIndicator = higherLevelQualityIndicator;
            csvObject.higherLevelQualityCode = higherLevelQualityIndicator == 'N' ? '' : higherLevelQualityIndicator;
            csvObject.childLaborCertificationCode = 'N';
        });

        return ["match", nationalStockNumber, csvObjects.map((csvObject) => rfqRequirementsToCsv(csvObject)).join("\n")];
    } catch (error) {
        console.error("Error processing request:", error);
        return ["error", ""];
    }
}

function getSolicitationTypeIndicator(text: string, totalUnits: number): string {
    const procurementHistory = getProcurementHistory(text);
    if(text.includes("UNILATERAL IDC")) {
        return "I"
    } else if(isLessThanMicroPurchase(procurementHistory, totalUnits)) {
        return "F"
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

function getPartNumbers(text: string): string[] {
    const partNumberRegex = /P\/N\s+(\S+)/g;
    const partNumberMatch = text.match(partNumberRegex);
    if(partNumberMatch != null) {
        const partNumbers = partNumberMatch.map((part) => part.substring(4));
        return partNumbers;
    } else {
        return [""];
    }
}

function getCageCodes(text: string): string[] {
    const cageCodeRegex = /(\S+)\s+P\/N/g;
    const cageCodeMatch = text.match(cageCodeRegex);
    if(cageCodeMatch != null) {
        const cageCodes = cageCodeMatch.map((code) => code.split(" ")[0]);
        return cageCodes;
    } else {
        return [""];
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

function getProcurementHistory(text: string): string[][] {
    const procurementHistory = /(?<=Contract Number Quantity Unit Cost AWD Date Surplus Material \. ).*?(?=CONTINUATION SHEET REFERENCE NO\.)/g;
    const procurementHistoryMatch = text.match(procurementHistory);
    if(procurementHistoryMatch != null) {
        const procurementHistoryArray: string[][] = [];
        let array: string[] = [];
        let count = 0;
        procurementHistoryMatch.forEach((history) => {
            const historyArray = history.trim().split(" ");
            historyArray.forEach((item) => {
                if(count == 6) {
                    procurementHistoryArray.push(array);
                    count = 1;
                    array = [];
                    array.push(item);
                } else {
                    array.push(item);
                    count++;
                }
            });
        });
        return procurementHistoryArray;
    } else {
        return [[""]];
    }
}

function isLessThanMicroPurchase(procurementHistory: string[][], totalUnits: number): string {
    const maxUnitPrice = procurementHistory.map((history) => Number(history[3])).reduce((a, b) => Math.max(a, b));
    if(maxUnitPrice * totalUnits < 10000) {
        return "Y";
    } else {
        return "N";
    }
}

function getUnitOfIssue(text: string, nsnDBArray: string[][]): lineItem[] {
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
                    QUANTITY: unit[4].split(".")[0],
                    UNIT_PRICE: unit[5],
                    TOTAL_PRICE: unit[6],
                }
            } else {
                return {
                    CLIN: unit[0],
                    PR: unit[1],
                    PRLI: unit[2],
                    UI: unit[3],
                    QUANTITY: unit[4].split(".")[0],
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
    const tradeAgreementsIndicatorRegex2 = /(?<=FREIGHT SHIPPING ADDRESS).*?(?=MARKFOR)/;
    const tradeAgreementsIndicator = text.match(tradeAgreementsIndicatorRegex1);
    const tradeAgreementsIndicator2 = text.match(tradeAgreementsIndicatorRegex2);
    if(tradeAgreementsIndicator != null) {
        return "Y";
    } else if(tradeAgreementsIndicator2 != null && !tradeAgreementsIndicator2[0].includes(" US ")) {
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

function getBuyAmericanIndicator(text: string, csvObject: RFQRequirements, totalUnits: number): string {
    if(csvObject.tradeAgreementsIndicator == "I") {
        return "I";
    } else {
        const buyAmericanIndicatorRegex = /DFARS 252\.225-7001, BUY AMERICAN AND BALANCE OF PAYMENTS PROGRAM/;
        const buyAmericanIndicator = text.match(buyAmericanIndicatorRegex);
        if(buyAmericanIndicator != null && isLessThanMicroPurchase(getProcurementHistory(text), totalUnits) == "N") {
            return "Y";
        } else {
            return "N";
        }
    }
}

function getItemDescriptionIndicator(text: string): string {
    //Source Control Data, DLA may not own the drawing but they will direct you where to get it
    const itemDescriptionIndicatorRegex1 = /SOURCE CONTROL DATA/; //B
    //Qualitfied Product List, like source controlled & DLA vets source, Vendors will need to make sure they're quoting bonafide parts
    const itemDescriptionIndicatorRegex2 = /QML or QPL Item/; //Q
    const itemDescriptionIndicatorRegex3 = /DETAILED DRAWING/; //D
    //This is an unrestricted item
    const itemDescriptionIndicatorRegex4 = /FULL AND OPEN COMPETITION APPLY/; //D
    const itemDescriptionIndicator = text.match(itemDescriptionIndicatorRegex1);
    const itemDescriptionIndicator2 = text.match(itemDescriptionIndicatorRegex2);
    const itemDescriptionIndicator3 = text.match(itemDescriptionIndicatorRegex3);
    const itemDescriptionIndicator4 = text.match(itemDescriptionIndicatorRegex4);
    if(itemDescriptionIndicator != null) {
        return "B";
    } else if(itemDescriptionIndicator2 != null) {
        return "Q";
    } else if (itemDescriptionIndicator3 != null || itemDescriptionIndicator4 != null) {
        return 'D';
    } else {
        return 'P';
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
    value = value.slice(0, -5);
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
