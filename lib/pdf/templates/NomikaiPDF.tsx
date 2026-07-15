import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { pdfStyles, COLORS } from "../styles";
import { MizuhikiRule, yen, hasPaymentInfo, PaymentInfoCard, type PDFPaymentInfo } from "../components";

export interface NomikaiPDFProps {
  title: string;
  date: string;
  shop: {
    name: string;
    address: string;
    phone?: string;
    openHours?: string;
    mapUrl: string;
  };
  qrDataUrl: string;
  participants: Array<{ name: string; amount: number }>;
  total: number;
  payment?: PDFPaymentInfo;
  reservation?: {
    number?: string;
    holder?: string;
  };
}

export function NomikaiPDF({
  title,
  date,
  shop,
  qrDataUrl,
  participants,
  total,
  payment,
  reservation,
}: NomikaiPDFProps) {
  return (
    <Document title={`KanjiLabo_${title}`}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.brand}>幹事ラボ</Text>
          <Text style={pdfStyles.headerDate}>{date}</Text>
        </View>

        <MizuhikiRule />
        <View style={pdfStyles.titleBlock}>
          <Text style={pdfStyles.title}>{title}</Text>
          <Text style={pdfStyles.subtitle}>{date}</Text>
        </View>
        <MizuhikiRule />

        <Text style={pdfStyles.sectionLabel}>【会場】</Text>
        <View style={[pdfStyles.card, { flexDirection: "row", justifyContent: "space-between" }]}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontFamily: "Noto Serif JP", fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
              {shop.name}
            </Text>
            <Text style={{ fontSize: 9, color: COLORS.inkSecondary, marginBottom: 2 }}>
              {shop.address}
            </Text>
            {shop.phone && (
              <Text style={{ fontSize: 9, color: COLORS.inkSecondary, marginBottom: 2 }}>
                {shop.phone}
              </Text>
            )}
            {shop.openHours && (
              <Text style={{ fontSize: 9, color: COLORS.inkSecondary }}>{shop.openHours}</Text>
            )}
          </View>
          {qrDataUrl && (
            <View style={{ alignItems: "center" }}>
              {/* react-pdf's Image is a PDF drawing primitive, not an HTML img — no alt concept */}
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={qrDataUrl} style={{ width: 64, height: 64 }} />
              <Text style={{ fontSize: 7, color: COLORS.inkMuted, marginTop: 3 }}>地図QR</Text>
            </View>
          )}
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

        {reservation?.number && (
          <>
            <Text style={pdfStyles.sectionLabel}>【予約情報】</Text>
            <View style={pdfStyles.card}>
              <Text style={{ fontSize: 10 }}>予約番号: {reservation.number}</Text>
              {reservation.holder && (
                <Text style={{ fontSize: 10, marginTop: 3 }}>予約者: {reservation.holder}</Text>
              )}
            </View>
          </>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Powered by 幹事ラボ</Text>
          <Text style={pdfStyles.footerText}>https://kanjii.app</Text>
        </View>
      </Page>
    </Document>
  );
}
