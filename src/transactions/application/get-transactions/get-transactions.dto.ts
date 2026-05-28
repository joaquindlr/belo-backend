export interface GetTransactionsDTO {
  userId?: string;
  status?: string;
  page: number;
  limit: number;
}
