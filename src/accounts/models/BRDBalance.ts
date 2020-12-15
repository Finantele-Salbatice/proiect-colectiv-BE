export interface IBRDAmount {
    amount: number,
    currency: string,
}
export interface IBRDBalance {
    balanceType: string,
    balanceAmount: IBRDAmount,
    creditLimitIncluded: boolean,
    lastChangeDateTime: string,
}