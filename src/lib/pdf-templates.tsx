import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { GeneratedPdf, PdfSection } from "@/src/lib/types";

// ─── SKEPTICAL_SWITCHER ────────────────────────────────────────────────────────
// Dark navy header bar, blue accents, gray evidence boxes, navy footer bar
const ssStyles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", paddingTop: 0, paddingBottom: 60, fontFamily: "Helvetica" },
  header: {
    backgroundColor: "#1a1a2e", paddingHorizontal: 36,
    paddingTop: 14, paddingBottom: 14, minHeight: 60, justifyContent: "center",
  },
  headerBrand: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 10, letterSpacing: 3, marginBottom: 6 },
  headerHeadline: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 13, lineHeight: 1.2 },
  body: { paddingHorizontal: 36, paddingTop: 20 },
  greeting: { fontSize: 10, color: "#1a1a1a", lineHeight: 1.6, marginBottom: 18 },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: "#0066cc", marginBottom: 6 },
  sectionContent: { fontSize: 10, color: "#1a1a1a", lineHeight: 1.65, marginBottom: 8 },
  evidenceList: {
    backgroundColor: "#f0f4f8", borderLeftWidth: 3, borderLeftColor: "#0066cc",
    borderLeftStyle: "solid", paddingLeft: 12, paddingRight: 10,
    paddingVertical: 10, marginBottom: 8,
  },
  evidenceItem: { flexDirection: "row", marginBottom: 4 },
  evidenceDot: { color: "#0066cc", fontFamily: "Helvetica-Bold", fontSize: 10, marginRight: 6, marginTop: 0.5 },
  evidenceText: { fontSize: 9.5, color: "#1a1a1a", flex: 1, lineHeight: 1.5 },
  sourceNote: { fontSize: 7.5, color: "#8888aa", fontFamily: "Helvetica-Oblique" },
  ctaBox: {
    marginTop: 18, marginHorizontal: 36, borderWidth: 1.5, borderColor: "#0066cc",
    borderStyle: "solid", borderRadius: 4, padding: 16,
  },
  ctaHeadline: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#1a1a2e", marginBottom: 5 },
  ctaBody: { fontSize: 10, color: "#1a1a1a", lineHeight: 1.6 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#1a1a2e", paddingHorizontal: 36, paddingVertical: 10,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  footerText: { fontSize: 7.5, color: "#ffffff" },
  pageNumber: { fontSize: 7.5, color: "#aaaacc" },
});

function SSSection({ s }: { s: PdfSection }) {
  return (
    <View style={ssStyles.section}>
      <Text style={ssStyles.sectionTitle}>{s.title.toUpperCase()}</Text>
      <Text style={ssStyles.sectionContent}>{s.content}</Text>
      {s.evidence.length > 0 && (
        <View style={ssStyles.evidenceList}>
          {s.evidence.map((e, i) => (
            <View key={i} style={ssStyles.evidenceItem}>
              <Text style={ssStyles.evidenceDot}>›</Text>
              <Text style={ssStyles.evidenceText}>{e}</Text>
            </View>
          ))}
        </View>
      )}
      {s.source_note ? <Text style={ssStyles.sourceNote}>Source: {s.source_note}</Text> : null}
    </View>
  );
}

function SkepticalSwitcherPdf({ data }: { data: GeneratedPdf }) {
  return (
    <Document>
      <Page size="A4" style={ssStyles.page}>
        <View style={ssStyles.header}>
          <Text style={ssStyles.headerBrand}>NOVACAMP</Text>
          <Text style={ssStyles.headerHeadline}>{data.headline}</Text>
        </View>

        <View style={ssStyles.body}>
          <Text style={ssStyles.greeting}>{data.greeting}</Text>
          {data.sections.map((s, i) => <SSSection key={i} s={s} />)}
        </View>

        <View style={ssStyles.ctaBox} wrap={false}>
          <Text style={ssStyles.ctaHeadline}>{data.cta.headline}</Text>
          <Text style={ssStyles.ctaBody}>{data.cta.body}</Text>
        </View>

        <View style={ssStyles.footer} fixed>
          <Text style={ssStyles.footerText}>NovaCamp · Data sourced from audited reports</Text>
          <Text style={ssStyles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── SENIOR_VALIDATOR ──────────────────────────────────────────────────────────
// No header bar. Typography-led: charcoal text, green accents, alternating section backgrounds, minimal footer
const svStyles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff", paddingTop: 36, paddingBottom: 50,
    paddingHorizontal: 44, fontFamily: "Times-Roman",
  },
  headerBrand: { fontFamily: "Helvetica-Bold", fontSize: 14, color: "#2d2d2d", letterSpacing: 4, marginBottom: 10 },
  headerHeadline: { fontFamily: "Times-Bold", fontSize: 20, color: "#2d2d2d", lineHeight: 1.25, marginBottom: 14 },
  headerRule: { borderBottomWidth: 1, borderBottomColor: "#cccccc", borderBottomStyle: "solid", marginBottom: 16 },
  greeting: { fontFamily: "Times-Roman", fontSize: 9, color: "#2d2d2d", lineHeight: 1.55, marginBottom: 20 },
  sectionOdd: {
    marginBottom: 14, paddingTop: 10, paddingBottom: 8,
    borderTopWidth: 1, borderTopColor: "#1a5c2a", borderTopStyle: "solid",
  },
  sectionEven: {
    marginBottom: 14, paddingTop: 10, paddingBottom: 8, paddingHorizontal: 8,
    borderTopWidth: 1, borderTopColor: "#1a5c2a", borderTopStyle: "solid",
    backgroundColor: "#faf8f5",
  },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#1a5c2a", marginBottom: 5, letterSpacing: 0.5 },
  sectionContent: { fontFamily: "Times-Roman", fontSize: 9, color: "#2d2d2d", lineHeight: 1.5, marginBottom: 6 },
  evidenceList: { marginBottom: 6 },
  evidenceItem: { flexDirection: "row", marginBottom: 3 },
  evidenceDash: { fontFamily: "Times-Roman", fontSize: 9, color: "#1a5c2a", marginRight: 8 },
  evidenceText: { fontFamily: "Times-Roman", fontSize: 9, color: "#2d2d2d", flex: 1, lineHeight: 1.45 },
  sourceNote: { fontFamily: "Times-Italic", fontSize: 7, color: "#999988" },
  ctaBox: {
    marginTop: 18, borderWidth: 1, borderColor: "#1a5c2a",
    borderStyle: "solid", padding: 14,
  },
  ctaHeadline: { fontFamily: "Helvetica-Bold", fontSize: 10, color: "#1a5c2a", marginBottom: 4 },
  ctaBody: { fontFamily: "Times-Roman", fontSize: 9, color: "#2d2d2d", lineHeight: 1.55 },
  footer: {
    position: "absolute", bottom: 18, left: 44, right: 44,
    flexDirection: "row", justifyContent: "space-between",
  },
  footerText: { fontFamily: "Times-Italic", fontSize: 7, color: "#999988" },
  pageNumber: { fontFamily: "Times-Roman", fontSize: 7, color: "#999988" },
});

function SVSection({ s, index }: { s: PdfSection; index: number }) {
  const style = index % 2 === 0 ? svStyles.sectionOdd : svStyles.sectionEven;
  return (
    <View style={style}>
      <Text style={svStyles.sectionTitle}>{s.title}</Text>
      <Text style={svStyles.sectionContent}>{s.content}</Text>
      {s.evidence.length > 0 && (
        <View style={svStyles.evidenceList}>
          {s.evidence.map((e, i) => (
            <View key={i} style={svStyles.evidenceItem}>
              <Text style={svStyles.evidenceDash}>—</Text>
              <Text style={svStyles.evidenceText}>{e}</Text>
            </View>
          ))}
        </View>
      )}
      {s.source_note ? <Text style={svStyles.sourceNote}>{s.source_note}</Text> : null}
    </View>
  );
}

function SeniorValidatorPdf({ data }: { data: GeneratedPdf }) {
  return (
    <Document>
      <Page size="A4" style={svStyles.page}>
        <Text style={svStyles.headerBrand}>NOVACAMP</Text>
        <Text style={svStyles.headerHeadline}>{data.headline}</Text>
        <View style={svStyles.headerRule} />
        <Text style={svStyles.greeting}>{data.greeting}</Text>

        {data.sections.map((s, i) => <SVSection key={i} s={s} index={i} />)}

        <View style={svStyles.ctaBox} wrap={false}>
          <Text style={svStyles.ctaHeadline}>{data.cta.headline}</Text>
          <Text style={svStyles.ctaBody}>{data.cta.body}</Text>
        </View>

        <View style={svStyles.footer} fixed>
          <Text style={svStyles.footerText}>NovaCamp · For detailed module breakdown, contact your program advisor</Text>
          <Text style={svStyles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── ANXIOUS_ASPIRER ───────────────────────────────────────────────────────────
// Purple header bar, orange section titles, lavender evidence boxes with checkmarks, purple footer bar, larger body text
const aaStyles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", paddingBottom: 70, fontFamily: "Helvetica" },
  header: {
    backgroundColor: "#6b21a8", paddingHorizontal: 36,
    paddingTop: 18, paddingBottom: 18, minHeight: 70, alignItems: "center",
  },
  headerBrand: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#e9d5ff", letterSpacing: 5, marginBottom: 8 },
  headerHeadline: { fontFamily: "Helvetica-Bold", fontSize: 20, color: "#ffffff", textAlign: "center", lineHeight: 1.3 },
  body: { paddingHorizontal: 32, paddingTop: 22 },
  greeting: { fontSize: 12, color: "#1a1a1a", lineHeight: 1.75, marginBottom: 18 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#ea580c", marginBottom: 8 },
  sectionContent: { fontSize: 12, color: "#1a1a1a", lineHeight: 1.8, marginBottom: 10 },
  evidenceList: {
    backgroundColor: "#f3e8ff", borderLeftWidth: 3, borderLeftColor: "#6b21a8",
    borderLeftStyle: "solid", paddingLeft: 12, paddingRight: 10,
    paddingVertical: 10, marginBottom: 8,
  },
  evidenceItem: { flexDirection: "row", marginBottom: 5 },
  evidenceCheck: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#6b21a8", marginRight: 7 },
  evidenceText: { fontSize: 11, color: "#1a1a1a", flex: 1, lineHeight: 1.6 },
  sourceNote: { fontSize: 8, color: "#9966cc", fontFamily: "Helvetica-Oblique" },
  ctaBox: {
    marginTop: 20, marginHorizontal: 32, backgroundColor: "#ea580c",
    borderRadius: 6, paddingHorizontal: 20, paddingVertical: 18,
  },
  ctaHeadline: { fontFamily: "Helvetica-Bold", fontSize: 14, color: "#ffffff", marginBottom: 6 },
  ctaBody: { fontSize: 12, color: "#fff7ed", lineHeight: 1.65 },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#6b21a8", paddingHorizontal: 32, paddingVertical: 10,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  footerText: { fontSize: 8, color: "#e9d5ff" },
  pageNumber: { fontSize: 8, color: "#e9d5ff" },
});

function AASection({ s }: { s: PdfSection }) {
  return (
    <View style={aaStyles.section}>
      <Text style={aaStyles.sectionTitle}>{s.title}</Text>
      <Text style={aaStyles.sectionContent}>{s.content}</Text>
      {s.evidence.length > 0 && (
        <View style={aaStyles.evidenceList}>
          {s.evidence.map((e, i) => (
            <View key={i} style={aaStyles.evidenceItem}>
              <Text style={aaStyles.evidenceCheck}>+</Text>
              <Text style={aaStyles.evidenceText}>{e}</Text>
            </View>
          ))}
        </View>
      )}
      {s.source_note ? <Text style={aaStyles.sourceNote}>Source: {s.source_note}</Text> : null}
    </View>
  );
}

function AnxiousAspirer({ data }: { data: GeneratedPdf }) {
  return (
    <Document>
      <Page size="A4" style={aaStyles.page}>
        <View style={aaStyles.header}>
          <Text style={aaStyles.headerBrand}>NOVACAMP</Text>
          <Text style={aaStyles.headerHeadline}>{data.headline}</Text>
        </View>

        <View style={aaStyles.body}>
          <Text style={aaStyles.greeting}>{data.greeting}</Text>
          {data.sections.map((s, i) => <AASection key={i} s={s} />)}
        </View>

        <View style={aaStyles.ctaBox} wrap={false}>
          <Text style={aaStyles.ctaHeadline}>{data.cta.headline}</Text>
          <Text style={aaStyles.ctaBody}>{data.cta.body}</Text>
        </View>

        <View style={aaStyles.footer} fixed>
          <Text style={aaStyles.footerText}>NovaCamp · Questions? Your advisor is here to help. No pressure, no timeline.</Text>
          <Text style={aaStyles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── Factory ───────────────────────────────────────────────────────────────────
// Unknown personas fall through to SKEPTICAL_SWITCHER (clean, data-forward default)
export function buildPdfDocument(data: GeneratedPdf): React.ReactElement<DocumentProps> {
  switch (data.persona) {
    case "SKEPTICAL_SWITCHER":
      return <SkepticalSwitcherPdf data={data} />;
    case "SENIOR_VALIDATOR":
      return <SeniorValidatorPdf data={data} />;
    case "ANXIOUS_ASPIRER":
      return <AnxiousAspirer data={data} />;
    default:
      return <SkepticalSwitcherPdf data={data} />;
  }
}
