from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "assets" / "documents" / "Ilya_Novik_CV_EN.pdf"
BLUE = colors.HexColor("#284E64")


def metadata(canvas, _document):
    canvas.setAuthor("Ilya Novik")
    canvas.setTitle("Ilya Novik | Creative Copywriter")
    canvas.setSubject("CV - Creative Copywriter")
    canvas.setKeywords(
        "Middle Creative, Creative Copywriter, Creative Concept Developer, "
        "Copywriter, Integrated Campaigns, Brand Strategy"
    )
    canvas.setCreator("(unspecified)")


def p(text, style):
    return Paragraph(text, style)


styles = getSampleStyleSheet()
name = ParagraphStyle(
    "Name",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=22,
    leading=23,
    spaceAfter=1.5,
)
role = ParagraphStyle(
    "Role",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=12.6,
    leading=14,
    textColor=BLUE,
    spaceAfter=2.5,
)
body = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.25,
    leading=9.65,
    alignment=TA_LEFT,
    spaceAfter=0.6,
)
section = ParagraphStyle(
    "Section",
    parent=body,
    fontName="Helvetica-Bold",
    fontSize=10.2,
    leading=11.5,
    textColor=BLUE,
    spaceBefore=4.2,
    spaceAfter=1.5,
)
job = ParagraphStyle(
    "Job",
    parent=body,
    fontName="Helvetica-Bold",
    fontSize=8.9,
    leading=10.2,
    spaceBefore=2.7,
    spaceAfter=0.6,
)
bullet = ParagraphStyle(
    "Bullet",
    parent=body,
    leftIndent=7,
    firstLineIndent=-7,
    spaceAfter=0.2,
)


story = [
    p("ILYA NOVIK", name),
    p("CREATIVE COPYWRITER", role),
    p("Warsaw, Poland | +48 519 343 555 | novik.brand@gmail.com | Telegram: @wilyam_the_originator", body),
    p("Work authorization: European Union (Polish national visa, type D)", body),
    p("Open to relocation and remote roles in Europe and the US", body),
    p("PROFILE", section),
    p(
        "Middle creative copywriter with 8 years of experience in brand and communication strategy across creative "
        "agencies, IT and financial services. Turns business briefs into focused creative briefs, clear key messages "
        "and integrated campaign ideas for TV, online video (OLV), out-of-home (OOH), digital, social media and PR, "
        "from first idea through pitch and production. Uses AI tools across the whole creative process, from research "
        "and copy to key visuals and animatics.",
        body,
    ),
    p("Selected brands: Alfa-Bank, Yandex, Demix, PepsiCo, Citydrive.", body),
    p("PROFESSIONAL EXPERIENCE", section),
    p("Alfa-Bank (financial services) | Middle Copywriter (Middle Creative) | 2025-2026", job),
    p("- Developed big ideas and campaign concepts for TV, online video (OLV) and out-of-home (OOH) advertising.", bullet),
    p("- Created campaign concepts for the Alfa Only premium card, the Alfa Investments product and a TV manifesto campaign supporting small and medium-sized businesses.", bullet),
    p("- Translated business briefs and product offers into creative briefs with a clear key message, connecting product benefits to a broader campaign idea.", bullet),
    p("SETTERS (creative agency) | Brand &amp; Creative Strategist | 2023-2025", job),
    p("- Contributed to 9 tender wins and the launch of 21 campaigns.", bullet),
    p("- Developed and launched brand campaigns, special projects, collaborations and PR concepts.", bullet),
    p("- Wrote video scripts, built creative presentations and pitched ideas to clients.", bullet),
    p("- Collaborated with strategists, art directors and media managers; oversaw execution through production and branded integrations.", bullet),
    p("RTK IT (IT company) | Brand Projects Lead, Employer Branding | 2022-2023", job),
    p("- Managed eight direct reports and developed employer brand communication strategy, with responsibility for brand perception and communication effectiveness.", bullet),
    p("- Developed a Programmer's Day PR project and cross-functional initiatives for employer consideration and candidate loyalty.", bullet),
    p("- Created concepts for influencer integrations and conference activations; sourced vendors for event stands.", bullet),
    p("Romashka Digital (digital agency) | Social Media Strategist / Creative Producer | 2020-2022", job),
    p("- Developed social media and brand communication strategies, creative frameworks and video concepts for client accounts and new business pitches.", bullet),
    p("- Assembled and coordinated project teams across design, editorial, paid media and influencer marketing; helped select video production partners.", bullet),
    p("AMDG (digital agency) | New Business Manager | 2018-2020", job),
    p("- Managed incoming briefs across social media, paid media, production, design, PR and online reputation management; scoped requirements and project timelines.", bullet),
    p("- Prepared and pitched proposals, presentations and budgets; represented the agency in tenders and coordinated NDAs and tender documentation.", bullet),
    p("LANGUAGES", section),
    p("English - B2 (upper-intermediate) | Russian - native | Belarusian - native", body),
    p("EDUCATION &amp; PROFESSIONAL DEVELOPMENT", section),
    p("Belarusian State University (BSU) - Marketing, 2021", body),
    p("Courses: MADS - Conceptual Thinking | Dnative - Communication Strategy | Nikolay Davydov - Pitching Ideas", body),
    p("AWARDS", section),
    p("WDA Winner, 2025 - Citydrive, horror podcast PR project.", body),
    p("D&amp;AD Shortlists (competition entries): 2023 - Heinz, Heinz Button; 2025 - Orbit, Chew-on Pen.", body),
    p("CORE SKILLS", section),
    p("Creative concept development | Integrated campaigns | Creative briefs | Key messages | Communication strategy | Copywriting &amp; scriptwriting | Brand platforms | Social media strategy | Influencer marketing | Pitching &amp; tenders | Client presentations | Creative production | Team leadership", body),
    p("AI &amp; TOOLS", section),
    p("<b>Thinking &amp; writing:</b> ChatGPT, Claude, DeepSeek - for research, idea development, scripts, copy, case structure and strategic sparring.", body),
    p("<b>Visual exploration:</b> Nano Banana, ChatGPT, Midjourney - for moodboards, visual territories, key visuals and fast image prototyping.", body),
    p("<b>Video &amp; audio prototyping:</b> Higgsfield, ElevenLabs, Flow, Kling - for animatics, video/audio references and early proof of concept.", body),
    p("<b>Design &amp; presentations:</b> Figma, Google Slides, Base44, Readymag - for decks, layouts, case studies and final idea packaging.", body),
]


document = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    leftMargin=36,
    rightMargin=36,
    topMargin=29,
    bottomMargin=24,
    title="Ilya Novik | Creative Copywriter",
    author="Ilya Novik",
)
document.build(story, onFirstPage=metadata, onLaterPages=metadata)
print(OUTPUT)
