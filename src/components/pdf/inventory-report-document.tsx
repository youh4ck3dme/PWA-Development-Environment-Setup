import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { InventoryItemSummary } from "@/types/inventory";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 12 },
  title: { fontSize: 20, marginBottom: 16 },
  row: { display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
});

export function InventoryReportDocument({ items }: { items: InventoryItemSummary[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Inventory Report</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text>{item.name}</Text>
            <Text>{item.quantity}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
