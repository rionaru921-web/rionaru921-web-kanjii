import { Font, StyleSheet } from "@react-pdf/renderer";

// @react-pdf/renderer uses fontkit, which needs one font file containing
// every glyph it will render — Google's normal css2 endpoint splits CJK
// fonts into dozens of unicode-range subset files, which fontkit can't
// stitch together. Requesting with a legacy (pre-woff2/unicode-range) user
// agent makes Google serve a single consolidated .woff file covering the
// full character set instead; verified working with a real Japanese-text
// PDF render before wiring this in.
const FONT_BASE = "https://fonts.gstatic.com/s/notosansjp/v56";
const SERIF_BASE = "https://fonts.gstatic.com/s/notoserifjp/v33";

// Only the regular weight is registered — each additional full-CJK-glyph
// woff (~2-3MB, 20k+ glyphs) adds real parse/subset time in fontkit, and
// bold body text isn't worth doubling that cost for. Visual emphasis in the
// templates now leans on size/color instead of a second Sans JP file.
Font.register({
  family: "Noto Sans JP",
  fonts: [{ src: `${FONT_BASE}/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75g.woff`, fontWeight: 400 }],
});

Font.register({
  family: "Noto Serif JP",
  fonts: [
    { src: `${SERIF_BASE}/xn71YHs72GKoTvER4Gn3b5eMRtWGkp6o7MjQ2bzWPebD.woff`, fontWeight: 700 },
  ],
});

// react-pdf can't do automatic Japanese line-breaking (kinsoku shori) out of
// the box; this at least stops it breaking mid-word on latin/number runs.
Font.registerHyphenationCallback((word) => [word]);

export const COLORS = {
  bg: "#FAF6EF",
  ink: "#2B2420",
  inkSecondary: "#6B5D52",
  inkMuted: "#A89B8E",
  gold: "#C4633F",
  goldDeep: "#A85030",
  vermilion: "#7A2E2E",
  border: "#E8DDD0",
};

export const pdfStyles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: "Noto Sans JP",
    fontSize: 10,
    color: COLORS.ink,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brand: {
    fontFamily: "Noto Serif JP",
    fontWeight: 700,
    fontSize: 14,
    color: COLORS.gold,
  },
  headerDate: {
    fontSize: 9,
    color: COLORS.inkMuted,
  },
  goldRule: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold,
    borderBottomStyle: "solid",
    marginVertical: 12,
  },
  titleBlock: {
    alignItems: "center",
    marginVertical: 18,
  },
  title: {
    fontFamily: "Noto Serif JP",
    fontWeight: 700,
    fontSize: 22,
    color: COLORS.goldDeep,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.inkSecondary,
    textAlign: "center",
  },
  sectionLabel: {
    fontFamily: "Noto Serif JP",
    fontWeight: 700,
    fontSize: 10,
    color: COLORS.goldDeep,
    marginBottom: 6,
    marginTop: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "solid",
    borderRadius: 6,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderBottomStyle: "solid",
  },
  tableRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 7,
  },
  textMuted: {
    color: COLORS.inkMuted,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderTopStyle: "solid",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.inkMuted,
  },
});
