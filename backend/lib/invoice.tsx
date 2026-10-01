import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    color: "#121212",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#77736E",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    color: "#77736E",
  },
  section: {
    marginTop: 20,
    borderTop: "1px solid #E5E0D9",
    paddingTop: 16,
  },
  total: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #121212",
    fontSize: 14,
    fontWeight: 700,
  },
});

export interface InvoiceData {
  invoiceNumber: string;
  paidAt: Date;
  productName: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  paymentId: string;
  orderId: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

function InvoiceDocument({ data }: { data: InvoiceData }) {
  const total = data.amount;

  const validUntil = new Date(data.paidAt);
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>DigiProfilo</Text>
        <Text style={styles.subtitle}>Payment Receipt & Invoice</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Invoice Number</Text>
          <Text>{data.invoiceNumber}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text>{data.paidAt.toLocaleDateString("en-IN")}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Billed To</Text>
          <Text>{data.customerName || data.customerEmail}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text>{data.customerEmail}</Text>
        </View>

        {(data.address || data.city || data.state || data.pincode) && (
          <View style={styles.row}>
            <Text style={styles.label}>Billing Address</Text>
            <Text>
              {[data.address, data.city, data.state, data.pincode]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>{data.productName}</Text>
            <Text>Rs. {data.amount.toFixed(2)}</Text>
          </View>

          <View style={styles.total}>
            <View style={styles.row}>
              <Text>Total Paid</Text>
              <Text>Rs. {total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Payment ID</Text>
            <Text>{data.paymentId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text>{data.orderId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Subscription Period</Text>
            <Text>
              {data.paidAt.toLocaleDateString("en-IN")} to{" "}
              {validUntil.toLocaleDateString("en-IN")}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(
  data: InvoiceData,
): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument data={data} />);
}
