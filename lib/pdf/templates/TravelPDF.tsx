import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles, COLORS } from "../styles";
import { MizuhikiRule, yen, hasPaymentInfo, PaymentInfoCard, type PDFPaymentInfo } from "../components";

export interface TravelPDFProps {
  title: string;
  destination: string;
  dateRange: string;
  days: number;
  nights: number;
  hotelName: string;
  participants: Array<{ name: string; amount: number }>;
  total: number;
  itinerary: Array<{ day: number; summary: string }>;
  costBreakdown: Array<{ category: string; amount: number; paidBy?: string }>;
  payment?: PDFPaymentInfo;
}

export function TravelPDF({
  title,
  destination,
  dateRange,
  days,
  nights,
  hotelName,
  participants,
  total,
  itinerary,
  costBreakdown,
  payment,
}: TravelPDFProps) {
  return (
    <Document title={`KanjiLabo_${title}`}>
      {/* Page 1: overview */}
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.brand}>幹事ラボ</Text>
          <Text style={pdfStyles.headerDate}>{dateRange}</Text>
        </View>

        <MizuhikiRule />
        <View style={pdfStyles.titleBlock}>
          <Text style={pdfStyles.title}>{title}</Text>
          <Text style={pdfStyles.subtitle}>
            {destination}・{nights}泊{days}日・{dateRange}
          </Text>
        </View>
        <MizuhikiRule />

        <Text style={pdfStyles.sectionLabel}>【宿泊先】</Text>
        <View style={pdfStyles.card}>
          <Text style={{ fontSize: 11, fontFamily: "Noto Serif JP", fontWeight: 700 }}>{hotelName}</Text>
        </View>

        <Text style={pdfStyles.sectionLabel}>【参加者・お支払い】</Text>
        <View style={pdfStyles.card}>
          {participants.map((p, i) => (
            <View key={`${p.name}-${i}`} style={pdfStyles.tableRow}>
              <Text style={{ fontSize: 10 }}>{p.name}</Text>
              <Text style={{ fontSize: 10, fontFamily: "Noto Serif JP", fontWeight: 700 }}>
                {yen(p.amount)}
              </Text>
            </View>
          ))}
          <View style={pdfStyles.tableRowLast}>
            <Text style={{ fontSize: 11, fontFamily: "Noto Serif JP", fontWeight: 700 }}>合計</Text>
            <Text style={{ fontSize: 12, fontFamily: "Noto Serif JP", fontWeight: 700, color: COLORS.goldDeep }}>
              {yen(total)}
            </Text>
          </View>
        </View>

        {hasPaymentInfo(payment) && (
          <>
            <Text style={pdfStyles.sectionLabel}>【集金方法】</Text>
            <PaymentInfoCard payment={payment} />
          </>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Powered by 幹事ラボ</Text>
          <Text style={pdfStyles.footerText}>https://kanjii.app</Text>
        </View>
      </Page>

      {/* Page 2+: itinerary (auto-flows to further pages if it overflows) */}
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.brand}>幹事ラボ</Text>
          <Text style={pdfStyles.headerDate}>{title}</Text>
        </View>
        <Text style={pdfStyles.sectionLabel}>【日程表】</Text>
        {itinerary.map((day) => (
          <View key={day.day} style={[pdfStyles.card, { marginBottom: 8 }]} wrap={false}>
            <Text
              style={{
                fontFamily: "Noto Serif JP",
                fontWeight: 700,
                fontSize: 12,
                color: COLORS.goldDeep,
                marginBottom: 4,
              }}
            >
              {day.day}日目
            </Text>
            <Text style={{ fontSize: 10, color: COLORS.inkSecondary, lineHeight: 1.5 }}>
              {day.summary}
            </Text>
          </View>
        ))}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Powered by 幹事ラボ</Text>
          <Text style={pdfStyles.footerText}>https://kanjii.app</Text>
        </View>
      </Page>

      {/* Final page: cost breakdown detail */}
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.brand}>幹事ラボ</Text>
          <Text style={pdfStyles.headerDate}>{title}</Text>
        </View>
        <Text style={pdfStyles.sectionLabel}>【費用分担詳細】</Text>
        <View style={pdfStyles.card}>
          {costBreakdown.map((item, i) => (
            <View key={`${item.category}-${i}`} style={pdfStyles.tableRow}>
              <View>
                <Text style={{ fontSize: 10 }}>{item.category}</Text>
                {item.paidBy && (
                  <Text style={{ fontSize: 8, color: COLORS.inkMuted, marginTop: 2 }}>
                    立替: {item.paidBy}
                  </Text>
                )}
              </View>
              <Text style={{ fontSize: 10, fontFamily: "Noto Serif JP", fontWeight: 700 }}>
                {yen(item.amount)}
              </Text>
            </View>
          ))}
          <View style={pdfStyles.tableRowLast}>
            <Text style={{ fontSize: 11, fontFamily: "Noto Serif JP", fontWeight: 700 }}>合計</Text>
            <Text style={{ fontSize: 12, fontFamily: "Noto Serif JP", fontWeight: 700, color: COLORS.goldDeep }}>
              {yen(total)}
            </Text>
          </View>
        </View>
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Powered by 幹事ラボ</Text>
          <Text style={pdfStyles.footerText}>https://kanjii.app</Text>
        </View>
      </Page>
    </Document>
  );
}
