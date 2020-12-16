export interface IBRDTransaction {
    EndToEndId: number,
    bookingDate: string,
    valueDate: string,
    transactionAmount: amount,
    creditorName: string,
    creditorAccount: account,
    remittanceInformationUnstructured: string,
    proprietaryBankTransactionCode: string,
    exchangeRate: rate,
}

interface rate {
    currencyFrom: string,
    rate: number,
    currencyTo: string,
    rateDate: string,
}

interface amount {
    amount: number,
    currency: string,
}

interface account {
    iban: string,
}