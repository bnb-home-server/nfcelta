export interface ReceiptMetadataItem {
  name: string;
  code: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  totalPrice: string;
}

export interface ReceiptMetadata {
  state: string;
  source: string;
  storeName: string;
  cnpj: string;
  invoiceNumber: string;
  series: string;
  emissionDate: string;
  protocol: string;
  accessKey: string;
  consumerCpf: string;
  consumerName: string;
  itemsCount: number;
  discount: string;
  items: ReceiptMetadataItem[];
}